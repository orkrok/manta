import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import clientPromise from '@/lib/mongodb';

const RESUME_TEXT = `
이름: 우주혁
직무: 클라우드 보안 엔지니어
현 직장: Cinamon
기술: AWS, Linux, Palo Alto-XDR, Python, Docker, K8S
자격증: 리눅스마스터 2급, 네트워크관리사 2급, Azure-900, 정보처리기사 필기 합격
교육 이수 : KT클라우드와 NHN클라우드로 완성하는 클라우드 엔지니어 과정
인턴 : 가상화 기술지원 - 소만사
외국어 : TOEIC 940 (24.10)
경험: SK Innovation XDR 기술지원 / 무신사 프로젝트
`;

// Next.js 15 API Route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// OPTIONS 메서드 처리 (CORS preflight)
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// GET 메서드 처리 (테스트용)
export async function GET(request) {
  return NextResponse.json(
    { error: '이 엔드포인트는 POST 메서드만 지원합니다.' },
    { status: 405 }
  );
}

export async function POST(request) {
  try {
    // 환경 변수 사전 검증
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY가 설정되어 있지 않습니다.' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }
    if (!process.env.MONGO_URI) {
      return NextResponse.json(
        { error: 'MONGO_URI가 설정되어 있지 않습니다.' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    let data;
    try {
      data = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: '잘못된 JSON 형식입니다.' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }
    const username = data.username || 'anonymous';
    const message = data.message || '';
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'message 필드는 필수이며 문자열이어야 합니다.' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    const client_ai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const mongoClient = await clientPromise;
    // MongoDB URI에서 데이터베이스 이름 추출, 없으면 기본값 사용
    let dbName = process.env.MONGO_DB_NAME;
    if (!dbName) {
      try {
        const uri = new URL(process.env.MONGO_URI);
        dbName = uri.pathname.slice(1) || 'test';
      } catch {
        dbName = 'test';
      }
    }
    const db = mongoClient.db(dbName);
    const messagesCollection = db.collection('messages');

    const prompt = `
아래는 사용자의 이력서입니다:
${RESUME_TEXT}

위 이력서를 기반으로 다음 질문에 답변하고, 관련된 추천 질문 3개도 제안해주세요.

1. 질문에 대한 대답을 자연스럽게 한국어로 작성
2. 추천 질문 3개를 JSON 배열로 작성
3. 반드시 아래 JSON 형태로 응답:

{
    "message": "AI의 대답",
    "recommend_questions": ["질문1", "질문2", "질문3"]
}

사용자 질문: "${message}"
`;

    let response;
    try {
      response = await client_ai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '너는 이력서 기반으로 나를 설명해주는 비서야.' },
          { role: 'user', content: prompt },
        ],
      });
    } catch (aiError) {
      // OpenAI 인증/권한 오류라면 401로 반환
      const msg = aiError?.message || '';
      if (
        aiError?.status === 401 ||
        /api key|unauthorized|invalid api key/i.test(msg)
      ) {
        return NextResponse.json(
          { error: 'OpenAI 인증 실패(401): OPENAI_API_KEY를 확인하세요.' },
          { 
            status: 401,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
          }
        );
      }
      // 기타 OpenAI 오류는 502로 반환
      return NextResponse.json(
        { error: `OpenAI 호출 실패: ${msg || 'Bad Gateway'}` },
        { 
          status: 502,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    const rawOutput = response.choices[0]?.message?.content || '';
    let parsed;
    try {
      parsed = JSON.parse(rawOutput);
    } catch (e) {
      parsed = { message: rawOutput, recommend_questions: [] };
    }

    // MongoDB 저장
    await messagesCollection.insertOne({
      username: username,
      user_message: message,
      bot_reply: parsed.message || '',
      recommend_questions: parsed.recommend_questions || [],
      timestamp: Date.now() / 1000,
    });

    return NextResponse.json({
      bot_reply: parsed.message || '',
      recommend_questions: parsed.recommend_questions || [],
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    
    // MongoDB 연결 에러인지 확인
    if (error.message && error.message.includes('Mongo')) {
      console.error('MongoDB connection error:', error.message);
      return NextResponse.json(
        { error: 'MongoDB 연결 오류가 발생했습니다. 환경 변수를 확인해주세요.' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

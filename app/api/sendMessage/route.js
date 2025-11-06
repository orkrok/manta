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

export async function POST(request) {
  try {
    const data = await request.json();
    const username = data.username || 'anonymous';
    const message = data.message || '';

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

    const response = await client_ai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '너는 이력서 기반으로 나를 설명해주는 비서야.' },
        { role: 'user', content: prompt },
      ],
    });

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
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    
    // MongoDB 연결 에러인지 확인
    if (error.message && error.message.includes('Mongo')) {
      console.error('MongoDB connection error:', error.message);
      return NextResponse.json(
        { error: 'MongoDB 연결 오류가 발생했습니다. 환경 변수를 확인해주세요.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

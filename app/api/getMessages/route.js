import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
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

    const messages = await messagesCollection
      .find({})
      .project({ _id: 0 })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    
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

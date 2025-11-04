import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const mongoClient = await clientPromise;
    const db = mongoClient.db();
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
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

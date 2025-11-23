import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/jwt';
import { getUserById } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    // 토큰에서 사용자 정보 추출
    const decoded = await getAuthUser(request);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 데이터베이스에서 사용자 정보 조회
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 제외하고 반환
    const { password: _, ...userWithoutPassword } = {
      ...user,
      _id: user._id.toString(),
    };

    return NextResponse.json(
      {
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import { getAuthUser } from './jwt';

/**
 * 인증이 필요한 API 라우트를 보호하는 미들웨어
 * @param {Function} handler - 원본 핸들러 함수
 * @returns {Function} 인증 검증이 추가된 핸들러
 */
export function withAuth(handler) {
  return async (request, ...args) => {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 요청 객체에 사용자 정보 추가
    request.user = user;
    
    return handler(request, ...args);
  };
}

/**
 * API 라우트에서 인증된 사용자 정보 가져오기
 * @param {Request} request - Next.js Request 객체
 * @returns {Promise<Object|null>} 사용자 정보 또는 null
 */
export async function requireAuth(request) {
  const user = await getAuthUser(request);
  
  if (!user) {
    throw new Error('인증이 필요합니다.');
  }
  
  return user;
}


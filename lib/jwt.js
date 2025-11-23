import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * JWT 토큰 생성
 * @param {Object} payload - 토큰에 포함할 데이터 (예: { userId, email })
 * @returns {string} JWT 토큰
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * JWT 토큰 검증
 * @param {string} token - 검증할 JWT 토큰
 * @returns {Object|null} 디코딩된 토큰 데이터 또는 null
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * 요청에서 JWT 토큰 추출
 * @param {Request} request - Next.js Request 객체
 * @returns {string|null} 토큰 또는 null
 */
export async function getTokenFromRequest(request) {
  // Authorization 헤더에서 토큰 추출
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 쿠키에서 토큰 추출
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (token) {
    return token;
  }

  return null;
}

/**
 * 인증된 사용자 정보 가져오기
 * @param {Request} request - Next.js Request 객체
 * @returns {Promise<Object|null>} 사용자 정보 또는 null
 */
export async function getAuthUser(request) {
  const token = await getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  return decoded;
}


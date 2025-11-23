import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';

/**
 * 비밀번호 해싱
 * @param {string} password - 평문 비밀번호
 * @returns {Promise<string>} 해시된 비밀번호
 */
export async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * 비밀번호 검증
 * @param {string} password - 평문 비밀번호
 * @param {string} hashedPassword - 해시된 비밀번호
 * @returns {Promise<boolean>} 일치 여부
 */
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * 사용자 이메일로 조회
 * @param {string} email - 사용자 이메일
 * @returns {Promise<Object|null>} 사용자 정보 또는 null
 */
export async function getUserByEmail(email) {
  const client = await clientPromise;
  let dbName = process.env.MONGO_DB_NAME;
  if (!dbName) {
    try {
      const uri = new URL(process.env.MONGO_URI);
      dbName = uri.pathname.slice(1) || 'test';
    } catch {
      dbName = 'test';
    }
  }
  const db = client.db(dbName);
  const usersCollection = db.collection('users');
  
  return await usersCollection.findOne({ email });
}

/**
 * 사용자 ID로 조회
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object|null>} 사용자 정보 또는 null
 */
export async function getUserById(userId) {
  const client = await clientPromise;
  let dbName = process.env.MONGO_DB_NAME;
  if (!dbName) {
    try {
      const uri = new URL(process.env.MONGO_URI);
      dbName = uri.pathname.slice(1) || 'test';
    } catch {
      dbName = 'test';
    }
  }
  const db = client.db(dbName);
  const usersCollection = db.collection('users');
  
  // ObjectId로 변환 시도
  let queryId;
  try {
    queryId = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
  } catch {
    queryId = userId;
  }
  
  return await usersCollection.findOne({ _id: queryId });
}

/**
 * 새 사용자 생성
 * @param {string} email - 이메일
 * @param {string} password - 평문 비밀번호
 * @param {string} name - 이름 (선택)
 * @returns {Promise<Object>} 생성된 사용자 정보
 */
export async function createUser(email, password, name = '') {
  const client = await clientPromise;
  let dbName = process.env.MONGO_DB_NAME;
  if (!dbName) {
    try {
      const uri = new URL(process.env.MONGO_URI);
      dbName = uri.pathname.slice(1) || 'test';
    } catch {
      dbName = 'test';
    }
  }
  const db = client.db(dbName);
  const usersCollection = db.collection('users');
  
  const hashedPassword = await hashPassword(password);
  
  const newUser = {
    email,
    password: hashedPassword,
    name: name || email.split('@')[0],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await usersCollection.insertOne(newUser);
  
  // 비밀번호 제외하고 반환
  const { password: _, ...userWithoutPassword } = {
    ...newUser,
    _id: result.insertedId.toString(),
  };
  
  return userWithoutPassword;
}


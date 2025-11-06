import { MongoClient } from 'mongodb';

if (!process.env.MONGO_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

let uri = process.env.MONGO_URI;

// URI에서 retryWrites 파라미터 제거 (옵션에서 명시적으로 설정하므로)
try {
  const url = new URL(uri);
  if (url.searchParams.has('retryWrites')) {
    url.searchParams.delete('retryWrites');
    uri = url.toString();
  }
} catch (e) {
  // URI가 URL 형식이 아닌 경우 그대로 사용
  // MongoDB URI는 mongodb:// 또는 mongodb+srv://로 시작하므로 일반적으로 URL 파싱 가능
}

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true, // 명시적으로 설정
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // 개발 환경에서는 전역 변수에 저장하여 재사용
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 프로덕션 환경
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

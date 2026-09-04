import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initDb() {
  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    // 오프라인 영속성 활성화: 컴포넌트 언마운트/재마운트 시 데이터 유실 방지
    return initializeFirestore(app, { localCache: persistentLocalCache() });
  }
  return getFirestore(getApp());
}

export const db = initDb();

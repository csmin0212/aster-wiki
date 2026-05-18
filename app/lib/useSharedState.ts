'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Firestore 기반 공유 상태 훅.
 * localStorage 대신 Firestore 문서를 읽고 쓰며,
 * onSnapshot 으로 다른 접속자 변경 사항을 실시간 반영.
 *
 * @param key       Firestore app_state 컬렉션의 문서 ID ('goddess' | 'silver-road')
 * @param defaults  문서가 없을 때 사용할 초기값
 */
const CACHE_PREFIX = 'aster-cache-';

function readCache<T>(key: string, defaults: T): T {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : defaults;
  } catch { return defaults; }
}

function writeCache<T>(key: string, value: T) {
  try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value)); } catch {}
}

export function useSharedState<T extends object>(key: string, defaults: T) {
  // ① 캐시가 있으면 즉시 표시 — 없으면 기본값
  const [state, setState]   = useState<T>(() => readCache(key, defaults));
  const [loaded, setLoaded] = useState<boolean>(() =>
    typeof window !== 'undefined' && !!localStorage.getItem(CACHE_PREFIX + key)
  );

  useEffect(() => {
    // ② Firebase 동기화 (백그라운드)
    const timeout = setTimeout(() => {
      console.warn('[useSharedState] Firebase 응답 없음 — 캐시/기본값으로 진행');
      setLoaded(true);
    }, 6000);

    const ref   = doc(db, 'app_state', key);
    const unsub = onSnapshot(ref, (snap) => {
      clearTimeout(timeout);
      const data = snap.exists() ? (snap.data() as T) : defaults;
      setState(data);
      writeCache(key, data);   // 캐시 갱신
      setLoaded(true);
    }, (err) => {
      clearTimeout(timeout);
      console.error('[useSharedState] Firestore 오류:', err.code, err.message);
      setLoaded(true);
    });

    return () => { clearTimeout(timeout); unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = (newState: T) => {
    setState(newState);              // ③ UI 즉시 반영
    writeCache(key, newState);       // ④ 캐시 즉시 저장
    setDoc(doc(db, 'app_state', key), newState)   // ⑤ Firebase 비동기
      .catch(err => console.error('[useSharedState] 저장 실패:', err));
  };

  return { state, save, loaded };
}

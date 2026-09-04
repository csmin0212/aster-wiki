'use client';

import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

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
  const [state, setState]   = useState<T>(() => readCache(key, defaults));
  const [loaded, setLoaded] = useState<boolean>(() =>
    typeof window !== 'undefined' && !!localStorage.getItem(CACHE_PREFIX + key)
  );
  // pending write 중 onSnapshot 덮어쓰기 방지
  const pendingRef = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('[useSharedState] Firebase 응답 없음 — 캐시/기본값으로 진행');
      setLoaded(true);
    }, 6000);

    const ref   = doc(db, 'app_state', key);
    const unsub = onSnapshot(ref, (snap) => {
      clearTimeout(timeout);
      // 로컬에서 쓰기 중이면 서버 데이터로 덮어쓰지 않음
      if (!pendingRef.current) {
        const data = snap.exists() ? (snap.data() as T) : defaults;
        setState(data);
        writeCache(key, data);
      }
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
    setState(newState);
    writeCache(key, newState);
    pendingRef.current = true;
    setDoc(doc(db, 'app_state', key), newState)
      .then(() => { pendingRef.current = false; })
      .catch(err => {
        pendingRef.current = false;
        console.error('[useSharedState] 저장 실패:', err);
      });
  };

  return { state, save, loaded };
}

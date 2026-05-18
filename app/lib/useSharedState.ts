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
export function useSharedState<T extends object>(key: string, defaults: T) {
  const [state, setState]   = useState<T>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 6초 안에 Firebase 응답 없으면 기본값으로 진행
    const timeout = setTimeout(() => {
      console.warn('[useSharedState] Firebase 응답 없음 — 기본값으로 진행');
      setLoaded(true);
    }, 6000);

    const ref   = doc(db, 'app_state', key);
    const unsub = onSnapshot(ref, (snap) => {
      clearTimeout(timeout);
      setState(snap.exists() ? (snap.data() as T) : defaults);
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
    setState(newState);                               // 즉시 UI 반영
    setDoc(doc(db, 'app_state', key), newState)       // 비동기 저장
      .catch(err => console.error('[useSharedState] 저장 실패:', err));
  };

  return { state, save, loaded };
}

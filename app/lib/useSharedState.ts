'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const CACHE_PREFIX   = 'aster-cache-';
const PENDING_PREFIX = 'aster-pending-';

/**
 * 모듈 레벨 Set — 컴포넌트가 언마운트/리마운트돼도 유지됨.
 * pendingRef(useRef)는 인스턴스가 사라지면 같이 사라져서
 * 다른 뷰 다녀오면 pending 상태가 초기화되는 버그가 있었음.
 */
const pendingWrites = new Set<string>();

// ── localStorage 캐시 헬퍼 ────────────────────────────────────

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

// ── 새로고침 후에도 살아남는 pending 플래그 (localStorage) ────

function markPending(key: string) {
  try { localStorage.setItem(PENDING_PREFIX + key, Date.now().toString()); } catch {}
}

function clearPending(key: string) {
  try { localStorage.removeItem(PENDING_PREFIX + key); } catch {}
}

/**
 * 저장 직후 새로고침해도 onSnapshot이 구버전으로 덮어쓰는 걸 방지.
 * setDoc이 30초 안에 완료되지 않으면(네트워크 끊김 등) pending을 해제함.
 */
function isPending(key: string): boolean {
  try {
    const ts = parseInt(localStorage.getItem(PENDING_PREFIX + key) || '0');
    if (!ts) return false;
    return Date.now() - ts < 30_000;
  } catch { return false; }
}

// ── 훅 ───────────────────────────────────────────────────────

export function useSharedState<T extends object>(key: string, defaults: T) {
  const [state, setState]   = useState<T>(() => readCache(key, defaults));
  const [loaded, setLoaded] = useState<boolean>(() =>
    typeof window !== 'undefined' && !!localStorage.getItem(CACHE_PREFIX + key)
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('[useSharedState] Firebase 응답 없음 — 캐시/기본값으로 진행');
      setLoaded(true);
    }, 6000);

    const ref   = doc(db, 'app_state', key);
    const unsub = onSnapshot(ref, (snap) => {
      clearTimeout(timeout);

      /**
       * pending 체크 2중 방어:
       *  1) pendingWrites(모듈 레벨) — 같은 페이지 세션에서 뷰 이동 후 복귀
       *  2) isPending(localStorage)  — 새로고침 직후
       *
       * 둘 중 하나라도 pending이면 Firestore 데이터로 덮어쓰지 않음.
       */
      if (!pendingWrites.has(key) && !isPending(key)) {
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
    // pending 마킹 (모듈 + localStorage 양쪽)
    pendingWrites.add(key);
    markPending(key);

    setState(newState);
    writeCache(key, newState);

    setDoc(doc(db, 'app_state', key), newState)
      .then(() => {
        pendingWrites.delete(key);
        clearPending(key);
      })
      .catch(err => {
        pendingWrites.delete(key);
        clearPending(key);
        console.error('[useSharedState] 저장 실패:', err);
      });
  };

  return { state, save, loaded };
}

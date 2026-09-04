'use client';

import { useState, useRef, useEffect } from 'react';
import { loadImageFile, cropToDataUrl, CropRect } from '../lib/resizeImage';

const PURPLE = "#7B5EA7";

// 미리보기용으로 원본을 이 크기까지 줄여 그린다 (큰 사진에서 렌더가 무거워지는 것 방지)
const PREVIEW_MAX = 900;
const MAX_ZOOM    = 4;

interface Props {
  file:     File;
  mob:      boolean;
  onCancel: () => void;
  onDone:   (dataUrl: string) => void;
}

/**
 * 정사각형 창 안에서 사진을 끌어 옮기고 확대해서 자를 위치를 정한다.
 * 창 밖으로 빈 곳이 생기지 않도록 항상 가장자리를 물고 있게 제한한다.
 */
export default function ImageCropper({ file, mob, onCancel, onDone }: Props) {
  const V = mob ? 260 : 320;                 // 자르기 창 한 변 (화면 px)

  const [bmp, setBmp]   = useState<ImageBitmap | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [prevSize, setPrevSize] = useState<{ w: number; h: number } | null>(null);
  const [err, setErr]   = useState('');
  const [z, setZ]       = useState(1);
  // null = 아직 손대지 않음 → 가운데를 잡는다
  const [off, setOff]   = useState<{ x: number; y: number } | null>(null);

  const drag    = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const pvScale = useRef(1);                 // 미리보기 px → 원본 px 배율

  // ── 파일 읽기 ──────────────────────────────────────────────
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const b = await loadImageFile(file);
        if (dead) { b.close?.(); return; }

        const s  = Math.min(1, PREVIEW_MAX / Math.max(b.width, b.height));
        const cv = document.createElement('canvas');
        cv.width  = Math.round(b.width  * s);
        cv.height = Math.round(b.height * s);
        cv.getContext('2d')?.drawImage(b, 0, 0, cv.width, cv.height);

        pvScale.current = s;
        setBmp(b);
        setPrevSize({ w: cv.width, h: cv.height });
        setPrevUrl(cv.toDataURL('image/jpeg', 0.85));
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : '사진을 읽지 못했습니다.');
      }
    })();
    return () => { dead = true; };
  }, [file]);

  if (err) {
    return (
      <Shell onCancel={onCancel}>
        <div style={{ padding: "28px 24px", fontSize: "13px", color: "#C0392B", fontWeight: 600 }}>⚠ {err}</div>
      </Shell>
    );
  }
  if (!prevUrl || !prevSize || !bmp) {
    return (
      <Shell onCancel={onCancel}>
        <div style={{ padding: "40px 24px", fontSize: "13px", color: "#999" }}>사진을 읽는 중…</div>
      </Shell>
    );
  }

  // ── 배치 계산 ──────────────────────────────────────────────
  const pw = prevSize.w, ph = prevSize.h;
  const base  = V / Math.min(pw, ph);        // 창을 가득 채우는 최소 배율
  const dispW = pw * base * z;
  const dispH = ph * base * z;

  const clampOff = (x: number, y: number) => ({
    x: Math.max(V - dispW, Math.min(0, x)),
    y: Math.max(V - dispH, Math.min(0, y)),
  });
  // 처음 열었을 때는 가운데가 잡히도록
  const start = off ?? { x: (V - dispW) / 2, y: (V - dispH) / 2 };
  const { x: ox, y: oy } = clampOff(start.x, start.y);

  // ── 조작 ──────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, ox, oy };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const d = drag.current;
    setOff(clampOff(d.ox + (e.clientX - d.px), d.oy + (e.clientY - d.py)));
  };
  const endDrag = () => { drag.current = null; };

  // 창 한가운데를 기준으로 확대/축소
  const zoomTo = (nz: number) => {
    const next = Math.max(1, Math.min(MAX_ZOOM, nz));
    const cx = (V / 2 - ox) / z;
    const cy = (V / 2 - oy) / z;
    const nw = pw * base * next, nh = ph * base * next;
    setOff({
      x: Math.max(V - nw, Math.min(0, V / 2 - cx * next)),
      y: Math.max(V - nh, Math.min(0, V / 2 - cy * next)),
    });
    setZ(next);
  };

  const reset = () => { setZ(1); setOff(null); };

  // ── 확정 ──────────────────────────────────────────────────
  const confirm = () => {
    const natPerDisp = 1 / (base * z * pvScale.current);
    const crop: CropRect = {
      sx:   -ox * natPerDisp,
      sy:   -oy * natPerDisp,
      side:  V  * natPerDisp,
    };
    try {
      onDone(cropToDataUrl(bmp, crop));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : '사진을 저장하지 못했습니다.');
    }
  };

  return (
    <Shell onCancel={onCancel}>
      <div style={{ padding: mob ? "18px 18px 22px" : "22px 24px 26px" }}>

        {/* 자르기 창 */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={e => zoomTo(z * (e.deltaY < 0 ? 1.12 : 1 / 1.12))}
          style={{
            position: "relative", width: V, height: V, margin: "0 auto",
            overflow: "hidden", borderRadius: 8, background: "#181614",
            cursor: "grab", touchAction: "none", userSelect: "none",
          }}
        >
          <img
            src={prevUrl}
            alt=""
            draggable={false}
            style={{
              position: "absolute", left: 0, top: 0,
              width: dispW, height: dispH,
              // Tailwind preflight의 img{max-width:100%}가 확대를 막으므로 해제
              maxWidth: "none", maxHeight: "none",
              transform: `translate(${ox}px, ${oy}px)`,
              pointerEvents: "none",
            }}
          />
          {/* 목록에서 보이는 모서리 둥글기를 그대로 표시 */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
            borderRadius: 8,
          }} />
        </div>

        <div style={{ textAlign: "center", fontSize: "11px", color: "#A79F92", margin: "10px 0 4px" }}>
          끌어서 위치를 옮기고, 아래에서 크기를 맞춥니다
        </div>

        {/* 배율 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <span style={{ fontSize: "14px" }}>🔍</span>
          <input
            type="range" min={1} max={MAX_ZOOM} step={0.01} value={z}
            onChange={e => zoomTo(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: PURPLE }}
          />
          <button onClick={reset} style={{
            padding: "5px 10px", background: "transparent", border: "1px solid #DDD",
            borderRadius: 6, fontSize: "11px", color: "#888", cursor: "pointer",
            fontFamily: "'Noto Sans KR',sans-serif", whiteSpace: "nowrap",
          }}>처음으로</button>
        </div>

        {/* 버튼 */}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={confirm} style={{
            flex: 1, padding: "11px 0", background: PURPLE, color: "#fff",
            border: "none", borderRadius: 8, fontSize: "14px", fontWeight: 700,
            cursor: "pointer", fontFamily: "'Noto Sans KR',sans-serif",
          }}>이 위치로 넣기</button>
          <button onClick={onCancel} style={{
            padding: "11px 20px", background: "transparent", color: "#888",
            border: "1px solid #DDD", borderRadius: 8, fontSize: "14px", fontWeight: 600,
            cursor: "pointer", fontFamily: "'Noto Sans KR',sans-serif",
          }}>취소</button>
        </div>
      </div>
    </Shell>
  );
}

// ─── 공통 껍데기 ──────────────────────────────────────────────

function Shell({ children, onCancel }: { children: React.ReactNode; onCancel: () => void }) {
  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2500,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, cursor: "pointer",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#FDFBF7", borderRadius: 14, maxWidth: 420, width: "100%",
        cursor: "default", boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
      }}>
        <div style={{
          padding: "18px 24px 14px", borderBottom: "1px solid #EDE8E0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: "15px", fontWeight: 700, color: "#2a2a2a" }}>
            사진 위치 맞추기
          </div>
          <button onClick={onCancel} style={{
            background: "none", border: "1px solid #DDD", borderRadius: 6,
            padding: "4px 11px", fontSize: "12px", color: "#777", cursor: "pointer",
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

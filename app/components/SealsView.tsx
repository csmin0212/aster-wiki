'use client';

import { useState } from 'react';
import { SEALS, Seal } from '../data/seals';

const INK = "#141A22";

const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

// ─── 육각 봉인석 ──────────────────────────────────────────────

function Hex({ seal, size, active, onClick }: {
  seal: Seal; size: number; active: boolean; onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const found  = seal.status === "recovered";
  const broken = seal.status === "broken";
  const lit    = found || broken;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={found ? seal.place : broken ? "파괴됨" : "행방 불명"}
      style={{
        position: "relative", width: size, height: size * 1.12,
        padding: 0, border: "none", background: "transparent",
        cursor: "pointer", transition: "transform 0.18s ease",
        transform: hover || active ? "translateY(-3px)" : "none",
      }}
    >
      {/* 테두리 */}
      <div style={{
        position: "absolute", inset: 0, clipPath: HEX,
        background: lit ? seal.color : "#3A4250",
        opacity: lit ? 1 : 0.55,
        boxShadow: lit ? `0 0 18px ${seal.color}` : "none",
      }} />
      {/* 안쪽 */}
      <div style={{
        position: "absolute", inset: 3, clipPath: HEX,
        background: lit
          ? `radial-gradient(circle at 38% 30%, ${seal.color}EE 0%, ${seal.color}55 55%, ${INK} 100%)`
          : "#1B212B",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 2,
      }}>
        <span style={{
          fontFamily: "'Noto Serif KR',serif",
          fontSize: size * 0.3, fontWeight: 700,
          color: lit ? "#FFF8E8" : "#4C5666",
          textShadow: lit ? `0 0 10px ${seal.color}` : "none",
          lineHeight: 1,
        }}>
          {lit ? seal.id : "?"}
        </span>
        {broken && (
          <span style={{ fontSize: size * 0.12, color: "#FF9A8A", fontWeight: 700 }}>파괴</span>
        )}
      </div>

      {/* 선택 표시 */}
      {active && (
        <div style={{
          position: "absolute", inset: -4, clipPath: HEX,
          border: `2px solid ${lit ? seal.color : "#5A6472"}`,
          pointerEvents: "none",
        }} />
      )}
    </button>
  );
}

// ─── 메인 ────────────────────────────────────────────────────

export default function SealsView({ mob }: { mob: boolean }) {
  const [sel, setSel] = useState<number>(
    SEALS.find(s => s.status === "recovered")?.id ?? 1
  );

  const total     = SEALS.length;
  const recovered = SEALS.filter(s => s.status === "recovered").length;
  const broken    = SEALS.filter(s => s.status === "broken").length;
  const pct       = Math.round((recovered / total) * 100);

  const cur  = SEALS.find(s => s.id === sel)!;
  const size = mob ? 68 : 82;

  return (
    <div style={{ maxWidth: 760, padding: mob ? "20px 16px 80px" : "28px 48px 80px" }}>

      {/* ── 헤더 ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.2em", color: "#8a8278", marginBottom: 6 }}>
          SEALING STONES
        </div>
        <h1 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: mob ? "22px" : "28px", fontWeight: 700, color: "#2a2a2a", marginBottom: 4 }}>
          봉인석
        </h1>
        <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.7 }}>
          마왕을 가둔 여섯 개의 돌. 하나라도 완전히 깨지면 봉인이 풀리기 시작한다.
        </p>
      </div>

      {/* ── 본체: 왼쪽 육각형 / 오른쪽 해방도 ──────────────── */}
      <div style={{
        display: "flex", flexDirection: mob ? "column" : "row",
        gap: mob ? 20 : 26, alignItems: "stretch",
        background: `linear-gradient(150deg, ${INK} 0%, #1D2530 100%)`,
        border: "1px solid #2C3542", borderRadius: 14,
        padding: mob ? "22px 18px" : "26px 28px",
        marginBottom: 18,
      }}>

        {/* 왼쪽 — 벌집 */}
        <div style={{
          flexShrink: 0, display: "flex", flexDirection: "column",
          alignItems: mob ? "center" : "flex-start",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {SEALS.slice(0, 3).map(s => (
              <Hex key={s.id} seal={s} size={size} active={sel === s.id} onClick={() => setSel(s.id)} />
            ))}
          </div>
          {/* 아랫줄 전체를 반 칸 밀어 벌집 모양으로 */}
          <div style={{
            display: "flex", gap: 6,
            marginTop: -size * 0.26,
            marginLeft: size * 0.5 + 3,
          }}>
            {SEALS.slice(3).map(s => (
              <Hex key={s.id} seal={s} size={size} active={sel === s.id} onClick={() => setSel(s.id)} />
            ))}
          </div>
        </div>

        {/* 오른쪽 — 해방도 */}
        <div style={{
          flex: 1, minWidth: 0,
          display: "flex", flexDirection: "column", justifyContent: "center",
          borderLeft: mob ? "none" : "1px solid #2C3542",
          borderTop: mob ? "1px solid #2C3542" : "none",
          paddingLeft: mob ? 0 : 26, paddingTop: mob ? 18 : 0,
        }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#6E7B8C", marginBottom: 6 }}>
            해방도
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{
              fontFamily: "'Noto Serif KR',serif", fontWeight: 700,
              fontSize: mob ? "44px" : "54px", lineHeight: 1,
              color: "#E8DFC8",
            }}>{pct}</span>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#8A94A4" }}>%</span>
            <span style={{ marginLeft: "auto", fontSize: "13px", color: "#8A94A4", fontWeight: 600 }}>
              {recovered} / {total}
            </span>
          </div>

          {/* 게이지 */}
          <div style={{
            display: "flex", gap: 3, marginTop: 12, marginBottom: 14,
          }}>
            {SEALS.map(s => (
              <div key={s.id} style={{
                flex: 1, height: 6, borderRadius: 3,
                background: s.status === "recovered" ? s.color
                          : s.status === "broken"    ? "#7A2E2E"
                          : "#2C3542",
                boxShadow: s.status === "recovered" ? `0 0 8px ${s.color}AA` : "none",
              }} />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: "12px" }}>
            <Row label="회수·수복" value={`${recovered}`} color="#9FD8A8" />
            <Row label="행방 불명" value={`${total - recovered - broken}`} color="#8A94A4" />
            <Row label="파괴됨"    value={`${broken}`} color={broken ? "#FF9A8A" : "#8A94A4"} />
          </div>
        </div>
      </div>

      {/* ── 선택한 봉인석 ──────────────────────────────────── */}
      <div style={{
        background: "#fff", border: "1px solid #E8E3DA", borderRadius: 12,
        padding: mob ? "18px 18px" : "20px 24px",
        borderLeft: `4px solid ${cur.status === "unknown" ? "#D6D0C6" : cur.color}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 22, height: 25, clipPath: HEX, flexShrink: 0,
            background: cur.status === "unknown" ? "#CFC9BE" : cur.color,
          }} />
          <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: "16px", fontWeight: 700, color: "#2a2a2a" }}>
            {cur.status === "unknown" ? `${cur.id}번째 봉인석` : cur.place}
          </div>
          {cur.nation && (
            <div style={{ fontSize: "11px", color: "#A79F92", marginLeft: "auto", flexShrink: 0 }}>
              {cur.nation}
            </div>
          )}
        </div>

        <div style={{ fontSize: "13px", lineHeight: 1.85, color: cur.record ? "#3a3a3a" : "#AAA" }}>
          {cur.record ?? "아직 찾지 못했다. 엘라는 가까워지면 알 수 있다고 했다."}
        </div>
      </div>

      <div style={{ fontSize: "11px", color: "#A79F92", marginTop: 12, lineHeight: 1.8 }}>
        육각형을 누르면 해당 봉인석의 기록을 볼 수 있습니다. 봉인석을 되돌릴 수 있는 것은 지금까지 엘라뿐입니다.
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#6E7B8C" }}>{label}</span>
      <span style={{ color, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

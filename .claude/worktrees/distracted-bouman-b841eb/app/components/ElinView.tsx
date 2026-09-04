'use client';

import { useState } from 'react';
import { ELIN_BOOKS, ElinBook } from '../data/elin';

const AMBER     = "#C4A86A";
const BROWN     = "#7A4E2D";
const PARCHMENT = "#F5EDD8";

const unlockedCount = ELIN_BOOKS.filter(b => b.unlocked).length;

export default function ElinView({ mob }: { mob: boolean }) {
  const [selected, setSelected] = useState<ElinBook | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [imgErr, setImgErr] = useState(false);

  const pad = mob ? "20px 16px 80px" : "28px 48px 80px";

  return (
    <div style={{ maxWidth: 760, padding: pad }}>

      {/* ── 헤더 ───────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${PARCHMENT} 0%, #EDD8A8 100%)`,
        border: `1px solid ${AMBER}`,
        borderRadius: 14,
        padding: mob ? "20px 18px" : "24px 28px",
        marginBottom: 24,
        display: "flex",
        gap: mob ? 16 : 22,
        alignItems: "center",
        flexDirection: mob ? "column" : "row",
      }}>
        <div style={{
          width: mob ? 72 : 88, height: mob ? 72 : 88,
          borderRadius: 10, overflow: "hidden", flexShrink: 0,
          border: `2px solid ${AMBER}`,
          background: "#EDD8A8",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {!imgErr
            ? <img src="/npcs/cardea/elin.jpg" alt="엘린" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErr(true)} />
            : <span style={{ fontSize: "28px" }}>📚</span>
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", color: BROWN, opacity: 0.55, marginBottom: 4 }}>
            ANCIENT CODEX · 엘린
          </div>
          <h1 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: mob ? "20px" : "24px", fontWeight: 700, color: "#2A1A0A", margin: "0 0 10px" }}>
            고서 해독
          </h1>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: "'Noto Serif KR',serif", fontSize: "22px", fontWeight: 700, color: BROWN }}>
              {unlockedCount}
            </span>
            <span style={{ fontSize: "13px", color: "#AAA" }}>/ 12 기록 해독됨</span>
            {unlockedCount === 12 && (
              <div style={{ marginLeft: 4, background: BROWN, color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: "10px", fontWeight: 700 }}>
                ★ 완전 해독
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 책 그리드 ──────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${mob ? 3 : 4}, 1fr)`,
        gap: mob ? 10 : 14,
      }}>
        {ELIN_BOOKS.map(book => {
          const isHovered = hoveredId === book.id;
          return (
            <div
              key={book.id}
              onClick={() => book.unlocked && setSelected(book)}
              onMouseEnter={() => setHoveredId(book.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: "relative",
                aspectRatio: "3/4",
                cursor: book.unlocked ? "pointer" : "default",
                borderRadius: 8,
                overflow: "hidden",
                border: `2px solid ${book.unlocked ? AMBER : "#555"}`,
                transform: book.unlocked && isHovered ? "translateY(-4px)" : "translateY(0)",
                boxShadow: book.unlocked && isHovered
                  ? `0 10px 28px ${AMBER}70`
                  : book.unlocked
                    ? `0 2px 8px ${AMBER}30`
                    : "0 2px 6px rgba(0,0,0,0.18)",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                background: book.unlocked ? "#C4A86A" : "#1E1E1E",
              }}
            >
              {/* 책 이미지 */}
              <img
                src={book.unlocked ? "/elin-book-unlocked.jpg" : "/elin-book-locked.jpg"}
                alt={book.unlocked ? book.title : `기록 ${book.id}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />

              {/* 번호 배지 */}
              <div style={{
                position: "absolute", top: 6, left: 6,
                background: book.unlocked ? "rgba(80,40,5,0.78)" : "rgba(0,0,0,0.72)",
                color: book.unlocked ? "#F5EDD8" : "#888",
                borderRadius: 4, padding: "2px 7px",
                fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
              }}>
                {String(book.id).padStart(2, '0')}
              </div>

              {/* 호버 제목 */}
              {isHovered && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: book.unlocked
                    ? "linear-gradient(to top, rgba(50,22,5,0.95) 0%, transparent 100%)"
                    : "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)",
                  padding: "28px 8px 10px",
                  textAlign: "center",
                }}>
                  <div style={{
                    fontSize: mob ? "10px" : "11px", fontWeight: 600,
                    color: book.unlocked ? "#F5EDD8" : "#555",
                    lineHeight: 1.4,
                    fontFamily: "'Noto Serif KR',serif",
                  }}>
                    {book.unlocked ? book.title : "— 미해독 —"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 내용 모달 ──────────────────────────────────────── */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.68)",
            zIndex: 2000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, cursor: "pointer",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#FDF6E8",
              borderRadius: 14,
              maxWidth: 520, width: "100%",
              maxHeight: "82vh", overflow: "auto",
              cursor: "default",
              boxShadow: "0 28px 72px rgba(0,0,0,0.55)",
              border: `1px solid ${AMBER}`,
            }}
          >
            {/* 모달 헤더 */}
            <div style={{
              padding: "22px 26px 16px",
              background: `linear-gradient(135deg, ${PARCHMENT} 0%, #EDD8A8 100%)`,
              borderBottom: `1px solid ${AMBER}50`,
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", color: BROWN, opacity: 0.55, marginBottom: 6 }}>
                  RECORD {String(selected.id).padStart(2, '0')}
                </div>
                <h2 style={{
                  fontFamily: "'Noto Serif KR',serif",
                  fontSize: "18px", fontWeight: 700,
                  color: "#2A1A0A", margin: 0,
                }}>
                  {selected.title}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  padding: "5px 12px", flexShrink: 0, marginLeft: 16,
                  background: "transparent",
                  border: `1px solid ${AMBER}80`,
                  borderRadius: 5, fontSize: "12px", color: BROWN,
                  cursor: "pointer", fontFamily: "'Noto Sans KR',sans-serif",
                }}
              >✕ 닫기</button>
            </div>

            {/* 본문 */}
            <div style={{
              padding: mob ? "28px 22px 36px" : "40px 48px 48px",
              fontFamily: "'Noto Serif KR',serif",
              fontSize: mob ? "14px" : "15px",
              lineHeight: 2.4,
              color: "#3A2010",
              whiteSpace: "pre-line",
              textAlign: "center",
              letterSpacing: "0.05em",
            }}>
              {selected.content
                ? selected.content
                : <span style={{ color: "#BBB", fontStyle: "italic", fontSize: "13px" }}>내용이 아직 기록되지 않았습니다.</span>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

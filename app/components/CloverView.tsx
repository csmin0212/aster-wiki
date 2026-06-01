'use client';

import { useState, useEffect } from 'react';
import { useSharedState } from '../lib/useSharedState';
import { CLOVER_ITEMS, CloverItem } from '../data/clover';
import { WHState, GoldLog, WAREHOUSE_DEFAULT } from './WarehouseView';

const GREEN     = "#2F8F57";
const GREEN_BDR = "#7FC79A";
const GREEN_DK  = "#0E2A18";

// ─── 상태 타입 ────────────────────────────────────────────────

interface CloverPurchase {
  at:    string;
  by?:   string;
  stat?: string;   // 성장의 비약: 지정한 스테이터스
}

interface CloverLogEntry {
  id:        string;
  itemName:  string;
  price:     number;
  by?:       string;
  stat?:     string;
  timestamp: string;
}

interface CloverState {
  purchased: Record<string, CloverPurchase>;
  log:       CloverLogEntry[];
}

const CLOVER_DEFAULT: CloverState = { purchased: {}, log: [] };

// ─── 유틸 ─────────────────────────────────────────────────────

function ts(): string {
  return new Date().toLocaleString('ko-KR', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}
function uid(): string { return Date.now().toString() + Math.random().toString(36).slice(2, 6); }

// ─── 진열 아이템 카드 ─────────────────────────────────────────

function ItemSlot({ item, sold, mob, onClick, onContext }: {
  item: CloverItem; sold: boolean; mob: boolean;
  onClick: () => void;
  onContext?: (e: React.MouseEvent) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const [hover, setHover]   = useState(false);
  const locked = item.type === "locked";
  const dim    = locked || sold;
  const clickable = !locked && !sold;

  return (
    <div
      onClick={clickable ? onClick : undefined}
      onContextMenu={sold && onContext ? onContext : undefined}
      title={sold ? "우클릭 → 구매 취소(환불)" : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: 12,
        overflow: "hidden",
        cursor: clickable ? "pointer" : "default",
        border: `2px solid ${locked ? "#3A3A3A" : sold ? "#C9C2B6" : GREEN_BDR}`,
        background: locked
          ? "#1B1B1B"
          : sold
            ? "#EFece4"
            : "linear-gradient(150deg, #F6FBF6 0%, #E4F2E8 100%)",
        transform: clickable && hover ? "translateY(-4px)" : "translateY(0)",
        boxShadow: clickable && hover
          ? `0 10px 26px ${GREEN}55`
          : clickable ? `0 2px 8px ${GREEN}22` : "0 2px 6px rgba(0,0,0,0.12)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 8,
        opacity: dim ? 0.7 : 1,
      }}>

      {/* 아이콘 / 이미지 */}
      <div style={{
        fontSize: mob ? "34px" : "42px",
        filter: dim ? "grayscale(0.6)" : "none",
        lineHeight: 1,
      }}>
        {item.image && !imgErr
          ? <img src={item.image} alt={item.name} onError={() => setImgErr(true)}
              style={{ width: mob ? 48 : 60, height: mob ? 48 : 60, objectFit: "contain" }} />
          : item.icon}
      </div>

      {/* 이름 */}
      <div style={{
        marginTop: 8, textAlign: "center",
        fontSize: mob ? "11px" : "12px", fontWeight: 700,
        fontFamily: "'Noto Serif KR',serif",
        color: locked ? "#666" : sold ? "#A39C90" : "#1E4A30",
        lineHeight: 1.3,
      }}>
        {locked ? "미해금" : item.name}
      </div>

      {/* 가격 */}
      {!locked && (
        <div style={{
          marginTop: 3, fontSize: "11px", fontWeight: 700,
          color: sold ? "#B8B0A2" : "#B8860B",
        }}>
          {sold ? "판매 완료" : `${item.price.toLocaleString()} G`}
        </div>
      )}

      {/* SOLD 오버레이 */}
      {sold && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "rgba(120,110,95,0.92)", color: "#fff",
          fontSize: "9px", fontWeight: 800, letterSpacing: "0.08em",
          padding: "2px 7px", borderRadius: 4,
        }}>SOLD</div>
      )}
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────

export default function CloverView({ mob }: { mob: boolean }) {
  // 골드는 공용 창고 문서를 공유
  const wh     = useSharedState<WHState>('warehouse', WAREHOUSE_DEFAULT);
  const clover = useSharedState<CloverState>('clover', CLOVER_DEFAULT);

  const [imgErr, setImgErr] = useState(false);
  const [sel, setSel]       = useState<CloverItem | null>(null);
  const [buyer, setBuyer]   = useState('');
  const [statIn, setStatIn] = useState('');
  const [err, setErr]       = useState('');
  const [ctx, setCtx]       = useState<{ id: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const close = () => setCtx(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const loaded = wh.loaded && clover.loaded;
  if (!loaded) return (
    <div style={{ padding: "60px 48px", color: "#AAA", fontSize: "14px" }}>불러오는 중…</div>
  );

  const gold      = wh.state.gold ?? 0;
  const purchased = clover.state.purchased ?? {};

  const openItem = (item: CloverItem) => {
    setSel(item); setBuyer(''); setStatIn(''); setErr('');
  };
  const closeModal = () => { setSel(null); setErr(''); };

  // ── 구매 ──────────────────────────────────────────────────────
  const buy = () => {
    if (!sel) return;
    setErr('');
    if (purchased[sel.id]) { setErr('이미 판매된 물건입니다.'); return; }
    if (gold < sel.price)  { setErr(`골드가 부족합니다. (보유 ${gold.toLocaleString()}G / 필요 ${sel.price.toLocaleString()}G)`); return; }
    if (sel.type === 'stat-potion' && !statIn.trim()) {
      setErr('올릴 스테이터스를 입력하세요.'); return;
    }

    // ① 공용 창고 골드 차감 + 골드 기록
    const newGold = gold - sel.price;
    const note = sel.type === 'stat-potion'
      ? `클로버 상회: ${sel.name} (${statIn.trim()})`
      : `클로버 상회: ${sel.name}`;
    const goldEntry: GoldLog = {
      id: uid(), action: 'withdraw', amount: sel.price,
      person: buyer.trim() ? `${buyer.trim()} · ${note}` : note,
      timestamp: ts(), prevGold: gold, newGold,
    };
    wh.save({
      ...wh.state,
      gold: newGold,
      goldLog: [goldEntry, ...(wh.state.goldLog ?? [])].slice(0, 100),
    });

    // ② 클로버 구매 상태 기록 (아이템 소진)
    const purchase: CloverPurchase = {
      at: ts(),
      ...(buyer.trim()  && { by: buyer.trim() }),
      ...(sel.type === 'stat-potion' && { stat: statIn.trim() }),
    };
    const logEntry: CloverLogEntry = {
      id: uid(), itemName: sel.name, price: sel.price, timestamp: ts(),
      ...(buyer.trim()  && { by: buyer.trim() }),
      ...(sel.type === 'stat-potion' && { stat: statIn.trim() }),
    };
    clover.save({
      ...clover.state,
      purchased: { ...purchased, [sel.id]: purchase },
      log: [logEntry, ...(clover.state.log ?? [])].slice(0, 100),
    });

    closeModal();
  };

  // ── 구매 취소 (환불) ─────────────────────────────────────────
  const refund = (itemId: string) => {
    const item = CLOVER_ITEMS.find(i => i.id === itemId);
    const p    = purchased[itemId];
    if (!item || !p) return;

    // 골드 환급
    const newGold = gold + item.price;
    const goldEntry: GoldLog = {
      id: uid(), action: 'deposit', amount: item.price,
      person: `클로버 상회 환불: ${item.name}`,
      timestamp: ts(), prevGold: gold, newGold,
    };
    wh.save({
      ...wh.state,
      gold: newGold,
      goldLog: [goldEntry, ...(wh.state.goldLog ?? [])].slice(0, 100),
    });

    // 구매 상태 해제 (다시 진열)
    const next = { ...purchased };
    delete next[itemId];
    clover.save({ ...clover.state, purchased: next });
  };

  const pad = mob ? "20px 16px 80px" : "28px 48px 80px";
  const cols = mob ? 2 : 4;

  return (
    <div style={{ maxWidth: 760, padding: pad }}>

      {/* ── 헤더 ───────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${GREEN_DK} 0%, #16432A 100%)`,
        border: `1px solid ${GREEN_BDR}30`,
        borderRadius: 14,
        padding: mob ? "22px 18px" : "28px 32px",
        marginBottom: 20,
        display: "flex",
        gap: mob ? 20 : 28,
        alignItems: "center",
        flexDirection: mob ? "column" : "row",
      }}>
        {/* 상회 사진 */}
        <div style={{
          width: mob ? 100 : 130, height: mob ? 100 : 130,
          borderRadius: "50%", overflow: "hidden", flexShrink: 0,
          border: `2px solid ${GREEN_BDR}50`,
          boxShadow: `0 0 28px ${GREEN}45`,
          background: "#041209",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {!imgErr
            ? <img src="/clover-symbol.jpg" alt="클로버 상회" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErr(true)} />
            : <span style={{ fontSize: "44px" }}>🍀</span>}
        </div>

        {/* 정보 */}
        <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.25em", color: GREEN_BDR, marginBottom: 4 }}>
            CLOVER TRADING CO.
          </div>
          <h1 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: mob ? "20px" : "24px", fontWeight: 700, color: "#E8F7EC", margin: "0 0 6px" }}>
            클로버 상회
          </h1>
          <p style={{ fontSize: "12px", color: "#8FC4A2", lineHeight: 1.6, margin: "0 0 14px" }}>
            어디선가 흘러들어온 특별한 물건들을 취급하는 상점. 같은 물건은 두 번 들어오지 않는다.
          </p>

          {/* 보유 골드 (공용 창고 연동) */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(184,134,11,0.15)", border: "1px solid #B8860B66",
            borderRadius: 9, padding: "8px 14px",
          }}>
            <span style={{ fontSize: "16px" }}>💰</span>
            <span style={{ fontSize: "11px", color: "#C9A94E", fontWeight: 600 }}>공용 골드</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#E8C45A" }}>
              {gold.toLocaleString()} G
            </span>
          </div>
        </div>
      </div>

      {/* ── 진열 그리드 (4 x 2) ─────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: mob ? 10 : 14,
        marginBottom: 20,
      }}>
        {CLOVER_ITEMS.map(item => (
          <ItemSlot
            key={item.id}
            item={item}
            sold={!!purchased[item.id]}
            mob={mob}
            onClick={() => openItem(item)}
            onContext={ev => { ev.preventDefault(); ev.stopPropagation(); setCtx({ id: item.id, x: ev.clientX, y: ev.clientY }); }}
          />
        ))}
      </div>

      {/* ── 구매 기록 ──────────────────────────────────────── */}
      {(clover.state.log ?? []).length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", marginBottom: 12 }}>
            구매 기록
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 260, overflowY: "auto" }}>
            {(clover.state.log ?? []).map(l => (
              <div key={l.id} style={{
                fontSize: "12px", padding: "7px 12px",
                background: "#F2FAF4", borderRadius: 6,
                borderLeft: `3px solid ${GREEN}80`, lineHeight: 1.6,
              }}>
                <span style={{ color: "#BBB", marginRight: 8, fontSize: "11px" }}>{l.timestamp}</span>
                {l.by && <><span style={{ fontWeight: 700, color: "#333" }}>{l.by}</span><span style={{ color: "#777" }}> · </span></>}
                <span style={{ fontWeight: 600, color: "#1E4A30" }}>{l.itemName}</span>
                {l.stat && <span style={{ color: GREEN, fontWeight: 600 }}> [{l.stat} +1]</span>}
                <span style={{ color: "#B8860B", fontWeight: 700 }}> · -{l.price.toLocaleString()}G</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 구매 모달 ──────────────────────────────────────── */}
      {sel && (
        <div onClick={closeModal} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "pointer",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#FBFDF9", borderRadius: 16, maxWidth: 460, width: "100%",
            maxHeight: "85vh", overflow: "auto", cursor: "default",
            boxShadow: "0 28px 72px rgba(0,0,0,0.5)", border: `1px solid ${GREEN_BDR}`,
          }}>
            {/* 모달 헤더 */}
            <div style={{
              padding: "26px 28px 20px",
              background: `linear-gradient(135deg, ${GREEN_DK} 0%, #16432A 100%)`,
              display: "flex", gap: 16, alignItems: "center",
            }}>
              <div style={{ fontSize: "44px", lineHeight: 1 }}>{sel.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", color: GREEN_BDR, marginBottom: 4 }}>
                  CLOVER TRADING CO.
                </div>
                <h2 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: "20px", fontWeight: 700, color: "#E8F7EC", margin: 0 }}>
                  {sel.name}
                </h2>
                <div style={{ marginTop: 6, fontSize: "16px", fontWeight: 800, color: "#E8C45A" }}>
                  {sel.price.toLocaleString()} G
                  {sel.consumable && <span style={{ fontSize: "11px", color: "#8FC4A2", fontWeight: 500, marginLeft: 8 }}>소모품</span>}
                </div>
              </div>
            </div>

            {/* 본문 */}
            <div style={{ padding: mob ? "20px 22px 24px" : "24px 28px 28px" }}>
              {/* 상세 정보 */}
              <div style={{ fontSize: "14px", lineHeight: 1.8, color: "#2A2A2A", marginBottom: sel.flavor ? 16 : 20 }}>
                {sel.desc}
              </div>

              {/* 플레이버 텍스트 */}
              {sel.flavor && (
                <div style={{
                  fontFamily: "'Noto Serif KR',serif", fontStyle: "italic",
                  fontSize: "13px", lineHeight: 1.9, color: "#5A6B5E",
                  background: "#EEF6EF", borderRadius: 8,
                  borderLeft: `3px solid ${GREEN}`, padding: "12px 16px", marginBottom: 20,
                }}>
                  {sel.flavor}
                </div>
              )}

              {/* 성장의 비약: 스테이터스 지정 */}
              {sel.type === 'stat-potion' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: 6 }}>
                    올릴 스테이터스 <span style={{ color: "#E74C3C" }}>*</span>
                  </label>
                  <input
                    placeholder="예: 근력 / 민첩 / 감각 / 정신 …"
                    value={statIn} onChange={e => setStatIn(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && buy()}
                    style={inputStyle}
                  />
                </div>
              )}

              {/* 구매자 (선택) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: 6 }}>
                  구매자 <span style={{ fontWeight: 400, color: "#AAA" }}>(선택)</span>
                </label>
                <input
                  placeholder="이름"
                  value={buyer} onChange={e => setBuyer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && buy()}
                  style={inputStyle}
                />
              </div>

              {err && (
                <div style={{ fontSize: "12px", color: "#E74C3C", fontWeight: 600, marginBottom: 12 }}>⚠ {err}</div>
              )}

              {/* 버튼 */}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={buy} style={{
                  flex: 1, padding: "12px 0",
                  background: gold >= sel.price ? GREEN : "#BBB",
                  color: "#fff", border: "none", borderRadius: 8,
                  fontSize: "14px", fontWeight: 700,
                  cursor: gold >= sel.price ? "pointer" : "not-allowed",
                  fontFamily: "'Noto Sans KR',sans-serif",
                }}>
                  💰 구매 ({sel.price.toLocaleString()}G)
                </button>
                <button onClick={closeModal} style={{
                  padding: "12px 22px", background: "transparent",
                  color: "#888", border: "1px solid #DDD", borderRadius: 8,
                  fontSize: "14px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Noto Sans KR',sans-serif",
                }}>취소</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 우클릭 메뉴는 그리드 카드에서 사용 (환불) */}
      {ctx && (
        <div onClick={e => e.stopPropagation()} style={{
          position: "fixed", left: ctx.x, top: ctx.y,
          background: "#fff", border: "1px solid #E0DDD8", borderRadius: 7,
          boxShadow: "0 4px 16px rgba(0,0,0,0.13)", zIndex: 9999, overflow: "hidden", minWidth: 130,
        }}>
          <button onClick={() => { refund(ctx.id); setCtx(null); }} style={{
            display: "block", width: "100%", padding: "9px 14px",
            textAlign: "left", background: "transparent", border: "none",
            fontSize: "12px", color: "#1A7A3C", cursor: "pointer",
            fontFamily: "'Noto Sans KR',sans-serif",
          }}>↩ 구매 취소 (환불)</button>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: "1px solid #DDD", borderRadius: 7,
  fontSize: "14px", fontFamily: "'Noto Sans KR',sans-serif", outline: "none",
  boxSizing: "border-box",
};

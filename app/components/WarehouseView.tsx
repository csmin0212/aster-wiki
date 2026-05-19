'use client';

import { useState, useEffect } from 'react';
import { useSharedState } from '../lib/useSharedState';

const MAX_WEIGHT = 50;
const ACCENT     = "#7B5EA7";   // 보라 계열 (창고 테마)
const ACCENT_BDR = "#B89FD4";

// ─── 타입 ─────────────────────────────────────────────────────

interface WarehouseItem {
  id:       string;
  name:     string;
  weight:   number;   // 개당 중량
  qty:      number;
  price?:   number;   // 개당 가격 (optional)
  addedBy:  string;
  addedAt:  string;
}

interface WarehouseLog {
  id:        string;
  action:    "in" | "out";
  itemName:  string;
  weight:    number;
  qty:       number;
  person:    string;
  timestamp: string;
  prevTotal: number;
  newTotal:  number;
}

interface WHState {
  items:    WarehouseItem[];
  log:      WarehouseLog[];
}

const DEFAULT_STATE: WHState = { items: [], log: [] };

type SortKey = "newest" | "weight" | "price";

// ─── 유틸 ─────────────────────────────────────────────────────

function totalWeight(items: WarehouseItem[]): number {
  return items.reduce((s, it) => s + it.weight * it.qty, 0);
}

function ts(): string {
  return new Date().toLocaleString('ko-KR', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function uid(): string { return Date.now().toString() + Math.random().toString(36).slice(2, 6); }

// ─── 컴포넌트 ────────────────────────────────────────────────

export default function WarehouseView({ mob }: { mob: boolean }) {
  const { state, save, loaded } = useSharedState<WHState>('warehouse', DEFAULT_STATE);

  // 입력 폼
  const [nameIn,   setName]    = useState('');
  const [weightIn, setWeight]  = useState('');
  const [qtyIn,    setQty]     = useState('1');
  const [priceIn,  setPrice]   = useState('');
  const [personIn, setPerson]  = useState('');
  const [errMsg,   setErr]     = useState('');

  // 출고 폼
  const [outId,    setOutId]   = useState('');
  const [outQty,   setOutQty]  = useState('1');
  const [outPerson,setOutPerson] = useState('');

  // UI
  const [sort,   setSort]   = useState<SortKey>('newest');
  const [ctx,    setCtx]    = useState<{ id: string; x: number; y: number; isLog: boolean } | null>(null);
  const [logCtx, setLogCtx] = useState<{ id: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const close = () => { setCtx(null); setLogCtx(null); };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  if (!loaded) return (
    <div style={{ padding: "60px 48px", color: "#AAA", fontSize: "14px" }}>불러오는 중…</div>
  );

  const curWeight = totalWeight(state.items);
  const weightPct = Math.min(100, (curWeight / MAX_WEIGHT) * 100);
  const isHeavy   = curWeight > 40;
  const isFull    = curWeight >= MAX_WEIGHT;

  // ── 입고 ──────────────────────────────────────────────────────
  const addItem = () => {
    setErr('');
    const w = parseFloat(weightIn);
    const q = parseInt(qtyIn);
    if (!nameIn.trim())       { setErr('아이템 이름을 입력하세요.'); return; }
    if (isNaN(w) || w <= 0)   { setErr('중량은 0보다 큰 숫자여야 합니다.'); return; }
    if (isNaN(q) || q <= 0)   { setErr('갯수는 1 이상이어야 합니다.'); return; }
    if (!personIn.trim())     { setErr('넣는 사람을 입력하세요.'); return; }

    const added = w * q;
    if (curWeight + added > MAX_WEIGHT) {
      setErr(`최대 하중(${MAX_WEIGHT})을 초과합니다. 현재 ${curWeight} + ${added} = ${curWeight + added}`);
      return;
    }

    const price = priceIn.trim() !== '' ? parseFloat(priceIn) : undefined;

    // 같은 이름 + 같은 중량 아이템이면 수량 병합
    const existing = state.items.find(it => it.name === nameIn.trim() && it.weight === w);
    let newItems: WarehouseItem[];
    if (existing) {
      newItems = state.items.map(it =>
        it.id === existing.id ? { ...it, qty: it.qty + q, price: price ?? it.price } : it
      );
    } else {
      newItems = [...state.items, {
        id: uid(), name: nameIn.trim(), weight: w, qty: q,
        price,
        addedBy: personIn.trim(), addedAt: ts(),
      }];
    }

    const logEntry: WarehouseLog = {
      id: uid(), action: 'in',
      itemName: nameIn.trim(), weight: w, qty: q,
      person: personIn.trim(), timestamp: ts(),
      prevTotal: curWeight, newTotal: curWeight + added,
    };

    save({ items: newItems, log: [logEntry, ...state.log].slice(0, 100) });
    setName(''); setWeight(''); setQty('1'); setPrice('');
  };

  // ── 출고 ──────────────────────────────────────────────────────
  const removeItem = () => {
    setErr('');
    const item = state.items.find(it => it.id === outId);
    if (!item)                      { setErr('출고할 아이템을 선택하세요.'); return; }
    if (!outPerson.trim())          { setErr('빼는 사람을 입력하세요.'); return; }
    const q = parseInt(outQty);
    if (isNaN(q) || q <= 0)         { setErr('갯수는 1 이상이어야 합니다.'); return; }
    if (q > item.qty)               { setErr(`재고(${item.qty}개)보다 많이 뺄 수 없습니다.`); return; }

    const removed = item.weight * q;
    const newItems = q >= item.qty
      ? state.items.filter(it => it.id !== outId)
      : state.items.map(it => it.id === outId ? { ...it, qty: it.qty - q } : it);

    const logEntry: WarehouseLog = {
      id: uid(), action: 'out',
      itemName: item.name, weight: item.weight, qty: q,
      person: outPerson.trim(), timestamp: ts(),
      prevTotal: curWeight, newTotal: curWeight - removed,
    };

    save({ items: newItems, log: [logEntry, ...state.log].slice(0, 100) });
    setOutId(''); setOutQty('1'); setOutPerson('');
  };

  // ── 아이템 행 우클릭 삭제 (창고에서 직접 제거) ────────────────
  const deleteItem = (id: string) => {
    const item = state.items.find(it => it.id === id);
    if (!item) return;
    const removed = item.weight * item.qty;
    const logEntry: WarehouseLog = {
      id: uid(), action: 'out',
      itemName: item.name, weight: item.weight, qty: item.qty,
      person: '(관리자 삭제)', timestamp: ts(),
      prevTotal: curWeight, newTotal: curWeight - removed,
    };
    save({
      items: state.items.filter(it => it.id !== id),
      log: [logEntry, ...state.log].slice(0, 100),
    });
  };

  // ── 로그 삭제 ────────────────────────────────────────────────
  const deleteLog = (id: string) => {
    save({ ...state, log: state.log.filter(l => l.id !== id) });
  };

  // ── 정렬된 아이템 목록 ────────────────────────────────────────
  const sortedItems = [...state.items].sort((a, b) => {
    if (sort === 'weight') return (b.weight * b.qty) - (a.weight * a.qty);
    if (sort === 'price')  return ((b.price ?? 0) * b.qty) - ((a.price ?? 0) * a.qty);
    return b.addedAt.localeCompare(a.addedAt);
  });

  const pad = mob ? "20px 16px 80px" : "28px 48px 80px";

  return (
    <div style={{ maxWidth: 760, padding: pad }}>

      {/* ── 헤더 ──────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #1A1025 0%, #2D1F45 100%)",
        border: `1px solid ${ACCENT_BDR}30`,
        borderRadius: 14,
        padding: mob ? "22px 18px" : "28px 32px",
        marginBottom: 16,
      }}>
        <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.25em", color: ACCENT_BDR, marginBottom: 6 }}>
          SHARED WAREHOUSE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: mob ? "20px" : "24px", fontWeight: 700, color: "#EDE8FF", margin: 0 }}>
            공용 창고
          </h1>
          <div style={{
            background: ACCENT, color: "#fff", borderRadius: 6,
            padding: "3px 12px", fontSize: "14px", fontWeight: 700,
          }}>
            {state.items.length}종
          </div>
        </div>

        {/* 중량 바 */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: isHeavy ? "#E8A030" : ACCENT_BDR }}>
              {isFull ? "🔴 창고 가득 참" : isHeavy ? "🟠 적재량 주의" : "적재 중량"}
            </span>
            <span style={{
              fontWeight: 700,
              color: isHeavy ? "#E8A030" : "#C4B8E8",
              fontSize: "14px",
            }}>
              {curWeight} / {MAX_WEIGHT}
            </span>
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 5, overflow: "hidden" }}>
            <div style={{
              width: `${weightPct}%`, height: "100%", borderRadius: 5,
              background: isFull
                ? "linear-gradient(90deg, #C0392B, #E74C3C)"
                : isHeavy
                ? "linear-gradient(90deg, #D4820A, #E8A030)"
                : `linear-gradient(90deg, ${ACCENT}, #B89FD4)`,
              transition: "width 0.4s ease",
              boxShadow: isFull ? "0 0 8px #E74C3C80" : isHeavy ? "0 0 8px #E8A03060" : `0 0 8px ${ACCENT}60`,
            }} />
          </div>
        </div>
      </div>

      {/* ── 입고 폼 ───────────────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px", marginBottom: 12 }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", marginBottom: 12 }}>
          📦 아이템 입고
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input placeholder="아이템 이름" value={nameIn} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            style={inputStyle("1 1 140px")} />
          <input type="number" placeholder="중량" value={weightIn} onChange={e => setWeight(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            style={inputStyle("0 0 70px")} />
          <input type="number" placeholder="갯수" value={qtyIn} onChange={e => setQty(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            style={inputStyle("0 0 60px")} />
          <input type="number" placeholder="가격 (G)" value={priceIn} onChange={e => setPrice(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            style={inputStyle("0 0 90px")} />
          <input placeholder="넣는 사람" value={personIn} onChange={e => setPerson(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            style={inputStyle("1 1 100px")} />
          <button onClick={addItem} style={{
            padding: "8px 18px", background: ACCENT, color: "#fff",
            border: "none", borderRadius: 6, fontSize: "13px", fontWeight: 600,
            cursor: "pointer", fontFamily: "'Noto Sans KR',sans-serif",
          }}>입고</button>
        </div>
        {weightIn && qtyIn && parseFloat(weightIn) > 0 && parseInt(qtyIn) > 0 && (
          <div style={{ marginTop: 8, fontSize: "12px", color: "#777" }}>
            총 추가 중량: <b style={{ color: ACCENT }}>{(parseFloat(weightIn) * parseInt(qtyIn)).toFixed(1)}</b>
            {" "}→ 창고 예상: <b style={{ color: curWeight + parseFloat(weightIn) * parseInt(qtyIn) > MAX_WEIGHT ? "#E74C3C" : ACCENT }}>
              {(curWeight + parseFloat(weightIn) * parseInt(qtyIn)).toFixed(1)} / {MAX_WEIGHT}
            </b>
          </div>
        )}
        {errMsg && (
          <div style={{ marginTop: 8, fontSize: "12px", color: "#E74C3C", fontWeight: 600 }}>
            ⚠ {errMsg}
          </div>
        )}
      </div>

      {/* ── 출고 폼 ───────────────────────────────────────────── */}
      {state.items.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", marginBottom: 12 }}>
            📤 아이템 출고
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={outId} onChange={e => setOutId(e.target.value)}
              style={{ flex: "1 1 160px", padding: "8px 10px", border: "1px solid #DDD", borderRadius: 6, fontSize: "13px", fontFamily: "'Noto Sans KR',sans-serif", outline: "none", background: "#fff" }}>
              <option value="">아이템 선택</option>
              {state.items.map(it => (
                <option key={it.id} value={it.id}>
                  {it.name} (중량 {it.weight} × {it.qty}개)
                </option>
              ))}
            </select>
            <input type="number" placeholder="갯수" value={outQty} onChange={e => setOutQty(e.target.value)}
              style={inputStyle("0 0 60px")} />
            <input placeholder="빼는 사람" value={outPerson} onChange={e => setOutPerson(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && removeItem()}
              style={inputStyle("1 1 100px")} />
            <button onClick={removeItem} style={{
              padding: "8px 18px", background: "#E8F0FF", color: "#2A5F9E",
              border: "1px solid #B0C8E8", borderRadius: 6, fontSize: "13px", fontWeight: 600,
              cursor: "pointer", fontFamily: "'Noto Sans KR',sans-serif",
            }}>출고</button>
          </div>
        </div>
      )}

      {/* ── 창고 목록 ─────────────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        {/* 헤더 + 정렬 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em" }}>
            창고 목록 <span style={{ fontWeight: 400, fontSize: "11px", opacity: 0.6 }}>(우클릭 → 삭제)</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {([
              { key: "newest", label: "최신 순" },
              { key: "weight", label: "중량 순" },
              { key: "price",  label: "가격 순" },
            ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
              <button key={key} onClick={() => setSort(key)} style={{
                padding: "4px 12px", borderRadius: 20, fontSize: "11px", fontWeight: 600,
                border: `1px solid ${sort === key ? ACCENT : "#E0DDD8"}`,
                background: sort === key ? ACCENT : "#F5F4F1",
                color: sort === key ? "#fff" : "#888",
                cursor: "pointer",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {state.items.length === 0 ? (
          <div style={{ padding: "24px 0", textAlign: "center", color: "#BBB", fontSize: "13px" }}>
            창고가 비어있습니다.
          </div>
        ) : (
          <>
            {/* 테이블 헤더 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 54px 44px 60px 80px 68px",
              gap: 6, padding: "6px 10px",
              fontSize: "11px", fontWeight: 600, color: "#AAA",
              borderBottom: "1px solid #EAEAEA", marginBottom: 4,
            }}>
              <span>아이템</span>
              <span style={{ textAlign: "center" }}>중량</span>
              <span style={{ textAlign: "center" }}>갯수</span>
              <span style={{ textAlign: "center" }}>총 중량</span>
              <span style={{ textAlign: "center" }}>가격 (G)</span>
              <span style={{ textAlign: "right" }}>넣은 사람</span>
            </div>
            {sortedItems.map(it => (
              <div key={it.id}
                onContextMenu={ev => { ev.preventDefault(); ev.stopPropagation(); setCtx({ id: it.id, x: ev.clientX, y: ev.clientY, isLog: false }); }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 54px 44px 60px 80px 68px",
                  gap: 6, padding: "8px 10px",
                  fontSize: "13px", borderRadius: 6,
                  background: "#FAFAF8", marginBottom: 4,
                  borderLeft: `3px solid ${ACCENT}40`,
                  cursor: "context-menu", userSelect: "none",
                  alignItems: "center",
                }}>
                <span style={{ fontWeight: 600, color: "#333" }}>{it.name}</span>
                <span style={{ textAlign: "center", color: "#666" }}>{it.weight}</span>
                <span style={{ textAlign: "center", color: "#666" }}>{it.qty}</span>
                <span style={{ textAlign: "center", fontWeight: 700, color: ACCENT }}>
                  {it.weight * it.qty}
                </span>
                <span style={{ textAlign: "center", color: it.price != null ? "#1A7A3C" : "#CCC", fontWeight: it.price != null ? 700 : 400, fontSize: it.price != null ? "13px" : "11px" }}>
                  {it.price != null ? `${(it.price * it.qty).toLocaleString()}` : "—"}
                </span>
                <span style={{ textAlign: "right", fontSize: "11px", color: "#999" }}>{it.addedBy}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── 창고 로그 ─────────────────────────────────────────── */}
      {state.log.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", marginBottom: 12 }}>
            기록 <span style={{ fontWeight: 400, fontSize: "11px", opacity: 0.6 }}>(우클릭 → 삭제)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 300, overflowY: "auto" }}>
            {state.log.map(l => (
              <div key={l.id}
                onContextMenu={ev => { ev.preventDefault(); ev.stopPropagation(); setLogCtx({ id: l.id, x: ev.clientX, y: ev.clientY }); }}
                style={{
                  fontSize: "12px", padding: "7px 12px",
                  background: l.action === 'in' ? "#F4F0FF" : "#FFF5EE",
                  borderRadius: 6,
                  borderLeft: `3px solid ${l.action === 'in' ? ACCENT + "80" : "#E8903080"}`,
                  lineHeight: 1.6, cursor: "context-menu", userSelect: "none",
                }}>
                <span style={{ color: "#BBB", marginRight: 8, fontSize: "11px" }}>{l.timestamp}</span>
                <span style={{
                  fontWeight: 700,
                  color: l.action === 'in' ? ACCENT : "#C0651A",
                  marginRight: 4,
                }}>
                  {l.action === 'in' ? '📦 입고' : '📤 출고'}
                </span>
                <span style={{ fontWeight: 600, color: "#333" }}>{l.person}</span>
                <span style={{ color: "#777" }}>이(가) </span>
                <span style={{ fontWeight: 600, color: "#333" }}>{l.itemName}</span>
                <span style={{ color: "#777" }}> {l.qty}개 (중량 {l.weight * l.qty})</span>
                <span style={{ color: "#AAA", fontSize: "11px" }}> · {l.prevTotal}→{l.newTotal}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 아이템 우클릭 메뉴 ──────────────────────────────────── */}
      {ctx && (
        <div onClick={e => e.stopPropagation()} style={{
          position: "fixed", left: ctx.x, top: ctx.y,
          background: "#fff", border: "1px solid #E0DDD8",
          borderRadius: 7, boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
          zIndex: 9999, overflow: "hidden", minWidth: 110,
        }}>
          <button onClick={() => { deleteItem(ctx.id); setCtx(null); }} style={{
            display: "block", width: "100%", padding: "9px 14px",
            textAlign: "left", background: "transparent", border: "none",
            fontSize: "12px", color: "#E74C3C", cursor: "pointer",
            fontFamily: "'Noto Sans KR',sans-serif",
          }}>🗑 창고에서 제거</button>
        </div>
      )}

      {/* ── 로그 우클릭 메뉴 ────────────────────────────────────── */}
      {logCtx && (
        <div onClick={e => e.stopPropagation()} style={{
          position: "fixed", left: logCtx.x, top: logCtx.y,
          background: "#fff", border: "1px solid #E0DDD8",
          borderRadius: 7, boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
          zIndex: 9999, overflow: "hidden", minWidth: 110,
        }}>
          <button onClick={() => { deleteLog(logCtx.id); setLogCtx(null); }} style={{
            display: "block", width: "100%", padding: "9px 14px",
            textAlign: "left", background: "transparent", border: "none",
            fontSize: "12px", color: "#E74C3C", cursor: "pointer",
            fontFamily: "'Noto Sans KR',sans-serif",
          }}>🗑 삭제</button>
        </div>
      )}
    </div>
  );
}

// ── 스타일 헬퍼 ───────────────────────────────────────────────
function inputStyle(flex: string): React.CSSProperties {
  return {
    flex,
    padding: "8px 10px",
    border: "1px solid #DDD",
    borderRadius: 6,
    fontSize: "13px",
    fontFamily: "'Noto Sans KR',sans-serif",
    outline: "none",
    minWidth: 0,
  };
}

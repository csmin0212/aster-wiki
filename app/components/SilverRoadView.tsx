'use client';

import { useState, useEffect } from 'react'; // useEffect: ctx 닫기용
import { useSharedState } from '../lib/useSharedState';
const BLUE        = "#2A5F9E";
const BLUE_BDR    = "#7AAFD4";

// ─── 레벨 데이터 ─────────────────────────────────────────────

interface LevelData {
  toLevel: number;
  required: number;
  goldReward: number;
}

const LEVEL_DATA: LevelData[] = [
  { toLevel: 2, required:  1000, goldReward:  1500 },
  { toLevel: 3, required:  3000, goldReward:  2500 },
  { toLevel: 4, required:  5000, goldReward:  5000 },
  { toLevel: 5, required: 10000, goldReward: 15000 },
  { toLevel: 6, required: 30000, goldReward: 30000 },
];

const MAX_LEVEL = 6;

function salesNeeded(level: number): number {
  return LEVEL_DATA.find(d => d.toLevel === level + 1)?.required ?? Infinity;
}

function getGoldReward(level: number): number {
  return LEVEL_DATA.find(d => d.toLevel === level + 1)?.goldReward ?? 0;
}

// ─── 상태 타입 ────────────────────────────────────────────────

type PerkId = "sell" | "buy" | "gold";

interface PerkChoice {
  level: number;
  perkId: PerkId;
  label: string;
  goldAmount?: number;
}

interface SalesLogEntry {
  id: string;
  item: string;
  amount: number;       // 보너스 적용 후 최종 금액
  baseAmount?: number;  // 보너스 적용 전 원래 금액
  bonusPct?: number;    // 적용된 보너스 %
  timestamp: string;
  prevSales: number;
  newSales: number;
  levelUp?: number;
  perkLabel?: string;
}

interface SRState {
  level: number;
  currentSales: number;
  pickedPerks: PerkChoice[];
  salesLog: SalesLogEntry[];
  pendingLevelUp?: boolean;   // 레벨업 혜택 선택 대기 중
}

const DEFAULT_STATE: SRState = {
  level: 1,
  currentSales: 0,
  pickedPerks: [],
  salesLog: [],
  pendingLevelUp: false,
};

// ─── 컴포넌트 ────────────────────────────────────────────────

export default function SilverRoadView({ mob }: { mob: boolean }) {
  const { state, save, loaded } = useSharedState<SRState>('silver-road', DEFAULT_STATE);
  const [itemInput, setItem]   = useState('');
  const [goldInput, setGold]   = useState('');
  const [imgErr, setImgErr]    = useState(false);
  const [ctx, setCtx]          = useState<{ id: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const close = () => setCtx(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  if (!loaded) return (
    <div style={{ padding: "60px 48px", color: "#AAA", fontSize: "14px" }}>불러오는 중…</div>
  );

  // ── 판매 추가 (보너스 자동 적용) ────────────────────────────
  const addSale = () => {
    const baseAmt = parseInt(goldInput);
    if (!itemInput.trim() || isNaN(baseAmt) || baseAmt <= 0) return;
    const bonus    = state.pickedPerks.filter(p => p.perkId === "sell").length * 10;
    const finalAmt = bonus > 0 ? Math.round(baseAmt * (1 + bonus / 100)) : baseAmt;
    const entry: SalesLogEntry = {
      id:        Date.now().toString(),
      item:      itemInput.trim(),
      amount:    finalAmt,
      timestamp: new Date().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      prevSales: state.currentSales,
      newSales:  state.currentSales + finalAmt,
      // bonus가 없을 때 undefined 필드 생성 금지 (Firestore가 undefined를 에러로 처리)
      ...(bonus > 0 && { baseAmount: baseAmt, bonusPct: bonus }),
    };
    save({ ...state, currentSales: state.currentSales + finalAmt, salesLog: [entry, ...state.salesLog].slice(0, 50) });
    setItem(''); setGold('');
  };

  // ── 레벨업 버튼 ──────────────────────────────────────────────
  const startLevelUp = () => {
    if (state.level >= MAX_LEVEL || state.currentSales < salesNeeded(state.level)) return;
    // pendingLevelUp을 Firestore state에 저장 → 로컬 React state 타이밍 문제 없음
    save({ ...state, pendingLevelUp: true });
  };

  // ── 혜택 선택 ────────────────────────────────────────────────
  const choosePerk = (perkId: PerkId) => {
    if (state.level >= MAX_LEVEL) { save({ ...state, pendingLevelUp: false }); return; }

    const goldReward = getGoldReward(state.level);
    const perkLabels: Record<PerkId, string> = {
      sell: "판매 가격 +10%",
      buy:  "구매 가격 -10%",
      gold: `${goldReward.toLocaleString()}골드 획득`,
    };
    const perk: PerkChoice = {
      level: state.level + 1,
      perkId,
      label: perkLabels[perkId],
      goldAmount: perkId === "gold" ? goldReward : undefined,
    };
    // 레벨업 기준치 초과분을 다음 레벨로 이월
    const needed  = salesNeeded(state.level);
    const carried = Math.max(0, state.currentSales - needed);

    const entry: SalesLogEntry = {
      id: (Date.now() + 1).toString(),
      item: "", amount: 0,
      timestamp: new Date().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      prevSales: state.currentSales,
      newSales:  carried,
      levelUp:   state.level + 1,
      perkLabel: perkLabels[perkId],
    };
    save({
      ...state,
      level:          state.level + 1,
      currentSales:   carried,          // 0 대신 초과분 이월
      pendingLevelUp: false,
      pickedPerks:    [...state.pickedPerks, perk],
      salesLog:       [entry, ...state.salesLog].slice(0, 50),
    });
  };

  // ── 로그 항목 삭제 (수치 역산) ──────────────────────────────
  const deleteLogEntry = (id: string) => {
    const entry  = state.salesLog.find(e => e.id === id);
    if (!entry) return;
    const newLog = state.salesLog.filter(e => e.id !== id);

    if (entry.levelUp) {
      // 레벨업 항목 → 레벨·판매액·혜택 되돌리기
      save({
        ...state,
        level:          entry.levelUp - 1,
        currentSales:   entry.prevSales,
        pendingLevelUp: false,
        pickedPerks:    state.pickedPerks.filter(p => p.level !== entry.levelUp),
        salesLog:       newLog,
      });
    } else {
      // 일반 판매 항목 → 판매액 차감
      save({
        ...state,
        currentSales: Math.max(0, state.currentSales - entry.amount),
        salesLog:     newLog,
      });
    }
  };

  // ── 리셋 ─────────────────────────────────────────────────────
  const hardReset = () => {
    if (!confirm('레벨·판매 기록·혜택·로그 전부 초기화됩니다.')) return;
    save(DEFAULT_STATE);
  };

  // ── 파생 값 ──────────────────────────────────────────────────
  const needed      = salesNeeded(state.level);
  const canLevelUp  = state.level < MAX_LEVEL && state.currentSales >= needed;
  const salesPct    = state.level >= MAX_LEVEL ? 100 : Math.min(100, (state.currentSales / needed) * 100);
  const goldReward  = getGoldReward(state.level);

  const sellBonus   = state.pickedPerks.filter(p => p.perkId === "sell").length * 10;
  const buyDiscount = state.pickedPerks.filter(p => p.perkId === "buy").length * 10;
  const goldEarned  = state.pickedPerks
    .filter(p => p.perkId === "gold")
    .reduce((sum, p) => sum + (p.goldAmount ?? 0), 0);

  const pad = mob ? "20px 16px 80px" : "28px 48px 80px";

  return (
    <div style={{ maxWidth: 760, padding: pad }}>

      {/* ── 헤더 ───────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #060E1A 0%, #0F2240 100%)",
        border: `1px solid ${BLUE_BDR}30`,
        borderRadius: 14,
        padding: mob ? "22px 18px" : "28px 32px",
        marginBottom: 16,
        display: "flex",
        gap: mob ? 20 : 28,
        alignItems: "center",
        flexDirection: mob ? "column" : "row",
      }}>
        {/* 심볼 */}
        <div style={{
          width: mob ? 100 : 130,
          height: mob ? 100 : 130,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          border: `2px solid ${BLUE_BDR}50`,
          boxShadow: `0 0 28px ${BLUE}50`,
          background: "#020810",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {!imgErr
            ? <img src="/silver-road-symbol.jpg" alt="실버 로드" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErr(true)} />
            : <span style={{ fontSize: "40px" }}>🪙</span>
          }
        </div>

        {/* 정보 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.25em", color: BLUE_BDR, marginBottom: 4 }}>
            SILVER ROAD
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: mob ? "20px" : "24px", fontWeight: 700, color: "#E8F2FF", margin: 0 }}>
              상단 [실버 로드]
            </h1>
            <div style={{ background: BLUE, color: "#fff", borderRadius: 6, padding: "3px 12px", fontSize: "14px", fontWeight: 700 }}>
              Lv. {state.level}
            </div>
            {canLevelUp && !state.pendingLevelUp && (
              <button onClick={startLevelUp} style={{
                background: "#C0392B", color: "#fff",
                border: "none", borderRadius: 6,
                padding: "4px 14px", fontSize: "13px", fontWeight: 700,
                cursor: "pointer",
              }}>▲ 레벨업</button>
            )}
            {state.level >= MAX_LEVEL && (
              <div style={{ fontSize: "12px", color: BLUE_BDR, fontWeight: 600 }}>★ 최고 등급</div>
            )}
          </div>

          {/* 판매 진행도 */}
          {state.level < MAX_LEVEL ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: canLevelUp ? "#E74C3C" : BLUE_BDR }}>
                  {canLevelUp ? "레벨업 가능!" : "누적 판매액"}
                </span>
                <span style={{ fontWeight: 600, color: "#AAD0F4" }}>
                  {state.currentSales.toLocaleString()} / {needed.toLocaleString()} G
                </span>
              </div>
              <div style={{ height: 10, background: "rgba(255,255,255,0.07)", borderRadius: 5, overflow: "hidden" }}>
                <div style={{
                  width: `${salesPct}%`, height: "100%",
                  background: canLevelUp
                    ? "linear-gradient(90deg, #C0392B, #E74C3C)"
                    : `linear-gradient(90deg, ${BLUE}, #5A9FDE)`,
                  borderRadius: 5, transition: "width 0.5s ease",
                  boxShadow: canLevelUp ? "0 0 8px #E74C3C80" : `0 0 8px ${BLUE}60`,
                }} />
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: BLUE_BDR, lineHeight: 1.6 }}>
              실버 로드의 최고 등급에 도달했습니다.
            </div>
          )}
        </div>
      </div>

      {/* ── 레벨업 선택 패널 ──────────────────────────────── */}
      {state.pendingLevelUp && state.level < MAX_LEVEL && (
        <div style={{
          background: "linear-gradient(135deg, #0D1E35 0%, #162E50 100%)",
          border: `2px solid ${BLUE_BDR}`,
          borderRadius: 12,
          padding: mob ? "20px 16px" : "24px 28px",
          marginBottom: 16,
          boxShadow: `0 8px 32px ${BLUE}40`,
        }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#E8F2FF", marginBottom: 4 }}>
            ✦ Lv.{state.level} → Lv.{state.level + 1} 달성
          </div>
          <div style={{ fontSize: "12px", color: BLUE_BDR, marginBottom: 20 }}>
            아래 혜택 중 하나를 선택하세요.
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(["sell", "buy", "gold"] as PerkId[]).map(perkId => {
              const info: Record<PerkId, { icon: string; title: string; desc: string; color: string }> = {
                sell: { icon: "📈", title: "판매 가격 +10%",   desc: "아이템 판매 시 가격이 10% 높아집니다.",   color: "#AAD0F4" },
                buy:  { icon: "🛒", title: "구매 가격 -10%",   desc: "아이템 구매 시 가격이 10% 낮아집니다.",   color: "#AAD0F4" },
                gold: { icon: "💰", title: `${goldReward.toLocaleString()}골드 획득`, desc: "즉시 골드를 획득합니다.", color: "#FFD060" },
              };
              const { icon, title, desc, color } = info[perkId];
              return (
                <button
                  key={perkId}
                  onClick={() => choosePerk(perkId)}
                  style={{
                    flex: "1 1 160px",
                    padding: "16px 14px",
                    background: "rgba(42,95,158,0.2)",
                    border: `1.5px solid ${BLUE_BDR}50`,
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "'Noto Sans KR',sans-serif",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(42,95,158,0.45)";
                    e.currentTarget.style.borderColor = BLUE_BDR;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(42,95,158,0.2)";
                    e.currentTarget.style.borderColor = `${BLUE_BDR}50`;
                  }}
                >
                  <div style={{ fontSize: "22px", marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: "11px", color: "#6A9DC0", lineHeight: 1.5 }}>{desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 판매 기록 입력 ────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", marginBottom: 12 }}>판매 기록 추가</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="아이템 이름" value={itemInput}
            onChange={e => setItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSale()}
            style={{ flex: "1 1 130px", minWidth: 100, padding: "8px 12px", border: "1px solid #DDD", borderRadius: 6, fontSize: "13px", fontFamily: "'Noto Sans KR',sans-serif", outline: "none" }}
          />
          <input
            type="number" placeholder="판매액 (G)" value={goldInput}
            onChange={e => setGold(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSale()}
            style={{ width: 110, padding: "8px 10px", border: "1px solid #DDD", borderRadius: 6, fontSize: "13px", fontFamily: "'Noto Sans KR',sans-serif", outline: "none" }}
          />
          <button onClick={addSale} style={{ padding: "8px 18px", background: BLUE, color: "#fff", border: "none", borderRadius: 6, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR',sans-serif" }}>
            추가
          </button>
        </div>
        {/* 판매 보너스 미리보기 */}
        {sellBonus > 0 && goldInput && parseInt(goldInput) > 0 && (() => {
          const base  = parseInt(goldInput);
          const final = Math.round(base * (1 + sellBonus / 100));
          return (
            <div style={{ marginTop: 8, fontSize: "12px", color: BLUE, fontWeight: 600 }}>
              📈 판매 +{sellBonus}% 적용 → {base.toLocaleString()}G → <span style={{ color: "#1A7A3C" }}>{final.toLocaleString()}G</span>
            </div>
          );
        })()}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={hardReset} style={{ padding: "7px 12px", background: "#FFF0EE", color: "#E74C3C", border: "1px solid #FFCDD2", borderRadius: 6, fontSize: "12px", cursor: "pointer" }}>
            하드 리셋
          </button>
        </div>
      </div>

      {/* ── 혜택 현황 ─────────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        {/* 헤더 + 누적 합산 태그 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em" }}>혜택 현황</div>
          {(sellBonus > 0 || buyDiscount > 0 || goldEarned > 0) && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {sellBonus   > 0 && <div style={{ padding: "3px 10px", background: "#EFF5FF", border: `1px solid ${BLUE_BDR}`, borderRadius: 20, fontSize: "11px", fontWeight: 600, color: BLUE }}>판매 +{sellBonus}%</div>}
              {buyDiscount > 0 && <div style={{ padding: "3px 10px", background: "#EFF5FF", border: `1px solid ${BLUE_BDR}`, borderRadius: 20, fontSize: "11px", fontWeight: 600, color: BLUE }}>구매 -{buyDiscount}%</div>}
              {goldEarned  > 0 && <div style={{ padding: "3px 10px", background: "#FFF8E7", border: "1px solid #E8D060", borderRadius: 20, fontSize: "11px", fontWeight: 600, color: "#8B6914" }}>+{goldEarned.toLocaleString()} G</div>}
            </div>
          )}
        </div>

        {/* 레벨별 선택 테이블 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {LEVEL_DATA.map(ld => {
            const reached = state.level >= ld.toLevel;
            const chosen  = state.pickedPerks.find(p => p.level === ld.toLevel);
            const options: { id: PerkId; label: string }[] = [
              { id: "sell", label: "판매 +10%" },
              { id: "buy",  label: "구매 -10%" },
              { id: "gold", label: `${ld.goldReward.toLocaleString()} G` },
            ];
            return (
              <div key={ld.toLevel} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 8,
                background: reached ? "#FAFAF8" : "#F5F5F3",
                border: `1px solid ${reached ? "#E0DDD8" : "#EAEAEA"}`,
                opacity: reached ? 1 : 0.45,
                flexWrap: "wrap",
                transition: "opacity 0.2s",
              }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: reached ? BLUE : "#BBB", minWidth: 38, flexShrink: 0 }}>
                  Lv.{ld.toLevel}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
                  {options.map(opt => {
                    const isChosen = chosen?.perkId === opt.id;
                    const isOther  = reached && !!chosen && !isChosen;
                    return (
                      <div key={opt.id} style={{
                        padding: "4px 10px", borderRadius: 6,
                        fontSize: "11px", fontWeight: isChosen ? 700 : 400,
                        background: isChosen ? BLUE : "#F0F0F0",
                        color: isChosen ? "#fff" : isOther ? "#C8C8C8" : "#888",
                        border: `1px solid ${isChosen ? BLUE : "#E4E4E4"}`,
                      }}>
                        {isChosen ? "✓ " : ""}{opt.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 거래 기록 ─────────────────────────────────────── */}
      {state.salesLog.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", marginBottom: 12 }}>
            거래 기록 <span style={{ fontWeight: 400, opacity: 0.6, fontSize: "11px" }}>(우클릭 → 삭제)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
            {state.salesLog.map(e => (
              <div key={e.id}
                onContextMenu={ev => { ev.preventDefault(); ev.stopPropagation(); setCtx({ id: e.id, x: ev.clientX, y: ev.clientY }); }}
                style={{
                  fontSize: "12px", padding: "8px 12px",
                  background: e.levelUp ? "#EEF4FF" : "#FAFAF8",
                  borderRadius: 6,
                  borderLeft: `3px solid ${e.levelUp ? BLUE : BLUE_BDR + "60"}`,
                  lineHeight: 1.6, cursor: "context-menu", userSelect: "none",
                }}>
                <span style={{ color: "#BBB", marginRight: 8, fontSize: "11px" }}>{e.timestamp}</span>
                {e.levelUp ? (
                  <span style={{ color: BLUE, fontWeight: 700 }}>
                    ✦ Lv.{e.levelUp - 1} → Lv.{e.levelUp} 달성!
                    {e.perkLabel && (
                      <span style={{ fontWeight: 400, color: "#888", fontSize: "11px", marginLeft: 6 }}>({e.perkLabel})</span>
                    )}
                  </span>
                ) : (
                  <>
                    <span style={{ fontWeight: 600, color: "#444" }}>{e.item}</span>
                    <span style={{ color: "#777" }}> 판매 </span>
                    <span style={{ color: "#1A7A3C", fontWeight: 700 }}>+{e.amount.toLocaleString()}G</span>
                    {e.bonusPct && e.baseAmount && (
                      <span style={{ color: BLUE, fontSize: "11px", fontWeight: 600, marginLeft: 4 }}>
                        ↑+{e.bonusPct}% <span style={{ color: "#999", fontWeight: 400 }}>(원가 {e.baseAmount.toLocaleString()}G)</span>
                      </span>
                    )}
                    <span style={{ color: "#AAA", fontSize: "11px" }}> ({e.prevSales.toLocaleString()}→{e.newSales.toLocaleString()})</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {ctx && (
        <div onClick={e => e.stopPropagation()} style={{
          position: "fixed", left: ctx.x, top: ctx.y,
          background: "#fff", border: "1px solid #E0DDD8",
          borderRadius: 7, boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
          zIndex: 9999, overflow: "hidden", minWidth: 110,
        }}>
          <button onClick={() => { deleteLogEntry(ctx.id); setCtx(null); }} style={{
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

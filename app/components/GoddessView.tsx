'use client';

import { useState, useEffect } from 'react';
import {
  GODDESS_SKILLS, SKILL_BRANCHES, SkillBranch, Skill,
  GoddessState, ExpLogEntry,
  DEFAULT_GODDESS_STATE, expNeeded,
} from '../data/systems';

const STORAGE_KEY = 'aster-goddess';
const GOLD        = "#C8A020";
const GOLD_LIGHT  = "#FFF8E7";
const GOLD_BDR    = "#E8D060";
const CARD_W      = 130;
const CARD_GAP    = 8;
const BRANCH_W    = CARD_W * 2 + CARD_GAP;  // 268
const CONN_H      = 30;

// ── Btn ────────────────────────────────────────────────────────

function Btn({
  label, onClick, variant = "ghost",
}: { label: string; onClick: () => void; variant?: "primary" | "danger" | "ghost" }) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: GOLD,      color: "#fff",    border: "none" },
    danger:  { background: "#FFF0EE", color: "#E74C3C", border: "1px solid #FFCDD2" },
    ghost:   { background: "#F5F3EE", color: "#666",    border: "1px solid #E0DDD8" },
  };
  return (
    <button onClick={onClick} style={{
      padding: "7px 14px", borderRadius: 6, fontSize: "12px",
      fontWeight: variant === "primary" ? 600 : 500,
      cursor: "pointer", fontFamily: "'Noto Sans KR',sans-serif",
      ...styles[variant],
    }}>{label}</button>
  );
}

// ── SkillCard ──────────────────────────────────────────────────

function SkillCard({
  skill, picked, pickable, reqsMet, onPick,
}: {
  skill: Skill;
  picked: boolean;
  pickable: boolean;
  reqsMet: boolean;
  onPick: () => void;
}) {
  if (skill.locked) {
    return (
      <div style={{
        width: CARD_W, minHeight: 48,
        padding: "9px 12px", borderRadius: 8,
        border: "2px solid #E8E8E8", background: "#F5F5F5",
        color: "#CCC", fontSize: "12px",
        textAlign: "center", userSelect: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <div style={{ filter: "blur(1.5px)" }}>🔒 ???</div>
      </div>
    );
  }

  const isTier2 = skill.tier === 2;

  const borderColor = isTier2
    ? (picked ? "#5A8A5A" : reqsMet ? "#7ABD7A80" : "#E8E8E8")
    : (picked ? GOLD_BDR  : pickable ? `${GOLD_BDR}90` : "#E8E8E8");
  const bgColor = isTier2
    ? (picked ? "#EEF8EE" : reqsMet ? "#FAFFF8" : "#F7F5F0")
    : (picked ? GOLD_LIGHT : pickable ? "#FAFAF8" : "#F7F5F0");
  const textColor = isTier2
    ? (picked ? "#3A7A3A" : reqsMet ? "#444" : "#AAA")
    : (picked ? "#8B6914" : pickable ? "#444" : "#AAA");

  return (
    <button
      onClick={() => pickable && onPick()}
      title={skill.effect}
      style={{
        width: CARD_W, minHeight: 48, flexShrink: 0,
        padding: "9px 12px", borderRadius: 8,
        border: `2px ${(picked || !isTier2) ? "solid" : "dashed"} ${borderColor}`,
        background: bgColor, color: textColor,
        fontSize: "12px", fontWeight: picked ? 700 : 500,
        cursor: pickable ? "pointer" : "default",
        transition: "all 0.15s", textAlign: "left",
        fontFamily: "'Noto Sans KR',sans-serif",
        lineHeight: 1.4, wordBreak: "keep-all",
      }}
    >
      {picked && <span style={{ marginRight: 4, fontSize: "10px" }}>✓</span>}
      {skill.name}
    </button>
  );
}

// ── BranchConnector ────────────────────────────────────────────

function BranchConnector({
  pattern, t1Picked, t2Picked,
}: {
  pattern: "2→1" | "1→2";
  t1Picked: boolean;
  t2Picked: boolean;
}) {
  const strokeColor = t2Picked ? "#5A8A5A" : t1Picked ? GOLD : "#D8D0C0";
  const strokeDash  = t2Picked ? undefined : "5,3";
  const strokeW     = t2Picked ? 2.5 : 1.5;

  const c1  = CARD_W / 2;                      // 65
  const c2  = CARD_W + CARD_GAP + CARD_W / 2;  // 203
  const mid = BRANCH_W / 2;                    // 134

  return (
    <svg width={BRANCH_W} height={CONN_H} style={{ display: "block", flexShrink: 0 }}>
      {pattern === "2→1" ? (
        <>
          <line x1={c1}  y1={0} x2={mid} y2={CONN_H} stroke={strokeColor} strokeWidth={strokeW} strokeDasharray={strokeDash} />
          <line x1={c2}  y1={0} x2={mid} y2={CONN_H} stroke={strokeColor} strokeWidth={strokeW} strokeDasharray={strokeDash} />
        </>
      ) : (
        <>
          <line x1={mid} y1={0} x2={c1}  y2={CONN_H} stroke={strokeColor} strokeWidth={strokeW} strokeDasharray={strokeDash} />
          <line x1={mid} y1={0} x2={c2}  y2={CONN_H} stroke={strokeColor} strokeWidth={strokeW} strokeDasharray={strokeDash} />
        </>
      )}
    </svg>
  );
}

// ── BranchView ────────────────────────────────────────────────

function BranchView({
  branch, pickedSkills, availablePoints, onPick,
}: {
  branch: SkillBranch;
  pickedSkills: string[];
  availablePoints: number;
  onPick: (s: Skill) => void;
}) {
  const getSkill     = (id: string) => GODDESS_SKILLS.find(s => s.id === id)!;
  const isPicked     = (id: string) => pickedSkills.includes(id);
  const canPickSkill = (s: Skill) =>
    !s.locked && !isPicked(s.id) && availablePoints > 0 &&
    s.requires.every(r => isPicked(r));

  const t1AllPicked = branch.t1.every(isPicked);
  const t2AnyPicked = branch.t2.some(isPicked);
  const labelColor  = t2AnyPicked ? "#5A8A5A" : t1AllPicked ? GOLD : "#C8C4BC";
  const offset      = (BRANCH_W - CARD_W) / 2;  // 69

  const renderCard = (id: string) => {
    const s = getSkill(id);
    return (
      <SkillCard
        key={s.id} skill={s}
        picked={isPicked(s.id)}
        pickable={canPickSkill(s)}
        reqsMet={s.requires.every(r => isPicked(r))}
        onPick={() => onPick(s)}
      />
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: BRANCH_W }}>
      {/* Branch label */}
      <div style={{
        fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em",
        color: labelColor, marginBottom: 6, transition: "color 0.2s",
      }}>
        {branch.label.toUpperCase()}
      </div>

      {/* T1 row */}
      {branch.pattern === "2→1" ? (
        <div style={{ display: "flex", gap: CARD_GAP, width: BRANCH_W }}>
          {branch.t1.map(renderCard)}
        </div>
      ) : (
        <div style={{ paddingLeft: offset, paddingRight: offset }}>
          {branch.t1.map(renderCard)}
        </div>
      )}

      {/* Connector SVG */}
      <BranchConnector pattern={branch.pattern} t1Picked={t1AllPicked} t2Picked={t2AnyPicked} />

      {/* T2 row */}
      {branch.pattern === "1→2" ? (
        <div style={{ display: "flex", gap: CARD_GAP, width: BRANCH_W }}>
          {branch.t2.map(renderCard)}
        </div>
      ) : (
        <div style={{ paddingLeft: offset, paddingRight: offset }}>
          {branch.t2.map(renderCard)}
        </div>
      )}
    </div>
  );
}

// ── EffectsPanel ───────────────────────────────────────────────

function EffectsPanel({ pickedSkills }: { pickedSkills: string[] }) {
  const totals: Record<string, number> = {};
  for (const id of pickedSkills) {
    const skill = GODDESS_SKILLS.find(s => s.id === id);
    if (!skill?.bonuses) continue;
    for (const b of skill.bonuses) {
      totals[b.stat] = (totals[b.stat] ?? 0) + b.value;
    }
  }

  const rows = [
    { stat: "HP",     label: "최대 HP",          unit: "" },
    { stat: "MP",     label: "최대 MP",          unit: "" },
    { stat: "물리공격", label: "물리 공격력",    unit: "" },
    { stat: "마법공격", label: "마법 공격력",    unit: "" },
    { stat: "물리방어", label: "물리 방어력",    unit: "" },
    { stat: "마법방어", label: "마법 방어력",    unit: "" },
    { stat: "명중",   label: "명중",              unit: "" },
    { stat: "리액션", label: "리액션",            unit: "" },
    { stat: "드롭",   label: "드롭 보너스",       unit: "D" },
    { stat: "페이트", label: "페이트 상한",       unit: "" },
    { stat: "배드",   label: "배드 스테이터스",   unit: "" },
  ];

  const active = rows.filter(r => (totals[r.stat] ?? 0) > 0);

  return (
    <div style={{
      width: 185, flexShrink: 0,
      background: GOLD_LIGHT, border: `1px solid ${GOLD_BDR}`,
      borderRadius: 10, padding: "14px",
      alignSelf: "flex-start",
    }}>
      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: GOLD, marginBottom: 12 }}>
        ✦ 적용 효과
      </div>

      {pickedSkills.length === 0 ? (
        <div style={{ fontSize: "11px", color: "#CCC", lineHeight: 1.9 }}>
          특성을 선택하면<br />효과가 표시됩니다.
        </div>
      ) : active.length === 0 ? (
        <div style={{ fontSize: "11px", color: "#AAA" }}>집계된 보너스 없음</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {active.map((r, i) => (
            <div key={r.stat} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 0",
              borderBottom: i < active.length - 1 ? `1px solid ${GOLD_BDR}40` : "none",
            }}>
              <span style={{ fontSize: "11px", color: "#666" }}>{r.label}</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: GOLD }}>
                +{totals[r.stat]}{r.unit}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: 12, paddingTop: 8,
        borderTop: `1px solid ${GOLD_BDR}50`,
        fontSize: "10px", color: "#AAA",
      }}>
        선택된 특성: <span style={{ color: GOLD, fontWeight: 700 }}>{pickedSkills.length}</span>개
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────

export default function GoddessView({ mob }: { mob: boolean }) {
  const [state, setState]       = useState<GoddessState>(DEFAULT_GODDESS_STATE);
  const [charInput, setChar]    = useState('');
  const [expInput,  setExp]     = useState('');
  const [decInput,  setDec]     = useState('');
  const [showDec,   setShowDec] = useState(false);
  const [imgErr,    setImgErr]  = useState(false);

  useEffect(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) { try { setState(JSON.parse(s)); } catch {} }
  }, []);

  const save = (s: GoddessState) => {
    setState(s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  };

  // ── 경험치 추가 ──────────────────────────────────────────────
  const addExp = () => {
    const amt = parseInt(expInput);
    if (!charInput.trim() || isNaN(amt) || amt <= 0) return;
    const entry: ExpLogEntry = {
      id: Date.now().toString(),
      character: charInput.trim(),
      amount: amt,
      timestamp: new Date().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      prevExp: state.currentExp,
      newExp: state.currentExp + amt,
    };
    save({ ...state, currentExp: state.currentExp + amt, expLog: [entry, ...state.expLog].slice(0, 50) });
    setChar(''); setExp('');
  };

  // ── 레벨업 ───────────────────────────────────────────────────
  const doLevelUp = () => {
    const needed = expNeeded(state.level);
    if (state.currentExp < needed) return;
    const entry: ExpLogEntry = {
      id: (Date.now() + 1).toString(),
      character: "", amount: 0,
      timestamp: new Date().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      prevExp: state.currentExp,
      newExp: state.currentExp - needed,
      levelUp: { from: state.level, to: state.level + 1 },
    };
    save({
      ...state,
      level: state.level + 1,
      currentExp: state.currentExp - needed,
      availablePoints: state.availablePoints + 1,
      expLog: [entry, ...state.expLog].slice(0, 50),
    });
  };

  // ── 스킬 선택 ────────────────────────────────────────────────
  const pickSkill = (skill: Skill) => {
    if (skill.locked)                                                 return;
    if (state.pickedSkills.includes(skill.id))                       return;
    if (state.availablePoints <= 0)                                  return;
    if (!skill.requires.every(r => state.pickedSkills.includes(r)))  return;
    save({
      ...state,
      pickedSkills: [...state.pickedSkills, skill.id],
      availablePoints: state.availablePoints - 1,
    });
  };

  // ── 경험치 감소 ──────────────────────────────────────────────
  const decreaseExp = () => {
    const amt = parseInt(decInput);
    if (isNaN(amt) || amt <= 0) return;
    save({ ...state, currentExp: Math.max(0, state.currentExp - amt) });
    setDec(''); setShowDec(false);
  };

  // ── 리셋 ─────────────────────────────────────────────────────
  const hardReset = () => {
    if (!confirm('레벨·경험치·스킬·로그 전부 초기화됩니다. 계속하시겠습니까?')) return;
    save(DEFAULT_GODDESS_STATE);
  };

  const skillReset = () => {
    if (!confirm('스킬만 초기화되고 포인트가 반환됩니다.')) return;
    save({ ...state, pickedSkills: [], availablePoints: state.level - 1 });
  };

  // ── 파생 값 ──────────────────────────────────────────────────
  const needed     = expNeeded(state.level);
  const expPct     = Math.min(100, (state.currentExp / needed) * 100);
  const canLevelUp = state.currentExp >= needed;
  const t3         = GODDESS_SKILLS.filter(s => s.tier === 3);
  const pad        = mob ? "20px 16px 80px" : "28px 48px 80px";

  return (
    <div style={{ maxWidth: 900, padding: pad }}>

      {/* ── 프로필 헤더 ───────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, #FFF0C0 100%)`,
        border: `1px solid ${GOLD_BDR}`,
        borderRadius: 14,
        padding: mob ? "20px 18px" : "24px 28px",
        marginBottom: 16,
        display: "flex",
        gap: mob ? 16 : 24,
        alignItems: "flex-start",
        flexDirection: mob ? "column" : "row",
      }}>
        <div style={{
          width: mob ? 80 : 108, height: mob ? 80 : 108,
          borderRadius: 14, overflow: "hidden", flexShrink: 0,
          border: `3px solid ${GOLD_BDR}`,
          boxShadow: `0 4px 18px ${GOLD}40`,
          background: "#FFF0C0",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {!imgErr
            ? <img src="/goddess.jpg" alt="여신" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErr(true)} />
            : <span style={{ fontSize: "36px" }}>✨</span>
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", color: GOLD, marginBottom: 4 }}>
            DIVINE TRAIT
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: mob ? "20px" : "24px", fontWeight: 700, color: "#2a2a2a", margin: 0 }}>
              여신 특성
            </h1>
            <div style={{ background: GOLD, color: "#fff", borderRadius: 6, padding: "3px 12px", fontSize: "14px", fontWeight: 700 }}>
              Lv. {state.level}
            </div>
            {state.availablePoints > 0 && (
              <div style={{ background: "#E74C3C", color: "#fff", borderRadius: 6, padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>
                ✦ 포인트 {state.availablePoints}
              </div>
            )}
            {canLevelUp && (
              <button onClick={doLevelUp} style={{
                background: "#C0392B", color: "#fff",
                border: "none", borderRadius: 6,
                padding: "4px 14px", fontSize: "13px", fontWeight: 700,
                cursor: "pointer",
              }}>▲ 레벨업</button>
            )}
          </div>

          {/* EXP 바 */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888", marginBottom: 6 }}>
              <span style={{ fontWeight: 600, color: canLevelUp ? "#C0392B" : GOLD }}>
                {canLevelUp ? "레벨업 가능!" : "EXP"}
              </span>
              <span style={{ fontWeight: 600, color: "#555" }}>{state.currentExp} / {needed}</span>
            </div>
            <div style={{ height: 12, background: "#EDE8D0", borderRadius: 6, overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{
                width: `${expPct}%`, height: "100%",
                background: canLevelUp
                  ? `linear-gradient(90deg, #C0392B, #E74C3C)`
                  : `linear-gradient(90deg, ${GOLD}, #FFD700)`,
                borderRadius: 6, transition: "width 0.5s ease",
                boxShadow: canLevelUp ? "0 0 10px #E74C3C80" : "0 0 8px #FFD70060",
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 경험치 입력 ───────────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", marginBottom: 12 }}>경험치 추가</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="캐릭터 이름" value={charInput}
            onChange={e => setChar(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addExp()}
            style={{ flex: "1 1 120px", minWidth: 90, padding: "8px 12px", border: "1px solid #DDD", borderRadius: 6, fontSize: "13px", fontFamily: "'Noto Sans KR',sans-serif", outline: "none" }}
          />
          <input
            type="number" placeholder="EXP" value={expInput}
            onChange={e => setExp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addExp()}
            style={{ width: 72, padding: "8px 10px", border: "1px solid #DDD", borderRadius: 6, fontSize: "13px", fontFamily: "'Noto Sans KR',sans-serif", outline: "none" }}
          />
          <Btn label="추가" onClick={addExp} variant="primary" />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
          {!showDec ? (
            <Btn label="경험치 감소" onClick={() => setShowDec(true)} />
          ) : (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="number" placeholder="감소량" value={decInput}
                onChange={e => setDec(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && decreaseExp()}
                style={{ width: 72, padding: "7px 10px", border: "1px solid #DDD", borderRadius: 6, fontSize: "12px", outline: "none" }}
              />
              <button onClick={decreaseExp} style={{ padding: "7px 12px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 6, fontSize: "12px", cursor: "pointer" }}>적용</button>
              <button onClick={() => { setShowDec(false); setDec(''); }} style={{ padding: "7px 10px", background: "#F5F3EE", color: "#777", border: "1px solid #E0DDD8", borderRadius: 6, fontSize: "12px", cursor: "pointer" }}>✕</button>
            </div>
          )}
          <Btn label="스킬 초기화" onClick={skillReset} />
          <Btn label="하드 리셋"   onClick={hardReset}  variant="danger" />
        </div>
      </div>

      {/* ── 스킬 트리 ─────────────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", marginBottom: 16 }}>스킬 트리</div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexDirection: mob ? "column" : "row" }}>

          {/* 브랜치 + T3 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              {SKILL_BRANCHES.map(branch => (
                <BranchView
                  key={branch.id}
                  branch={branch}
                  pickedSkills={state.pickedSkills}
                  availablePoints={state.availablePoints}
                  onPick={pickSkill}
                />
              ))}
            </div>

            {/* Tier 3 */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px dashed #E8E8E8" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "#BBB", marginBottom: 10 }}>◆ TIER 3</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {t3.map(s => (
                  <SkillCard key={s.id} skill={s} picked={false} pickable={false} reqsMet={false} onPick={() => {}} />
                ))}
              </div>
              <div style={{ fontSize: "11px", color: "#CCC", marginTop: 8 }}>아직 해금되지 않은 특성입니다.</div>
            </div>
          </div>

          {/* 효과 패널 */}
          <EffectsPanel pickedSkills={state.pickedSkills} />
        </div>
      </div>

      {/* ── 활동 로그 ─────────────────────────────────────────── */}
      {state.expLog.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", marginBottom: 12 }}>활동 로그</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
            {state.expLog.map(e => (
              <div key={e.id} style={{
                fontSize: "12px", padding: "8px 12px",
                background: e.levelUp ? "#FFF5F5" : "#FAFAF8",
                borderRadius: 6,
                borderLeft: `3px solid ${e.levelUp ? "#C0392B" : GOLD_BDR}`,
                lineHeight: 1.6,
              }}>
                <span style={{ color: "#BBB", marginRight: 8, fontSize: "11px" }}>{e.timestamp}</span>
                {e.levelUp ? (
                  <span style={{ color: "#C0392B", fontWeight: 700 }}>
                    ✦ Lv.{e.levelUp.from} → Lv.{e.levelUp.to} 레벨업!
                    <span style={{ fontWeight: 400, color: "#AAA", fontSize: "11px", marginLeft: 6 }}>
                      (EXP {e.prevExp} → {e.newExp})
                    </span>
                  </span>
                ) : (
                  <>
                    <span style={{ fontWeight: 600, color: "#444" }}>{e.character}</span>
                    <span style={{ color: "#777" }}> 경험치 </span>
                    <span style={{ color: GOLD, fontWeight: 700 }}>+{e.amount}</span>
                    <span style={{ color: "#AAA", fontSize: "11px" }}> ({e.prevExp}→{e.newExp})</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

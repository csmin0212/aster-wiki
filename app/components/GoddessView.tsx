'use client';

import { useState, useEffect } from 'react';
import {
  GODDESS_SKILLS, SKILL_BRANCHES, SkillBranch, Skill,
  GoddessState, ExpLogEntry,
  DEFAULT_GODDESS_STATE, expNeeded,
} from '../data/systems';
import { useSharedState } from '../lib/useSharedState';
const GOLD        = "#C8A020";
const GOLD_LIGHT  = "#FFF8E7";
const GOLD_BDR    = "#E8D060";
const CARD_W      = 130;
const CARD_GAP    = 8;
const BRANCH_W    = CARD_W * 2 + CARD_GAP;  // 268
const CONN_H      = 30;

// ─── 캐릭터 스테이터스 데이터 ─────────────────────────────────

const CHAR_SKILLS_LIST = [
  { minLevel: 2, name: "트레이닝",    type: "패시브",                  desc: "근력·민첩 +3, 최대 HP +3, 행동치 +1" },
  { minLevel: 3, name: "신벌 강화Ⅰ",  type: "패시브",                  desc: "신벌! 명중 판정에 +1D" },
  { minLevel: 4, name: "신벌 강화Ⅱ",  type: "패시브",                  desc: "신벌! 대미지에 +2D" },
  { minLevel: 5, name: "빛의 가호",   type: "효과 참조 / 단일 / 시야",  desc: "시나리오 1회. 대미지 굴림 직후, 해당 대미지를 0으로 변경한다." },
];

function computeCharStats(level: number, pickedSkills: string[]) {
  const lvb = Math.max(0, level - 1);

  // 레벨 누적 기본치
  let hp    = 20 + lvb * 7;
  let str   = 6  + lvb;
  const dex = 6;
  let agi   = 9;
  const per = 6;
  let int_  = 18 + lvb;
  let spi   = 15 + lvb;
  const luk = 9;
  let pdef  = 3  + lvb;
  let mdef  = 5  + lvb;
  let act   = 6  + lvb;
  let hitDice = 2, hitFlat = 6  + lvb;
  let dmgDice = 2, dmgFlat = 15 + lvb * 2;

  // 레벨별 스킬 보너스
  if (level >= 2) { str += 3; agi += 3; hp += 3; act += 1; }
  if (level >= 3) { hitDice += 1; }
  if (level >= 4) { dmgDice += 2; }

  // 여신 특성 보너스
  const t: Record<string, number> = {};
  for (const id of pickedSkills) {
    const sk = GODDESS_SKILLS.find(s => s.id === id);
    if (!sk?.bonuses) continue;
    for (const b of sk.bonuses) t[b.stat] = (t[b.stat] ?? 0) + b.value;
  }

  return {
    hp, str, dex, agi, per, int_, spi, luk,
    pdef, mdef, act,
    hitDice, hitFlat, dmgDice, dmgFlat,
    traitHP:   t["HP"]      ?? 0,
    traitMAtk: t["마법공격"] ?? 0,
    traitPDef: t["물리방어"] ?? 0,
    traitMDef: t["마법방어"] ?? 0,
    traitHit:  t["명중"]    ?? 0,
  };
}

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

  const isTier2    = skill.tier === 2;
  const isAdvanced = skill.tier === 3 && !skill.locked;
  const cost       = skill.cost ?? 1;

  const borderColor = isAdvanced
    ? (picked ? "#7B5EA7" : pickable ? "#B39DDB90" : "#E8E8E8")
    : isTier2
      ? (picked ? "#5A8A5A" : reqsMet ? "#7ABD7A80" : "#E8E8E8")
      : (picked ? GOLD_BDR  : pickable ? `${GOLD_BDR}90` : "#E8E8E8");
  const bgColor = isAdvanced
    ? (picked ? "#F0E9FF" : pickable ? "#FAF6FF" : "#F7F5F0")
    : isTier2
      ? (picked ? "#EEF8EE" : reqsMet ? "#FAFFF8" : "#F7F5F0")
      : (picked ? GOLD_LIGHT : pickable ? "#FAFAF8" : "#F7F5F0");
  const textColor = isAdvanced
    ? (picked ? "#5B2D8E" : pickable ? "#444" : "#AAA")
    : isTier2
      ? (picked ? "#3A7A3A" : reqsMet ? "#444" : "#AAA")
      : (picked ? "#8B6914" : pickable ? "#444" : "#AAA");
  const borderStyle = (picked || (!isTier2 && !isAdvanced)) ? "solid" : "dashed";

  return (
    <button
      onClick={() => pickable && onPick()}
      title={`${skill.effect}${cost > 1 ? ` (포인트 ${cost} 소모)` : ""}`}
      style={{
        width: CARD_W, minHeight: 48, flexShrink: 0,
        padding: "9px 12px", borderRadius: 8,
        border: `2px ${borderStyle} ${borderColor}`,
        background: bgColor, color: textColor,
        fontSize: "12px", fontWeight: picked ? 700 : 500,
        cursor: pickable ? "pointer" : "default",
        transition: "all 0.15s", textAlign: "left",
        fontFamily: "'Noto Sans KR',sans-serif",
        lineHeight: 1.4, wordBreak: "keep-all",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
        <span>
          {picked && <span style={{ marginRight: 4, fontSize: "10px" }}>✓</span>}
          {skill.name}
        </span>
        {isAdvanced && !picked && (
          <span style={{
            fontSize: "9px", fontWeight: 700, flexShrink: 0,
            background: pickable ? "#7B5EA7" : "#CCC",
            color: "#fff", borderRadius: 3, padding: "1px 5px",
            marginTop: 1,
          }}>×{cost}</span>
        )}
      </div>
    </button>
  );
}

// ── BranchConnector ────────────────────────────────────────────

function BranchConnector({
  pattern, t1Picked, t2Picked,
}: {
  pattern: "2→1" | "1→2" | "1→1";
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
      ) : pattern === "1→2" ? (
        <>
          <line x1={mid} y1={0} x2={c1}  y2={CONN_H} stroke={strokeColor} strokeWidth={strokeW} strokeDasharray={strokeDash} />
          <line x1={mid} y1={0} x2={c2}  y2={CONN_H} stroke={strokeColor} strokeWidth={strokeW} strokeDasharray={strokeDash} />
        </>
      ) : (
        <line x1={mid} y1={0} x2={mid} y2={CONN_H} stroke={strokeColor} strokeWidth={strokeW} strokeDasharray={strokeDash} />
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
    !s.locked && !isPicked(s.id) && availablePoints >= (s.cost ?? 1) &&
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
    { stat: "특수공격", label: "특수 공격력",    unit: "" },
    { stat: "물리방어", label: "물리 방어력",    unit: "" },
    { stat: "마법방어", label: "마법 방어력",    unit: "" },
    { stat: "명중",   label: "명중",              unit: "" },
    { stat: "리액션", label: "리액션",            unit: "" },
    { stat: "드롭",     label: "드롭 보너스",       unit: "D" },
    { stat: "페이트",   label: "페이트 상한",       unit: "" },
    { stat: "배드",     label: "배드 스테이터스",   unit: "" },
    { stat: "판정D",    label: "판정 주사위",       unit: "D" },
    { stat: "스킬포인트", label: "스킬 포인트",     unit: "" },
  ];

  const active = rows.filter(r => (totals[r.stat] ?? 0) > 0);

  return (
    <div style={{
      width: "100%",
      background: GOLD_LIGHT, border: `1px solid ${GOLD_BDR}`,
      borderRadius: 10, padding: "14px",
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

// ── CharacterStats ─────────────────────────────────────────────

function CharacterStats({ level, pickedSkills }: { level: number; pickedSkills: string[] }) {
  const cs = computeCharStats(level, pickedSkills);
  const known = CHAR_SKILLS_LIST.filter(sk => level >= sk.minLevel);

  // 특성 배지 (+N 표기)
  const TB = ({ v, label }: { v: number; label?: string }) =>
    v > 0 ? (
      <span style={{ fontSize: "10px", color: GOLD, fontWeight: 700, marginLeft: 4 }}>
        (+{v}{label ? ` ${label}` : ""})
      </span>
    ) : null;

  // 능력치 박스 (작은 카드)
  const SBox = ({ label, val, trait = 0 }: { label: string; val: number; trait?: number }) => (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      minWidth: 50, padding: "5px 7px",
      background: "rgba(255,255,255,0.75)", borderRadius: 6,
      border: `1px solid ${GOLD_BDR}50`,
    }}>
      <span style={{ fontSize: "9px", color: "#AAA", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: "14px", fontWeight: 700, color: "#333", lineHeight: 1.3 }}>
        {val + trait}
      </span>
      {trait > 0 && (
        <span style={{ fontSize: "9px", color: GOLD, fontWeight: 700 }}>+{trait}</span>
      )}
    </div>
  );

  return (
    <div style={{
      background: "linear-gradient(135deg, #FFFDF5 0%, #FFF8E7 100%)",
      border: `1px solid ${GOLD_BDR}`,
      borderRadius: 10, padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: GOLD, marginBottom: 14 }}>
        ✦ 캐릭터 능력치 — Lv.{level}
      </div>

      {/* HP */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
        <span style={{ fontSize: "10px", fontWeight: 600, color: "#AAA" }}>HP</span>
        <span style={{ fontSize: "24px", fontWeight: 700, color: "#C0392B" }}>
          {cs.hp + cs.traitHP}
        </span>
        <TB v={cs.traitHP} />
      </div>

      {/* 7대 능력치 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        <SBox label="근력" val={cs.str} />
        <SBox label="재주" val={cs.dex} />
        <SBox label="민첩" val={cs.agi} />
        <SBox label="감지" val={cs.per} />
        <SBox label="지력" val={cs.int_} />
        <SBox label="정신" val={cs.spi} />
        <SBox label="행운" val={cs.luk} />
      </div>

      {/* 방어·행동치 */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 5,
        paddingTop: 10, borderTop: `1px solid ${GOLD_BDR}40`, marginBottom: 14,
      }}>
        <SBox label="물리방어" val={cs.pdef} trait={cs.traitPDef} />
        <SBox label="마법방어" val={cs.mdef} trait={cs.traitMDef} />
        <SBox label="행동치"   val={cs.act} />
      </div>

      {/* 신벌! */}
      <div style={{ paddingTop: 10, borderTop: `1px solid ${GOLD_BDR}40`, marginBottom: 14 }}>
        <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "#AAA", marginBottom: 8 }}>
          ◆ 사용 스킬
        </div>
        <div style={{
          background: "rgba(255,255,255,0.85)", border: `1px solid ${GOLD_BDR}70`,
          borderRadius: 8, padding: "10px 14px",
        }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#2a2a2a", marginBottom: 8 }}>
            신벌!
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "9px", color: "#888", marginBottom: 2 }}>명중</div>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#444" }}>
                {cs.hitDice}D+{cs.hitFlat + cs.traitHit}
              </span>
              <TB v={cs.traitHit} label="명중" />
            </div>
            <div>
              <div style={{ fontSize: "9px", color: "#888", marginBottom: 2 }}>대미지</div>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#C0392B" }}>
                {cs.dmgDice}D+{cs.dmgFlat + cs.traitMAtk}
              </span>
              <TB v={cs.traitMAtk} label="마법공격" />
            </div>
          </div>
        </div>
      </div>

      {/* 보유 스킬 목록 */}
      {known.length > 0 && (
        <div style={{ paddingTop: 10, borderTop: `1px solid ${GOLD_BDR}40` }}>
          <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "#AAA", marginBottom: 8 }}>
            ◆ 보유 스킬
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {known.map(sk => (
              <div key={sk.name} style={{
                background: "rgba(255,255,255,0.85)", border: `1px solid ${GOLD_BDR}60`,
                borderRadius: 8, padding: "8px 12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#2a2a2a" }}>{sk.name}</span>
                  <span style={{
                    fontSize: "9px", color: "#999",
                    border: "1px solid #E0DDD8", borderRadius: 4, padding: "1px 6px",
                  }}>{sk.type}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#666", lineHeight: 1.55 }}>{sk.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── LogPanel ───────────────────────────────────────────────────

function LogPanel({ expLog, onDelete }: { expLog: ExpLogEntry[], onDelete: (id: string) => void }) {
  const [ctx, setCtx] = useState<{ id: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const close = () => setCtx(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  return (
    <div style={{ width: "100%", background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: "#AAA", marginBottom: 10 }}>
        ✦ 활동 로그 <span style={{ fontWeight: 400, opacity: 0.6 }}>(우클릭 → 삭제)</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
        {expLog.map(e => (
          <div key={e.id}
            onContextMenu={ev => { ev.preventDefault(); ev.stopPropagation(); setCtx({ id: e.id, x: ev.clientX, y: ev.clientY }); }}
            style={{
              fontSize: "11px", padding: "5px 8px",
              background: e.levelUp ? "#FFF5F5" : "#FAFAF8",
              borderRadius: 5,
              borderLeft: `2px solid ${e.levelUp ? "#C0392B" : GOLD_BDR}`,
              lineHeight: 1.5, cursor: "context-menu", userSelect: "none",
            }}
          >
            <div style={{ color: "#CCC", fontSize: "10px", marginBottom: 1 }}>{e.timestamp}</div>
            {e.levelUp ? (
              <span style={{ color: "#C0392B", fontWeight: 700, fontSize: "11px" }}>
                ✦ Lv.{e.levelUp.from} → {e.levelUp.to} 레벨업!
              </span>
            ) : (
              <div>
                <span style={{ fontWeight: 600, color: "#444" }}>{e.character}</span>
                <span style={{ color: GOLD, fontWeight: 700 }}> +{e.amount}</span>
                <span style={{ color: "#AAA", fontSize: "10px" }}> EXP</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {ctx && (
        <div onClick={e => e.stopPropagation()} style={{
          position: "fixed", left: ctx.x, top: ctx.y,
          background: "#fff", border: "1px solid #E0DDD8",
          borderRadius: 7, boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
          zIndex: 9999, overflow: "hidden", minWidth: 110,
        }}>
          <button onClick={() => { onDelete(ctx.id); setCtx(null); }} style={{
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

// ── 메인 컴포넌트 ────────────────────────────────────────────────

export default function GoddessView({ mob }: { mob: boolean }) {
  const { state, save, loaded }  = useSharedState<GoddessState>('goddess', DEFAULT_GODDESS_STATE);
  const [charInput,  setChar]    = useState('');
  const [expInput,   setExp]     = useState('');
  const [imgErr,     setImgErr]  = useState(false);
  const [showStats,  setShowStats] = useState(false);

  if (!loaded) return (
    <div style={{ padding: "60px 48px", color: "#AAA", fontSize: "14px" }}>불러오는 중…</div>
  );

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
    const cost = skill.cost ?? 1;
    if (state.availablePoints < cost)                                 return;
    if (!skill.requires.every(r => state.pickedSkills.includes(r)))  return;
    save({
      ...state,
      pickedSkills: [...state.pickedSkills, skill.id],
      availablePoints: state.availablePoints - cost,
    });
  };

  // ── 로그 항목 삭제 (수치 역산) ──────────────────────────────
  const deleteLogEntry = (id: string) => {
    const entry  = state.expLog.find(e => e.id === id);
    if (!entry) return;
    const newLog = state.expLog.filter(e => e.id !== id);

    if (entry.levelUp) {
      // 레벨업 항목 → 레벨·포인트 되돌리기
      save({
        ...state,
        level:           Math.max(1, state.level - 1),
        currentExp:      entry.prevExp,
        availablePoints: Math.max(0, state.availablePoints - 1),
        expLog:          newLog,
      });
    } else {
      // 일반 EXP 항목 → 경험치 차감
      save({
        ...state,
        currentExp: Math.max(0, state.currentExp - entry.amount),
        expLog:     newLog,
      });
    }
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
  const t3adv      = GODDESS_SKILLS.filter(s => s.tier === 3);
  const t4epic     = GODDESS_SKILLS.filter(s => s.tier === 4);
  const pad        = mob ? "20px 16px 80px" : "28px 48px 80px";

  return (
    <div style={{
      display: mob ? "block" : "flex",
      alignItems: "flex-start",
      gap: 20,
      padding: pad,
      maxWidth: 1160,
    }}>

      {/* ── 메인 컬럼 ─────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>

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
              페이스:??
            </h1>
            <div style={{ background: GOLD, color: "#fff", borderRadius: 6, padding: "3px 12px", fontSize: "14px", fontWeight: 700 }}>
              Lv. {state.level}
            </div>
            <button
              onClick={() => setShowStats(v => !v)}
              style={{
                background: showStats ? GOLD : "transparent",
                color: showStats ? "#fff" : GOLD,
                border: `1.5px solid ${GOLD_BDR}`,
                borderRadius: 6, padding: "3px 11px",
                fontSize: "12px", fontWeight: 600,
                cursor: "pointer", fontFamily: "'Noto Sans KR',sans-serif",
              }}
            >
              {showStats ? "✕ 능력치" : "📊 능력치"}
            </button>
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

      {/* ── 캐릭터 능력치 패널 ───────────────────────────────── */}
      {showStats && (
        <CharacterStats level={state.level} pickedSkills={state.pickedSkills} />
      )}

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

            {/* 고급 특성 */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px dashed #E8E8E8" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "#9B7AC4" }}>◆ 고급 특성</div>
                <div style={{ fontSize: "10px", color: "#AAA" }}>— 특성 포인트 3점 소모</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {t3adv.map(s => {
                  const picked   = state.pickedSkills.includes(s.id);
                  const pickable = !picked && state.availablePoints >= (s.cost ?? 1);
                  return (
                    <SkillCard key={s.id} skill={s}
                      picked={picked} pickable={pickable} reqsMet={true}
                      onPick={() => pickSkill(s)} />
                  );
                })}
              </div>
            </div>

            {/* 에픽 특성 */}
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px dashed #F0E8E8" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "#DDB8B8", marginBottom: 10 }}>◆ 에픽 특성</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {t4epic.map(s => (
                  <SkillCard key={s.id} skill={s} picked={false} pickable={false} reqsMet={false} onPick={() => {}} />
                ))}
              </div>
              <div style={{ fontSize: "11px", color: "#CCC", marginTop: 8 }}>아직 해금되지 않은 특성입니다.</div>
            </div>
          </div>

          {/* 효과 패널 */}
          <div style={{ width: mob ? "100%" : 185, flexShrink: 0, alignSelf: "flex-start" }}>
            <EffectsPanel pickedSkills={state.pickedSkills} />
          </div>

        </div>
      </div>

      </div>{/* ── 메인 컬럼 끝 ─── */}

      {/* ── 활동 로그 사이드바 ─────────────────────────────── */}
      {!mob && state.expLog.length > 0 && (
        <div style={{
          width: 240, flexShrink: 0,
          position: "sticky", top: 20,
          alignSelf: "flex-start",
        }}>
          <LogPanel expLog={state.expLog} onDelete={deleteLogEntry} />
        </div>
      )}
      {mob && state.expLog.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <LogPanel expLog={state.expLog} onDelete={deleteLogEntry} />
        </div>
      )}

    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { LevelEffect, LevelState, ExpLogEntry, DEFAULT_LEVEL_STATE, expNeeded } from '../data/systems';

interface Props {
  title: string;
  image?: string;
  effects: LevelEffect[];
  storageKey: string;
  color: string;
  colorLight: string;
  mob: boolean;
}

export default function LevelSystemView({ title, image, effects, storageKey, color, colorLight, mob }: Props) {
  const [state,     setState]   = useState<LevelState>(DEFAULT_LEVEL_STATE);
  const [charInput, setChar]    = useState('');
  const [expInput,  setExp]     = useState('');
  const [decInput,  setDec]     = useState('');
  const [showDec,   setShowDec] = useState(false);
  const [imgErr,    setImgErr]  = useState(false);

  useEffect(() => {
    const s = localStorage.getItem(storageKey);
    if (s) { try { setState(JSON.parse(s)); } catch {} }
  }, [storageKey]);

  const save = (s: LevelState) => {
    setState(s);
    localStorage.setItem(storageKey, JSON.stringify(s));
  };

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

  const doLevelUp = () => {
    const needed = expNeeded(state.level);
    if (state.currentExp < needed) return;

    const entry: ExpLogEntry = {
      id: (Date.now() + 1).toString(),
      character: "",
      amount: 0,
      timestamp: new Date().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      prevExp: state.currentExp,
      newExp: state.currentExp - needed,
      levelUp: { from: state.level, to: state.level + 1 },
    };

    save({ ...state, level: state.level + 1, currentExp: state.currentExp - needed, expLog: [entry, ...state.expLog].slice(0, 50) });
  };

  const decreaseExp = () => {
    const amt = parseInt(decInput);
    if (isNaN(amt) || amt <= 0) return;
    save({ ...state, currentExp: Math.max(0, state.currentExp - amt) });
    setDec(''); setShowDec(false);
  };

  const hardReset = () => {
    if (!confirm(`${title} 레벨·경험치·로그 전부 초기화됩니다.`)) return;
    save(DEFAULT_LEVEL_STATE);
  };

  const needed     = expNeeded(state.level);
  const expPct     = Math.min(100, (state.currentExp / needed) * 100);
  const canLevelUp = state.currentExp >= needed;

  return (
    <div style={{ maxWidth: 760, padding: mob ? "20px 16px 80px" : "28px 48px 80px" }}>

      {/* ── 헤더 ─────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${colorLight} 0%, ${colorLight}99 100%)`,
        border: `1px solid ${color}40`,
        borderRadius: 14,
        padding: mob ? "20px 18px" : "24px 28px",
        marginBottom: 16,
        display: "flex",
        gap: mob ? 16 : 24,
        alignItems: "flex-start",
        flexDirection: mob ? "column" : "row",
      }}>
        {image && !imgErr && (
          <div style={{
            width: mob ? 72 : 96,
            height: mob ? 72 : 96,
            borderRadius: 12,
            overflow: "hidden",
            flexShrink: 0,
            border: `2px solid ${color}60`,
            background: colorLight,
          }}>
            <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErr(true)} />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", color, marginBottom: 4 }}>LEVEL SYSTEM</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: mob ? "20px" : "24px", fontWeight: 700, color: "#2a2a2a", margin: 0 }}>
              {title}
            </h1>
            <div style={{ background: color, color: "#fff", borderRadius: 6, padding: "3px 12px", fontSize: "14px", fontWeight: 700 }}>
              Lv. {state.level}
            </div>
            {effects[state.level - 1] && (
              <div style={{ fontSize: "12px", color, fontWeight: 500 }}>
                {effects[state.level - 1].title}
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

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888", marginBottom: 6 }}>
              <span style={{ fontWeight: 600, color: canLevelUp ? "#C0392B" : color }}>
                {canLevelUp ? "레벨업 가능!" : "EXP"}
              </span>
              <span style={{ fontWeight: 600, color: "#555" }}>{state.currentExp} / {needed}</span>
            </div>
            <div style={{ height: 10, background: "#EDE8D0", borderRadius: 5, overflow: "hidden" }}>
              <div style={{
                width: `${expPct}%`, height: "100%",
                background: canLevelUp ? "#C0392B" : color,
                borderRadius: 5, transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 경험치 입력 ──────────────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", marginBottom: 12 }}>경험치 추가</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="캐릭터 이름"
            value={charInput}
            onChange={e => setChar(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addExp()}
            style={{ flex: "1 1 120px", minWidth: 90, padding: "8px 12px", border: "1px solid #DDD", borderRadius: 6, fontSize: "13px", fontFamily: "'Noto Sans KR',sans-serif", outline: "none" }}
          />
          <input
            type="number" placeholder="EXP"
            value={expInput}
            onChange={e => setExp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addExp()}
            style={{ width: 72, padding: "8px 10px", border: "1px solid #DDD", borderRadius: 6, fontSize: "13px", fontFamily: "'Noto Sans KR',sans-serif", outline: "none" }}
          />
          <button onClick={addExp} style={{ padding: "8px 18px", background: color, color: "#fff", border: "none", borderRadius: 6, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR',sans-serif" }}>
            추가
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
          {!showDec ? (
            <button onClick={() => setShowDec(true)} style={{ padding: "7px 12px", background: "#F5F3EE", color: "#666", border: "1px solid #E0DDD8", borderRadius: 6, fontSize: "12px", cursor: "pointer" }}>
              경험치 감소
            </button>
          ) : (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="number" placeholder="감소량"
                value={decInput}
                onChange={e => setDec(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && decreaseExp()}
                style={{ width: 72, padding: "7px 10px", border: "1px solid #DDD", borderRadius: 6, fontSize: "12px", outline: "none" }}
              />
              <button onClick={decreaseExp} style={{ padding: "7px 12px", background: "#E67E22", color: "#fff", border: "none", borderRadius: 6, fontSize: "12px", cursor: "pointer" }}>적용</button>
              <button onClick={() => { setShowDec(false); setDec(''); }} style={{ padding: "7px 10px", background: "#F5F3EE", color: "#777", border: "1px solid #E0DDD8", borderRadius: 6, fontSize: "12px", cursor: "pointer" }}>✕</button>
            </div>
          )}
          <button onClick={hardReset} style={{ padding: "7px 12px", background: "#FFF0EE", color: "#E74C3C", border: "1px solid #FFCDD2", borderRadius: 6, fontSize: "12px", cursor: "pointer" }}>
            하드 리셋
          </button>
        </div>
      </div>

      {/* ── 레벨별 효과 ──────────────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", marginBottom: 16 }}>레벨별 효과</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {effects.map(ef => {
            const isCurrent  = ef.level === state.level;
            const isUnlocked = ef.level <= state.level;
            return (
              <div key={ef.level} style={{
                padding: "14px 16px", borderRadius: 8,
                border: isCurrent ? `2px solid ${color}` : "1px solid #E8E3DA",
                background: isCurrent ? colorLight : isUnlocked ? "#FAFAF8" : "#F5F5F3",
                opacity: isUnlocked ? 1 : 0.5,
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <div style={{
                    background: isUnlocked ? color : "#CCC", color: "#fff",
                    borderRadius: 4, padding: "2px 8px", fontSize: "12px", fontWeight: 700,
                  }}>Lv. {ef.level}</div>
                  <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: "14px", fontWeight: 700, color: isCurrent ? color : "#444" }}>
                    {ef.title}
                  </div>
                  {isCurrent && (
                    <div style={{ fontSize: "10px", color: "#fff", background: color, borderRadius: 4, padding: "1px 6px" }}>현재</div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {ef.effects.map((eff, i) => (
                    <div key={i} style={{
                      fontSize: "13px", color: isUnlocked ? "#444" : "#AAA",
                      paddingLeft: 10,
                      borderLeft: `2px solid ${isUnlocked ? color : "#DDD"}40`,
                    }}>{eff}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 활동 로그 ──────────────────────────────────────────── */}
      {state.expLog.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E8E3DA", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", marginBottom: 12 }}>활동 로그</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
            {state.expLog.map(e => (
              <div key={e.id} style={{
                fontSize: "12px", padding: "8px 12px",
                background: e.levelUp ? "#FFF5F5" : "#FAFAF8",
                borderRadius: 6,
                borderLeft: `3px solid ${e.levelUp ? "#C0392B" : color + "60"}`,
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
                    <span style={{ color, fontWeight: 700 }}>+{e.amount}</span>
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

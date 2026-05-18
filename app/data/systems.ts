// ─── 여신 특성 스킬 트리 ─────────────────────────────────────

export interface Skill {
  id: string;
  tier: 1 | 2 | 3;
  name: string;
  effect: string;
  requires: string[];
  locked?: boolean;
  bonuses?: { stat: string; value: number }[];
}

export const GODDESS_SKILLS: Skill[] = [
  // ── Tier 1 ──────────────────────────────────────────────────
  { id: "t1_hp",    tier: 1, name: "최대 HP +5",          effect: "최대 HP 5 증가",                requires: [], bonuses: [{ stat: "HP", value: 5 }] },
  { id: "t1_mp",    tier: 1, name: "최대 MP +5",          effect: "최대 MP 5 증가",                requires: [], bonuses: [{ stat: "MP", value: 5 }] },
  { id: "t1_patk",  tier: 1, name: "물리 공격력 +3",      effect: "물리 공격력 3 증가",            requires: [], bonuses: [{ stat: "물리공격", value: 3 }] },
  { id: "t1_matk",  tier: 1, name: "마법 공격력 +3",      effect: "마법 공격력 3 증가",            requires: [], bonuses: [{ stat: "마법공격", value: 3 }] },
  { id: "t1_pdef",  tier: 1, name: "물리 방어력 +3",      effect: "물리 방어력 3 증가",            requires: [], bonuses: [{ stat: "물리방어", value: 3 }] },
  { id: "t1_mdef",  tier: 1, name: "마법 방어력 +3",      effect: "마법 방어력 3 증가",            requires: [], bonuses: [{ stat: "마법방어", value: 3 }] },
  { id: "t1_hit",   tier: 1, name: "명중 +1",             effect: "명중 판정에 +1",                requires: [], bonuses: [{ stat: "명중", value: 1 }] },
  { id: "t1_react", tier: 1, name: "리액션 +1",           effect: "리액션 판정에 +1",              requires: [], bonuses: [{ stat: "리액션", value: 1 }] },
  { id: "t1_drop",  tier: 1, name: "드롭 +1D",            effect: "드롭 아이템 굴림에 +1D",        requires: [], bonuses: [{ stat: "드롭", value: 1 }] },
  { id: "t1_fate",  tier: 1, name: "페이트 상한 +1",      effect: "페이트 상한 1 증가",            requires: [], bonuses: [{ stat: "페이트", value: 1 }] },
  { id: "t1_bad",   tier: 1, name: "배드 스테이터스 +1",  effect: "배드 스테이터스 강도 1 증가",   requires: [], bonuses: [{ stat: "배드", value: 1 }] },

  // ── Tier 2 ──────────────────────────────────────────────────
  { id: "t2_hpmp",   tier: 2, name: "최대 HP·MP +10",     effect: "최대 HP와 MP 각 10 증가",       requires: ["t1_hp", "t1_mp"],     bonuses: [{ stat: "HP", value: 10 }, { stat: "MP", value: 10 }] },
  { id: "t2_atk",    tier: 2, name: "공격력 +4",           effect: "물리·마법 공격력 각 4 증가",   requires: ["t1_patk", "t1_matk"], bonuses: [{ stat: "물리공격", value: 4 }, { stat: "마법공격", value: 4 }] },
  { id: "t2_def",    tier: 2, name: "방어력 +4",           effect: "물리·마법 방어력 각 4 증가",   requires: ["t1_pdef", "t1_mdef"], bonuses: [{ stat: "물리방어", value: 4 }, { stat: "마법방어", value: 4 }] },
  { id: "t2_judge",  tier: 2, name: "모든 판정 +2",        effect: "모든 판정에 +2",               requires: ["t1_hit", "t1_react"], bonuses: [{ stat: "명중", value: 2 }, { stat: "리액션", value: 2 }] },
  { id: "t2_drop_a", tier: 2, name: "드롭 +1D",            effect: "드롭 아이템 굴림에 +1D",       requires: ["t1_drop"],            bonuses: [{ stat: "드롭", value: 1 }] },
  { id: "t2_drop_b", tier: 2, name: "드롭 +1D",            effect: "드롭 아이템 굴림에 +1D",       requires: ["t1_drop"],            bonuses: [{ stat: "드롭", value: 1 }] },
  { id: "t2_fate_a", tier: 2, name: "페이트 상한 +1",      effect: "페이트 상한 1 증가",           requires: ["t1_fate"],            bonuses: [{ stat: "페이트", value: 1 }] },
  { id: "t2_fate_b", tier: 2, name: "페이트 상한 +1",      effect: "페이트 상한 1 증가",           requires: ["t1_fate"],            bonuses: [{ stat: "페이트", value: 1 }] },
  { id: "t2_bad_a",  tier: 2, name: "배드 스테이터스 +1",  effect: "배드 스테이터스 강도 1 증가",  requires: ["t1_bad"],             bonuses: [{ stat: "배드", value: 1 }] },
  { id: "t2_bad_b",  tier: 2, name: "배드 스테이터스 +1",  effect: "배드 스테이터스 강도 1 증가",  requires: ["t1_bad"],             bonuses: [{ stat: "배드", value: 1 }] },

  // ── Tier 3 (잠금) ────────────────────────────────────────────
  { id: "t3_1", tier: 3, name: "???", effect: "미공개", requires: [], locked: true },
  { id: "t3_2", tier: 3, name: "???", effect: "미공개", requires: [], locked: true },
  { id: "t3_3", tier: 3, name: "???", effect: "미공개", requires: [], locked: true },
  { id: "t3_4", tier: 3, name: "???", effect: "미공개", requires: [], locked: true },
];

// ─── 스킬 브랜치 ──────────────────────────────────────────────

export interface SkillBranch {
  id: string;
  label: string;
  t1: string[];
  t2: string[];
  pattern: "2→1" | "1→2";
}

export const SKILL_BRANCHES: SkillBranch[] = [
  { id: "hpmp",  label: "HP·MP",  t1: ["t1_hp", "t1_mp"],       t2: ["t2_hpmp"],                  pattern: "2→1" },
  { id: "atk",   label: "공격력", t1: ["t1_patk", "t1_matk"],   t2: ["t2_atk"],                   pattern: "2→1" },
  { id: "def",   label: "방어력", t1: ["t1_pdef", "t1_mdef"],   t2: ["t2_def"],                   pattern: "2→1" },
  { id: "judge", label: "판정",   t1: ["t1_hit", "t1_react"],   t2: ["t2_judge"],                 pattern: "2→1" },
  { id: "drop",  label: "드롭",   t1: ["t1_drop"],               t2: ["t2_drop_a", "t2_drop_b"],   pattern: "1→2" },
  { id: "fate",  label: "페이트", t1: ["t1_fate"],               t2: ["t2_fate_a", "t2_fate_b"],   pattern: "1→2" },
  { id: "bad",   label: "배드",   t1: ["t1_bad"],                t2: ["t2_bad_a", "t2_bad_b"],     pattern: "1→2" },
];

// ─── 레벨별 효과 ──────────────────────────────────────────────

export interface LevelEffect {
  level: number;
  title: string;
  effects: string[];
}

// 실버로드 레벨 효과 (app/data/systems.ts에서 직접 수정)
export const SILVER_ROAD_EFFECTS: LevelEffect[] = [
  { level: 1, title: "거래처",      effects: ["기본 거래 가능", "일반 소모품 구매 가능"] },
  { level: 2, title: "단골 고객",   effects: ["장비 아이템 구매 가능", "거래 시 10% 할인"] },
  { level: 3, title: "신뢰 파트너", effects: ["희귀 아이템 목록 열람 가능", "거래 시 20% 할인"] },
  { level: 4, title: "특별 의뢰인", effects: ["특수 의뢰 수주 가능", "거래 시 25% 할인"] },
  { level: 5, title: "동반자",      effects: ["상단 전용 창고 사용 가능", "거래 시 30% 할인"] },
];

// 엘린 레벨 효과 (app/data/systems.ts에서 직접 수정)
export const ELIN_EFFECTS: LevelEffect[] = [
  { level: 1, title: "면식", effects: ["기본 대화 가능"] },
  { level: 2, title: "지인", effects: ["마을 소문 공유", "정보 교환 가능"] },
  { level: 3, title: "친구", effects: ["단독 의뢰 수주 가능", "비밀 대화 가능"] },
  { level: 4, title: "측근", effects: ["상단 내부 정보 공유", "특별 장비 구매 가능"] },
  { level: 5, title: "동료", effects: ["동반 모험 가능", "전투 지원 가능"] },
];

// ─── 상태 타입 ────────────────────────────────────────────────

export interface ExpLogEntry {
  id: string;
  character: string;
  amount: number;
  timestamp: string;
  prevExp: number;
  newExp: number;
  levelUp?: { from: number; to: number };
}

export interface GoddessState {
  level: number;
  currentExp: number;
  availablePoints: number;
  pickedSkills: string[];
  expLog: ExpLogEntry[];
}

export interface LevelState {
  level: number;
  currentExp: number;
  expLog: ExpLogEntry[];
}

export const DEFAULT_GODDESS_STATE: GoddessState = {
  level: 1,
  currentExp: 0,
  availablePoints: 0,
  pickedSkills: [],
  expLog: [],
};

export const DEFAULT_LEVEL_STATE: LevelState = {
  level: 1,
  currentExp: 0,
  expLog: [],
};

export function expNeeded(level: number): number {
  return level * 10;
}

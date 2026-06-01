// ─── 클로버 상회 (특수 상점) ─────────────────────────────────
// 특별한 물건을 파는 특수 상점.
// 각 물건은 1회만 구매 가능하며, 구매(사용) 시 진열대에서 사라진다.
//
// 잠금 해제:  locked: true → false 로 직접 수정
// 진열은 4 x 2 (총 8칸) 그리드.

export type CloverItemType = "stat-potion" | "normal" | "locked";

export interface CloverItem {
  id:        string;          // 고유 ID (구매 상태 추적용)
  name:      string;
  price:     number;          // G
  type:      CloverItemType;
  icon:      string;          // 이미지 로드 실패 시 대체 이모지
  image?:    string;          // /public 경로 (없으면 이모지)
  desc:      string;          // 상세 정보
  flavor?:   string;          // 플레이버 텍스트
  consumable?: boolean;       // 소모품 여부
  locked?:   boolean;         // 미해금 여부
}

const POTION_FLAVOR =
  "병을 기울이면 네잎클로버 빛깔의 액체가 느릿하게 소용돌이친다. " +
  "한 모금, 단 한 모금이면 — 잠들어 있던 재능 하나가 기지개를 켠다. " +
  "클로버 상회의 약사는 빙긋 웃으며 말했다. \"무엇이 자라고 싶은지는, 마시는 분이 정하는 겁니다.\"";

const POTION = (n: number): CloverItem => ({
  id:         `growth-potion-${n}`,
  name:       "성장의 비약",
  price:      2000,
  type:       "stat-potion",
  icon:       "🧪",
  desc:       "원하는 스테이터스 1개를 지정하여 해당 스테이터스 수정치에 +1 한다.",
  flavor:     POTION_FLAVOR,
  consumable: true,
});

export const CLOVER_ITEMS: CloverItem[] = [
  // 1~4. 성장의 비약
  POTION(1),
  POTION(2),
  POTION(3),
  POTION(4),

  // 5. 복원된 고서
  {
    id:     "restored-codex",
    name:   "복원된 고서",
    price:  5000,
    type:   "normal",
    icon:   "📜",
    desc:   "수장된 유적에서 발견한 고서의 복원본. 어디에 쓰는 걸까?",
    flavor:
      "바닷물에 삼켜져 한 글자도 남지 않았던 책. 상회의 손을 거치자 " +
      "빛바랜 삽화와 끊어진 문장들이 되살아났다. 그러나 — 페이지 한가운데, " +
      "누군가 일부러 도려낸 듯한 공백만은 끝끝내 복원되지 않았다.",
    consumable: true,
  },

  // 6. 특별한 사진
  {
    id:     "special-photo",
    name:   "특별한 사진",
    price:  5000,
    type:   "normal",
    icon:   "🖼️",
    desc:   "왕도에서 찍은 사진. 익숙한 얼굴이 보이는데.",
    consumable: true,
  },

  // 7~8. 미해금
  {
    id:     "locked-7",
    name:   "???",
    price:  0,
    type:   "locked",
    icon:   "🔒",
    desc:   "아직 진열되지 않은 물건이다.",
    locked: true,
  },
  {
    id:     "locked-8",
    name:   "???",
    price:  0,
    type:   "locked",
    icon:   "🔒",
    desc:   "아직 진열되지 않은 물건이다.",
    locked: true,
  },
];

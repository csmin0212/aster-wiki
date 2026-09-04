// ─── 클로버 상회 (특수 상점) ─────────────────────────────────
// 특별한 물건을 파는 특수 상점.
// 각 물건은 1회만 구매 가능하며, 구매(사용) 시 진열대에서 사라진다.
//
// 잠금 해제:  locked: true → false 로 직접 수정
// 진열은 4 x 3 (총 12칸) 그리드.

export type CloverItemType = "stat-potion" | "normal" | "photo" | "locked";

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
  vip?:      boolean;         // VIP 카드로만 열리는 진열칸
  photo?:    string;          // type: "photo" — 열람용 실제 사진 경로
  photoCaption?: string;      // 사진 하단에 적힌 문구
  tag?:      string;          // 분류 표시 (예: "복합")
  prompt?: {                  // 구매 시 반드시 적어 넣어야 하는 항목
    label:       string;
    placeholder: string;
    suffix?:     string;      // 기록에 덧붙일 꼬리말 (예: " +1")
  };
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
  prompt:     {
    label:       "올릴 스테이터스",
    placeholder: "예: 근력 / 민첩 / 감각 / 정신 …",
    suffix:      " +1",
  },
});

const COMMISSION = (n: number): CloverItem => ({
  id:     `blank-commission-${n}`,
  name:   "백지 의뢰서",
  price:  20000,
  type:   "normal",
  icon:   "📋",
  vip:    true,
  desc:
    "아무것도 적히지 않은 클로버 상회의 의뢰서. 찾고 싶은 것을 적어 내면, 상회가 찾아온다.\n\n" +
    "진열대에 없는 것을 파는 유일한 자리다. 무엇을 적든 값은 같고, 한 번 적은 것은 지울 수 없다.",
  flavor:
    "\"값은 물건이 아니라, 찾는 데 듭니다.\" 점원은 펜을 함께 내밀었다. " +
    "\"그러니 없는 것을 적으셔도 환불은 없습니다. 찾지 못했다는 것도, 저희가 찾아드린 답이니까요.\"",
  consumable: true,
  prompt: {
    label:       "의뢰 내용",
    placeholder: "찾고 싶은 것을 적으시오",
  },
});

export const CLOVER_ITEMS: CloverItem[] = [
  // 1~4. 성장의 비약
  POTION(1),
  POTION(2),
  POTION(3),
  POTION(4),

  // 5. 복원된 고서 — 신탁 연대기 IV 그 자체 (완전 복원 · 결손부 없음)
  {
    id:     "restored-codex",
    name:   "복원된 고서",
    price:  5000,
    type:   "normal",
    icon:   "📜",
    desc:
      "수장된 유적에서 발견한 고서의 복원본. 어디에 쓰는 걸까?\n\n" +
      "해독하면 「신탁 연대기 IV」의 기록이 드러난다. — 엘린에게 가져갈 것.",
    flavor:
      "바닷물에 삼켜져 한 글자도 남지 않았던 책. 상회의 손을 거치자 " +
      "빛바랜 삽화와 끊어진 문장들이 하나도 빠짐없이 되살아났다. " +
      "이제 첫 줄부터 마지막 줄까지, 읽지 못할 곳이 없다.",
    consumable: true,
  },

  // 6. 특별한 사진
  {
    id:     "special-photo",
    name:   "특별한 사진",
    price:  5000,
    type:   "photo",
    icon:   "🖼️",
    desc:   "어딘가에서 찍은 사진. 사용하기는 당신에게 달렸다…",
    flavor:
      "상회의 주인은 사진을 봉투째 밀어놓고는, 끝내 그 안을 들여다보지 않았다. " +
      "\"값은 이미 받았습니다. 무엇이 찍혔는지는 — 사신 분의 몫이지요.\"",
    photo:  "/special-photo.jpg",
    photoCaption: "어딘가에서 찍은 사진. 사용하기는 당신에게 달렸다…",
    consumable: true,
  },

  // ── 7~11. VIP 카드로 열린 안쪽 진열 ───────────────────────
  {
    id:     "flowing-whetstone",
    name:   "유수의 숫돌",
    price:  10000,
    type:   "normal",
    icon:   "🪨",
    tag:    "복합",
    vip:    true,
    desc:
      "마이너 액션, 당신이 행하는 무기 공격의 대미지를 '선택한 속성'의 마법 피해로 변경한다. " +
      "이 효과는 라운드 종료 시 까지 지속된다.",
    flavor:
      "\"참 신기한 물건이죠, 사용자의 마음에 응하여 발하는 속성이 달라지다니.\"",
  },
  {
    id:     "nameless-arcana",
    name:   "이름 없는 아르카나",
    price:  10000,
    type:   "normal",
    icon:   "🃏",
    vip:    true,
    desc:   "구매 시 중량 1. 특별한 효과는 없어 보인다.",
    flavor:
      "새하얗게 빛바랜 그것은 누군가가 사용하던 물건과 비슷하게 닮아있다. " +
      "고대 유적에서 발견했지만 사용처를 찾지 못해 지금은 애물단지와 같은 취급이라고.",
  },
  {
    id:     "pure-white-silk",
    name:   "순백의 비단",
    price:  10000,
    type:   "normal",
    icon:   "🎀",
    vip:    true,
    desc:   "구매 시 중량 1. 특별한 효과는 없어 보인다.",
    flavor:
      "소문만 무성한 '유계', 요정들의 이상향에서 가져왔다는 하얀 비단. " +
      "어디에 사용하는걸까…",
  },
  COMMISSION(1),
  COMMISSION(2),

  // ── 12. 빈 자리 ───────────────────────────────────────────
  {
    id:     "empty-slot",
    name:   "???",
    price:  0,
    type:   "locked",
    icon:   "⬜",
    locked: true,
    desc:   "받침대만 놓인 빈 자리. 아직 아무것도 진열되지 않았다.",
    flavor:
      "상회는 이 자리를 비워둔 채로도 매일 닦는다. " +
      "들어올 물건이 정해져 있다는 뜻인지, 나간 물건을 아직 치우지 못한 것인지는 알 수 없다.",
  },
];

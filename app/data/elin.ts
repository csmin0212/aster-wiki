// ─── 신탁 연대기 ─────────────────────────────────────────────
// 해금 여부: unlocked: true / false 로 직접 수정
// 내용 추가: content 필드를 직접 수정
//
// ── 전체 구조 ────────────────────────────────────────────────
//   I        서장. "서로 다른 네 사람이 모일지니" — 예언의 대상은 PC 4인.
//   II ~ IX  PC 4인에 대한 예언. 각성과 죽음이 연속 쌍으로 배치된다.
//              짝수(II·IV·VI·VIII) = 각성의 예언
//              홀수(III·V·VII·IX)  = 죽음의 예언
//              (II,III) 페쿠니아 / (IV,V) 세란티아 / (VI,VII) ? / (VIII,IX) ?
//   X ~ XI   미정
//   XII      종장. 관찰자 시점의 건조한 마무리.
//
// ── 각성의 예언 작법 (II·IV 기준) ────────────────────────────
//   · 3연 × 2행. 인물의 이름은 끝까지 부르지 않는다.
//   · 1연: "한 아이가 있었다." + 그 인물을 정의하는 모순 → "~ 아이였다."
//   · 2연: 살아온 삶 + 끝내 풀지 못한 것 → "끝내 ~하지 못했다."
//   · 3연: 무너지는 한 순간 + 그 인물이 계약한 정령이 깃드는 장면.
//          ※ 마지막 행의 상징물 = 계약한 정령 그 자체다. 은유가 아니다.
//          페쿠니아 = 금빛 알갱이  → 금빛 정령과 계약 (빈손 → 마음속)
//          세란티아 = 물빛 한 방울 → 텅 빈 정령검에 깃든 첫 정령.
//                     정령은 앞으로 하나씩 늘어난다("빈자리", "처음으로"가 그 복선)

export interface ElinBook {
  id: number;
  title: string;
  content: string;
  unlocked: boolean;
}

export const ELIN_BOOKS: ElinBook[] = [
  {
    id: 1,
    title: "신탁 연대기 I",
    unlocked: true,
    content:
      "붉은 하늘이 불처럼 피어오를 때\n" +
      "서로 다른 네 사람이 모일지니\n" +
      "첫 번째 별의 기억이 떠오르고\n" +
      "거짓된 역사를 바로잡으리라.",
  },
  {
    id: 2,
    title: "신탁 연대기 II",
    unlocked: true,
    content:
      "한 아이가 있었다.\n" +
      "웃는 얼굴 아래 불타는 꿈을 숨긴 아이였다.\n\n" +
      "아픈 이들에게 손을 내미는 동안에도,\n" +
      "제 안의 불만은 끝내 끄지 못했다.\n\n" +
      "더는 건넬 것이 없어 빈손을 떨던 그 순간,\n" +
      "금빛 알갱이가 아이의 마음 깊은 곳에 내려앉았다.",
  },
  { id: 3,  title: "신탁 연대기 III",  unlocked: false, content: "" },
  {
    id: 4,
    title: "신탁 연대기 IV",
    unlocked: true,
    content:
      "한 아이가 있었다.\n" +
      "날개를 가졌으나, 늘 남의 등 뒤에 서 있던 아이였다.\n\n" +
      "부러진 이들을 잇고 돌아오는 길마다,\n" +
      "지켜서 강해졌다는 이를 끝내 한 사람도 세지 못했다.\n\n" +
      "빈손으로 서야 할 끝의 들판에서 텅 빈 쇠를 움켜쥔 그 순간,\n" +
      "물빛 한 방울이 그 빈자리에 처음으로 깃들었다.",
  },
  { id: 5,  title: "신탁 연대기 V",    unlocked: false, content: "" },
  { id: 6,  title: "신탁 연대기 VI",   unlocked: false, content: "" },
  { id: 7,  title: "신탁 연대기 VII",  unlocked: false, content: "" },
  { id: 8,  title: "신탁 연대기 VIII", unlocked: false, content: "" },
  { id: 9,  title: "신탁 연대기 IX",   unlocked: false, content: "" },
  { id: 10, title: "신탁 연대기 X",    unlocked: false, content: "" },
  { id: 11, title: "신탁 연대기 XI",   unlocked: false, content: "" },
  {
    id: 12,
    title: "신탁 연대기 XII",
    unlocked: true,
    content:
      "그렇게, 빛과 어둠이 양립하던 시대는 마무리 되었다.\n" +
      "하지만 기억해야할 것이다. 이것은 임시 방편에 불과하다는 사실을.\n" +
      "진정한 구원은 찾아오지 않는다. 이 세계에게도. 그들에게도.\n" +
      "이것은, 기록된 역사일지니.",
  },
];

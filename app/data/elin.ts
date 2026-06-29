// ─── 신탁 연대기 ─────────────────────────────────────────────
// 해금 여부: unlocked: true / false 로 직접 수정
// 내용 추가: content 필드를 직접 수정

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
  { id: 4,  title: "신탁 연대기 IV",   unlocked: false, content: "" },
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

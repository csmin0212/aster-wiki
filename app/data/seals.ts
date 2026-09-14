// ─── 봉인석 ──────────────────────────────────────────────────
// 마왕을 가둔 여섯 개의 돌.
//
// 회수하면 status를 "recovered" 로, 장소와 기록을 채운다.
// 완전히 파괴되면 "broken" 으로 바꾼다.

export type SealStatus =
  | "recovered"   // 회수·수복 완료
  | "unknown"     // 아직 찾지 못함
  | "broken";     // 파괴됨

export interface Seal {
  id:      number;
  color:   string;          // 육각형 색
  status:  SealStatus;
  place?:  string;          // 회수한 장소
  nation?: string;          // 소속 국가
  record?: string;          // 그곳에서 있었던 일
}

export const SEALS: Seal[] = [
  {
    id: 1,
    color: "#C9A94E",
    status: "recovered",
    place:  "고도(古都) 아에르데",
    nation: "카르데아 왕국",
    record:
      "요마 무리가 봉인석을 파괴하기 직전까지 몰아붙인 것을 저지했다. " +
      "금이 간 돌에 엘라가 손을 대자, 알아들을 수 없는 말과 함께 원석의 모습으로 되돌아갔다.",
  },
  {
    id: 2,
    color: "#3E8FB0",
    status: "recovered",
    place:  "곡창 도시 파넬 · 풍차 지하 연구 시설",
    nation: "리에트 자유시연합",
    record:
      "도시보다 오래된 풍차, 그 아래 잠긴 고대의 연구 단지 가장 깊은 곳에 있었다. " +
      "이 봉인석이 있었기에 그 자리에 연구 단지가 세워졌다고, 시설의 관리 기계는 말했다.",
  },
  { id: 3, color: "#6BA84F", status: "unknown" },
  { id: 4, color: "#B0505F", status: "unknown" },
  { id: 5, color: "#7B5EA7", status: "unknown" },
  { id: 6, color: "#C57A3E", status: "unknown" },
];

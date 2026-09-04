export interface Npc {
  id: string;
  name: string;
  title?: string;
  image?: string;
}

export interface NpcGroup {
  id: string;
  name: string;
  nationId: string;
  npcs: Npc[];
}

export const npcGroups: NpcGroup[] = [
  // 카르데아 왕국
  {
    id: "cardea-berna-cathedral",
    name: "베르나 대신전",
    nationId: "cardea",
    npcs: [
      { id: "teresa", name: "테레사", title: "주교", image: "/npcs/cardea/teresa.jpg" },
      { id: "matias", name: "마티아스", title: "사제", image: "/npcs/cardea/matias.jpg" },
    ],
  },
  {
    id: "cardea-silver-road",
    name: "상단 [실버 로드]",
    nationId: "cardea",
    npcs: [
      { id: "silverash", name: "실버에쉬", title: "여상", image: "/npcs/cardea/silverash.jpg" },
      { id: "murdock", name: '머독 "The Heavy"', image: "/npcs/cardea/murdock.jpg" },
      { id: "elin", name: "엘린", image: "/npcs/cardea/elin.jpg" },
    ],
  },
  {
    id: "cardea-orphanage",
    name: "고아원",
    nationId: "cardea",
    npcs: [
      { id: "charles", name: "찰스 에버릭", title: "원장", image: "/npcs/cardea/charles.jpg" },
      { id: "dian", name: "디안", image: "/npcs/cardea/dian.jpg" },
      { id: "rebecca", name: "레베카", image: "/npcs/cardea/rebecca.jpg" },
    ],
  },

  // 실바나 수호림
  {
    id: "silvana-elder-council",
    name: "장로회",
    nationId: "silvana",
    npcs: [
      { id: "armin", name: "아르민", title: "쪽빛 장로", image: "/npcs/silvana/armin.jpg" },
    ],
  },
  {
    id: "silvana-guardian",
    name: "가디언",
    nationId: "silvana",
    npcs: [
      { id: "erwen", name: "에르웬", image: "/npcs/silvana/erwen.jpg" },
      { id: "ferendia", name: "페렌디아", image: "/npcs/silvana/ferendia.jpg" },
    ],
  },

  // 발하르트 방벽령
  {
    id: "valhart-arkbalt",
    name: "중앙 요새 아르크발트",
    nationId: "valhart",
    npcs: [
      { id: "velk", name: "벨크 팔켄하임", title: "방벽장", image: "/npcs/valhart/velk.jpg" },
    ],
  },
  {
    id: "valhart-owl-squad",
    name: "올빼미부대",
    nationId: "valhart",
    npcs: [
      { id: "medeia", name: "메데이아", title: "선익장", image: "/npcs/valhart/medeia.jpg" },
    ],
  },
  {
    id: "valhart-crow-squad",
    name: "까마귀부대",
    nationId: "valhart",
    npcs: [
      { id: "branwen", name: "브란웬", image: "/npcs/valhart/branwen.jpg" },
    ],
  },
];

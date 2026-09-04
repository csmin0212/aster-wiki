'use client';

import { useState, useEffect, useRef, ReactNode } from "react";

// --- 타입 정의 (TypeScript) ---
interface RaceData {
  race: string;
  pct: number;
  color: string;
}

interface Location {
  name: string;
  desc: string;
  detail: string;
}

interface Nation {
  id: string;
  name: string;
  nameEn: string;
  race: string;
  location: string;
  regime: string;
  color: string;
  accent: string;
  icon: string;
  summary: string;
  geography: string;
  politics: string;
  culture: string;
  military: string;
  population: {
    total: string;
    data: RaceData[];
  };
  locations: Location[];
}

// --- 데이터 세트 ---
const nations: Nation[] = [
  {
    id: "cardea", name: "카르데아 왕국", nameEn: "Kingdom of Cardea",
    race: "휴린", location: "대륙 중앙 ~ 남해안", regime: "세습 왕정 · 귀족 의회",
    color: "#2A5F9E", accent: "#D4E4F7", icon: "👑",
    summary: "아스테르 대륙의 중심부를 차지하는 최대 국가. 비옥한 평야와 남해 교역로를 독점하며, 항구도시 베르나를 중심으로 대륙 경제의 심장부 역할을 한다.",
    geography: "대륙 중앙 평원부터 남해안까지 이르는 광대한 영토를 보유한 최대 국가. 비옥한 농경지와 내륙 교역로를 독점하는 지정학적 우위를 가진다.\n\n남해안의 항구도시 베르나가 대륙 최대 무역 거점이며, 북으로는 실바나 수호림·모그라이헴 산악연합과 국경을 접하고, 남동으로는 카란사 초원과 맞닿아 있다. 내륙에는 왕도 루미엘을 중심으로 여러 도시가 가도(街道)로 연결되어 있다.",
    politics: "세습 왕정과 귀족 의회가 병존하는 체제. 왕가는 수백 년간 이어져 왔으며, 실질적 정치는 의회의 귀족 파벌이 좌우한다. 왕의 권위는 상징적이지만 군사 통수권은 왕에게 있다.\n\n의회 내에서 왕당파(전통 중시)와 개혁파(타종족 연합 확대)가 대립하고 있으며, 최근 마족 위협 증가에 따른 대응 방침을 놓고 갈등이 격화되고 있다.",
    culture: "대륙에서 가장 다종족이 섞여 사는 사회. 베르나를 비롯한 대도시에서는 엘다난 상인, 네바프 대장장이, 필보르 여인숙 주인, 버나 용병, 두앙 짐꾼까지 다양한 종족을 볼 수 있다.\n\n휴린 특유의 적응력과 사교성이 이 다종족 공존의 기반이며, 혼혈(하프 블러드)에 대한 태도는 도시에서는 비교적 관용적이나 시골로 갈수록 보수적인 편이다.\n\n고대 문명에 대해서는 공식적으로 '신화'로 분류하며, 학술적 접근만 허용하는 입장이다.",
    military: "왕국 정규군이 국경 방어를 담당하나 실전 경험이 부족하다. 수백 년간 대규모 전쟁이 없었기 때문에 군의 전투력보다는 장비와 조직력에 의존하는 구조.\n\n최근 마족 활동 증가에 대비한 군비 확충 논의가 시작됐으나, 의회 내 예산 논쟁으로 진전이 더디다.",
    population: { total: "약 850만", data: [
      { race: "휴린", pct: 72, color: "#2A5F9E" }, { race: "엘다난", pct: 8, color: "#1A6B4A" },
      { race: "필보르", pct: 7, color: "#4A7A2E" }, { race: "네바프", pct: 5, color: "#8B6914" },
      { race: "버나", pct: 5, color: "#B85C2A" }, { race: "두앙", pct: 2, color: "#8B2D2D" },
      { race: "하프", pct: 1, color: "#777" },
    ]},
    locations: [
      { name: "왕도 루미엘", desc: "대륙 중앙 평원의 도시. 왕궁과 귀족 의회가 소재한 왕국의 심장.", detail: "카르데아 왕국의 수도이자 대륙 정치의 중심지. 인구 약 12만. 왕궁을 중심으로 귀족 저택과 행정 기관이 방사형으로 배치되어 있으며, 외곽에는 평민 거주구와 상업구가 자리잡고 있다.\n\n왕궁은 수백 년의 역사를 가진 웅장한 석조 건축물로, 내부에는 왕가의 역사를 기록한 대서고(大書庫)가 있다. 이 서고에 고대 문명에 대한 기록이 일부 보관되어 있다고 알려져 있으나, 열람은 엄격히 제한된다.\n\n대륙 회의가 열리는 '아스테르 합의전'도 이 도시에 소재한다. 6개국 대표가 모이는 유일한 장소이며, 회의 기간에는 도시 전체가 축제 분위기가 된다." },
      { name: "항구도시 베르나", desc: "남해안 최대 항구. 인구 약 3만. 6개국 상인이 모이는 중립적 무역 거점.", detail: "카르데아 왕국 남해안에 위치한 대륙 최대의 무역항. 남쪽 바닷길을 통해 카란사 부족연합과 교역하고, 내륙 교역로를 통해 전 대륙과 연결되는 물류의 심장부.\n\n도시는 항구를 중심으로 부채꼴 형태로 발달했으며, 항구 구역·상업 구역·구시가지·장인 구역·거주 구역·외곽으로 나뉜다. 구시가지 언덕 꼭대기의 베르나 대성당은 도시에서 가장 오래된 건축물로, 도시 건설 이전부터 존재했다고 전해진다.\n\n6개국의 문화가 자연스럽게 공존하는 곳으로, '베르나에서는 누구나 손님이다'라는 속담이 있을 정도로 개방적이다." },
      { name: "고도(古都) 아에르데", desc: "고대 문명 시대의 수도였다고 전해지는 옛 도시의 유적.", detail: "왕도 루미엘에서 남쪽으로 반나절 거리에 위치한 광대한 유적지. 고대 문명 시대에 대륙의 중심 도시였다고 전해지나, 현재는 대부분이 무너지거나 땅에 묻혀 있다.\n\n현 왕가가 접근 금지로 지정하고 있으며, 왕국 정규군이 유적 주변을 경비한다. 접근 금지의 공식적 이유는 '구조물 붕괴 위험'이지만, 실제 이유를 아는 사람은 왕가 내부에도 극소수뿐이라고 한다.\n\n학자들 사이에서는 이 유적 지하에 고대 문명의 핵심 시설이 보존되어 있을 것이라는 추측이 끊이지 않는다." },
    ],
  },
  {
    id: "silvana", name: "실바나 수호림", nameEn: "Guardwood of Silvana",
    race: "엘다난", location: "대륙 북서부 고대 삼림", regime: "장로 회의제",
    color: "#1A6B4A", accent: "#D5EDDF", icon: "🌿",
    summary: "대륙 북서부를 덮는 거대한 고대 삼림 전체가 하나의 국가. 외부인의 출입을 제한하며, 고대 문명의 기억을 가장 선명하게 보존하고 있는 곳.",
    geography: "대륙 북서부를 덮는 거대한 고대 삼림. 숲 자체가 일종의 자연 방어막 역할을 하며, 외부인이 길을 찾기 극도로 어렵다.\n\n숲의 중심에 대륙에서 가장 오래된 나무인 세계수 이르미나가 있으며, 이것이 엘다난의 정신적 중심이다.",
    politics: "장로 회의제. 200세 이상을 사는 종족이므로 장로 중에는 수백 년의 경험을 가진 이가 있다. 결정은 합의 중심이라 느리지만 한 번 결정되면 매우 강고하다.\n\n현재 장로 회의는 개방파(외부 협력 주장)와 수호파(고립 유지 주장)로 나뉘어 있다.",
    culture: "고유 언어인 스피아르어를 사용하며, 문자 기록 문화가 매우 발달해 있다. 고대 문명의 기억이 가장 선명하게 보존된 곳으로, 엘다난의 장수명 덕분에 수백 년 전의 일도 비교적 가까운 과거로 인식된다.\n\n마술과 학문을 중시하며, 외부의 소란에 관여하지 않는 것을 미덕으로 여긴다.",
    military: "정규군 개념이 없고 '수호자(가디언)'라 불리는 전사·마술사 조직이 숲을 순찰한다. 수는 적으나 개개인이 강력하며, 숲 내부에서는 사실상 무적.\n\n다만 숲 밖으로 전력을 투사하기 어렵다는 것이 구조적 약점이다.",
    population: { total: "약 180만", data: [
      { race: "엘다난", pct: 88, color: "#1A6B4A" }, { race: "휴린", pct: 5, color: "#2A5F9E" },
      { race: "필보르", pct: 4, color: "#4A7A2E" }, { race: "버나", pct: 2, color: "#B85C2A" },
      { race: "기타", pct: 1, color: "#777" },
    ]},
    locations: [
      { name: "세계수 이르미나", desc: "숲 최심부의 거대한 고목. 엘다난의 정신적 중심.", detail: "실바나 수호림의 정확한 중심에 서 있는 거대한 나무. 높이가 수백 미터에 달하며, 나무 자체가 살아있는 역사 기록물이라는 의미를 가진다.\n\n이르미나의 뿌리는 숲 전체 지하로 뻗어 있으며, 엘다난은 이 뿌리가 숲의 결계를 유지하는 핵심이라고 믿는다. 뿌리 깊은 곳에는 장로만이 출입 가능한 금역이 있다.\n\n이르미나 주변에 장로 회의장과 주요 거주지가 배치되어 있으며, 숲 전체의 행정 중심이기도 하다." },
      { name: "별의 관측소 유적", desc: "숲 동쪽 고지대. 고대에 세계의 흐름을 읽었다는 시설.", detail: "실바나 동쪽 가장자리의 고지대에 위치한 고대 시설. 반구형 돔과 수정으로 된 관측 장치가 남아 있으나, 현재는 기능을 상실한 상태.\n\n고대에 이 시설을 통해 세계의 기운 흐름과 마족의 활동까지 감지했다고 전해진다. 엘다난 학자들이 복원을 시도하고 있으나 핵심 원리를 이해하지 못하고 있다." },
      { name: "외곽 교역소 '린의 문'", desc: "외부인이 접근 가능한 유일한 공식 창구.", detail: "실바나와 카르데아의 국경 지점에 위치한 교역소. 이름의 '린'은 스피아르어로 '문턱'을 뜻한다.\n\n엘다난 외교관이 상주하며, 외부 상인과의 거래, 외부인의 숲 진입 허가, 외부 정보 수집 등을 담당한다. 진입 허가를 받는 것은 매우 까다로우며, 대부분의 외부인은 이 교역소까지만 올 수 있다.\n\n교역소 주변에는 허가를 기다리는 상인과 학자들의 임시 거주지가 형성되어 작은 마을 수준의 규모가 되었다." },
    ],
  },
  {
    id: "mograheim", name: "모그라이헴 산악연합", nameEn: "Mountain Union of Mograheim",
    race: "네바프", location: "대륙 북동부 산맥", regime: "7대 씨족 연합체",
    color: "#8B6914", accent: "#F5E8C8", icon: "⛏️",
    summary: "대륙 북동부의 험준한 산맥 내부에 거대한 지하 도시들을 건설한 장인 국가. 연금술과 야금술의 종주이며, 대륙 최고 품질의 무기와 장비를 생산한다.",
    geography: "대륙 북동부의 험준한 산맥 일대. 지하 동굴망으로 연결된 도시들이 산맥 내부에 펼쳐져 있으며, 지상에서는 입구만 보이지만 지하에는 거대한 반지하 도시가 여럿 존재한다.\n\n산맥 너머 북동쪽은 마족의 땅과 직접 접경하고 있다.",
    politics: "7대 씨족의 연합체. 각 씨족이 자치를 유지하며, 전체 사안은 씨족장 회합에서 합의로 결정한다.\n\n외부 전쟁에 불관여하는 것이 수백 년의 국시였으나, 마족의 광맥 침식으로 최초로 방침 변경 논의가 이루어지고 있다.",
    culture: "고유 언어인 라프어를 사용. 장인 문화가 사회의 근간이며, 개인의 가치는 '무엇을 만들 수 있는가'로 판단된다. 연금술은 네바프가 발전시킨 최첨단 기술이며, 이 기술의 수출이 경제의 핵심이다.\n\n괴팍하고 폐쇄적이라는 평판이 있지만, 실제로는 자기 일에 집중하느라 외부에 관심이 없는 것에 가깝다.",
    military: "씨족 경비대가 각 동굴 도시를 방어한다. 장비 품질이 대륙 최고이므로 장비 면에서 압도적이다.\n\n연금술을 이용한 함정·기관 방어가 특기이며, 지하 미궁에서의 방어전은 사실상 난공불락이다.",
    population: { total: "약 320만", data: [
      { race: "네바프", pct: 82, color: "#8B6914" }, { race: "휴린", pct: 8, color: "#2A5F9E" },
      { race: "두앙", pct: 5, color: "#8B2D2D" }, { race: "필보르", pct: 3, color: "#4A7A2E" },
      { race: "기타", pct: 2, color: "#777" },
    ]},
    locations: [
      { name: "칸두르 회합장", desc: "7대 씨족장이 모이는 중앙 홀. 산맥 중앙부 지하 최대 공간.", detail: "산맥 중앙부 지하 약 200미터 깊이에 위치한 거대 자연 동굴을 가공하여 만든 홀. 천장에 자연 수정이 군집으로 박혀 있어 지상의 빛이 반사되어 내부를 밝힌다.\n\n7개의 거대한 석좌가 원형으로 배치되어 있으며, 각 석좌에 해당 씨족의 문장이 새겨져 있다.\n\n회합장 주변에는 7대 씨족의 대표 공방과 씨족 문서고가 인접해 있어, 단순한 회의실이 아니라 모그라이헴 문화의 집약점이기도 하다." },
      { name: "봉인 광맥", desc: "선조가 '절대 파지 말라'고 남긴 채굴 금지 구역.", detail: "모그라이헴 산맥 동쪽 깊은 곳에 위치한 거대한 광맥. 수백 년 전 선조들이 '절대 파지 말라'는 금기를 남겼으며, 이 금기는 관습적으로 지켜지고 있다.\n\n현 세대의 네바프 대부분은 금기의 이유를 알지 못한다. 광맥 입구에는 고대 문자로 된 경고문이 새겨져 있으나, 해독 가능한 네바프는 극소수.\n\n최근 이 광맥 주변에서 마족 활동이 감지되기 시작했다." },
      { name: "무너진 대장간 신전", desc: "고대의 장인이 전설적인 무기를 단련했다고 전해지는 장소.", detail: "봉인 광맥보다 더 깊은 곳에 있었다고 전해지는 고대의 대장간. 전설에 따르면 이곳에서 고대 문명 시대의 전설적 무기가 만들어졌다.\n\n수백 년 전 대규모 지진으로 매몰되어 현재는 접근이 불가능하다. 일부 씨족장은 이 장소의 존재 자체를 의심한다." },
    ],
  },
  {
    id: "riet", name: "리에트 자유시연합", nameEn: "Free City League of Riet",
    race: "필보르", location: "대륙 서부 하천지대", regime: "자유 도시 연맹",
    color: "#4A7A2E", accent: "#DEF0D0", icon: "🌾",
    summary: "대륙 서부의 비옥한 하천 유역에 자리잡은 느슨한 도시 연합. 필보르 특유의 쾌활하고 개방적인 기질이 반영된 가장 민주적인 국가이자, 대륙의 곡창지대.",
    geography: "대륙 서부의 대하천 유역. 비옥한 평야와 완만한 구릉이 펼쳐진 온화한 땅. 하천을 중심으로 소규모 도시가 점점이 늘어서 있다.\n\n단일 수도가 없고, 의장 도시가 2년마다 순번제로 돌아가는 독특한 체제.",
    politics: "자유 도시 연맹. 각 도시가 자치하며, 전체 사안은 도시 대표자 회의에서 결정한다. 왕도 군주도 없다.\n\n필보르 특유의 쾌활하고 개방적인 기질이 반영되어 가장 민주적이고, 동시에 가장 비효율적인 정치 체제라는 평가를 받는다.",
    culture: "농업과 목축이 경제의 기반. 축제가 많고, 음식 문화가 발달하며, 여행자를 환대하는 풍토가 있다. '작은 사람들의 큰 마음'이라는 속담은 다른 국가에서도 널리 알려져 있다.\n\n종족 간 차별이 가장 적은 사회로 여겨진다.",
    military: "군사력이 거의 없다. 각 도시에 소규모 경비대가 있을 뿐.\n\n방위는 카르데아 왕국과의 방위 조약에 의존하고 있으며, 그 대가로 리에트는 카르데아에 식량을 공급한다.",
    population: { total: "약 250만", data: [
      { race: "필보르", pct: 55, color: "#4A7A2E" }, { race: "휴린", pct: 30, color: "#2A5F9E" },
      { race: "버나", pct: 8, color: "#B85C2A" }, { race: "엘다난", pct: 4, color: "#1A6B4A" },
      { race: "기타", pct: 3, color: "#777" },
    ]},
    locations: [
      { name: "하류 도시 미에르", desc: "현재 의장 도시. 하천과 바다가 만나는 하구.", detail: "리에트 연합의 현재 의장 도시. 인구 약 4만. 베르나 다음으로 무역이 활발하며, 특히 리에트산 곡물과 가공식품의 수출 거점.\n\n2년간 의장 도시 역할을 수행한 뒤 다음 도시로 넘긴다. 필보르와 휴린이 거의 동등한 비율로 거주하며, 종족 간 구분이 가장 적은 도시로 유명하다." },
      { name: "곡창 도시 파넬", desc: "대륙 최대 곡물 생산지.", detail: "리에트 내륙에 위치한 대규모 농업 도시. 끝없이 펼쳐진 밀밭과 과수원이 도시를 둘러싸고 있다.\n\n6개국 식량의 상당 부분이 이곳에서 생산되며, '파넬이 굶으면 대륙이 굶는다'는 말이 있을 정도. 리에트에서 유일하게 상비 경비대(약 500명)를 보유.\n\n가을 수확축제 '파넬의 나눔'은 대륙에서 가장 큰 축제 중 하나로, 6개국에서 사절이 참석한다." },
      { name: "풍차의 언덕", desc: "리에트의 상징이자 관광지.", detail: "미에르와 파넬 사이에 위치한 완만한 구릉. 수십 기의 풍차가 바람에 돌아가는 풍경은 리에트의 상징이자 대륙에서 가장 평화로운 광경 중 하나.\n\n풍차는 실제로 곡물 제분에 사용되며, 각 풍차마다 필보르 가족이 대대로 관리한다.\n\n언덕 아래에 고대 유적이 묻혀 있다는 소문이 간간이 돌지만, 진지하게 받아들이는 사람은 거의 없다." },
    ],
  },
  {
    id: "karansa", name: "카란사 부족연합", nameEn: "Tribal Union of Karansa",
    race: "버나", location: "대륙 남동부 초원 · 절벽지대", regime: "12부족 회의",
    color: "#B85C2A", accent: "#F8E2D0", icon: "🐺",
    summary: "대륙 남동부의 광활한 초원과 해안 절벽에 걸쳐 사는 수렵 부족연합. 구전으로 역사를 이어가며, 고대의 전설을 살아있는 신앙으로 간직한 유일한 국가.",
    geography: "대륙 남동부의 광활한 초원과 해안 절벽 지대. 동쪽 끝에는 수백 년째 폭풍이 멈추지 않는 기이한 절벽이 있다.\n\n정해진 수도가 없으며, 12부족이 계절에 따라 이동. 고정 건축물은 회의소 하나뿐이다.",
    politics: "12부족 회의. 토족(토끼) 4부족, 묘족(고양이) 4부족, 랑족(늑대) 4부족으로 구성. 대족장은 3년마다 선출.\n\n현 대족장은 랑족 출신의 여전사로, 마족에 대한 적극 대응을 주장하는 강경파이다.",
    culture: "구전 문화. 모든 역사와 지식은 '이야기꾼(르발)'을 통해 전승된다. 고대의 전설을 '언젠가 돌아올 것'으로 믿는 유일한 국가.\n\n외지인을 쉽게 받지 않지만, 일단 인정하면 가족처럼 대한다. 버나는 수명이 60세로 짧아, 삶을 짧고 뜨겁게 사는 기질이 있다.",
    military: "정규군 없이 모든 성인이 전사. 초원에서의 기동력은 대륙 최강. 특히 랑족은 전투에 특화.\n\n장비 품질은 네바프에 비해 열세이며, 이것이 모그라이헴과의 교역 동기가 된다.",
    population: { total: "약 200만", data: [
      { race: "버나", pct: 90, color: "#B85C2A" }, { race: "휴린", pct: 5, color: "#2A5F9E" },
      { race: "두앙", pct: 3, color: "#8B2D2D" }, { race: "기타", pct: 2, color: "#777" },
    ]},
    locations: [
      { name: "12부족 회의소 오르다", desc: "초원 중앙의 거대한 원형 야외 회의장.", detail: "카란사 초원의 정중앙에 위치한 거대한 원형 야외 회의장. 유일한 영구 건축물.\n\n12개의 석좌가 원형으로 배치되어 있으며, 중앙에는 성화(聖火)가 꺼지지 않고 타오른다. 회의가 소집되면 수천 명의 버나가 초원 각지에서 모여든다.\n\n회의 기간에는 전통 경기, 사냥 시합, 이야기꾼(르발)의 구연이 함께 열린다." },
      { name: "폭풍의 절벽", desc: "수백 년째 폭풍이 멈추지 않는 기이한 장소.", detail: "카란사 영토 동쪽 해안 끝에 위치한 수직 절벽. 높이 약 300미터. 수백 년째 폭풍이 멈추지 않는 이상 기상이 계속되고 있다.\n\n부족은 이곳을 성지로 여기며 접근하지 않는다. 르발의 구전에 따르면 '바람이 약속을 지키는 곳'이라 한다.\n\n폭풍의 중심부에 고대의 탑이 서 있다는 이야기가 있으나, 폭풍을 뚫고 확인한 자는 없다." },
      { name: "최초 족장의 묘", desc: "구전에만 등장하는 전설적 장소.", detail: "르발의 이야기 속에서만 등장하는 전설적 장소. 버나 최초의 족장이 잠들어 있다고 전해지며, '초원의 심장이 뛰는 곳'에 있다고 한다.\n\n실존 여부조차 확인되지 않았으나, 일부 르발은 꿈에서 그 위치를 보았다고 주장한다." },
    ],
  },
  {
    id: "valhart", name: "발하르트 방벽령", nameEn: "Bulwark Territory of Valhart",
    race: "두앙", location: "대륙 동부 경계지대", regime: "전쟁사령부 체제",
    color: "#8B2D2D", accent: "#F5D5D5", icon: "🛡️",
    summary: "문명의 끝이자 마족의 땅과 직접 맞닿는 최전선. 대륙에서 유일하게 마족과 일상적으로 전투하는 국가.",
    geography: "대륙 동부의 험준한 고산과 황야. 사막, 화산 지대, 동결 고원 등 척박한 환경이 섞여 있으며, 문명의 끝이자 마족의 땅과 직접 맞닿는 최전선이다.\n\n'방벽선(라인)'이라 불리는 요새 체인이 사실상의 국경선 역할을 한다.",
    politics: "전쟁사령부 체제. 평시에도 군사 지휘 체계가 통치 구조를 겸한다. 최고 지도자는 방벽장(벨크)으로, 3부족이 합의하여 선출.\n\n'나라'라기보다는 '전선을 유지하는 조직'에 가까운 사회.",
    culture: "싸움을 존중하되 무분별한 폭력은 경멸하는 전사의 명예 문화. '강하다'는 것은 많이 죽이는 것이 아니라 지켜내는 것이라는 가치관.\n\n3부족 — 유각족(뿔), 아조족(송곳니·발톱), 천익족(날개) — 이 각각의 특성을 살린 역할 분담이 이루어져 있다.\n\n최근 후방 도시에서 부족·종족을 초월한 복합 사회가 형성되기 시작했다.",
    military: "대륙 최강. 모든 성인이 전투 훈련을 받으며, 두앙의 태생적 신체 능력(뿔·날개·발톱)이 그대로 전력.\n\n천익족의 공중 정찰은 마족 동향 파악의 핵심 수단이다.",
    population: { total: "약 150만", data: [
      { race: "두앙", pct: 70, color: "#8B2D2D" }, { race: "휴린", pct: 12, color: "#2A5F9E" },
      { race: "네바프", pct: 8, color: "#8B6914" }, { race: "버나", pct: 6, color: "#B85C2A" },
      { race: "기타", pct: 4, color: "#777" },
    ]},
    locations: [
      { name: "중앙 요새 아르크발트", desc: "방벽선 중앙의 최대 요새. 방벽장이 주재.", detail: "발하르트 방벽선의 중앙에 위치한 최대 요새이자 사실상의 수도. 수천 명의 전사가 상주하며, 방벽장(벨크)이 전선 전체를 총지휘한다.\n\n요새 자체가 하나의 도시 규모이며, 무기고, 훈련장, 의무실, 병영, 소규모 민간인 거주 구역까지 갖추고 있다.\n\n최고층에는 천익족 정찰대의 발착장이 있으며, 방벽선 전체의 상황을 조망할 수 있다." },
      { name: "동결 고원 '끝의 들판'", desc: "방벽선 너머, 마족의 땅과 직접 맞닿는 곳.", detail: "아르크발트 너머로 펼쳐진 얼어붙은 황무지. 문명 세계의 물리적 끝이다.\n\n두앙 전사에게 이곳에서의 전투 경험은 성인 의례와 같다. '끝의 들판에서 살아 돌아온 자'만이 진정한 전사로 인정받는다.\n\n고원 곳곳에 과거 전투의 흔적 — 부서진 무기, 마족의 잔해, 이름 모를 전사들의 묘표 — 이 남아 있다." },
      { name: "화산 대장간 '볼칸'", desc: "화산 열을 이용한 대규모 야금 시설.", detail: "발하르트 남쪽 활화산 기슭의 대규모 야금 시설. 화산의 지열을 직접 이용하여 금속을 가공하며, 모그라이헴의 네바프 기술자와 두앙 장인이 공동 운영한다.\n\n'볼칸제(製)' 표시가 찍힌 무기는 대륙 최고 품질로 인정받는다. 두 종족 협력의 상징이며, 모그라이헴-발하르트 동맹의 물리적 증거.\n\n최근 화산 활동이 불안정해졌다는 보고가 있다." },
    ],
  },
];

// --- 컴포넌트 Props 타입 정의 ---
interface ContinentMapProps {
  activeId: string;
  onSelect: (id: string) => void;
}

function ContinentMap({ activeId, onSelect }: ContinentMapProps) {
  const nc: Record<string, string> = { cardea:"#2A5F9E", silvana:"#1A6B4A", mograheim:"#8B6914", riet:"#4A7A2E", karansa:"#B85C2A", valhart:"#8B2D2D" };
  const pois = [
    {x:255,y:268,l:"베르나",s:1},{x:300,y:175,l:"루미엘",s:1},{x:290,y:235,l:"아에르데",s:0},
    {x:148,y:118,l:"이르미나",s:0},{x:170,y:142,l:"린의 문",s:0},{x:135,y:95,l:"관측소",s:0},
    {x:420,y:110,l:"칸두르",s:0},{x:455,y:130,l:"봉인 광맥",s:0},
    {x:100,y:250,l:"미에르",s:0},{x:130,y:195,l:"파넬",s:0},{x:112,y:215,l:"풍차 언덕",s:0},
    {x:440,y:325,l:"오르다",s:0},{x:490,y:310,l:"폭풍의 절벽",s:0},
    {x:510,y:160,l:"아르크발트",s:0},{x:540,y:215,l:"볼칸",s:0},{x:530,y:185,l:"끝의 들판",s:0},
    {x:300,y:195,l:"합의전",s:0},
  ];
  const R = (id: string, d: string, f: string, s: string, sw: number) => (
    <path 
      key={id} 
      d={d} 
      fill={activeId === id ? f.replace(")", ",0.22)").replace("rgb", "rgba") : f} 
      stroke={s} 
      strokeWidth={sw} 
      style={{ cursor: "pointer" }} 
      onClick={() => onSelect(id)} 
    />
  );
  
  return (
    <svg viewBox="0 0 620 400" style={{width:"100%",height:"auto",display:"block"}}>
      <rect width="620" height="400" fill="#D4DDE8" opacity="0.3" rx="8"/>
      <path d="M80 60Q120 35 200 45L290 40Q390 45 460 75L530 125Q555 200 525 285L445 340Q360 355 270 330L165 320Q85 285 65 220L55 140Z" fill="#E8E3D8" stroke="#C4BFB2" strokeWidth="0.8"/>
      {R("silvana","M85 75Q135 55 195 65L225 100Q215 145 175 165L125 155Q85 135 80 100Z","rgba(26,107,74,0.12)","#639922",0.6)}
      {R("mograheim","M345 50L430 60Q475 80 475 125L455 155Q405 150 365 135L335 95Z","rgba(139,105,20,0.12)","#BA7517",0.6)}
      {R("cardea","M220 170Q280 145 365 165L405 205Q395 260 345 275L275 268Q218 250 212 205Z","rgba(42,95,158,0.12)","#378ADD",0.6)}
      {R("riet","M70 175Q100 165 160 175L175 225Q145 265 100 260L68 230Z","rgba(74,122,46,0.12)","#639922",0.6)}
      {R("karansa","M385 280Q455 265 510 285L520 335Q480 355 420 345L385 320Z","rgba(184,92,42,0.12)","#D85A30",0.6)}
      {R("valhart","M475 120Q530 110 550 150L545 230Q530 260 500 265L475 240Q465 180 470 140Z","rgba(139,45,45,0.12)","#E24B4A",0.6)}
      <text x="575" y="135" fontSize="8" fill="#A32D2D" fontWeight="500" textAnchor="middle" opacity="0.5">마족의 땅</text>
      <text x="575" y="145" fontSize="7" fill="#A32D2D" textAnchor="middle" opacity="0.35">→</text>
      {pois.map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r={p.s?3:1.8} fill={p.s?"#A32D2D":"#888"} stroke="#fff" strokeWidth={p.s?1.2:0.8}/><text x={p.x} y={p.y-(p.s?6:4.5)} fontSize={p.s?9:7} fill={p.s?"#501313":"#666"} fontWeight={p.s?600:400} textAnchor="middle" fontFamily="sans-serif">{p.l}</text></g>)}
      {[{id:"cardea",x:300,y:210,l:"카르데아 왕국",l2:""},{id:"silvana",x:140,y:100,l:"실바나",l2:"수호림"},{id:"mograheim",x:420,y:95,l:"모그라이헴",l2:"산악연합"},{id:"riet",x:110,y:220,l:"리에트",l2:"자유시연합"},{id:"karansa",x:430,y:300,l:"카란사",l2:"부족연합"},{id:"valhart",x:510,y:180,l:"발하르트",l2:"방벽령"}].map(n=><g key={n.id} style={{cursor:"pointer"}} onClick={()=>onSelect(n.id)}><text x={n.x} y={n.y} fontSize="11" fill={nc[n.id]} fontWeight={activeId===n.id?700:500} textAnchor="middle" fontFamily="sans-serif" opacity={activeId===n.id?1:0.7}>{n.l}</text>{n.l2&&<text x={n.x} y={n.y+13} fontSize="9" fill={nc[n.id]} textAnchor="middle" fontFamily="sans-serif" opacity="0.5">{n.l2}</text>}</g>)}
      <g transform="translate(582,28)"><circle r="11" fill="#fff" stroke="#888" strokeWidth="0.4"/><text y="1" textAnchor="middle" fontSize="8" fontWeight="600" fill="#444" fontFamily="sans-serif">N</text></g>
    </svg>
  );
}

interface PopChartProps {
  data: RaceData[];
  total: string;
}

function PopChart({data, total}: PopChartProps) {
  return (
    <div>
      <div style={{fontSize:"13px",fontWeight:600,marginBottom:12,color:"#2a2a2a"}}>총 인구: {total}</div>
      {data.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <div style={{width:55,fontSize:"12px",color:"#555",textAlign:"right",flexShrink:0}}>{d.race}</div>
        <div style={{flex:1,height:18,background:"#F1EFE8",borderRadius:4,overflow:"hidden"}}><div style={{width:`${d.pct}%`,height:"100%",background:d.color,borderRadius:4}}/></div>
        <div style={{width:36,fontSize:"12px",fontWeight:600,color:d.color,textAlign:"right",flexShrink:0}}>{d.pct}%</div>
      </div>)}
    </div>
  );
}

interface LocModalProps {
  loc: Location | null;
  color: string;
  onClose: () => void;
}

function LocModal({loc, color, onClose}: LocModalProps) {
  if(!loc) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#FDFBF7",borderRadius:12,maxWidth:560,width:"100%",maxHeight:"80vh",overflow:"auto",cursor:"default",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
        <div style={{padding:"24px 28px 16px",borderBottom:`3px solid ${color}20`}}>
          <div style={{fontSize:"10px",fontWeight:600,letterSpacing:"0.15em",color,opacity:0.6,marginBottom:4}}>LOCATION DETAIL</div>
          <h2 style={{fontFamily:"'Noto Serif KR',serif",fontSize:"20px",fontWeight:700,color:"#2a2a2a",margin:0}}>{loc.name}</h2>
          <p style={{fontSize:"13px",color:"#777",marginTop:4,fontStyle:"italic"}}>{loc.desc}</p>
        </div>
        <div style={{padding:"20px 28px 28px",fontSize:"14px",lineHeight:1.85,color:"#3a3a3a"}}>{loc.detail.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:12}}>{p}</p>)}</div>
        <div style={{padding:"0 28px 20px",textAlign:"right"}}><button onClick={onClose} style={{background:"none",border:"1px solid #ddd",borderRadius:6,padding:"6px 18px",fontSize:"12px",color:"#777",cursor:"pointer"}}>닫기</button></div>
      </div>
    </div>
  );
}

export default function NationsWiki() {
  const [activeId, setActiveId] = useState("cardea");
  const [showNav, setShowNav] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selLoc, setSelLoc] = useState<Location | null>(null);
  const ref = useRef<HTMLElement>(null);
  const [mob, setMob] = useState(false);
  
  // 데이터 찾기 (undefined 방지 위해 ! 사용하거나 기본값 처리)
  const n = nations.find(x => x.id === activeId) || nations[0];

  useEffect(() => {
    const c = () => setMob(window.innerWidth <= 768);
    c();
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
    setShowNav(false);
  }, [activeId]);

  const Sec = ({title, children}: {title: string; children: ReactNode}) => (
    <div style={{marginBottom:"2.5rem"}}>
      <h3 style={{fontFamily:"'Noto Serif KR',Georgia,serif",fontSize:"15px",fontWeight:600,letterSpacing:"0.12em",borderBottom:`2px solid ${n.color}`,paddingBottom:6,marginBottom:14,color:n.color}}>
        {title}
      </h3>
      {children}
    </div>
  );

  const Prose = ({text}: {text: string}) => (
    <div style={{fontSize:"14px",lineHeight:1.85,color:"#3a3a3a"}}>
      {text.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:12}}>{p}</p>)}
    </div>
  );

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"'Noto Sans KR',sans-serif",background:"#F7F4EE",color:"#2a2a2a"}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;600;700&display=swap" rel="stylesheet"/>

      {mob && <button onClick={()=>setShowNav(!showNav)} style={{position:"fixed",top:12,left:12,zIndex:1000,background:n.color,color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontSize:"13px",fontWeight:500,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>{showNav?"✕":"☰"}</button>}

      <nav style={{width:260,minWidth:260,background:"#2C2824",color:"#D4CFC7",display:"flex",flexDirection:"column",overflow:"hidden",...(mob?{position:"fixed",top:0,left:showNav?0:-280,height:"100vh",zIndex:999,transition:"left 0.3s ease",boxShadow:showNav?"4px 0 20px rgba(0,0,0,0.3)":"none"}:{})}}>
        <div style={{padding:"28px 22px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{fontFamily:"'Noto Serif KR',serif",fontSize:"11px",letterSpacing:"0.2em",color:"#8a8278",marginBottom:6}}>ENCYCLOPEDIA</div>
          <div style={{fontFamily:"'Noto Serif KR',serif",fontSize:"18px",fontWeight:700,color:"#E8E2D8",letterSpacing:"0.05em"}}>아스테르 대륙</div>
          <div style={{fontSize:"11px",color:"#8a8278",marginTop:4,letterSpacing:"0.08em"}}>NATIONS OF ASTER</div>
        </div>
        <div style={{padding:"12px 0",flex:1,overflowY:"auto"}}>
          <button onClick={()=>{setShowMap(true);if(mob)setShowNav(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 22px",border:"none",cursor:"pointer",textAlign:"left",fontSize:"13px",fontWeight:500,background:"rgba(255,255,255,0.04)",color:"#C4BFB2",borderLeft:"3px solid transparent",fontFamily:"'Noto Sans KR',sans-serif",marginBottom:4}}>
            <span style={{fontSize:"14px",width:24,textAlign:"center"}}>🗺️</span><span>대륙 전체 지도</span>
          </button>
          <div style={{fontSize:"10px",fontWeight:500,letterSpacing:"0.15em",color:"#6b6560",padding:"8px 22px 8px"}}>6개국</div>
          {nations.map(x=><button key={x.id} onClick={()=>setActiveId(x.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 22px",border:"none",cursor:"pointer",textAlign:"left",fontSize:"13px",fontWeight:activeId===x.id?500:400,background:activeId===x.id?"rgba(255,255,255,0.08)":"transparent",color:activeId===x.id?"#E8E2D8":"#A09888",borderLeft:activeId===x.id?`3px solid ${x.color}`:"3px solid transparent",transition:"all 0.15s ease",fontFamily:"'Noto Sans KR',sans-serif"}}>
            <span style={{fontSize:"16px",width:24,textAlign:"center"}}>{x.icon}</span><span>{x.name}</span>
          </button>)}
          <div style={{fontSize:"10px",fontWeight:500,letterSpacing:"0.15em",color:"#6b6560",padding:"16px 22px 8px"}}>대륙 공통</div>
          <div style={{padding:"6px 22px",fontSize:"12px",color:"#8a8278",lineHeight:1.8}}>
            <div style={{marginBottom:10}}><span style={{color:"#B0A898",fontWeight:500}}>공용어</span><br/>아스테르 공용어 (통상어)<br/><span style={{fontSize:"11px",color:"#6b6560"}}>6개국 간 교역·외교에 사용되는 공통 언어. 대부분의 도시에서 통용된다. 각국은 고유 언어(스피아르어, 라프어 등)를 병용한다.</span></div>
            <div><span style={{color:"#B0A898",fontWeight:500}}>대륙 회의</span><br/>아스테르 합의전<br/><span style={{fontSize:"11px",color:"#6b6560"}}>카르데아 왕도 루미엘에서 연 1회 개최. 6개국 대표가 참석하는 유일한 정기 회합. 마족 위협 대응, 교역 분쟁 조정, 공동 방위 논의가 주 안건. 의결에는 6국 만장일치가 필요하여 실질적 결정은 쉽지 않다.</span></div>
          </div>
        </div>
        <div style={{padding:"16px 22px",borderTop:"1px solid rgba(255,255,255,0.06)",fontSize:"10px",color:"#6b6560",lineHeight:1.6}}>異床同夢 · 이상동몽<br/>아리안로드 2E 캠페인</div>
      </nav>

      <main ref={ref} style={{flex:1,overflowY:"auto"}}>
        <div style={{background:`linear-gradient(135deg, ${n.color}18 0%, ${n.accent}60 100%)`,borderBottom:`3px solid ${n.color}30`,padding:mob?"60px 20px 28px":"48px 48px 40px"}}>
          <div style={{maxWidth:720}}>
            <div style={{fontSize:"11px",fontWeight:500,letterSpacing:"0.2em",color:n.color,marginBottom:8,opacity:0.7}}>{n.nameEn.toUpperCase()}</div>
            <h1 style={{fontFamily:"'Noto Serif KR',serif",fontSize:mob?"26px":"32px",fontWeight:700,color:"#2a2a2a",marginBottom:8,letterSpacing:"0.02em"}}>{n.name}</h1>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
              {[{l:n.race,bg:n.accent,c:n.color},{l:n.location,bg:"#F1EFE8",c:"#5a5a5a"},{l:n.regime,bg:"#F1EFE8",c:"#5a5a5a"}].map((t,i)=><span key={i} style={{fontSize:"12px",padding:"3px 10px",borderRadius:4,background:t.bg,color:t.c,fontWeight:500}}>{t.l}</span>)}
            </div>
            <p style={{fontFamily:"'Noto Serif KR',serif",fontSize:"15px",lineHeight:1.8,color:"#4a4a4a",fontStyle:"italic"}}>{n.summary}</p>
          </div>
        </div>
        <div style={{maxWidth:720,padding:mob?"20px 20px 0":"28px 48px 0"}}>
          <div style={{background:"#fff",border:"1px solid #E8E3DA",borderRadius:10,padding:12,marginBottom:8}}><ContinentMap activeId={activeId} onSelect={setActiveId}/></div>
          <div style={{fontSize:"11px",color:"#999",textAlign:"center",marginBottom:24}}>지도의 국가 이름을 클릭하면 해당 페이지로 이동합니다</div>
        </div>
        <div style={{maxWidth:720,padding:mob?"12px 20px 60px":"12px 48px 80px"}}>
          <Sec title="지리와 영토"><Prose text={n.geography}/></Sec>
          <Sec title="정치 체제"><Prose text={n.politics}/></Sec>
          <Sec title="문화와 사회"><Prose text={n.culture}/></Sec>
          <Sec title="군사"><Prose text={n.military}/></Sec>
          <Sec title="인구 구성"><PopChart data={n.population.data} total={n.population.total}/></Sec>
          <Sec title="주요 지명">
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {n.locations.map((loc,i)=><div key={i} onClick={()=>setSelLoc(loc)} style={{padding:"14px 18px",background:"#fff",border:"1px solid #E8E3DA",borderRadius:8,borderLeft:`4px solid ${n.color}40`,cursor:"pointer",transition:"box-shadow 0.15s ease"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.08)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontFamily:"'Noto Serif KR',serif",fontSize:"14px",fontWeight:600,color:n.color}}>{loc.name}</div>
                  <div style={{fontSize:"11px",color:"#aaa",flexShrink:0,marginLeft:12}}>상세 보기 →</div>
                </div>
                <div style={{fontSize:"13px",lineHeight:1.7,color:"#555",marginTop:4}}>{loc.desc}</div>
              </div>)}
            </div>
          </Sec>
        </div>
      </main>

      <LocModal loc={selLoc} color={n.color} onClose={()=>setSelLoc(null)}/>
      {showMap && <div onClick={()=>setShowMap(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#FDFBF7",borderRadius:12,maxWidth:700,width:"100%",cursor:"default",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
          <div style={{padding:"20px 24px 12px",borderBottom:"1px solid #E8E3DA",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontFamily:"'Noto Serif KR',serif",fontSize:"18px",fontWeight:700}}>아스테르 대륙 전체 지도</div><div style={{fontSize:"11px",color:"#999",marginTop:2}}>국가를 클릭하면 해당 페이지로 이동합니다</div></div>
            <button onClick={()=>setShowMap(false)} style={{background:"none",border:"1px solid #ddd",borderRadius:6,padding:"4px 12px",fontSize:"12px",color:"#777",cursor:"pointer"}}>✕</button>
          </div>
          <div style={{padding:"16px 24px 24px"}}><ContinentMap activeId={activeId} onSelect={id=>{setActiveId(id);setShowMap(false);}}/></div>
        </div>
      </div>}
    </div>
  );
}
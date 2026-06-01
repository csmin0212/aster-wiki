'use client';

import { useState, useEffect, useRef, ReactNode } from "react";
import { nations, Nation, Location } from "./data/nations";
import { npcGroups, NpcGroup, Npc } from "./data/npcs";
import GoddessView from "./components/GoddessView";
import SilverRoadView from "./components/SilverRoadView";
import ElinView from "./components/ElinView";
import WarehouseView from "./components/WarehouseView";
import CloverView from "./components/CloverView";

// ─── 대륙 지도 ───────────────────────────────────────────────

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
    <path key={id} d={d} fill={activeId === id ? f.replace(")", ",0.22)").replace("rgb", "rgba") : f} stroke={s} strokeWidth={sw} style={{ cursor: "pointer" }} onClick={() => onSelect(id)} />
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

// ─── 인구 차트 ───────────────────────────────────────────────

interface PopChartProps {
  data: { race: string; pct: number; color: string }[];
  total: string;
}

function PopChart({ data, total }: PopChartProps) {
  return (
    <div>
      <div style={{fontSize:"13px",fontWeight:600,marginBottom:12,color:"#2a2a2a"}}>총 인구: {total}</div>
      {data.map((d,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <div style={{width:55,fontSize:"12px",color:"#555",textAlign:"right",flexShrink:0}}>{d.race}</div>
          <div style={{flex:1,height:18,background:"#F1EFE8",borderRadius:4,overflow:"hidden"}}>
            <div style={{width:`${d.pct}%`,height:"100%",background:d.color,borderRadius:4}}/>
          </div>
          <div style={{width:36,fontSize:"12px",fontWeight:600,color:d.color,textAlign:"right",flexShrink:0}}>{d.pct}%</div>
        </div>
      ))}
    </div>
  );
}

// ─── 지명 상세 모달 ──────────────────────────────────────────

interface LocModalProps {
  loc: Location | null;
  color: string;
  onClose: () => void;
}

function LocModal({ loc, color, onClose }: LocModalProps) {
  if (!loc) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#FDFBF7",borderRadius:12,maxWidth:560,width:"100%",maxHeight:"80vh",overflow:"auto",cursor:"default",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
        <div style={{padding:"24px 28px 16px",borderBottom:`3px solid ${color}20`}}>
          <div style={{fontSize:"10px",fontWeight:600,letterSpacing:"0.15em",color,opacity:0.6,marginBottom:4}}>LOCATION DETAIL</div>
          <h2 style={{fontFamily:"'Noto Serif KR',serif",fontSize:"20px",fontWeight:700,color:"#2a2a2a",margin:0}}>{loc.name}</h2>
          <p style={{fontSize:"13px",color:"#777",marginTop:4,fontStyle:"italic"}}>{loc.desc}</p>
        </div>
        <div style={{padding:"20px 28px 28px",fontSize:"14px",lineHeight:1.85,color:"#3a3a3a"}}>
          {loc.detail.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:12}}>{p}</p>)}
        </div>
        <div style={{padding:"0 28px 20px",textAlign:"right"}}>
          <button onClick={onClose} style={{background:"none",border:"1px solid #ddd",borderRadius:6,padding:"6px 18px",fontSize:"12px",color:"#777",cursor:"pointer"}}>닫기</button>
        </div>
      </div>
    </div>
  );
}

// ─── NPC 카드 ────────────────────────────────────────────────

function NpcAvatar({ npc, color }: { npc: Npc; color: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",background:"#fff",border:"1px solid #E8E3DA",borderRadius:8,borderLeft:`3px solid ${color}40`}}>
      <div style={{width:44,height:44,borderRadius:6,overflow:"hidden",background:"#F1EFE8",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {npc.image && !imgError
          ? <img src={npc.image} alt={npc.name} onError={()=>setImgError(true)} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <span style={{fontSize:"18px",color:"#bbb"}}>👤</span>
        }
      </div>
      <div>
        {npc.title && <div style={{fontSize:"11px",color,fontWeight:600,marginBottom:2}}>[{npc.title}]</div>}
        <div style={{fontSize:"14px",fontWeight:600,color:"#2a2a2a"}}>{npc.name}</div>
      </div>
    </div>
  );
}

// ─── 인물 뷰 ────────────────────────────────────────────────

function NpcsView({ mob }: { mob: boolean }) {
  const nationOrder = ["cardea","silvana","mograheim","riet","karansa","valhart"];

  return (
    <div style={{maxWidth:720,padding:mob?"20px 20px 60px":"28px 48px 80px"}}>
      <div style={{marginBottom:32}}>
        <div style={{fontSize:"11px",fontWeight:500,letterSpacing:"0.2em",color:"#8a8278",marginBottom:6}}>ENCYCLOPEDIA</div>
        <h1 style={{fontFamily:"'Noto Serif KR',serif",fontSize:mob?"22px":"28px",fontWeight:700,color:"#2a2a2a",marginBottom:4}}>인물 사전</h1>
        <p style={{fontSize:"13px",color:"#888",lineHeight:1.7}}>세션에서 만난 NPC와 주요 인물들.</p>
      </div>

      {nationOrder.map(nationId => {
        const nation = nations.find(n => n.id === nationId);
        const groups = npcGroups.filter(g => g.nationId === nationId);
        if (!nation || groups.length === 0) return null;

        return (
          <div key={nationId} style={{marginBottom:40}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,paddingBottom:10,borderBottom:`2px solid ${nation.color}30`}}>
              <span style={{fontSize:"20px"}}>{nation.icon}</span>
              <div>
                <div style={{fontFamily:"'Noto Serif KR',serif",fontSize:"17px",fontWeight:700,color:nation.color}}>{nation.name}</div>
                <div style={{fontSize:"11px",color:"#aaa",letterSpacing:"0.1em"}}>{nation.nameEn.toUpperCase()}</div>
              </div>
            </div>

            {groups.map(group => (
              <div key={group.id} style={{marginBottom:20}}>
                <div style={{fontSize:"12px",fontWeight:600,color:"#666",letterSpacing:"0.08em",marginBottom:8,padding:"4px 0",borderBottom:"1px solid #EDE8E0"}}>
                  {group.name}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {group.npcs.map(npc => (
                    <NpcAvatar key={npc.id} npc={npc} color={nation.color}/>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── 국가 상세 뷰 ────────────────────────────────────────────

interface NationViewProps {
  n: Nation;
  mob: boolean;
  activeId: string;
  onSelect: (id: string) => void;
  onLocClick: (loc: Location) => void;
}

function NationView({ n, mob, activeId, onSelect, onLocClick }: NationViewProps) {
  const Sec = ({ title, children }: { title: string; children: ReactNode }) => (
    <div style={{marginBottom:"2.5rem"}}>
      <h3 style={{fontFamily:"'Noto Serif KR',Georgia,serif",fontSize:"15px",fontWeight:600,letterSpacing:"0.12em",borderBottom:`2px solid ${n.color}`,paddingBottom:6,marginBottom:14,color:n.color}}>
        {title}
      </h3>
      {children}
    </div>
  );

  const Prose = ({ text }: { text: string }) => (
    <div style={{fontSize:"14px",lineHeight:1.85,color:"#3a3a3a"}}>
      {text.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:12}}>{p}</p>)}
    </div>
  );

  return (
    <>
      <div style={{background:`linear-gradient(135deg, ${n.color}18 0%, ${n.accent}60 100%)`,borderBottom:`3px solid ${n.color}30`,padding:mob?"60px 20px 28px":"48px 48px 40px"}}>
        <div style={{maxWidth:720}}>
          <div style={{fontSize:"11px",fontWeight:500,letterSpacing:"0.2em",color:n.color,marginBottom:8,opacity:0.7}}>{n.nameEn.toUpperCase()}</div>
          <h1 style={{fontFamily:"'Noto Serif KR',serif",fontSize:mob?"26px":"32px",fontWeight:700,color:"#2a2a2a",marginBottom:8,letterSpacing:"0.02em"}}>{n.name}</h1>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
            {[{l:n.race,bg:n.accent,c:n.color},{l:n.location,bg:"#F1EFE8",c:"#5a5a5a"},{l:n.regime,bg:"#F1EFE8",c:"#5a5a5a"}].map((t,i)=>(
              <span key={i} style={{fontSize:"12px",padding:"3px 10px",borderRadius:4,background:t.bg,color:t.c,fontWeight:500}}>{t.l}</span>
            ))}
          </div>
          <p style={{fontFamily:"'Noto Serif KR',serif",fontSize:"15px",lineHeight:1.8,color:"#4a4a4a",fontStyle:"italic"}}>{n.summary}</p>
        </div>
      </div>

      <div style={{maxWidth:720,padding:mob?"20px 20px 0":"28px 48px 0"}}>
        <div style={{background:"#fff",border:"1px solid #E8E3DA",borderRadius:10,padding:12,marginBottom:8}}>
          <ContinentMap activeId={activeId} onSelect={onSelect}/>
        </div>
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
            {n.locations.map((loc,i)=>(
              <div key={i} onClick={()=>onLocClick(loc)}
                style={{padding:"14px 18px",background:"#fff",border:"1px solid #E8E3DA",borderRadius:8,borderLeft:`4px solid ${n.color}40`,cursor:"pointer",transition:"box-shadow 0.15s ease"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.08)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
              >
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontFamily:"'Noto Serif KR',serif",fontSize:"14px",fontWeight:600,color:n.color}}>{loc.name}</div>
                  <div style={{fontSize:"11px",color:"#aaa",flexShrink:0,marginLeft:12}}>상세 보기 →</div>
                </div>
                <div style={{fontSize:"13px",lineHeight:1.7,color:"#555",marginTop:4}}>{loc.desc}</div>
              </div>
            ))}
          </div>
        </Sec>
      </div>
    </>
  );
}

// ─── 루트 컴포넌트 ───────────────────────────────────────────

type ActiveView =
  | { type: "nation"; nationId: string }
  | { type: "npcs" }
  | { type: "goddess" }
  | { type: "silver-road" }
  | { type: "elin" }
  | { type: "warehouse" }
  | { type: "clover" };

export default function NationsWiki() {
  const [activeView, setActiveView] = useState<ActiveView>({ type: "nation", nationId: "cardea" });
  const [showNav, setShowNav] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selLoc, setSelLoc] = useState<Location | null>(null);
  const ref = useRef<HTMLElement>(null);
  const [mob, setMob] = useState(false);

  const activeNationId = activeView.type === "nation" ? activeView.nationId : "cardea";
  const n = nations.find(x => x.id === activeNationId) || nations[0];

  useEffect(() => {
    const c = () => setMob(window.innerWidth <= 768);
    c();
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
    setShowNav(false);
  }, [activeView]);

  const selectNation = (id: string) => {
    setActiveView({ type: "nation", nationId: id });
    setShowMap(false);
  };

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"'Noto Sans KR',sans-serif",background:"#F7F4EE",color:"#2a2a2a"}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;600;700&display=swap" rel="stylesheet"/>

      {mob && (
        <button onClick={()=>setShowNav(!showNav)} style={{position:"fixed",top:12,left:12,zIndex:1000,background:n.color,color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontSize:"13px",fontWeight:500,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
          {showNav ? "✕" : "☰"}
        </button>
      )}

      {/* 사이드바 */}
      <nav style={{width:260,minWidth:260,background:"#2C2824",color:"#D4CFC7",display:"flex",flexDirection:"column",overflow:"hidden",...(mob?{position:"fixed",top:0,left:showNav?0:-280,height:"100vh",zIndex:999,transition:"left 0.3s ease",boxShadow:showNav?"4px 0 20px rgba(0,0,0,0.3)":"none"}:{})}}>
        <div style={{padding:"28px 22px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{fontFamily:"'Noto Serif KR',serif",fontSize:"11px",letterSpacing:"0.2em",color:"#8a8278",marginBottom:6}}>ENCYCLOPEDIA</div>
          <div style={{fontFamily:"'Noto Serif KR',serif",fontSize:"18px",fontWeight:700,color:"#E8E2D8",letterSpacing:"0.05em"}}>아스테르 대륙</div>
          <div style={{fontSize:"11px",color:"#8a8278",marginTop:4,letterSpacing:"0.08em"}}>NATIONS OF ASTER</div>
        </div>

        <div style={{padding:"12px 0",flex:1,overflowY:"auto"}}>
          {/* 지도 버튼 */}
          <button onClick={()=>{setShowMap(true);if(mob)setShowNav(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 22px",border:"none",cursor:"pointer",textAlign:"left",fontSize:"13px",fontWeight:500,background:"rgba(255,255,255,0.04)",color:"#C4BFB2",borderLeft:"3px solid transparent",fontFamily:"'Noto Sans KR',sans-serif",marginBottom:4}}>
            <span style={{fontSize:"14px",width:24,textAlign:"center"}}>🗺️</span><span>대륙 전체 지도</span>
          </button>

          {/* 국가 목록 */}
          <div style={{fontSize:"10px",fontWeight:500,letterSpacing:"0.15em",color:"#6b6560",padding:"8px 22px 8px"}}>6개국</div>
          {nations.map(x => {
            const isActive = activeView.type === "nation" && activeView.nationId === x.id;
            return (
              <button key={x.id} onClick={()=>selectNation(x.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 22px",border:"none",cursor:"pointer",textAlign:"left",fontSize:"13px",fontWeight:isActive?500:400,background:isActive?"rgba(255,255,255,0.08)":"transparent",color:isActive?"#E8E2D8":"#A09888",borderLeft:isActive?`3px solid ${x.color}`:"3px solid transparent",transition:"all 0.15s ease",fontFamily:"'Noto Sans KR',sans-serif"}}>
                <span style={{fontSize:"16px",width:24,textAlign:"center"}}>{x.icon}</span><span>{x.name}</span>
              </button>
            );
          })}

          {/* 인물 사전 */}
          <div style={{fontSize:"10px",fontWeight:500,letterSpacing:"0.15em",color:"#6b6560",padding:"16px 22px 8px"}}>인물</div>
          <button onClick={()=>setActiveView({type:"npcs"})} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 22px",border:"none",cursor:"pointer",textAlign:"left",fontSize:"13px",fontWeight:activeView.type==="npcs"?500:400,background:activeView.type==="npcs"?"rgba(255,255,255,0.08)":"transparent",color:activeView.type==="npcs"?"#E8E2D8":"#A09888",borderLeft:activeView.type==="npcs"?"3px solid #A09888":"3px solid transparent",transition:"all 0.15s ease",fontFamily:"'Noto Sans KR',sans-serif"}}>
            <span style={{fontSize:"16px",width:24,textAlign:"center"}}>👥</span><span>인물 사전</span>
          </button>

          {/* 커뮤니티 */}
          <div style={{fontSize:"10px",fontWeight:500,letterSpacing:"0.15em",color:"#6b6560",padding:"16px 22px 8px"}}>커뮤니티</div>
          {([
            { type: "goddess",    icon: "✨", label: "페이스:??",   color: "#C8A020" },
            { type: "silver-road",icon: "🪙", label: "실버로드",    color: "#2A5F9E" },
            { type: "elin",       icon: "🌸", label: "엘린",        color: "#B85C6E" },
            { type: "warehouse",  icon: "📦", label: "공용 창고",   color: "#7B5EA7" },
            { type: "clover",     icon: "🍀", label: "클로버 상회", color: "#2F8F57" },
          ] as const).map(item => {
            const isActive = activeView.type === item.type;
            return (
              <button key={item.type} onClick={()=>setActiveView({type:item.type})} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 22px",border:"none",cursor:"pointer",textAlign:"left",fontSize:"13px",fontWeight:isActive?500:400,background:isActive?"rgba(255,255,255,0.08)":"transparent",color:isActive?"#E8E2D8":"#A09888",borderLeft:isActive?`3px solid ${item.color}`:"3px solid transparent",transition:"all 0.15s ease",fontFamily:"'Noto Sans KR',sans-serif"}}>
                <span style={{fontSize:"16px",width:24,textAlign:"center"}}>{item.icon}</span><span>{item.label}</span>
              </button>
            );
          })}

          {/* 대륙 공통 정보 */}
          <div style={{fontSize:"10px",fontWeight:500,letterSpacing:"0.15em",color:"#6b6560",padding:"16px 22px 8px"}}>대륙 공통</div>
          <div style={{padding:"6px 22px",fontSize:"12px",color:"#8a8278",lineHeight:1.8}}>
            <div style={{marginBottom:10}}>
              <span style={{color:"#B0A898",fontWeight:500}}>공용어</span><br/>
              아스테르 공용어 (통상어)<br/>
              <span style={{fontSize:"11px",color:"#6b6560"}}>6개국 간 교역·외교에 사용되는 공통 언어. 대부분의 도시에서 통용된다. 각국은 고유 언어(스피아르어, 라프어 등)를 병용한다.</span>
            </div>
            <div>
              <span style={{color:"#B0A898",fontWeight:500}}>대륙 회의</span><br/>
              아스테르 합의전<br/>
              <span style={{fontSize:"11px",color:"#6b6560"}}>카르데아 왕도 루미엘에서 연 1회 개최. 6개국 대표가 참석하는 유일한 정기 회합. 마족 위협 대응, 교역 분쟁 조정, 공동 방위 논의가 주 안건. 의결에는 6국 만장일치가 필요하여 실질적 결정은 쉽지 않다.</span>
            </div>
          </div>
        </div>

        <div style={{padding:"16px 22px",borderTop:"1px solid rgba(255,255,255,0.06)",fontSize:"10px",color:"#6b6560",lineHeight:1.6}}>
          異床同夢 · 이상동몽<br/>아리안로드 2E 캠페인
        </div>
      </nav>

      {/* 메인 영역 */}
      <main ref={ref} style={{flex:1,overflowY:"auto"}}>
        {activeView.type === "npcs"
          ? <NpcsView mob={mob}/>
          : activeView.type === "goddess"
          ? <GoddessView mob={mob}/>
          : activeView.type === "silver-road"
          ? <SilverRoadView mob={mob} />
          : activeView.type === "elin"
          ? <ElinView mob={mob} />
          : activeView.type === "warehouse"
          ? <WarehouseView mob={mob} />
          : activeView.type === "clover"
          ? <CloverView mob={mob} />
          : <NationView n={n} mob={mob} activeId={activeNationId} onSelect={selectNation} onLocClick={setSelLoc}/>
        }
      </main>

      {/* 지명 모달 */}
      <LocModal loc={selLoc} color={n.color} onClose={()=>setSelLoc(null)}/>

      {/* 전체 지도 모달 */}
      {showMap && (
        <div onClick={()=>setShowMap(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#FDFBF7",borderRadius:12,maxWidth:700,width:"100%",cursor:"default",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
            <div style={{padding:"20px 24px 12px",borderBottom:"1px solid #E8E3DA",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Noto Serif KR',serif",fontSize:"18px",fontWeight:700}}>아스테르 대륙 전체 지도</div>
                <div style={{fontSize:"11px",color:"#999",marginTop:2}}>국가를 클릭하면 해당 페이지로 이동합니다</div>
              </div>
              <button onClick={()=>setShowMap(false)} style={{background:"none",border:"1px solid #ddd",borderRadius:6,padding:"4px 12px",fontSize:"12px",color:"#777",cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:"16px 24px 24px"}}>
              <ContinentMap activeId={activeNationId} onSelect={selectNation}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

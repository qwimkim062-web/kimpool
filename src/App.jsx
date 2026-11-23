import React,{useCallback,useEffect,useRef,useState} from 'react';

const initialBalls=[
 {id:0,n:0,x:292,y:260,color:'#f7f4e9'},{id:1,n:1,x:682,y:260,color:'#f5d435'},
 {id:2,n:9,x:710,y:246,color:'#f2c936'},{id:3,n:2,x:710,y:274,color:'#2467c7'},
 {id:4,n:8,x:738,y:260,color:'#22252a'},{id:5,n:3,x:738,y:232,color:'#df3838'},
 {id:6,n:10,x:738,y:288,color:'#df3838'},{id:7,n:4,x:766,y:218,color:'#713ab0'},
 {id:8,n:11,x:766,y:246,color:'#713ab0'},{id:9,n:5,x:766,y:274,color:'#ed8d27'},
 {id:10,n:12,x:766,y:302,color:'#ed8d27'},{id:11,n:6,x:794,y:204,color:'#27925a'},
 {id:12,n:13,x:794,y:232,color:'#27925a'},{id:13,n:7,x:794,y:260,color:'#92333c'},
 {id:14,n:14,x:794,y:288,color:'#92333c'},{id:15,n:15,x:794,y:316,color:'#315f9c'}
];
const tournamentData=[
 {name:'Friday Night Break',type:'8-Ball · Knockout',players:'32 / 64',time:'Starts in 18 min',prize:'2,500',status:'Registering'},
 {name:'Nairobi Open',type:'8-Ball · Knockout',players:'48 / 64',time:'Today · 8:00 PM',prize:'5,000',status:'Registering'},
 {name:'Sunday 9-Ball Sprint',type:'9-Ball · Quick bracket',players:'16 / 32',time:'Sun · 4:30 PM',prize:'1,200',status:'Soon'}
];
const leaderboard=[
 {rank:1,name:'CueTheStorm',country:'🇰🇪',rating:2184,wins:42,winRate:'84%'},
 {rank:2,name:'NairobiNiner',country:'🇰🇪',rating:2068,wins:38,winRate:'79%'},
 {rank:3,name:'PocketWizard',country:'🇺🇬',rating:1982,wins:35,winRate:'76%'},
 {rank:4,name:'GreenFeltKing',country:'🇹🇿',rating:1870,wins:31,winRate:'72%'},
 {rank:5,name:'KimCue',country:'🇰🇪',rating:1756,wins:27,winRate:'68%'}
];
function readInviteCode(){
 const code=new URLSearchParams(window.location.search).get('room')||'';
 return /^[a-f0-9]{6}$/i.test(code)?code.toUpperCase():'';
}
function makeInviteUrl(code){
 const url=new URL(window.location.href);
 url.searchParams.set('room',code);
 return url.toString();
}

function Icon({name,size=18}){
 const paths={
  home:<><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
  play:<><path d="m8 5 12 7-12 7z"/></>,
  trophy:<><path d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4"/></>,
  chart:<><path d="M4 19V5m0 14h17"/><path d="m7 15 4-4 3 2 6-7"/></>,
  user:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  wallet:<><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18m-5 5h.01M7 5V3h12"/></>,
  menu:<><path d="M4 7h16M4 12h16M4 17h16"/></>,
  close:<><path d="m6 6 12 12M18 6 6 18"/></>,
  arrow:<><path d="M5 12h14m-7-7 7 7-7 7"/></>,
  plus:<><path d="M12 5v14m-7-7h14"/></>,
  users:<><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  target:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4L7.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1L11 7.4h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z"/></>
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.target}</svg>;
}

function PoolMark({small=false}){return <span className={`pool-mark${small?' small':''}`}><span>8</span></span>}

function BallTracker({balls}){
 const remainingIds=new Set(balls.filter(ball=>ball.id>0).map(ball=>ball.id));
 const pocketed=initialBalls.filter(ball=>ball.id>0&&!remainingIds.has(ball.id)).sort((a,b)=>a.n-b.n);
 const remaining=initialBalls.filter(ball=>ball.id>0&&remainingIds.has(ball.id)).sort((a,b)=>a.n-b.n);
 return <section className="ball-tracker" aria-label="Ball status">
  <div className="ball-tracker-heading">
   <span className="section-kicker">BALL TRACKER</span>
   <span className="ball-tracker-count">{pocketed.length} / 15 POCKETED</span>
  </div>
  <div className="ball-tracker-groups">
   {[['ON TABLE',remaining],['POCKETED',pocketed]].map(([label,group])=><div className="ball-tracker-group" key={label}>
    <div className="ball-tracker-label"><span>{label}</span><b>{group.length}</b></div>
    <div className="ball-tracker-balls" aria-label={`${label.toLowerCase()}: ${group.length ? group.map(ball=>ball.n).join(', ') : 'none'}`}>
     {group.length?group.map(ball=><span className={`tracked-ball${ball.n>8?' is-striped':''}${label==='POCKETED'?' is-pocketed':''}`} key={ball.id} style={{'--ball-color':ball.color}} title={`${ball.n}${ball.n>8?' striped':''}`} aria-label={`${ball.n}${ball.n>8?' striped':''}`}>
      {ball.n>8&&<i aria-hidden="true"/>}<span>{ball.n}</span>
     </span>):<span className="ball-tracker-empty">None</span>}
    </div>
   </div>)}
  </div>
 </section>;
}

function PoolTable({balls,setBalls,aim,setAim,power,shooting,setShooting,shoot,serverDriven=false,statusLabel}){
 const svgRef=useRef(null),animation=useRef(0),lastFrame=useRef(0),pullStart=useRef(null);
 const [pullPower,setPullPower]=useState(power),[isPulling,setIsPulling]=useState(false),[localFoul,setLocalFoul]=useState('');
 const pocketCenters=[[60,54],[500,54],[940,54],[60,466],[500,466],[940,466]];
 const pointerPosition=e=>{
  const bounds=svgRef.current.getBoundingClientRect();
  return {x:(e.clientX-bounds.left)/bounds.width*1000,y:(e.clientY-bounds.top)/bounds.height*520};
 };
 const powerForPull=distance=>Math.max(10,Math.min(100,Math.round(10+distance*.5)));
 const moveAim=e=>{
  if(shooting)return;
  const p=pointerPosition(e),cue=balls.find(ball=>ball.id===0),pull=pullStart.current;
  if(pull?.pointerId===e.pointerId){
   const x=p.x-pull.x,y=p.y-pull.y,distance=Math.hypot(x,y);
   if(distance>0){
    setAim({x:-x,y:-y});
    setPullPower(powerForPull(distance));
   }
   return;
  }
  if(cue)setAim({x:p.x-cue.x,y:p.y-cue.y});
 };
 const startPull=e=>{
  if(e.button!==0||shooting)return;
  const cue=balls.find(ball=>ball.id===0),p=pointerPosition(e);
  if(!cue||Math.hypot(p.x-cue.x,p.y-cue.y)>34)return;
  pullStart.current={pointerId:e.pointerId,x:p.x,y:p.y};
  setPullPower(power);
  setIsPulling(true);
  e.currentTarget.setPointerCapture(e.pointerId);
 };
 const releasePull=e=>{
  const start=pullStart.current;
  if(!start||start.pointerId!==e.pointerId)return;
  pullStart.current=null;
  setIsPulling(false);
  const p=pointerPosition(e),x=p.x-start.x,y=p.y-start.y,distance=Math.hypot(x,y);
  if(distance<8)return;
  const shotAim={x:-x,y:-y},shotPower=powerForPull(distance);
  setAim(shotAim);
  setPullPower(shotPower);
  shoot(shotAim,shotPower);
 };
 const cancelPull=()=>{pullStart.current=null;setIsPulling(false)};
 useEffect(()=>{
  if(!shooting||serverDriven)return;
  let currentBalls=balls.map(ball=>({...ball}));
   let cuePotted=false;
  const step=now=>{
   const delta=Math.min((now-(lastFrame.current||now))/16.67,2);lastFrame.current=now;
   let moving=false;
   const next=currentBalls.map(ball=>({...ball}));
   const substeps=Math.max(1,Math.ceil(delta*2));
   for(let stepIndex=0;stepIndex<substeps;stepIndex++){
    const stepDelta=delta/substeps;
    for(let i=0;i<next.length;i++){
     const a=next[i];if(!a.vx&&!a.vy)continue;
     a.x+=a.vx*stepDelta;a.y+=a.vy*stepDelta;
     a.vx*=Math.pow(.988,stepDelta);a.vy*=Math.pow(.988,stepDelta);
     if(a.x<74||a.x>926){a.x=Math.max(74,Math.min(926,a.x));a.vx*=-.88}
     if(a.y<68||a.y>452){a.y=Math.max(68,Math.min(452,a.y));a.vy*=-.88}
     if(Math.hypot(a.vx,a.vy)<.035){a.vx=0;a.vy=0}
    }
    for(let i=0;i<next.length;i++)for(let j=i+1;j<next.length;j++){
     const a=next[i],b=next[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=28;
     if(d>0&&d<min){
      const nx=dx/d,ny=dy/d,overlap=(min-d)/2;
      a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
      const closingSpeed=((a.vx||0)-(b.vx||0))*nx+((a.vy||0)-(b.vy||0))*ny;
      if(closingSpeed>0){
       const impulse=closingSpeed*.99;
       a.vx=(a.vx||0)-impulse*nx;a.vy=(a.vy||0)-impulse*ny;
       b.vx=(b.vx||0)+impulse*nx;b.vy=(b.vy||0)+impulse*ny;
      }
     }
    }
   }
   moving=next.some(ball=>Math.hypot(ball.vx||0,ball.vy||0)>=.035);
   const pocketed=next.filter(ball=>pocketCenters.some(([x,y])=>Math.hypot(ball.x-x,ball.y-y)<32));
   if(pocketed.some(ball=>ball.id===0))cuePotted=true;
   currentBalls=next.filter(ball=>!pocketCenters.some(([x,y])=>Math.hypot(ball.x-x,ball.y-y)<32));
   if(moving){setBalls(currentBalls);animation.current=requestAnimationFrame(step)}
   else{
    if(cuePotted){
     currentBalls=[...currentBalls,{...initialBalls[0],vx:0,vy:0}];
     setLocalFoul('FOUL: Cue ball pocketed. It has been returned to the table.');
    }
    setBalls(currentBalls);
    lastFrame.current=0;setShooting(false);
   }
  };
  animation.current=requestAnimationFrame(step);
  return ()=>{cancelAnimationFrame(animation.current);lastFrame.current=0};
 },[serverDriven,shooting,setBalls]);
 useEffect(()=>{if(shooting&&!serverDriven)setLocalFoul('')},[serverDriven,shooting]);
 useEffect(()=>()=>cancelAnimationFrame(animation.current),[]);
 const cue=balls.find(ball=>ball.id===0);
 const aimAngle=cue?Math.atan2(aim.y,aim.x):0;
 const cueEnd=cue?{x:cue.x-Math.cos(aimAngle)*(72+pullPower*.7),y:cue.y-Math.sin(aimAngle)*(72+pullPower*.7)}:{x:0,y:0};
 return <div className="table-shell">
  <div className="table-meta"><span><i className="live-dot"/> {serverDriven?'LIVE MATCH':'PRACTICE TABLE'} <span className="meta-divider">·</span> 8-BALL</span><span className="table-status">{statusLabel||(shooting?'BALLS IN MOTION':'YOUR TURN')}</span></div>
  {localFoul&&<div className="foul-message" role="status" aria-live="polite">{localFoul}</div>}
  <svg ref={svgRef} className={`pool-table${shooting?' is-shooting':''}${isPulling?' is-pulling':''}`} viewBox="0 0 1000 520" onPointerMove={moveAim} onPointerDown={startPull} onPointerUp={releasePull} onPointerCancel={cancelPull} aria-label="Hold the left mouse button on the cue ball, pull back to aim and set power, then release to shoot.">
   <defs>
    <linearGradient id="wood" x2="0" y2="1"><stop stopColor="#956039"/><stop offset=".48" stopColor="#57351f"/><stop offset="1" stopColor="#2b1a12"/></linearGradient>
    <linearGradient id="felt" x2="1" y2="1"><stop stopColor="#16734a"/><stop offset=".5" stopColor="#0d5c3a"/><stop offset="1" stopColor="#08472f"/></linearGradient>
    <radialGradient id="cueBall" cx=".35" cy=".28"><stop stopColor="#fff"/><stop offset=".7" stopColor="#efeee8"/><stop offset="1" stopColor="#aaa99e"/></radialGradient>
    <radialGradient id="numberBall" cx=".34" cy=".27"><stop stopColor="#fff"/><stop offset=".44" stopColor="#fff"/><stop offset=".48" stopColor="#f8f6ed"/><stop offset="1" stopColor="#d7d4c8"/></radialGradient>
    <pattern id="feltTexture" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 12 12 0M-3 3 3-3M9 15l6-6" stroke="#fff" strokeOpacity=".025" strokeWidth="1"/></pattern>
    <filter id="ballShadow" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="1" dy="3" stdDeviation="2.5" floodColor="#001a10" floodOpacity=".65"/></filter>
    {initialBalls.filter(ball=>ball.id>0).map(ball=><React.Fragment key={ball.id}>
     <radialGradient id={`ballFinish${ball.id}`} cx=".3" cy=".24" r=".78">
      <stop stopColor="#fff" stopOpacity=".72"/><stop offset=".18" stopColor={ball.color}/><stop offset=".7" stopColor={ball.color}/><stop offset="1" stopColor="#111" stopOpacity=".72"/>
     </radialGradient>
     <clipPath id={`ballClip${ball.id}`}><circle r="14"/></clipPath>
    </React.Fragment>)}
   </defs>
   <rect x="15" y="16" width="970" height="488" rx="42" fill="#14100d" opacity=".72"/>
   <rect x="23" y="12" width="954" height="482" rx="37" fill="url(#wood)" stroke="#b48b5f" strokeWidth="2"/>
   <rect x="39" y="28" width="922" height="450" rx="29" fill="#31251b" stroke="#c6a579" strokeOpacity=".5" strokeWidth="3"/>
   <rect x="60" y="54" width="880" height="412" rx="12" fill="url(#felt)" stroke="#226b49" strokeWidth="5"/>
   <rect x="60" y="54" width="880" height="412" rx="12" fill="url(#feltTexture)"/>
   <path d="M500 55v410" stroke="#d7f0dc" strokeOpacity=".13" strokeWidth="1.5" strokeDasharray="3 7"/>
   <path d="M285 54a95 95 0 0 0 0 190" fill="none" stroke="#d7f0dc" strokeOpacity=".14" strokeWidth="1.5"/>
   <path d="M94 111h6m-6 148h6m0 148h-6m800-296h6m-6 148h6m0 148h-6" stroke="#dbbd88" strokeWidth="3" strokeLinecap="round"/>
   {pocketCenters.map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r={i%3===1?20:22} fill="#100e0c"/><circle cx={x} cy={y} r={i%3===1?15:17} fill="#000" opacity=".8"/></g>)}
   {cue&&aim&&!shooting&&<g>
    <line x1={cue.x} y1={cue.y} x2={cue.x+aim.x/Math.hypot(aim.x,aim.y)*260} y2={cue.y+aim.y/Math.hypot(aim.x,aim.y)*260} stroke="#f6f1dc" strokeWidth="1.4" strokeDasharray="6 6" opacity=".7"/>
    <line x1={cueEnd.x} y1={cueEnd.y} x2={cue.x-Math.cos(aimAngle)*11} y2={cue.y-Math.sin(aimAngle)*11} stroke="#d5aa72" strokeWidth="7" strokeLinecap="round"/>
    <line x1={cueEnd.x} y1={cueEnd.y} x2={cue.x-Math.cos(aimAngle)*11} y2={cue.y-Math.sin(aimAngle)*11} stroke="#ecd4a7" strokeWidth="2.5"/>
   </g>}
   {balls.map(ball=><g key={ball.id} transform={`translate(${ball.x} ${ball.y})`} filter="url(#ballShadow)">
    <circle r="14" fill={ball.id===0?'url(#cueBall)':`url(#ballFinish${ball.id})`} stroke={ball.id===0?'#aaa99e':'#f3eddb'} strokeOpacity={ball.id===0?'.9':'.7'} strokeWidth="1.5"/>
    {ball.n>8&&<g clipPath={`url(#ballClip${ball.id})`}><rect x="-15" y="-5.3" width="30" height="10.6" fill="#f3f0e5"/></g>}
    {ball.id>0&&<><circle r="6.3" fill="url(#numberBall)"/><text y="2.7" textAnchor="middle" fontSize="7.2" fontWeight="800" fill="#252522">{ball.n}</text></>}
    <ellipse cx="-4.2" cy="-5.2" rx="3.1" ry="2" fill="#fff" opacity={ball.id===0 ? .85 : .55}/>
   </g>)}
  </svg>
  <div className="table-help"><span>{isPulling?`PULL BACK · ${pullPower}% POWER`:'↖ Hold the cue ball, pull back, then release to shoot'}</span><span>{balls.filter(b=>b.id>0).length} balls remaining</span></div>
  <BallTracker balls={balls}/>
 </div>;
}

function App(){
 const [page,setPage]=useState('Home'),[modal,setModal]=useState(''),[toast,setToast]=useState(''),[user,setUser]=useState(()=>localStorage.getItem('kimpool_name')||'Guest');
 const [balls,setBalls]=useState(initialBalls),[aim,setAim]=useState({x:1,y:0}),[power,setPower]=useState(48),[shots,setShots]=useState(0),[shooting,setShooting]=useState(false),[lastFoul,setLastFoul]=useState(''),[roomCode,setRoomCode]=useState(''),[friendInviteCode,setFriendInviteCode]=useState(readInviteCode),[inviteCopied,setInviteCopied]=useState(false),[mobileMenu,setMobileMenu]=useState(false);
 const [onlineGame,setOnlineGame]=useState({connected:false,playerId:'',roomCode:'',status:'idle',players:[],currentPlayerId:null,winner:null,groups:{},shots:0,balls:[],foul:null});
 const socketRef=useRef(null);
 const [credits,setCredits]=useState(()=>Number(localStorage.getItem('kimpool_credits'))||1000),[joined,setJoined]=useState([]);
 const [bonusClaimed,setBonusClaimed]=useState(()=>localStorage.getItem('kimpool_bonus_date')===new Date().toISOString().slice(0,10));
 const [authForm,setAuthForm]=useState({name:'',email:'',password:''});
 const showToast=message=>{setToast(message);window.clearTimeout(showToast.timeout);showToast.timeout=window.setTimeout(()=>setToast(''),3200)};
 useEffect(()=>{if(friendInviteCode)setModal('incoming')},[]);
 useEffect(()=>()=>socketRef.current?.close(),[]);
 const handleOnlineMessage=message=>{
  if(message.type==='connected'){setOnlineGame(old=>({...old,connected:true,playerId:message.playerId}));return}
  if(message.type==='room:created'){
   setFriendInviteCode(message.roomCode);setInviteCopied(false);setModal('friend');
   setOnlineGame(old=>({...old,roomCode:message.roomCode,status:'waiting',playerId:message.playerId}));
   if(['localhost','127.0.0.1'].includes(window.location.hostname))showToast('Online room created. Friends need the published site URL to join.');
   return;
  }
  if(message.type==='room:joined'){
   setOnlineGame(old=>({...old,roomCode:message.roomCode,playerId:message.playerId}));
   setModal('');return;
  }
  if(message.type==='room:state'){
   setOnlineGame(old=>({...old,...message.room,connected:true}));
   if(message.room.status==='waiting'&&message.room.players?.length===1){setPage('Play');setModal('friend')}
   return;
  }
  if(message.type==='game:state'){
   const game=message.game;
   setOnlineGame(old=>({...old,...game,connected:true}));
   if(game.balls)setBalls(game.balls.map(ball=>({...ball,color:initialBalls.find(initial=>initial.id===ball.id)?.color||'#eee'})));
   setShooting(game.status==='moving');
   if(game.foul)showToast(`FOUL: ${game.foul.playerName} pocketed the cue ball. Turn passes.`);
   if(game.players?.length===2){setPage('OnlineGame');setModal('')}
   return;
  }
  if(message.type==='room:left'){
   setOnlineGame({connected:true,playerId:'',roomCode:'',status:'idle',players:[],currentPlayerId:null,winner:null,groups:{},shots:0,balls:[],foul:null});
   setPage('Play');setModal('');return;
  }
  if(message.type==='error')showToast(message.message||'Online game request failed.');
 };
 const ensureOnlineSocket=()=>new Promise((resolve,reject)=>{
  let socket=socketRef.current;
  if(socket?.readyState===WebSocket.OPEN){resolve(socket);return}
  if(!socket||socket.readyState===WebSocket.CLOSED){
   const protocol=window.location.protocol==='https:'?'wss:':'ws:';
   const socketPath=import.meta.env.DEV?'/ws':'/api/ws';
   socket=new WebSocket(`${protocol}//${window.location.host}${socketPath}`);
   socketRef.current=socket;
   socket.onmessage=event=>{try{handleOnlineMessage(JSON.parse(event.data))}catch{showToast('The game server sent an unreadable response.')}};
   socket.onclose=()=>setOnlineGame(old=>({...old,connected:false}));
  }
  if(socket.readyState===WebSocket.OPEN){resolve(socket);return}
  const timeout=window.setTimeout(()=>reject(new Error('The game server did not respond.')),8000);
  socket.addEventListener('open',()=>{window.clearTimeout(timeout);resolve(socket)},{once:true});
  socket.addEventListener('error',()=>{window.clearTimeout(timeout);reject(new Error('Could not connect to the online game server.'))},{once:true});
 });
 const sendOnlineMessage=async(type,data={})=>{
  try{const socket=await ensureOnlineSocket();socket.send(JSON.stringify({type,...data}))}
  catch(error){showToast(error.message)}
 };
 const enterPractice=()=>{setPage('Practice');setBalls(initialBalls.map(ball=>({...ball})));setShots(0);setAim({x:1,y:0});setShooting(false);setLastFoul('')};
 const joinTournament=name=>{if(joined.includes(name)){showToast('You are already registered for this tournament.');return}setJoined(old=>[...old,name]);showToast(`You're on the list for ${name}. Demo registration confirmed.`)};
 const register=event=>{event.preventDefault();if(!authForm.name.trim()||!authForm.email.trim()){showToast('Enter your name and email to continue.');return}setUser(authForm.name.trim());localStorage.setItem('kimpool_name',authForm.name.trim());setModal('');showToast(`Welcome to KIM POOL, ${authForm.name.trim().split(' ')[0]}!`)};
 const onShot=useCallback(()=>setShots(count=>count+1),[]);
 const claimDailyBonus=()=>{
  const today=new Date().toISOString().slice(0,10);
  if(localStorage.getItem('kimpool_bonus_date')===today){setBonusClaimed(true);showToast('Your daily practice bonus has already been claimed.');return}
  const next=credits+250;
  localStorage.setItem('kimpool_bonus_date',today);
  localStorage.setItem('kimpool_credits',String(next));
  setCredits(next);setBonusClaimed(true);showToast('Daily practice bonus: +250 demo credits!');
 };
 const createFriendInvite=()=>{
  sendOnlineMessage('room:create',{name:user});
 };
 const joinFriendRoom=()=>sendOnlineMessage('room:join',{roomCode:friendInviteCode,name:user});
 const copyFriendInvite=async()=>{
  if(!friendInviteCode){showToast('Create an online room before copying its invite.');return}
  const link=makeInviteUrl(friendInviteCode);
  try{
   if(!navigator.clipboard?.writeText){showToast('Clipboard access is unavailable. Select and copy the invite link.');return}
   await navigator.clipboard.writeText(link);
   setInviteCopied(true);showToast('Invite link copied to clipboard.');
  }catch{
   showToast('Could not copy the invite link. Select and copy it manually.');
  }
 };
 const shareFriendInvite=async()=>{
  if(!friendInviteCode){showToast('Create an online room before sharing its invite.');return}
  const link=makeInviteUrl(friendInviteCode);
  if(!navigator.share){await copyFriendInvite();return}
  try{await navigator.share({title:'KIM POOL invite',text:'Come play pool with me on KIM POOL.',url:link})}
  catch(error){if(error.name!=='AbortError')showToast('Could not open the share menu. Copy the invite link instead.')}
 };
 const shoot=useCallback((shotAim=aim,shotPower=power)=>{
  if(shooting)return;
  const cue=balls.find(ball=>ball.id===0);
  if(!cue)return;
  const length=Math.hypot(shotAim.x,shotAim.y)||1,speed=5.2+shotPower*.24;
  setBalls(balls.map(ball=>ball.id===0?{...ball,vx:(shotAim.x/length)*speed,vy:(shotAim.y/length)*speed}:ball));
  setPower(shotPower);
  setShooting(true);onShot();
 },[aim,balls,onShot,power,shooting]);
 const shootOnline=(shotAim=aim,shotPower=power)=>{
  if(onlineGame.currentPlayerId!==onlineGame.playerId){showToast('Wait for your opponent to finish their turn.');return}
  if(onlineGame.status!=='playing'){showToast('The game is not ready for a shot yet.');return}
  setPower(shotPower);
  sendOnlineMessage('shot',{angle:Math.atan2(shotAim.y,shotAim.x),power:shotPower});
 };
 const leaveOnlineRoom=()=>{const socket=socketRef.current;if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({type:'room:leave'}));setPage('Play');setOnlineGame(old=>({...old,roomCode:'',status:'idle',players:[],currentPlayerId:null,winner:null,groups:{},balls:[]}));};
 const nav=[['Home','home'],['Play','play'],['Tournaments','trophy'],['Leaderboard','chart'],['Profile','user']];
 const balance=credits.toLocaleString('en-KE');
 return <div className="app-shell">
  <aside className={`sidebar-nav${mobileMenu?' open':''}`}>
   <button className="brand-lockup" onClick={()=>setPage('Home')}><PoolMark/><span>KIM<span className="brand-green">POOL</span><small>THE CUE CLUB</small></span></button>
   <div className="nav-caption">PLAY</div>
   <nav>{nav.slice(0,2).map(([label,icon])=><button key={label} className={`nav-link${page===label||(label==='Play'&&(page==='Practice'||page==='OnlineGame'))?' active':''}`} onClick={()=>{setPage(label);setMobileMenu(false)}}><Icon name={icon}/><span>{label==='Play'?'Play pool':label}</span>{label==='Play'&&<span className="nav-live">LIVE</span>}</button>)}</nav>
   <div className="nav-caption secondary-caption">YOUR CLUB</div>
   <nav>{nav.slice(2).map(([label,icon])=><button key={label} className={`nav-link${page===label?' active':''}`} onClick={()=>{setPage(label);setMobileMenu(false)}}><Icon name={icon}/><span>{label}</span></button>)}</nav>
   <div className="sidebar-bottom"><div className="club-card"><span className="club-icon"><Icon name="target" size={17}/></span><b>Find your next match</b><p>Jump into a friendly game and sharpen your aim.</p><button onClick={()=>{setPage('Play');setMobileMenu(false)}}>Find a table <Icon name="arrow" size={14}/></button></div><div className="sidebar-foot"><span className="online-dot"/> Demo club · East Africa</div></div>
  </aside>
  <div className="main-column">
   <header className="topbar"><button className="mobile-menu" onClick={()=>setMobileMenu(!mobileMenu)} aria-label="Open menu"><Icon name="menu"/></button><div className="breadcrumb"><span>CLUB</span><b>/</b>{page==='Play'?'GAME LOBBY':page.toUpperCase()}</div><div className="topbar-right"><button className="wallet-chip" onClick={()=>setPage('Profile')}><span className="coin">K</span><span>{balance}<small>DEMO CREDITS</small></span><Icon name="plus" size={15}/></button><button className="profile-chip" onClick={()=>setModal('account')}><span className="avatar">{user==='Guest'?'G':user[0].toUpperCase()}</span><span className="profile-name">{user}</span><span className="chevron">⌄</span></button></div></header>
   <main className="main-content">
    {page==='Home'&&<div className="dashboard-page">
     <section className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> YOUR TABLE IS READY</div><h1>Good game starts<br/><span>with one shot.</span></h1><p>Find your rhythm, challenge a friend, or take your place in the club.</p><button className="button-primary" onClick={()=>setPage('Play')}>Find a game <Icon name="arrow" size={16}/></button></div><div className="welcome-art" aria-hidden="true"><div className="art-glow"/><div className="art-cue"/><div className="hero-ball ball-eight">8</div><div className="hero-ball ball-yellow"/><div className="hero-ball ball-stripe"><i/></div><div className="art-label"><span>EST. 2026</span><b>THE PERFECT<br/>BREAK.</b></div></div><div className="hero-dots"><span/> <span/> <span/></div></section>
     <div className="stat-strip"><div><span className="stat-icon"><Icon name="users"/></span><span><b>1,248</b><small>Players online</small></span><span className="stat-divider"/></div><div><span className="stat-icon"><Icon name="target"/></span><span><b>86</b><small>Tables in play</small></span><span className="stat-divider"/></div><div><span className="stat-icon"><Icon name="trophy"/></span><span><b>12</b><small>Open tournaments</small></span></div><span className="demo-label">DEMO NUMBERS</span></div>
     <div className="home-section-heading"><div><span className="section-kicker">PICK YOUR GAME</span><h2>How do you want to play?</h2></div><span className="muted-copy">Choose your table</span></div>
     <div className="mode-grid">
      <button className="mode-card quick-card" onClick={()=>{showToast('Looking for an opponent… Demo matchmaking found a table!');window.setTimeout(enterPractice,1000)}}><span className="mode-icon"><Icon name="target" size={21}/></span><span className="mode-tag">POPULAR</span><b>Quick match</b><small>Find a worthy opponent in seconds.</small><span className="mode-action">Find opponent <Icon name="arrow" size={15}/></span></button>
      <button className="mode-card friend-card" onClick={()=>setModal('friend')}><span className="mode-icon"><Icon name="users" size={21}/></span><b>Play a friend</b><small>Invite your crew to a private table.</small><span className="mode-action">Send an invite <Icon name="arrow" size={15}/></span></button>
      <button className="mode-card practice-card" onClick={enterPractice}><span className="mode-icon"><Icon name="play" size={21}/></span><b>Practice</b><small>Just you, the cue, and the table.</small><span className="mode-action">Rack 'em up <Icon name="arrow" size={15}/></span></button>
      <button className="mode-card room-card" onClick={()=>setModal('room')}><span className="mode-icon"><Icon name="plus" size={21}/></span><b>Private room</b><small>Create a room or join with a code.</small><span className="mode-action">Create / join <Icon name="arrow" size={15}/></span></button>
     </div>
     <div className="lower-grid"><section className="content-card tournament-preview"><div className="card-heading"><div><span className="section-kicker">THE CLUB CIRCUIT</span><h2>Coming up</h2></div><button className="text-link" onClick={()=>setPage('Tournaments')}>All tournaments <Icon name="arrow" size={14}/></button></div>{tournamentData.slice(0,2).map((t,index)=><div className="mini-tournament" key={t.name}><span className={`mini-date${index===0?' today':''}`}><b>{index===0?'20':'21'}</b><small>NOV</small></span><span className="mini-tour-info"><b>{t.name}</b><small>{t.type} <i/> {t.players} players</small></span><span className="mini-prize"><small>PRIZE POOL</small><b>{t.prize} <i>CR</i></b></span><button className="icon-arrow" onClick={()=>setPage('Tournaments')} aria-label={`View ${t.name}`}><Icon name="arrow"/></button></div>)}</section>
      <section className="content-card leaderboard-preview"><div className="card-heading"><div><span className="section-kicker">THIS WEEK</span><h2>Top of the table</h2></div><button className="text-link" onClick={()=>setPage('Leaderboard')}>Leaderboard <Icon name="arrow" size={14}/></button></div>{leaderboard.slice(0,3).map((p,i)=><div className="mini-rank" key={p.name}><span className={`rank-number rank-${i+1}`}>{String(i+1).padStart(2,'0')}</span><span className="rank-avatar">{p.name[0]}</span><span className="rank-player"><b>{p.name}</b><small>{p.country} · {p.wins} wins</small></span><b className="rank-rating">{p.rating.toLocaleString()}<small> ELO</small></b></div>)}</section></div>
    </div>}
    {page==='Play'&&<section className="lobby-page"><div className="page-title-row"><div><span className="section-kicker">YOUR NEXT BREAK</span><h1>Game lobby</h1><p>Pick a mode. We'll keep the table warm.</p></div><span className="online-pill"><i/> 1,248 players online</span></div><div className="lobby-grid"><button className="lobby-mode featured" onClick={()=>{showToast('Demo matchmaking found a table!');enterPractice()}}><span className="lobby-mode-icon"><Icon name="target" size={25}/></span><span className="mode-tag">FASTEST MATCH</span><h2>Quick match</h2><p>Get paired with a player at your level. No waiting around.</p><span className="button-primary">Find an opponent <Icon name="arrow"/></span><span className="featured-graphic"><PoolMark/></span></button><button className="lobby-mode" onClick={()=>setModal('friend')}><span className="lobby-mode-icon"><Icon name="users" size={23}/></span><h2>Play a friend</h2><p>Invite a friend with a private match link.</p><span className="lobby-link">Invite a player <Icon name="arrow" size={15}/></span></button><button className="lobby-mode" onClick={()=>setModal('room')}><span className="lobby-mode-icon"><Icon name="plus" size={23}/></span><h2>Private room</h2><p>Make a room code and bring your own players.</p><span className="lobby-link">Create a room <Icon name="arrow" size={15}/></span></button><button className="lobby-mode" onClick={enterPractice}><span className="lobby-mode-icon"><Icon name="play" size={23}/></span><h2>Practice mode</h2><p>Play solo and work on your shot. No pressure.</p><span className="lobby-link">Start practicing <Icon name="arrow" size={15}/></span></button></div><section className="content-card spectators"><div className="card-heading"><div><span className="section-kicker">LIVE FROM THE CLUB</span><h2>Tables to watch</h2></div><span className="spectator-total"><i className="live-dot"/> 32 watching</span></div>{[['CueTheStorm','NairobiNiner','8-Ball','Semi-final',18],['PocketWizard','GreenFeltKing','9-Ball','Quick match',24]].map(([a,b,game,stage,count])=><div className="watch-row" key={a}><span className="watch-avatars"><i>{a[0]}</i><i>{b[0]}</i></span><span className="watch-players"><b>{a} <small>vs</small> {b}</b><small>{game} · {stage}</small></span><span className="watch-count"><Icon name="users" size={14}/> {count}</span><button className="outline-button" onClick={()=>showToast('Spectator view is a preview. Live tables are coming soon.')}>Watch <Icon name="arrow" size={14}/></button></div>)}</section><div className="match-history-note"><Icon name="clock" size={16}/><span>Match history lives in your profile.</span><button onClick={()=>setPage('Profile')}>View profile <Icon name="arrow" size={13}/></button></div></section>}
    {page==='Tournaments'&&<section className="tournaments-page"><div className="page-title-row"><div><span className="section-kicker">COMPETE WITH THE CLUB</span><h1>Tournaments</h1><p>Make your mark on the bracket.</p></div><button className="button-primary" onClick={()=>showToast('Tournament creation is available to club admins in this demo.')}>Create tournament <Icon name="plus" size={16}/></button></div><div className="tournament-feature"><div><span className="section-kicker">FEATURED EVENT · REGISTRATION OPEN</span><h2>Nairobi Open</h2><p>One table. One champion. Show the club what you've got.</p><div className="feature-meta"><span><Icon name="clock" size={15}/> Today · 8:00 PM EAT</span><span><Icon name="users" size={15}/> 48 / 64 players</span><span><Icon name="trophy" size={15}/> 5,000 credits</span></div><button className="button-primary" onClick={()=>joinTournament('Nairobi Open')}>{joined.includes('Nairobi Open')?'Registered ✓':'Join tournament'} <Icon name="arrow" size={15}/></button></div><div className="tournament-cup">🏆<span>KP<br/>OPEN</span></div></div><div className="card-heading tournaments-heading"><div><span className="section-kicker">COMING TO THE CLUB</span><h2>More events</h2></div><div className="filter-pills"><button className="selected">All events</button><button onClick={()=>showToast('Showing all upcoming demo events.')}>8-Ball</button><button onClick={()=>showToast('Showing all upcoming demo events.')}>9-Ball</button></div></div><div className="tournament-list">{tournamentData.map((t,i)=><article className="tournament-row" key={t.name}><span className="tournament-date"><b>{i===0?'20':i===1?'20':'23'}</b><small>NOV</small></span><span className="tournament-info"><b>{t.name}</b><small>{t.type} · {i===0?'Tonight · 7:00 PM':i===1?'Today · 8:00 PM':'Sunday · 4:30 PM'} EAT</small></span><span className="tournament-players"><b>{t.players}</b><small>players</small></span><span className="tournament-prize"><b>{t.prize} <small>CR</small></b><small>Prize pool</small></span><span className={`tournament-status${t.status==='Soon'?' soon':''}`}>{joined.includes(t.name)?'Registered':t.status}</span><button className="outline-button" onClick={()=>joinTournament(t.name)}>{joined.includes(t.name)?'Joined':'Register'} <Icon name="arrow" size={14}/></button></article>)}</div><p className="demo-disclaimer">Demo events use virtual credits only. Prizes have no cash value.</p></section>}
    {page==='Leaderboard'&&<section className="leaderboard-page"><div className="page-title-row"><div><span className="section-kicker">THE CLUB'S BEST</span><h1>Leaderboard</h1><p>Every clean shot counts.</p></div><span className="filter-pills"><button className="selected">This week</button><button onClick={()=>showToast('Leaderboard period changed to this month (demo).')}>This month</button><button onClick={()=>showToast('All-time leaderboard selected (demo).')}>All time</button></span></div><div className="podium">{leaderboard.slice(0,3).map((p,i)=><div className={`podium-player podium-${p.rank}`} key={p.name}><span className="podium-glow"/><span className="podium-avatar">{p.name[0]}</span><span className="podium-crown">{i===0?'✦':i===1?'✦':'✦'}</span><b>{p.name}</b><small>{p.rating.toLocaleString()} ELO</small><strong>{p.rank}</strong></div>)}</div><section className="content-card standings-card"><div className="card-heading"><div><span className="section-kicker">8-BALL · EAST AFRICA</span><h2>Weekly standings</h2></div><span className="refresh-label"><i/> Updated just now</span></div><div className="standings-table"><div className="standing-head"><span>RANK</span><span>PLAYER</span><span>RATING</span><span>MATCHES WON</span><span>WIN RATE</span></div>{leaderboard.map(p=><div className={`standing-row${p.name==='KimCue'?' own-standing':''}`} key={p.name}><span className="standing-rank">{p.rank<4?<span className={`rank-medal medal-${p.rank}`}>{p.rank}</span>:`#${p.rank}`}</span><span className="standing-player"><i>{p.name[0]}</i><b>{p.name}{p.name==='KimCue'&&<small>YOU</small>}</b><em>{p.country}</em></span><span className="standing-rating">{p.rating.toLocaleString()}</span><span className="standing-wins">{p.wins}</span><span className="standing-winrate">{p.winRate}<i><span style={{width:p.winRate}}/></i></span></div>)}</div></section><p className="demo-disclaimer">Demo rankings are sample data and don't represent live player results.</p></section>}
    {page==='Profile'&&<section className="profile-page"><div className="page-title-row"><div><span className="section-kicker">YOUR CLUB CARD</span><h1>Player profile</h1><p>Your stats, records, and rewards.</p></div><button className="outline-button" onClick={()=>setModal('account')}><Icon name="settings" size={15}/> Edit profile</button></div><section className="profile-banner"><div className="profile-big-avatar">{user==='Guest'?'G':user[0].toUpperCase()}<span>✦</span></div><div className="profile-identity"><span className="member-tag">CLUB MEMBER · ROOKIE</span><h2>{user==='Guest'?'Guest Player':user}</h2><p>🇰🇪 &nbsp; East Africa <i/> Member since November 2026</p></div><div className="profile-rating"><small>PLAYER RATING</small><b>1,240</b><span>PROVISIONAL</span></div></section><div className="profile-stat-grid"><div className="content-card profile-stat"><span className="profile-stat-icon"><Icon name="trophy"/></span><b>0</b><small>Matches won</small></div><div className="content-card profile-stat"><span className="profile-stat-icon"><Icon name="target"/></span><b>{shots}</b><small>Practice shots</small></div><div className="content-card profile-stat"><span className="profile-stat-icon"><Icon name="chart"/></span><b>—</b><small>Win rate</small></div><div className="content-card profile-stat"><span className="profile-stat-icon"><Icon name="wallet"/></span><b>{balance}</b><small>Demo credits</small></div></div><div className="lower-grid profile-lower"><section className="content-card"><div className="card-heading"><div><span className="section-kicker">RECENT ACTIVITY</span><h2>Match history</h2></div><span className="muted-copy">Last 30 days</span></div><div className="empty-history"><span><Icon name="clock" size={22}/></span><b>Your story starts here.</b><p>Play your first game to see it show up here.</p><button className="text-link" onClick={()=>setPage('Play')}>Find a game <Icon name="arrow" size={14}/></button></div></section><section className="content-card"><div className="card-heading"><div><span className="section-kicker">YOUR REWARDS</span><h2>Demo wallet</h2></div><span className="credit-coin">K</span></div><div className="wallet-balance">{balance}<small>CR</small></div><p className="muted-copy">Practice credits · No cash value</p><button className="outline-button full-width" disabled={bonusClaimed} onClick={claimDailyBonus}>{bonusClaimed?'Daily bonus claimed':'Claim daily practice bonus'} <Icon name="plus" size={14}/></button><div className="wallet-history"><span>{bonusClaimed?"Today's practice bonus":'Daily bonus available'}</span><b>+250 CR</b></div></section></div></section>}
    {page==='Admin'&&<section className="admin-page"><div className="page-title-row"><div><span className="section-kicker">CLUB CONTROL</span><h1>Administration</h1><p>Manage the demo club experience.</p></div><span className="admin-tag"><Icon name="settings" size={14}/> ADMIN PREVIEW</span></div><div className="admin-stats"><div className="content-card"><small>PLAYER ACCOUNTS</small><b>1,248</b><span>+8.2% this month</span></div><div className="content-card"><small>ACTIVE MATCHES</small><b>86</b><span>Across 42 tables</span></div><div className="content-card"><small>TOURNAMENTS</small><b>12</b><span>3 registering now</span></div><div className="content-card"><small>DEMO CREDITS ISSUED</small><b>2.4M</b><span>Virtual only</span></div></div><div className="lower-grid"><section className="content-card"><div className="card-heading"><div><span className="section-kicker">CLUB OPERATIONS</span><h2>Manage platform</h2></div></div>{[['Player management','Accounts, profiles & reports'],['Game management','Tables, matches & rules'],['Tournament management','Events, brackets & results'],['Rewards & settings','Demo credits & club settings']].map(([title,desc])=><button className="admin-action" key={title} onClick={()=>showToast(`${title} is a preview in this front-end demo.`)}><span><b>{title}</b><small>{desc}</small></span><Icon name="arrow" size={16}/></button>)}</section><section className="content-card"><div className="card-heading"><div><span className="section-kicker">PLATFORM STATUS</span><h2>Club health</h2></div></div><div className="health-row"><span><i/> Table service</span><b>Demo preview</b></div><div className="health-row"><span><i/> Player accounts</span><b>Not connected</b></div><div className="health-row"><span><i/> Match results</span><b>Local only</b></div><p className="muted-copy admin-note">Connect a secure backend before opening the club to real players.</p></section></div></section>}
    {page==='OnlineGame'&&<section className="practice-page online-game-page"><div className="page-title-row practice-title"><div><button className="back-link" onClick={leaveOnlineRoom}><Icon name="arrow" size={14}/> LEAVE MATCH</button><h1>Online 8-Ball</h1><p>Private room · {onlineGame.roomCode}</p></div><span className={`online-pill${onlineGame.connected?' connected':''}`}><i/> {onlineGame.connected?'SERVER CONNECTED':'RECONNECTING'}</span></div><div className="practice-layout"><div className="practice-main"><PoolTable balls={balls} setBalls={setBalls} aim={aim} setAim={setAim} power={power} shooting={shooting} setShooting={setShooting} shoot={shootOnline} serverDriven statusLabel={shooting?'BALLS IN MOTION':onlineGame.currentPlayerId===onlineGame.playerId?'YOUR TURN':'OPPONENT TURN'}/></div><aside className="game-side"><section className="content-card match-score"><span className="section-kicker">LIVE MATCH · ROOM {onlineGame.roomCode}</span><div className="match-players">{onlineGame.players.map(player=><div className="game-player" key={player.id}><span className={`game-avatar${player.id===onlineGame.currentPlayerId?' active-avatar':''}`}>{player.name.slice(0,1).toUpperCase()}</span><b>{player.id===onlineGame.playerId?'You':player.name}</b><small>{onlineGame.status==='finished'?(player.id===onlineGame.winner?'WINNER':'OPPONENT'):player.id===onlineGame.currentPlayerId?'AT THE TABLE':'WAITING'}</small></div>).reduce((items,player,index)=>index?[...items,<span className="match-vs" key="versus">VS</span>,player]:[player],[])}</div><div className="game-stats"><span><small>SHOTS</small><b>{onlineGame.shots}</b></span><span><small>GAME</small><b>8-Ball</b></span><span><small>TURN</small><b>{onlineGame.status==='moving'?'IN PLAY':onlineGame.status==='finished'?'OVER':onlineGame.currentPlayerId===onlineGame.playerId?'YOURS':'THEIRS'}</b></span></div></section><section className="content-card power-panel"><div className="power-heading"><span><span className="section-kicker">SHOT POWER</span><b>{power}<small>%</small></b></span><span className="power-icon">⌁</span></div><input aria-label="Shot power" type="range" min="10" max="100" value={power} onChange={e=>setPower(Number(e.target.value))}/><div className="power-labels"><span>SOFT</span><span>FULL</span></div><button className="button-primary full-width shoot-button" disabled={shooting||onlineGame.status!=='playing'||onlineGame.currentPlayerId!==onlineGame.playerId} onClick={shootOnline}><Icon name="target" size={16}/>{onlineGame.status==='finished'?'Game finished':onlineGame.currentPlayerId===onlineGame.playerId?'Take your shot':'Opponent’s turn'}</button><p className="control-hint">Server checks turn order and simulates every shot for both players.</p></section><section className="content-card table-rules"><span className="section-kicker">MATCH STATUS</span><div><span>Room</span><b>{onlineGame.roomCode}</b></div><div><span>Connection</span><b>{onlineGame.connected?'Online':'Reconnecting'}</b></div><div><span>Match winner</span><b>{onlineGame.winner?onlineGame.players.find(player=>player.id===onlineGame.winner)?.name||'Player':'—'}</b></div></section></aside></div></section>}
    {page==='Practice'&&<section className="practice-page"><div className="page-title-row practice-title"><div><button className="back-link" onClick={()=>setPage('Play')}><Icon name="arrow" size={14}/> GAME LOBBY</button><h1>Practice table</h1><p>Take your time. Every shot is a lesson.</p></div><button className="outline-button" onClick={()=>{setBalls(initialBalls.map(ball=>({...ball})));setShots(0);setShooting(false);showToast('Table re-racked. Your next break is ready.')}}><Icon name="target" size={15}/> Re-rack</button></div><div className="practice-layout"><div className="practice-main"><PoolTable balls={balls} setBalls={setBalls} aim={aim} setAim={setAim} power={power} shooting={shooting} setShooting={setShooting} shoot={shoot}/></div><aside className="game-side"><section className="content-card match-score"><span className="section-kicker">PRACTICE SESSION</span><div className="match-players"><div className="game-player"><span className="game-avatar active-avatar">{user==='Guest'?'G':user[0].toUpperCase()}</span><b>{user==='Guest'?'You':user}</b><small>AT THE TABLE</small></div><span className="match-vs">VS</span><div className="game-player"><span className="game-avatar bot-avatar">AI</span><b>Solo practice</b><small>NO OPPONENT</small></div></div><div className="game-stats"><span><small>SHOTS</small><b>{shots}</b></span><span><small>GAME</small><b>8-Ball</b></span><span><small>TIME</small><b>∞</b></span></div></section><section className="content-card power-panel"><div className="power-heading"><span><span className="section-kicker">SHOT POWER</span><b>{power}<small>%</small></b></span><span className="power-icon">⌁</span></div><input aria-label="Shot power" type="range" min="10" max="100" value={power} onChange={e=>setPower(Number(e.target.value))}/><div className="power-labels"><span>SOFT</span><span>FULL</span></div><button className="button-primary full-width shoot-button" disabled={shooting} onClick={shoot}><Icon name="target" size={16}/> Aim &amp; shoot</button><p className="control-hint">Hold the cue ball, pull back, then release to shoot. Pull farther for more power.</p></section><section className="content-card table-rules"><span className="section-kicker">TABLE RULES</span><div><span>Game type</span><b>8-Ball</b></div><div><span>Mode</span><b>Practice</b></div><div><span>Credits at stake</span><b>None</b></div></section></aside></div><p className="demo-disclaimer">Local practice preview · Ball physics and match outcomes are client-side only.</p></section>}
    <footer className="site-footer"><span>© 2026 KIM POOL CLUB</span><span>Made for the love of the game <b>·</b> DEMO MODE</span><button onClick={()=>setPage('Admin')}>Admin preview</button></footer>
   </main>
  </div>
  {toast&&<div className="toast" role="status"><span>✓</span>{toast}<button onClick={()=>setToast('')}><Icon name="close" size={15}/></button></div>}
  {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal('')}}><div className="modal-card"><button className="modal-close" onClick={()=>setModal('')} aria-label="Close"><Icon name="close"/></button>
   {modal==='room'&&<><span className="modal-icon"><Icon name="users" size={22}/></span><span className="section-kicker">YOUR PRIVATE TABLE</span><h2>Room for your crew.</h2><p>Create a live room and share its invite link, or join a friend's room code.</p><button className="button-primary full-width" onClick={createFriendInvite}>Create online room <Icon name="plus" size={15}/></button><div className="modal-separator"><span>OR JOIN WITH A CODE</span></div><form className="modal-form" onSubmit={e=>{e.preventDefault();if(!/^[A-F0-9]{6}$/.test(roomCode.trim())){showToast('Enter a six-character room code.');return}sendOnlineMessage('room:join',{roomCode:roomCode.trim(),name:user})}}><input aria-label="Room code" placeholder="Enter 6-character code" maxLength="6" value={roomCode} onChange={e=>setRoomCode(e.target.value.toUpperCase())}/><button className="outline-button">Join room <Icon name="arrow" size={14}/></button></form></>}
   {modal==='friend'&&<><span className="modal-icon"><Icon name="users" size={22}/></span><span className="section-kicker">BETTER WITH FRIENDS</span><h2>Bring your crew.</h2>{friendInviteCode?<><p>Share this room invite with a friend. The game starts when they join.</p><label className="invite-label" htmlFor="friend-invite-url">YOUR INVITE LINK</label><input id="friend-invite-url" className="invite-url-input" readOnly value={makeInviteUrl(friendInviteCode)} onFocus={e=>e.target.select()}/><div className="invite-actions"><button className="button-primary full-width" onClick={copyFriendInvite}>{inviteCopied?'Copied ✓':'Copy invite link'} <Icon name="arrow" size={15}/></button><button className="outline-button" onClick={shareFriendInvite} aria-label="Share invite link"><Icon name="users" size={15}/> Share</button></div>{onlineGame.players.length<2&&<p className="invite-note">Waiting for a friend to join room {friendInviteCode}…</p>}<p className="invite-note">{['localhost','127.0.0.1'].includes(window.location.hostname)?'Local preview: this link cannot be reached by friends. Publish the app and WebSocket server before sharing.':'This room uses the online game server. Both players need the public site URL.'}</p></>:<><p>Create a private online room. Your friend will need this site URL to join.</p><button className="button-primary full-width" onClick={createFriendInvite}>Create online room <Icon name="plus" size={15}/></button></>}</>}
   {modal==='incoming'&&<><span className="modal-icon"><Icon name="users" size={22}/></span><span className="section-kicker">YOU'RE INVITED</span><h2>Join the table.</h2><p>Your friend invited you to room <b className="invite-code">{friendInviteCode}</b>. Join to connect to their online table.</p><button className="button-primary full-width" onClick={joinFriendRoom}>Join online game <Icon name="arrow" size={15}/></button><p className="invite-note">Both players must be connected to the same published KIM POOL site.</p></>}
   {modal==='account'&&<><span className="modal-icon"><Icon name="user" size={22}/></span><span className="section-kicker">YOUR CLUB ID</span><h2>{user==='Guest'?'Join the club.':'Looking good, '+user.split(' ')[0]+'.'}</h2>{user==='Guest'?<><p>Create a demo profile to personalize your player card. No password is stored by this preview.</p><form className="account-form" onSubmit={register}><label>Player name<input required placeholder="e.g. CueMaster" value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})}/></label><label>Email address<input required type="email" placeholder="you@example.com" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})}/></label><button className="button-primary full-width">Create demo profile <Icon name="arrow" size={15}/></button></form></>:<><p>Your demo profile is ready. Account security and password recovery require a connected server.</p><button className="outline-button full-width" onClick={()=>{setUser('Guest');localStorage.removeItem('kimpool_name');setModal('');showToast('Signed out of your demo profile.')}}>Sign out</button></>}</>}
  </div></div>}
 </div>
}
export default App;

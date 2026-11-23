import {randomBytes,randomUUID} from 'node:crypto';
import {WebSocketServer,WebSocket} from 'ws';

const rooms=new Map();
const sockets=new Map();
const pockets=[[60,54],[500,54],[940,54],[60,466],[500,466],[940,466]];
const initialBalls=[
 {id:0,n:0,x:292,y:260},{id:1,n:1,x:682,y:260},{id:2,n:9,x:710,y:246},
 {id:3,n:2,x:710,y:274},{id:4,n:8,x:738,y:260},{id:5,n:3,x:738,y:232},
 {id:6,n:10,x:738,y:288},{id:7,n:4,x:766,y:218},{id:8,n:11,x:766,y:246},
 {id:9,n:5,x:766,y:274},{id:10,n:12,x:766,y:302},{id:11,n:6,x:794,y:204},
 {id:12,n:13,x:794,y:232},{id:13,n:7,x:794,y:260},{id:14,n:14,x:794,y:288},
 {id:15,n:15,x:794,y:316}
];

function send(socket,type,data={}){
 if(socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify({type,...data}));
}
function roomSnapshot(room){
 return {
  roomCode:room.code,
  status:room.status,
  players:[...room.players.values()].map(({id,name})=>({id,name})),
  currentPlayerId:room.currentPlayerId,
  winner:room.winner,
  groups:room.groups,
  shots:room.shots,
  foul:room.foul
 };
}
function gameSnapshot(room){
 return {
  roomCode:room.code,
  status:room.status,
  players:[...room.players.values()].map(({id,name})=>({id,name})),
  currentPlayerId:room.currentPlayerId,
  winner:room.winner,
  groups:room.groups,
  shots:room.shots,
  foul:room.foul,
  balls:room.balls.map(({id,n,x,y})=>({id,n,x,y}))
 };
}
function broadcastRoom(room){
 const message=JSON.stringify({type:'room:state',room:roomSnapshot(room)});
 for(const player of room.players.values())if(player.socket.readyState===WebSocket.OPEN)player.socket.send(message);
}
function broadcastGame(room){
 const message=JSON.stringify({type:'game:state',game:gameSnapshot(room)});
 for(const player of room.players.values())if(player.socket.readyState===WebSocket.OPEN)player.socket.send(message);
}
function fail(socket,message){
 send(socket,'error',{message});
}
function createCode(){
 let code;
 do{code=randomBytes(4).toString('hex').slice(0,6).toUpperCase()}while(rooms.has(code));
 return code;
}
function cleanName(value){
 if(typeof value!=='string')return 'Player';
 const name=value.replace(/[<>]/g,'').trim().slice(0,24);
 return name||'Player';
}
function assignRoom(socket,room){
 const player=sockets.get(socket);
 if(player.roomCode){
  fail(socket,'Leave your current room before joining another.');
  return null;
 }
 player.roomCode=room.code;
 room.players.set(player.id,{...player,socket});
 return player;
}
function createRoom(socket,name){
 const player=sockets.get(socket);
 if(player.roomCode){fail(socket,'Leave your current room before creating another.');return}
 const code=createCode();
 const room={code,status:'waiting',players:new Map(),balls:initialBalls.map(ball=>({...ball})),groups:{},currentPlayerId:null,winner:null,shots:0,turnPlayerId:null,interval:null,potted:new Set(),shotPlayerId:null,foul:null};
 rooms.set(code,room);
 assignRoom(socket,room);
 send(socket,'room:created',{roomCode:code,playerId:player.id});
 broadcastRoom(room);
}
function joinRoom(socket,rawCode,name){
 const code=typeof rawCode==='string'?rawCode.trim().toUpperCase():'';
 if(!/^[A-F0-9]{6}$/.test(code)){fail(socket,'Enter a valid six-character invite code.');return}
 const room=rooms.get(code);
 if(!room){fail(socket,'That room was not found. Ask your friend to create a new invite.');return}
 if(room.status!=='waiting'||room.players.size>=2){fail(socket,'That room is already full or the game has started.');return}
 const player=assignRoom(socket,room);
 if(!player)return;
 room.status='playing';
 room.currentPlayerId=[...room.players.keys()][0];
 room.turnPlayerId=room.currentPlayerId;
 send(socket,'room:joined',{roomCode:code,playerId:player.id});
 broadcastRoom(room);
 broadcastGame(room);
}
function completeShot(room){
 if(room.status!=='moving')return;
 room.status='playing';
 const shooter=room.shotPlayerId;
 const cueStillThere=room.balls.some(ball=>ball.id===0);
 const potted=[...room.potted];
 const eightPotted=potted.some(id=>initialBalls.find(ball=>ball.id===id)?.n===8);
 const cuePotted=!cueStillThere;
 room.foul=cuePotted?{playerId:shooter,playerName:room.players.get(shooter)?.name||'Player',reason:'Cue ball pocketed'}:null;
 if(eightPotted){
  const ownGroup=room.groups[shooter];
  const remainingOwn=ownGroup&&room.balls.some(ball=>ownGroup==='solids'?ball.n>=1&&ball.n<=7:ball.n>=9&&ball.n<=15);
  room.winner=remainingOwn||cuePotted?([...room.players.keys()].find(id=>id!==shooter)||null):shooter;
  room.status='finished';
 }else{
  const firstGroupBall=potted.find(id=>{
   const number=initialBalls.find(ball=>ball.id===id)?.n;
   return number!==undefined&&number!==0&&number!==8;
  });
  if(firstGroupBall&&!room.groups[shooter]){
   const pottedNumber=initialBalls.find(item=>item.id===firstGroupBall)?.n;
   const group=pottedNumber<=7?'solids':'stripes';
   room.groups[shooter]=group;
   const opponent=[...room.players.keys()].find(id=>id!==shooter);
   if(opponent)room.groups[opponent]=group==='solids'?'stripes':'solids';
  }
  const shotGroup=room.groups[shooter];
  const keptTurn=!cuePotted&&potted.some(id=>{
   const number=initialBalls.find(item=>item.id===id)?.n;
   return shotGroup==='solids'?number>=1&&number<=7:shotGroup==='stripes'?number>=9&&number<=15:false;
  });
  if(!keptTurn)room.currentPlayerId=[...room.players.keys()].find(id=>id!==shooter)||shooter;
  if(cuePotted)room.balls.push({id:0,n:0,x:292,y:260});
 }
 room.turnPlayerId=room.currentPlayerId;
 room.shotPlayerId=null;
 room.potted.clear();
 broadcastGame(room);
 broadcastRoom(room);
}
function simulate(room){
 let moving=false;
 const balls=room.balls;
 for(let substep=0;substep<2;substep++){
  for(const ball of balls){
   if(!ball.vx&&!ball.vy)continue;
   ball.x+=ball.vx*.5;ball.y+=ball.vy*.5;
   ball.vx*=.994;ball.vy*=.994;
   if(ball.x<74||ball.x>926){ball.x=Math.max(74,Math.min(926,ball.x));ball.vx*=-.88}
   if(ball.y<68||ball.y>452){ball.y=Math.max(68,Math.min(452,ball.y));ball.vy*=-.88}
   if(Math.hypot(ball.vx,ball.vy)<.035){ball.vx=0;ball.vy=0}
  }
  for(let i=0;i<balls.length;i++)for(let j=i+1;j<balls.length;j++){
   const a=balls[i],b=balls[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=28;
   if(d>0&&d<min){
    const nx=dx/d,ny=dy/d,overlap=(min-d)/2;
    a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
    const closingSpeed=((a.vx||0)-(b.vx||0))*nx+((a.vy||0)-(b.vy||0))*ny;
    if(closingSpeed>0){
     const impact=closingSpeed*.99;
     a.vx=(a.vx||0)-impact*nx;a.vy=(a.vy||0)-impact*ny;
     b.vx=(b.vx||0)+impact*nx;b.vy=(b.vy||0)+impact*ny;
    }
   }
  }
 }
 moving=balls.some(ball=>Math.hypot(ball.vx||0,ball.vy||0)>=.035);
 room.balls=balls.filter(ball=>{
  const pocketed=pockets.some(([x,y])=>Math.hypot(ball.x-x,ball.y-y)<32);
  if(pocketed)room.potted.add(ball.id);
  return !pocketed;
 });
 return moving;
}
function takeShot(socket,message){
 const player=sockets.get(socket);
 const room=player?.roomCode&&rooms.get(player.roomCode);
 if(!room||room.status!=='playing'){fail(socket,'There is no active game for this player.');return}
 if(room.currentPlayerId!==player.id){fail(socket,'It is not your turn.');return}
 const angle=Number(message.angle),power=Number(message.power);
 if(typeof message.angle!=='number'||typeof message.power!=='number'||!Number.isFinite(angle)||!Number.isFinite(power)||Math.abs(angle)>Math.PI||power<10||power>100){fail(socket,'Invalid shot angle or power.');return}
 const cue=room.balls.find(ball=>ball.id===0);
 if(!cue){fail(socket,'Cue ball is unavailable.');return}
 const speed=5.2+power*.24;
 cue.vx=Math.cos(angle)*speed;cue.vy=Math.sin(angle)*speed;
 room.status='moving';room.shots++;room.shotPlayerId=player.id;room.potted.clear();room.foul=null;
 broadcastGame(room);broadcastRoom(room);
 let frames=0;
 room.interval=setInterval(()=>{
  frames++;
  const moving=simulate(room);
  if(frames%3===0)broadcastGame(room);
  if(!moving||frames>=900){
   clearInterval(room.interval);room.interval=null;broadcastGame(room);completeShot(room);
  }
 },16);
}
function leaveRoom(socket){
 const player=sockets.get(socket);
 if(!player?.roomCode)return;
 const room=rooms.get(player.roomCode);
 player.roomCode='';
 if(!room)return;
 room.players.delete(player.id);
 if(room.interval){clearInterval(room.interval);room.interval=null}
 if(room.players.size===0)rooms.delete(room.code);
 else{
  room.status='waiting';room.currentPlayerId=null;room.turnPlayerId=null;
  room.groups={};room.balls=initialBalls.map(ball=>({...ball}));room.shots=0;room.winner=null;room.foul=null;
  broadcastRoom(room);
 }
}

export function attachGameWebSocketServer(server,path){
 const websocketServer=new WebSocketServer({server,...(path?{path}:{}),maxPayload:8192});
 websocketServer.on('connection',socket=>{
  const player={id:randomUUID(),name:'Player',roomCode:''};
  sockets.set(socket,player);
  send(socket,'connected',{playerId:player.id});
  socket.on('message',buffer=>{
   let message;
   try{message=JSON.parse(buffer.toString())}
   catch{fail(socket,'Send a valid JSON message.');return}
   if(!message||typeof message.type!=='string'){fail(socket,'Message type is required.');return}
   if(message.type==='room:create'){player.name=cleanName(message.name);createRoom(socket,player.name);return}
   if(message.type==='room:join'){player.name=cleanName(message.name);joinRoom(socket,message.roomCode,player.name);return}
   if(message.type==='shot'){takeShot(socket,message);return}
   if(message.type==='room:leave'){leaveRoom(socket);send(socket,'room:left');return}
   fail(socket,'Unknown message type.');
  });
  socket.on('close',()=>{leaveRoom(socket);sockets.delete(socket)});
  socket.on('error',()=>{leaveRoom(socket);sockets.delete(socket)});
 });
 return websocketServer;
}

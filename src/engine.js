const G=['#7b4a26','#b3261e','#c05600','#8a6d00','#2e7d32','#00695c','#1f4fbf','#5e35b1'];
const S_=(n,p,g,sn)=>({k:'s',n,p,g,sn:sn||n});
const PK=(n,sn)=>({k:'park',n,p:200,sn});
const CD={k:'card',n:'뽑기',d:'카드 한 장'};
const T=[
 {k:'start',n:'입구',d:'지나면 보너스'},
 S_('붕어빵',60,0),CD,S_('호떡',60,0),{k:'tax',n:'자릿세',amt:100,d:'-100냥'},PK('북문 주차장','북문P'),S_('어묵',100,1),CD,S_('계란빵',100,1),S_('꽈배기',120,1),
 {k:'jail',n:'단속반',d:'구경만 해요'},
 S_('떡볶이',140,2),{k:'busk',n:'버스킹',d:'모두에게 20씩'},S_('순대',140,2),S_('튀김',160,2),PK('동문 주차장','동문P'),S_('김밥',180,3),CD,S_('핫바',180,3),S_('소떡소떡',200,3,'소떡'),
 {k:'rest',n:'분수광장',d:'쉬어가기'},
 S_('닭꼬치',220,4),CD,S_('핫도그',220,4),S_('회오리감자',240,4,'회오리'),PK('남문 주차장','남문P'),S_('군고구마',260,5,'고구마'),S_('츄러스',260,5),{k:'tax',n:'전기세',amt:150,d:'-150냥'},S_('와플',280,5),
 {k:'gojail',n:'단속 걸림',d:'단속반으로 · 한 턴 쉼'},
 S_('탕후루',300,6),S_('버블티',300,6),CD,S_('크레페',320,6),PK('서문 주차장','서문P'),CD,S_('타코야끼',350,7,'타코'),{k:'tax',n:'가스비',amt:120,d:'-120냥'},S_('스테이크 큐브',400,7,'스테이크')
];
const CARDS=[
 {t:'SNS에서 맛집으로 소문났어요! +120',m:120},
 {t:'야시장 축제 특수! +150',m:150},
 {t:'재료를 도매가로 샀어요. +80',m:80},
 {t:'단골손님 생일! 모두에게 30씩 받기',all:30},
 {t:'입구로 이동해요',go:0},
 {t:'앞으로 3칸',step:3},
 {t:'비가 와서 장사를 공쳤어요. -80',m:-80},
 {t:'냉장고가 고장 났어요. -120',m:-120},
 {t:'탕후루 먹다 이가 깨졌어요. 치과비 -100',m:-100},
 {t:'위생 점검! 내 노점 하나당 30씩 내요',inspect:30},
 {t:'단속반에 걸렸어요. 한 턴 쉼',jail:true},
 {t:'뒤로 3칸',step:-3},
 {t:'분수광장으로 산책 가요',go:20}
];
const N=T.length;
const CFG={start:1500,orderBonus:100,pass:200,rentMult:1.0,rounds:15,takeMult:1.5,parkRent:[25,50,100,200],exCost:.5,exMult:[1,1.5,2,2.5],exMax:3};
const UNIT='냥';
const GN=['갈색','빨강','주황','겨자','초록','청록','파랑','보라'];
const TURN_SEC=30;

function newGame(code){return {code,phase:'lobby',players:[],turn:0,round:1,owners:Array(N).fill(-1),lv:Array(N).fill(0),dice:[0,0],seq:0,stage:'roll',msg:'',log:[],card:''};}
function groupTiles(g){const a=[];T.forEach((t,j)=>{if(t.k==='s'&&t.g===g)a.push(j)});return a;}
function setOwned(s,g,o){return o>=0&&groupTiles(g).every(j=>s.owners[j]===o);}
function parksOf(s,o){let n=0;T.forEach((t,j)=>{if(t.k==='park'&&s.owners[j]===o)n++});return n;}
function rent(s,pos){const t=T[pos],o=s.owners[pos];
  if(t.k==='park')return CFG.parkRent[Math.max(0,parksOf(s,o)-1)];
  const m=setOwned(s,t.g,o)?2:1;
  return Math.round(t.p*CFG.rentMult*m*CFG.exMult[lvOf(s,pos)]/10)*10;}
function lvOf(s,j){return (s&&s.lv&&s.lv[j])||0;}
function exCost(j){return Math.round(T[j].p*CFG.exCost/10)*10;}
function takePrice(pos,s){return Math.round((T[pos].p+exCost(pos)*lvOf(s,pos))*CFG.takeMult/10)*10;}
function canExpand(s,i,j){return T[j].k==='s'&&s.owners[j]===i&&lvOf(s,j)<CFG.exMax&&s.players[i].money>=exCost(j);}
function expandable(s,i){const a=[];T.forEach((t,j)=>{if(canExpand(s,i,j))a.push(j)});return a;}
function stallsOf(s,i){return s.owners.filter(o=>o===i).length;}
function addLog(s,t){s.log.unshift(t);s.log=s.log.slice(0,6);s.msg=t;}
function alive(s){return s.players.filter(p=>!p.out);}
function worth(s,i){let w=s.players[i].money;s.owners.forEach((o,j)=>{if(o===i)w+=T[j].p+exCost(j)*lvOf(s,j)});return w;}
function checkOver(s){const al=alive(s);if(s.phase==='play'&&al.length<=1){s.phase='over';s.winner=al.length?s.players.indexOf(al[0]):-1;s.endReason='bankrupt';}}
function goBroke(s,i,why){const p=s.players[i];p.money=0;p.out=true;if(s.lv)s.owners.forEach((o,j)=>{if(o===i)s.lv[j]=0});s.owners=s.owners.map(o=>o===i?-1:o);addLog(s,`${p.name} ${why}`);checkOver(s);}
function pay(s,from,to,amt){const a=s.players[from];if(a.out)return;const paid=Math.min(amt,a.money);a.money-=amt;
  if(to>=0)s.players[to].money+=paid;if(a.money<0)goBroke(s,from,'파산! 가게를 모두 내놓았어요');}
function moveBy(s,i,steps){const p=s.players[i];if(steps>0&&p.pos+steps>=N){p.money+=CFG.pass;s.exPend=true;addLog(s,`${p.name}: 입구 통과 +${CFG.pass}`);}p.pos=((p.pos+steps)%N+N)%N;}
function land(s,depth){const i=s.turn,p=s.players[i],t=T[p.pos];s.stage='end';
  switch(t.k){
  case 's':case 'park':{const o=s.owners[p.pos];
    if(o<0){if(p.money>=t.p){s.stage='buy';addLog(s,`${p.name}: ${t.n} 자리가 비어 있어요`);}else addLog(s,`${p.name}: ${t.n}을(를) 살 돈이 부족해요`);}
    else if(o===i){if(canExpand(s,i,p.pos)){s.stage='expand';s.exTarget=p.pos;s.exPend=false;addLog(s,`${p.name}: 내 가게 ${t.n}에 도착! 확장할 수 있어요`);}
      else addLog(s,`${p.name}: 내 가게 ${t.n}에 들렀어요`+(lvOf(s,p.pos)>=CFG.exMax?' (명물 가게)':''));}
    else{const r=rent(s,p.pos);addLog(s,`${p.name} → ${s.players[o].name}: ${t.n} 이용료 ${r}${UNIT}`);pay(s,i,o,r);
      if(t.k==='s'&&!p.out&&!s.players[o].out&&!setOwned(s,t.g,o)&&lvOf(s,p.pos)<CFG.exMax&&p.money>=takePrice(p.pos,s))s.stage='take';}
    break;}
  case 'card':{const c=CARDS[Math.floor(Math.random()*CARDS.length)];s.card=c.t;addLog(s,`${p.name} 뽑기: ${c.t}`);
    if(c.m>0)p.money+=c.m;else if(c.m<0)pay(s,i,-1,-c.m);
    if(c.inspect){const n=T.reduce((a,x,j)=>a+(x.k==='s'&&s.owners[j]===i?1:0),0);if(n)pay(s,i,-1,n*c.inspect);addLog(s,`${p.name}: 위생 점검으로 ${n*c.inspect}${UNIT} 냈어요`);}
    if(c.all)s.players.forEach((q,j)=>{if(j!==i&&!q.out)pay(s,j,i,c.all)});
    if(c.jail){p.pos=10;p.skip=true;}
    if(c.step!=null){moveBy(s,i,c.step);if(!depth&&!p.out)return land(s,1);}
    if(c.go!=null){moveBy(s,i,(c.go-p.pos+N)%N||N);if(!depth&&!p.out)return land(s,1);}
    break;}
  case 'tax':addLog(s,`${p.name}: ${t.n} ${t.amt}${UNIT} 냈어요`);pay(s,i,-1,t.amt);break;
  case 'gojail':p.pos=10;p.skip=true;addLog(s,`${p.name}: 단속에 걸려 단속반으로! 다음 턴은 쉬어요`);break;
  case 'jail':addLog(s,`${p.name}: 단속반을 구경만 해요`);break;
  case 'busk':{let n=0;s.players.forEach((q,j)=>{if(j!==i&&!q.out){pay(s,j,i,20);n++}});addLog(s,`${p.name}: 버스킹 공연으로 ${n*20}${UNIT} 모았어요`);break;}
  case 'rest':addLog(s,`${p.name}: 분수광장에서 쉬어가요`);break;
  case 'start':addLog(s,`${p.name}: 입구에 도착`);break;}
}
function finish(s){s.phase='over';s.endReason=s.endReason||'rounds';let best=-1,bw=-1;s.players.forEach((p,i)=>{if(!p.out){const w=worth(s,i);if(w>bw){bw=w;best=i}}});s.winner=best;}
function nextTurn(s){if(s.phase!=='play')return;const n=s.players.length,prev=s.turn;let k=0;
  do{s.turn=(s.turn+1)%n;k++}while(s.players[s.turn].out&&k<=n);
  if(s.turn<=prev){s.round++;if(s.round>CFG.rounds){s.round=CFG.rounds;s.endReason='rounds';finish(s);addLog(s,`${CFG.rounds}라운드 종료! 자산이 가장 많은 사람이 이겨요`);return;}}
  s.stage='roll';s.card='';s.dbl=0;s.extra=false;s.lastDbl=0;s.exPend=false;s.exTarget=null;const p=s.players[s.turn];s.msg=p.skip?`${p.name} 차례 (이번엔 쉬어요)`:`${p.name} 차례예요`;}
function afterAct(s){if(s.phase==='play'&&s.stage==='end'&&s.extra){const p=s.players[s.turn];s.extra=false;
  if(p.out||p.skip){s.dbl=0;return;}s.stage='roll';s.card='';s.msg=`${p.name}: 더블! 한 번 더 굴려요`+(s.dbl>=2?' (한 번 더 나오면 단속!)':'');}}
function resolvePend(s){if(s.phase!=='play'||s.stage!=='end'||!s.exPend)return;s.exPend=false;const p=s.players[s.turn];if(p.out)return;
  if(expandable(s,s.turn).length){s.stage='expandAny';s.msg=`${p.name}: 입구 통과 보너스! 확장할 노점을 하나 골라요`;}}
function apply(s,a){const r=apply0(s,a);if(r){resolvePend(s);afterAct(s);}return r;}
function apply0(s,a){if(s.phase!=='play')return false;const i=s.turn,p=s.players[i];
  if(typeof a==='string'&&a.indexOf('ex:')===0&&(s.stage==='expand'||s.stage==='expandAny')){const j=parseInt(a.slice(3),10);
    if(!(j>=0&&j<N)||(s.stage==='expand'&&j!==s.exTarget)||!canExpand(s,i,j))return false;
    p.money-=exCost(j);s.lv[j]=lvOf(s,j)+1;const L=s.lv[j];
    addLog(s,`${p.name}: ${T[j].n} 확장! ${L>=CFG.exMax?'명물 가게가 됐어요 (인수 불가)':L+'단계'} · 이용료 ${rent(s,j)}${UNIT}`);s.stage='end';s.exTarget=null;return true;}
  if(a==='pass'&&(s.stage==='expand'||s.stage==='expandAny')){addLog(s,`${p.name}: 확장하지 않았어요`);s.stage='end';s.exTarget=null;return true;}
  if(a==='roll'&&s.stage==='roll'){s.seq++;s.card='';s.lastDbl=0;s.exPend=false;
    if(p.skip){p.skip=false;s.dice=[0,0];s.dbl=0;addLog(s,`${p.name}: 이번 턴은 쉬어요`);s.stage='end';return true;}
    const d1=1+Math.floor(Math.random()*6),d2=1+Math.floor(Math.random()*6);s.dice=[d1,d2];
    if(d1===d2){s.dbl=(s.dbl||0)+1;s.lastDbl=s.dbl;
      if(s.dbl>=3){p.pos=10;p.skip=true;s.dbl=0;s.extra=false;s.stage='end';addLog(s,`${p.name}: 더블 3번! 단속반으로 끌려가 다음 턴은 쉬어요`);return true;}
      addLog(s,`${p.name}: 더블! (${d1}·${d2})`);}
    else s.dbl=0;
    moveBy(s,i,d1+d2);land(s,0);
    s.extra=d1===d2&&!p.out&&!p.skip&&s.phase==='play';
    return true;}
  if(a==='buy'&&s.stage==='buy'){const t=T[p.pos];
    if(p.money>=t.p&&s.owners[p.pos]<0){p.money-=t.p;s.owners[p.pos]=i;
      addLog(s,`${p.name}: ${t.n} 샀어요`+(t.k==='s'&&setOwned(s,t.g,i)?' · 세트 완성, 이용료 2배!':''));}
    s.stage='end';return true;}
  if(a==='take'&&s.stage==='take'){const t=T[p.pos],o=s.owners[p.pos],pr=takePrice(p.pos,s);
    if(o>=0&&o!==i&&p.money>=pr&&!setOwned(s,t.g,o)&&lvOf(s,p.pos)<CFG.exMax){p.money-=pr;s.players[o].money+=pr;s.owners[p.pos]=i;
      addLog(s,`${p.name}: ${s.players[o].name}의 ${t.n}을(를) ${pr}${UNIT}에 인수!`+(setOwned(s,t.g,i)?' · 세트 완성!':''));}
    s.stage='end';return true;}
  if(a==='pass'&&(s.stage==='buy'||s.stage==='take')){addLog(s,`${p.name}: 그냥 지나가요`);s.stage='end';return true;}
  if(a==='end'&&s.stage==='end'){nextTurn(s);return true;}
  return false;}
function startGame(s){const r6=()=>1+Math.floor(Math.random()*6);
  const rl=s.players.map(p=>({p,d:[r6(),r6()],t:Math.random()}));
  const sorted=rl.slice().sort((a,b)=>(b.d[0]+b.d[1])-(a.d[0]+a.d[1])||a.t-b.t);const ps=sorted.map(x=>x.p);
  const cmap={};s.players.forEach((p,i)=>cmap[p.id]=i);
  s.players=ps.map((p,i)=>({id:p.id,name:p.name,c:(p.ch!=null?p.ch:cmap[p.id]),pos:0,money:CFG.start+i*CFG.orderBonus,skip:false,out:false}));
  s.ord=rl.map(x=>({i:sorted.indexOf(x),d:x.d}));s.gid=Math.random().toString(36).slice(2,8);
  s.owners=Array(N).fill(-1);s.lv=Array(N).fill(0);s.exPend=false;s.exTarget=null;s.phase='play';s.turn=0;s.round=1;s.stage='roll';s.seq=0;s.dice=[0,0];s.log=[];s.card='';s.winner=null;s.endReason=null;s.dbl=0;s.extra=false;s.lastDbl=0;
  addLog(s,`선 뽑기: ${s.players.map((p,k)=>p.name+'('+(sorted[k].d[0]+sorted[k].d[1])+')').join(' → ')}. 뒤 순서일수록 시작 자금 +${CFG.orderBonus}`);}
function forfeit(s,i){if(s.players[i].out)return;goBroke(s,i,'님이 나가서 기권 처리됐어요');if(s.phase==='play'&&s.turn===i){s.stage='end';nextTurn(s);}}

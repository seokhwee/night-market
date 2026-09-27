const G=['#6e4c33','#9d3a34','#a3591d','#756115','#3a713d','#105950','#3759a7','#64489e'];
const S_=(n,p,g,sn)=>({k:'s',n,p,g,sn:sn||n});
const PK=(n,sn)=>({k:'park',n,p:200,sn});
const CD={k:'card',n:'뽑기',d:'카드 한 장'};
const T=[
 {k:'start',n:'입구',d:'지나면 보너스'},
 S_('붕어빵',60,0),CD,S_('호떡',60,0),{k:'tax',n:'자릿세',amt:100,d:'-100냥'},PK('북문 주차장','북문P'),S_('어묵',100,1),CD,S_('계란빵',100,1),S_('꽈배기',120,1),
 {k:'jail',n:'단속반',d:'들어오면 한 턴 쉼'},
 S_('떡볶이',140,2),{k:'busk',n:'버스킹',d:'모두에게 20씩'},S_('순대',140,2),S_('튀김',160,2),PK('동문 주차장','동문P'),S_('김밥',180,3),CD,S_('핫바',180,3),S_('소떡소떡',200,3,'소떡'),
 {k:'rest',n:'분수광장',d:'세금 환급'},
 S_('닭꼬치',220,4),{k:'coin',n:'동전 던지기',d:'2배·3배·5배'},S_('핫도그',220,4),S_('회오리감자',240,4,'회오리'),PK('남문 주차장','남문P'),S_('군고구마',260,5,'고구마'),S_('츄러스',260,5),{k:'tax',n:'전기세',amt:150,d:'-150냥'},S_('와플',280,5),
 {k:'travel',n:'맛집탐방',d:'원하는 칸으로'},
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
 {t:'분수광장으로 산책 가요',go:20},
 {t:'맛집탐방 칸으로 순간이동!',tp:30}
];
const N=T.length;
const CFG={coinBets:[100,200,300],coinMult:[2,3,5],sellMult:.5,start:1500,orderBonus:100,pass:200,rentMult:1.0,rounds:100,takeMult:1.5,parkRent:[150,300,450,700],exCost:.5,exMult:[1,1.5,2,2.5],exMax:3,loanRate:.2,sellSec:120};
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
/* 바퀴에 따른 건설 한도: 1바퀴 땅만 · 2바퀴 ★1까지 · 3바퀴부터 ★★까지. ★★★(명물)은 ★★ 가게를 다시 밟아 올릴 때만 */
function lapOf(s,i){return (s.players[i]&&s.players[i].lap)||1;}
function lapCap(s,i){const l=lapOf(s,i);return l<=1?0:l===2?1:2;}
function buildCost(j,from,to){return exCost(j)*Math.max(0,to-from);}
function exOptions(s,i,j){if(T[j].k!=='s'||s.owners[j]!==i)return [];const lv=lvOf(s,j),cap=lapCap(s,i),m=s.players[i].money,out=[];
  if(lv>=2){if(lv<CFG.exMax&&m>=buildCost(j,lv,3))out.push(3);return out;}
  for(let L=lv+1;L<=cap;L++)if(m>=buildCost(j,lv,L))out.push(L);return out;}
function buyOptions(s,i,j){const t=T[j],m=s.players[i].money,out=[];if(m<t.p)return out;out.push(0);if(t.k!=='s')return out;
  for(let L=1;L<=lapCap(s,i);L++)if(m>=t.p+buildCost(j,0,L))out.push(L);return out;}
function takeOptions(s,i,j){const lv=lvOf(s,j),pr=takePrice(j,s),m=s.players[i].money,out=[];if(m<pr)return out;out.push(lv);
  for(let L=lv+1;L<=Math.min(2,lapCap(s,i));L++)if(m>=pr+buildCost(j,lv,L))out.push(L);return out;}
function expandable(s,i){const a=[];T.forEach((t,j)=>{if(canExpand(s,i,j))a.push(j)});return a;}
function stallsOf(s,i){return s.owners.filter(o=>o===i).length;}
function addLog(s,t){s.log.unshift(t);s.log=s.log.slice(0,6);s.msg=t;}
function alive(s){return s.players.filter(p=>!p.out);}
/* 은행 대출: 한 사람당 한 게임에 한 번, 모자란 만큼 받고 갚지 않아도 돼요 */
function takeLoan(s,d,auto){const p=s.players[d],amt=owed(s,d);if(p.loanUsed||amt<=0)return false;p.loanUsed=true;p.money+=amt;tx(s,-1,d,amt);
  addLog(s,`${p.name}: 은행 대출 ${amt}${UNIT}${auto?' (시간이 지나 자동)':''} · 갚지 않아도 돼요`);return true;}
/* 빚: {from 낼 사람, to 받을 사람(-1이면 분수광장), amt} */
function debtorOf(s){return s.stage==='sell'&&s.debtor!=null?s.debtor:s.turn;}
function owed(s,d){if(d==null)d=debtorOf(s);return (s.owe||[]).filter(o=>o.from===d).reduce((a,o)=>a+o.amt,0);}
function worth(s,i){let w=s.players[i].money-owed(s,i);s.owners.forEach((o,j)=>{if(o===i)w+=T[j].p+exCost(j)*lvOf(s,j)});return w;}
function checkOver(s){const al=alive(s);if(s.phase==='play'&&al.length<=1){s.phase='over';s.winner=al.length?s.players.indexOf(al[0]):-1;s.endReason='bankrupt';}}
function goBroke(s,i,why){const p=s.players[i];p.money=0;p.out=true;if(s.lv)s.owners.forEach((o,j)=>{if(o===i)s.lv[j]=0});s.owners=s.owners.map(o=>o===i?-1:o);addLog(s,`${p.name} ${why}`);checkOver(s);}
function sellValue(s,j){return Math.round((T[j].p+(T[j].k==='s'?exCost(j)*lvOf(s,j):0))*CFG.sellMult/10)*10;}
function sellable(s,i){const a=[];s.owners.forEach((o,j)=>{if(o===i)a.push(j)});return a;}
function assetValue(s,i){return sellable(s,i).reduce((a,j)=>a+sellValue(s,j),0);}
function tx(s,f,t,a){if(!(a>0))return;s.txn=(s.txn||0)+1;s.tx=(s.tx||[]).concat([{n:s.txn,f,t,a}]).slice(-8);}
function sellTile(s,i,j){const p=s.players[i];const v=sellValue(s,j);p.money+=v;tx(s,-1,i,v);s.owners[j]=-1;if(s.lv)s.lv[j]=0;return v;}
function credit(s,from,to,x){if(!(x>0))return;if(to<0)s.pot=(s.pot||0)+x;else if(s.players[to])s.players[to].money+=x;tx(s,from,to<0?-2:to,x);}
function settleOwe(s,d){const p=s.players[d];for(const o of (s.owe||[])){if(o.from!==d||o.amt<=0)continue;if(p.money<=0)break;const x=Math.min(o.amt,p.money);p.money-=x;credit(s,d,o.to,x);o.amt-=x;}
  s.owe=(s.owe||[]).filter(o=>o.amt>0);}
/* 돈이 모자라면 가진 현금을 먼저 내고, 나머지는 빚으로 남겨 그 사람이 직접 해결해요 (차례가 아니어도) */
function pay(s,from,to,amt){const a=s.players[from];if(a.out||!(amt>0))return;
  if(a.money>=amt||s.phase!=='play'){const x=Math.min(amt,Math.max(0,a.money));a.money-=x;credit(s,from,to,x);return;}
  const paid=Math.max(0,a.money);a.money=0;credit(s,from,to,paid);s.owe=s.owe||[];s.owe.push({from,to,amt:amt-paid});}
/* 파산: 못 낸 돈은 은행이 대신 채워 받을 사람에게 전액 주고, 파산한 사람의 가게는 모두 빈 땅이 돼요 */
function bankrupt(s,d,why){(s.owe||[]).filter(o=>o.from===d).forEach(o=>{if(o.to<0)s.pot=(s.pot||0)+o.amt;else if(s.players[o.to]&&!s.players[o.to].out)s.players[o.to].money+=o.amt;tx(s,-1,o.to<0?-2:o.to,o.amt);});
  s.owe=(s.owe||[]).filter(o=>o.from!==d&&o.to!==d);goBroke(s,d,why);}
function moveBy(s,i,steps){const p=s.players[i];if(steps>0&&p.pos+steps>=N){p.money+=CFG.pass;tx(s,-1,i,CFG.pass);p.lap=(p.lap||1)+1;addLog(s,`${p.name}: 입구 통과 +${CFG.pass} · ${p.lap}바퀴째`);
}p.pos=((p.pos+steps)%N+N)%N;}
function land(s,depth){const i=s.turn,p=s.players[i],t=T[p.pos];s.stage='end';
  switch(t.k){
  case 's':case 'park':{const o=s.owners[p.pos];
    if(o<0){if(p.money>=t.p){s.stage='buy';addLog(s,`${p.name}: ${t.n} 자리가 비어 있어요`+(t.k==='s'&&lapCap(s,i)?` (★${lapCap(s,i)}까지 지을 수 있어요)`:''));}else addLog(s,`${p.name}: ${t.n}을(를) 살 돈이 부족해요`);}
    else if(o===i){if(exOptions(s,i,p.pos).length){s.stage='expand';s.exTarget=p.pos;addLog(s,`${p.name}: 내 가게 ${t.n}에 도착! 확장할 수 있어요`);}
      else addLog(s,`${p.name}: 내 가게 ${t.n}에 들렀어요`+(lvOf(s,p.pos)>=CFG.exMax?' (명물 가게)':''));}
    else{const r=rent(s,p.pos);addLog(s,`${p.name} → ${s.players[o].name}: ${t.n} 이용료 ${r}${UNIT}`);pay(s,i,o,r);
      if(t.k==='s'&&!p.out&&!s.players[o].out&&!setOwned(s,t.g,o)&&lvOf(s,p.pos)<CFG.exMax&&p.money>=takePrice(p.pos,s))s.stage='take';}
    break;}
  case 'card':s.stage='draw';s.drawDepth=depth||0;s.card='';addLog(s,`${p.name}: 뽑기 칸! 제비를 하나 뽑아요`);break;
  case 'tax':addLog(s,`${p.name}: ${t.n} ${t.amt}${UNIT} 냈어요`);pay(s,i,-1,t.amt);break;
  case 'jail':jail(s,i,10);addLog(s,`${p.name}: 단속반에 들어왔어요! 다음 턴은 쉬어요`);break;
  case 'travel':p.tour=true;addLog(s,`${p.name}: 맛집탐방 도착! 다음 차례에 원하는 칸으로 갈 수 있어요`);break;
  case 'busk':{let n=0;s.players.forEach((q,j)=>{if(j!==i&&!q.out){pay(s,j,i,20);n++}});addLog(s,`${p.name}: 버스킹 공연으로 ${n*20}${UNIT} 모았어요`);break;}
  case 'rest':if(s.pot>0){const w=s.pot;s.pot=0;p.money+=w;tx(s,-2,i,w);s.potN=(s.potN||0)+1;s.potWin={n:s.potN,i,a:w};addLog(s,`${p.name}: 분수광장 세금 환급! 모인 ${w}${UNIT}을 모두 받아요`);}
    else addLog(s,`${p.name}: 분수광장에 왔지만 모인 세금이 없어요`);break;
  case 'coin':if(p.money>=CFG.coinBets[0]){s.stage='coinBet';s.coin=null;addLog(s,`${p.name}: 동전 던지기 칸! 도전할까요?`);}else addLog(s,`${p.name}: 동전 던지기에 걸 돈이 부족해요`);break;
  case 'start':if(expandable(s,i).length){s.stage='expandAny';addLog(s,`${p.name}: 입구에 딱 도착! 원하는 가게 하나를 확장할 수 있어요`);}else addLog(s,`${p.name}: 입구에 도착`);break;}
}
function jail(s,i,from){const p=s.players[i];p.pos=10;p.skip=true;s.jailN=(s.jailN||0)+1;s.jailFx={n:s.jailN,i,from};}
function drawCard(s,k){const i=s.turn,p=s.players[i],depth=s.drawDepth||0;const ci=Math.floor(Math.random()*CARDS.length),c=CARDS[ci];
  s.card=c.t;s.cardId=ci;s.cardN=(s.cardN||0)+1;s.cardSlip=k;s.lastCard={n:s.cardN,t:c.t,id:ci,k,who:i};s.stage='end';addLog(s,`${p.name} 뽑기: ${c.t}`);
  if(c.m>0){p.money+=c.m;tx(s,-1,i,c.m);}else if(c.m<0)pay(s,i,-1,-c.m);
  if(c.inspect){const n=T.reduce((a,x,j)=>a+(x.k==='s'&&s.owners[j]===i?1:0),0);if(n)pay(s,i,-1,n*c.inspect);addLog(s,`${p.name}: 위생 점검으로 ${n*c.inspect}${UNIT} 냈어요`);}
  if(c.all)s.players.forEach((q,j)=>{if(j!==i&&!q.out)pay(s,j,i,c.all)});
  if(c.jail)jail(s,i,p.pos);
  if(c.step!=null){moveBy(s,i,c.step);if(!depth&&!p.out)land(s,1);}
  if(c.go!=null){moveBy(s,i,(c.go-p.pos+N)%N||N);if(!depth&&!p.out)land(s,1);}
  if(c.tp!=null&&!p.out){p.pos=c.tp;s.tpN=(s.tpN||0)+1;s.tpFx={n:s.tpN,i,to:c.tp};if(!depth)land(s,1);} /* 순간이동: 입구 통과·바퀴 수 없음 */}
function cardKind(ci){const c=CARDS[ci];if(!c)return '';if(c.jail||c.inspect||c.m<0)return 'bad';if(c.m>0||c.all)return 'good';return 'move';}
function finish(s){s.phase='over';s.endReason=s.endReason||'rounds';let best=-1,bw=-1;s.players.forEach((p,i)=>{if(!p.out){const w=worth(s,i);if(w>bw){bw=w;best=i}}});s.winner=best;}
function nextTurn(s){if(s.phase!=='play')return;const n=s.players.length,prev=s.turn;let k=0;
  do{s.turn=(s.turn+1)%n;k++}while(s.players[s.turn].out&&k<=n);
  if(s.turn<=prev){s.round++;if(s.round>CFG.rounds){s.round=CFG.rounds;s.endReason='rounds';finish(s);addLog(s,`${CFG.rounds}라운드 종료! 자산이 가장 많은 사람이 이겨요`);return;}}
  s.stage='roll';s.card='';s.dbl=0;s.extra=false;s.lastDbl=0;s.exPend=false;s.exTarget=null;s.owe=[];s.resume=null;s.coin=null;const p=s.players[s.turn];s.msg=p.skip?`${p.name} 차례 (이번엔 쉬어요)`:`${p.name} 차례예요`;
  if(p.tour&&!p.skip&&p.pos===30){s.stage='travel';s.msg=`${p.name}: 맛집탐방! 가고 싶은 칸을 골라요 (안 가면 주사위를 굴려요)`;}else p.tour=false;}
function afterAct(s){if(s.phase==='play'&&s.stage==='end'&&s.extra){const p=s.players[s.turn];s.extra=false;
  if(p.out||p.skip){s.dbl=0;return;}s.stage='roll';s.card='';s.msg=`${p.name}: 더블! 한 번 더 굴려요`+(s.dbl>=2?' (한 번 더 나오면 단속!)':'');}}
function resolvePend(s){if(s.phase!=='play'||s.stage!=='end'||!s.exPend)return;s.exPend=false;const p=s.players[s.turn];if(p.out)return;
  if(expandable(s,s.turn).length){s.stage='expandAny';s.msg=`${p.name}: 입구 통과 보너스! 확장할 노점을 하나 골라요`;}}
function checkDebt(s){if(s.phase!=='play')return;s.owe=(s.owe||[]).filter(o=>o.amt>0&&s.players[o.from]&&!s.players[o.from].out);
  while(s.owe.length&&s.phase==='play'){const d=s.owe[0].from,p=s.players[d];
    if(!sellable(s,d).length&&p.loanUsed){bankrupt(s,d,'파산! 팔 가게도 대출도 없어요 · 못 낸 돈은 은행이 대신 냈어요');continue;}
    if(s.stage!=='sell'){s.resume=s.stage;s.stage='sell';}s.debtor=d;s.msg=`${p.name}: 현금이 모자라요! ${owed(s,d)}${UNIT}을 마련해야 해요`;return;}
  if(s.phase==='play'&&s.stage==='sell')afterSell(s);
  else if(s.phase==='play'&&s.players[s.turn].out)nextTurn(s);}
function afterSell(s){const p=s.players[s.turn];let st=s.resume||'end';s.resume=null;s.debtor=null;
  if(p.out){s.stage='end';nextTurn(s);return;}
  if(st==='take'&&!(p.money>=takePrice(p.pos,s)&&s.owners[p.pos]>=0&&s.owners[p.pos]!==s.turn))st='end';
  if(st==='buy'&&!(s.owners[p.pos]<0&&p.money>=T[p.pos].p))st='end';
  if((st==='expand'&&!exOptions(s,s.turn,s.exTarget).length)||(st==='expandAny'&&!expandable(s,s.turn).length))st='end';
  s.stage=st;}
function apply(s,a){const r=apply0(s,a);if(r){checkDebt(s);if(s.stage!=='sell'){resolvePend(s);afterAct(s);}}return r;}
function apply0(s,a){if(s.phase!=='play')return false;const i=s.turn,p=s.players[i];
  if(typeof a==='string'&&a.indexOf('ex:')===0&&(s.stage==='expand'||s.stage==='expandAny')){const j=parseInt(a.slice(3),10);
    const want=a.split(':')[2]!=null?parseInt(a.split(':')[2],10):lvOf(s,j)+1;
    if(!(j>=0&&j<N)||(s.stage==='expand'&&(j!==s.exTarget||!exOptions(s,i,j).includes(want)))||(s.stage==='expandAny'&&(!canExpand(s,i,j)||want!==lvOf(s,j)+1)))return false;
    const c=buildCost(j,lvOf(s,j),want);p.money-=c;tx(s,i,-1,c);s.lv[j]=want;const L=s.lv[j];
    addLog(s,`${p.name}: ${T[j].n} 확장! ${L>=CFG.exMax?'명물 가게가 됐어요 (인수 불가)':L+'단계'} · 이용료 ${rent(s,j)}${UNIT}`);s.stage='end';s.exTarget=null;return true;}
  if(s.stage==='coinBet'){
    if(typeof a==='string'&&a.indexOf('bet:')===0){const b=parseInt(a.slice(4),10);if(!CFG.coinBets.includes(b)||p.money<b)return false;
      p.money-=b;tx(s,i,-1,b);s.coin={bet:b,streak:0,flips:0,last:null};s.stage='coinPick';addLog(s,`${p.name}: ${b}${UNIT}을 걸었어요! 앞? 뒤?`);return true;}
    if(a==='pass'){addLog(s,`${p.name}: 동전 던지기는 건너뛰어요`);s.stage='end';return true;}
    return false;}
  if(s.stage==='coinPick'&&(a==='pick:H'||a==='pick:T')){const c=s.coin,pick=a.slice(5),res=Math.random()<.5?'H':'T',win=pick===res;
    c.flips++;c.last={pick,res,win,n:c.flips};
    if(win){c.streak++;const m=CFG.coinMult[c.streak-1];
      if(c.streak>=CFG.coinMult.length){const w=c.bet*m;p.money+=w;tx(s,-1,i,w);c.done='jackpot';addLog(s,`${p.name}: 3연속 적중! ${m}배 대박, ${w}${UNIT}!`);s.stage='end';}
      else{addLog(s,`${p.name}: ${res==='H'?'앞면':'뒷면'} 적중! ${c.streak}연속 · 지금 멈추면 ${c.bet*m}${UNIT}`);s.stage='coinNext';}}
    else{c.done='lose';addLog(s,`${p.name}: ${res==='H'?'앞면':'뒷면'}… 빗나갔어요. ${c.bet}${UNIT}을 잃었어요`);s.stage='end';}
    return true;}
  if(s.stage==='coinNext'){const c=s.coin;
    if(a==='cash'){const m=CFG.coinMult[c.streak-1],w=c.bet*m;p.money+=w;tx(s,-1,i,w);c.done='cash';addLog(s,`${p.name}: ${m}배로 멈췄어요! +${w}${UNIT}`);s.stage='end';return true;}
    if(a==='again'){s.stage='coinPick';addLog(s,`${p.name}: 한 번 더! ${CFG.coinMult[c.streak]}배 도전`);return true;}
    return false;}
  if(s.stage==='sell'){const d=debtorOf(s),q=s.players[d];
    if(typeof a==='string'&&a.indexOf('sell:')===0){const j=parseInt(a.slice(5),10);if(!(j>=0&&j<N)||s.owners[j]!==d)return false;
      const v=sellTile(s,d,j);settleOwe(s,d);addLog(s,`${q.name}: ${T[j].n}을(를) ${v}${UNIT}에 팔았어요`+(owed(s,d)>0?` · 아직 ${owed(s,d)}${UNIT} 부족`:' · 다 냈어요'));return true;}
    if(a==='loan'){if(q.loanUsed||owed(s,d)<=0)return false;takeLoan(s,d);settleOwe(s,d);return true;}
    if(a==='autosell'){if(!q.loanUsed)takeLoan(s,d,true);settleOwe(s,d);
      const js=sellable(s,d).sort((x,y)=>sellValue(s,x)-sellValue(s,y));const sold=[];
      while(owed(s,d)>0&&js.length){const j=js.shift();sellTile(s,d,j);settleOwe(s,d);sold.push(T[j].n);}
      if(sold.length)addLog(s,`${q.name}: 시간이 지나 ${sold.join(', ')}을(를) 자동으로 팔았어요`);
      if(owed(s,d)>0)bankrupt(s,d,'파산! 못 낸 돈은 은행이 대신 냈어요');return true;}
    if(a==='giveup'){bankrupt(s,d,'님이 파산을 선언했어요 · 못 낸 돈은 은행이 대신 냈어요');return true;}
    return false;}
  if(a==='pass'&&(s.stage==='expand'||s.stage==='expandAny')){addLog(s,`${p.name}: 확장하지 않았어요`);s.stage='end';s.exTarget=null;return true;}
  if(a==='roll'&&s.stage==='roll'){s.seq++;p.tour=false;s.card='';s.lastDbl=0;s.exPend=false;
    if(p.skip){p.skip=false;s.dice=[0,0];s.dbl=0;addLog(s,`${p.name}: 이번 턴은 쉬어요`);s.stage='end';return true;}
    const d1=1+Math.floor(Math.random()*6),d2=1+Math.floor(Math.random()*6);s.dice=[d1,d2];
    if(d1===d2){s.dbl=(s.dbl||0)+1;s.lastDbl=s.dbl;
      if(s.dbl>=3){jail(s,i,p.pos);s.dbl=0;s.extra=false;s.stage='end';addLog(s,`${p.name}: 더블 3번! 단속반으로 끌려가 다음 턴은 쉬어요`);return true;}
      addLog(s,`${p.name}: 더블! (${d1}·${d2})`);}
    else s.dbl=0;
    moveBy(s,i,d1+d2);land(s,0);
    s.extra=d1===d2&&!p.out&&!p.skip&&s.phase==='play';
    return true;}
  if(typeof a==='string'&&/^buy(:\d)?$/.test(a)&&s.stage==='buy'){const t=T[p.pos],L=a.length>4?+a.slice(4):0;
    if(s.owners[p.pos]<0&&buyOptions(s,i,p.pos).includes(L)){const c=t.p+buildCost(p.pos,0,L);p.money-=c;tx(s,i,-1,c);s.owners[p.pos]=i;s.lv[p.pos]=L;
      addLog(s,`${p.name}: ${t.n} ${L?`★${L} 가게로 열었어요`:'샀어요'}`+(t.k==='s'&&setOwned(s,t.g,i)?' · 세트 완성, 이용료 2배!':''));}
    else return false;
    s.stage='end';return true;}
  if(typeof a==='string'&&/^take(:\d)?$/.test(a)&&s.stage==='take'){const t=T[p.pos],o=s.owners[p.pos],pr=takePrice(p.pos,s),lv0=lvOf(s,p.pos),L=a.length>5?+a.slice(5):lv0;
    if(o>=0&&o!==i&&!setOwned(s,t.g,o)&&lv0<CFG.exMax&&takeOptions(s,i,p.pos).includes(L)){p.money-=pr;s.players[o].money+=pr;tx(s,i,o,pr);s.owners[p.pos]=i;
      if(L>lv0){const c=buildCost(p.pos,lv0,L);p.money-=c;tx(s,i,-1,c);s.lv[p.pos]=L;}
      addLog(s,`${p.name}: ${s.players[o].name}의 ${t.n}을(를) ${pr}${UNIT}에 인수!`+(L>lv0?` ★${L}까지 올렸어요`:'')+(setOwned(s,t.g,i)?' · 세트 완성!':''));}
    else return false;
    s.stage='end';return true;}
  if(s.stage==='draw'&&typeof a==='string'&&/^draw(:[0-9])?$/.test(a)){drawCard(s,a.length>5?Math.min(4,+a.slice(5)):Math.floor(Math.random()*5));return true;}
  if(s.stage==='travel'&&typeof a==='string'&&a.indexOf('go:')===0){const j=parseInt(a.slice(3),10);if(!(j>=0&&j<N)||j===p.pos)return false;
    p.tour=false;const from=p.pos,steps=(j-from+N)%N;s.travN=(s.travN||0)+1;s.travFx={n:s.travN,i,from,to:j};
    addLog(s,`${p.name}: ${T[j].n}(으)로 맛집탐방 가요`+(from+steps>=N?' · 입구를 지나요':''));moveBy(s,i,steps);land(s,0);return true;}
  if(a==='pass'&&s.stage==='travel'){p.tour=false;addLog(s,`${p.name}: 탐방 대신 주사위를 굴려요`);s.stage='roll';return true;}
  if(a==='pass'&&(s.stage==='buy'||s.stage==='take')){addLog(s,`${p.name}: 그냥 지나가요`);s.stage='end';return true;}
  if(a==='end'&&s.stage==='end'){nextTurn(s);return true;}
  return false;}
function startGame(s){const r6=()=>1+Math.floor(Math.random()*6);
  const rl=s.players.map(p=>({p,d:[r6(),r6()],re:[]}));
  /* 동점이면 동점자끼리만 다시 굴려 순서를 정해요 */
  const rank=(grp,r)=>{const val=x=>{const d=r===0?x.d:x.re[r-1];return d[0]+d[1];};
    const by={};grp.forEach(x=>{(by[val(x)]=by[val(x)]||[]).push(x)});
    return Object.keys(by).map(Number).sort((a,b)=>b-a).flatMap(v=>{const g=by[v];if(g.length===1||r>=8)return g;
      g.forEach(x=>{while(x.re.length<r)x.re.push(null);x.re[r]=[r6(),r6()];});return rank(g,r+1);});};
  const sorted=rank(rl,0);const ps=sorted.map(x=>x.p);
  const cmap={};s.players.forEach((p,i)=>cmap[p.id]=i);
  s.players=ps.map((p,i)=>({id:p.id,name:p.name,c:(p.ch!=null?p.ch:cmap[p.id]),pos:0,money:CFG.start+i*CFG.orderBonus,skip:false,out:false,lap:1}));
  s.ord=rl.map(x=>({i:sorted.indexOf(x),d:x.d,re:x.re}));s.gid=Math.random().toString(36).slice(2,8);
  s.owners=Array(N).fill(-1);s.lv=Array(N).fill(0);s.exPend=false;s.exTarget=null;s.owe=[];s.resume=null;s.tx=[];s.txn=0;s.pot=0;s.potN=0;s.potWin=null;s.phase='play';s.turn=0;s.round=1;s.stage='roll';s.seq=0;s.dice=[0,0];s.log=[];s.card='';s.winner=null;s.endReason=null;s.dbl=0;s.extra=false;s.lastDbl=0;
  addLog(s,`선 뽑기: ${s.players.map((p,k)=>p.name+'('+(sorted[k].d[0]+sorted[k].d[1])+')').join(' → ')}. 뒤 순서일수록 시작 자금 +${CFG.orderBonus}`);}
function forfeit(s,i){if(s.players[i].out)return;goBroke(s,i,'님이 나가서 기권 처리됐어요');if(s.phase==='play'&&s.turn===i){s.stage='end';nextTurn(s);}}

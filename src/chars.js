const FACE=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s||1})"><circle cx="-4.2" cy="0" r="1.8" fill="#2a1a12"/><circle cx="4.2" cy="0" r="1.8" fill="#2a1a12"/><circle cx="-3.6" cy="-.7" r=".6" fill="#fff"/><circle cx="4.8" cy="-.7" r=".6" fill="#fff"/><path d="M-2.1 2.3 Q0 4.3 2.1 2.3" stroke="#2a1a12" stroke-width="1.15" fill="none" stroke-linecap="round"/><ellipse cx="-6.6" cy="2.7" rx="1.7" ry="1.05" fill="#ff6f86" opacity=".75"/><ellipse cx="6.6" cy="2.7" rx="1.7" ry="1.05" fill="#ff6f86" opacity=".75"/></g>`;
const CHAR_ART=[
 // 0 붕어빵
 `<path d="M30 20 L38.5 12.5 L37.5 27.5Z" fill="#e3a142" stroke="#8a4f16" stroke-width="1.3" stroke-linejoin="round"/>
  <path d="M4.5 20 Q10 8.5 22 9.5 Q31 10.5 32 20 Q31 29.5 22 30.5 Q10 31.5 4.5 20Z" fill="#eab04e" stroke="#8a4f16" stroke-width="1.3"/>
  <path d="M21 14.5 q2.2 2.2 0 4.4 M25.5 14.5 q2.2 2.2 0 4.4 M23.2 21 q2.2 2.2 0 4.4 M27.6 21 q2.2 2.2 0 4.4" stroke="#b36e25" fill="none" stroke-width="1"/>
  <path d="M9 13.5 Q13 11 17 11.5" stroke="#fff3c9" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".8"/>${FACE(13.5,19.5,.82)}`,
 // 1 탕후루
 `<rect x="19" y="3" width="2.2" height="35" rx="1.1" fill="#c9995c"/>
  <circle cx="20.1" cy="12.5" r="8" fill="#e8283f" stroke="#8e1020" stroke-width="1.2"/><path d="M16.5 5.2 l3.6 2.4 l3.6-2.4 l-1 3.6 h-5.2z" fill="#3aa34a"/>
  <circle cx="20.1" cy="27.5" r="8.6" fill="#ff3b52" stroke="#8e1020" stroke-width="1.2"/>
  <ellipse cx="16.8" cy="9.6" rx="2.4" ry="1.4" fill="#fff" opacity=".7"/><ellipse cx="16.4" cy="24.2" rx="2.6" ry="1.5" fill="#fff" opacity=".6"/>${FACE(20.1,28.3,.78)}`,
 // 2 어묵꼬치
 `<rect x="19" y="2" width="2.2" height="37" rx="1.1" fill="#b98548"/>
  <rect x="8" y="6.5" width="23" height="9" rx="4.5" fill="#f3d6a2" stroke="#b07d3c" stroke-width="1.2"/>
  <rect x="10" y="15.5" width="23" height="10" rx="5" fill="#f7deb0" stroke="#b07d3c" stroke-width="1.2"/>
  <rect x="8" y="25.5" width="23" height="9" rx="4.5" fill="#f3d6a2" stroke="#b07d3c" stroke-width="1.2"/>${FACE(21.5,20.3,.72)}`,
 // 3 타코야끼
 `<circle cx="20" cy="21.5" r="15" fill="#dc9640" stroke="#8a5019" stroke-width="1.3"/>
  <path d="M6.2 17 Q9 8.5 20 7.5 Q31 8.5 33.8 17 Q30 15 27 18 Q23.5 14.5 20 17.8 Q16.5 14.5 13 18 Q10 15 6.2 17Z" fill="#5a2c12"/>
  <path d="M10.5 13.5 l3-2.8 l3 2.8 l3-2.8 l3 2.8 l3-2.8 l3 2.8" stroke="#fff5da" stroke-width="1.4" fill="none" stroke-linejoin="round"/>
  <rect x="14" y="9" width="2.4" height="1.6" fill="#2f7d32"/><rect x="24" y="10.5" width="2.2" height="1.5" fill="#2f7d32"/>${FACE(20,25.5,.85)}`,
 // 4 호떡
 `<ellipse cx="20" cy="22" rx="16.5" ry="12" fill="#c97b37" stroke="#7d4418" stroke-width="1.3"/>
  <ellipse cx="18" cy="18" rx="10" ry="5" fill="#dc9451" opacity=".85"/>
  <ellipse cx="11" cy="16.5" rx="1.1" ry=".7" fill="#fbe7b5"/><ellipse cx="27" cy="17" rx="1.1" ry=".7" fill="#fbe7b5"/><ellipse cx="30" cy="24" rx="1.1" ry=".7" fill="#fbe7b5"/>${FACE(20,23.5,.85)}`,
 // 5 핫도그
 `<rect x="18.9" y="29" width="2.2" height="10" rx="1.1" fill="#c9995c"/>
  <rect x="10.5" y="3.5" width="19" height="28.5" rx="9.5" fill="#dc8c2c" stroke="#86480f" stroke-width="1.3"/>
  <path d="M13 11 l2.4-2.2 l2.4 2.2 l2.4-2.2 l2.4 2.2 l2.4-2.2 l2.4 2.2" stroke="#e5252a" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
  <path d="M14 6.5 Q16 5 18 5.2" stroke="#ffd27a" stroke-width="1.3" fill="none" stroke-linecap="round"/>${FACE(20,20,.78)}`,
 // 6 계란빵
 `<rect x="6.5" y="13.5" width="27" height="21" rx="8" fill="#e8ad57" stroke="#8f5b1f" stroke-width="1.3"/>
  <ellipse cx="20" cy="14.5" rx="11.5" ry="7" fill="#fff8ea" stroke="#d8c7a4" stroke-width="1"/><circle cx="20" cy="13.8" r="4.4" fill="#ffb000"/><circle cx="18.6" cy="12.4" r="1.2" fill="#fff" opacity=".7"/>${FACE(20,26,.8)}`,
 // 7 군고구마
 `<g transform="rotate(-24 20 21)"><ellipse cx="20" cy="21" rx="16" ry="10.5" fill="#8f3a5a" stroke="#541b35" stroke-width="1.3"/>
  <ellipse cx="34" cy="21" rx="3.4" ry="7.6" fill="#ffc94d" stroke="#c88a12" stroke-width="1"/>
  <path d="M9 16 q3 1 5 0 M11 26 q3-1 5 0" stroke="#6d2744" stroke-width="1" fill="none"/></g>${FACE(17,22,.8)}`
];
const CH=[
 {n:'붕붕',food:'붕어빵',c:'#ff8a3d'},
 {n:'탕탕',food:'탕후루',c:'#ff5dc8'},
 {n:'오뎅',food:'어묵꼬치',c:'#3fb6f2'},
 {n:'타코',food:'타코야끼',c:'#a77cff'},
 {n:'호야',food:'호떡',c:'#f2c230'},
 {n:'핫찌',food:'핫도그',c:'#ff4d4d'},
 {n:'계란',food:'계란빵',c:'#5ccf6d'},
 {n:'고구',food:'군고구마',c:'#3ee0c0'}
].map((x,i)=>Object.assign(x,{svg:`<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(3 3) scale(.85)">${CHAR_ART[i]}</g></svg>`}));
const PC=CH.map(x=>x.c);
/* 명물 가게 세움 간판용 음식 그림 (얼굴 없음). 40x40 좌표 */
const noFace=s=>s.replace(/<g transform="translate\([^)]*\) scale\([^)]*\)"><circle cx="-4\.2"[\s\S]*?<\/g>/g,'');
const FOOD_ART={
'붕어빵':noFace(CHAR_ART[0]),'탕후루':noFace(CHAR_ART[1]),'어묵':noFace(CHAR_ART[2]),'타코야끼':noFace(CHAR_ART[3]),
'호떡':noFace(CHAR_ART[4]),'핫도그':noFace(CHAR_ART[5]),'계란빵':noFace(CHAR_ART[6]),'군고구마':noFace(CHAR_ART[7]),
'꽈배기':`<g transform="rotate(-35 20 20)">${[0,1,2,3,4,5].map(i=>`<ellipse cx="${5.5+i*5.8}" cy="20" rx="5.2" ry="8.4" transform="rotate(${i%2?28:-28} ${5.5+i*5.8} 20)" fill="#e2a24a" stroke="#8a5216" stroke-width="1.2"/>`).join('')}
  ${[[8,17],[13,23],[18,16],[23,24],[28,17],[33,22],[11,20],[26,20]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".9" fill="#fffaf0"/>`).join('')}</g>`,
'떡볶이':`<path d="M6 17 h28 l-3 17 q-11 3 -22 0z" fill="#fff4e4" stroke="#9a7b58" stroke-width="1.2"/><path d="M8 25 h24" stroke="#e64b3c" stroke-width="2"/>
  <ellipse cx="20" cy="17" rx="14" ry="4" fill="#d9362b" stroke="#8e1a13" stroke-width="1.2"/>
  <rect x="9" y="8" width="11" height="5" rx="2.5" fill="#f3553f" stroke="#8e1a13" stroke-width="1.1" transform="rotate(-20 14 10)"/><rect x="18" y="9" width="12" height="5" rx="2.5" fill="#ee4a36" stroke="#8e1a13" stroke-width="1.1" transform="rotate(15 24 11)"/>
  <rect x="13" y="12.5" width="11" height="5" rx="2.5" fill="#f65f48" stroke="#8e1a13" stroke-width="1.1"/><path d="M24 6 l7 3 l-5 5z" fill="#f0c27b" stroke="#9a6a2a" stroke-width="1"/>
  <path d="M29 4 v12" stroke="#c9995c" stroke-width="1.6" stroke-linecap="round"/>`,
'순대':`<path d="M33 5 L14 30" stroke="#c9995c" stroke-width="1.8" stroke-linecap="round"/>
  ${[[12,26,8],[22,20,7.4],[29,29,7]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#5b2c3e" stroke="#2b1119" stroke-width="1.3"/><circle cx="${x}" cy="${y}" r="${r-2.3}" fill="#8a4a5e"/><circle cx="${x-1.5}" cy="${y-1}" r=".8" fill="#e8d6c0"/><circle cx="${x+1.8}" cy="${y+1.2}" r=".7" fill="#e8d6c0"/><circle cx="${x+.5}" cy="${y-2.6}" r=".6" fill="#c4a07c"/>`).join('')}`,
'튀김':`<g transform="rotate(-30 20 20)"><path d="M33 20 l5 -5 l-1 5 l1 5z" fill="#ff5a3c" stroke="#9b2210" stroke-width="1.1"/>
  <path d="M3 20 q2 -9 14 -8 q11 1 16 8 q-5 7 -16 8 q-12 1 -14 -8z" fill="#e6a53c" stroke="#8a5412" stroke-width="1.3"/>
  ${[[8,17],[12,22],[16,16],[20,23],[24,17],[28,21],[10,19],[22,20]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6" fill="#f5c45e" stroke="#b77a22" stroke-width=".5"/>`).join('')}</g>`,
'김밥':`${[[13,15],[27,17],[19,28]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8.4" fill="#1f2a1f" stroke="#0c120c" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="6.6" fill="#fdfaf2"/>
  <rect x="${x-1.2}" y="${y-4}" width="2.4" height="3" fill="#ffcf2e"/><rect x="${x+.8}" y="${y-1}" width="2.6" height="2.4" fill="#ff8a2e"/><rect x="${x-3.4}" y="${y-.6}" width="2.6" height="2.4" fill="#3aa34a"/><rect x="${x-1}" y="${y+1.4}" width="2.4" height="2.4" fill="#ff6f8a"/>`).join('')}`,
'핫바':`<path d="M20 36 V26" stroke="#c9995c" stroke-width="2.2" stroke-linecap="round"/>
  <rect x="11" y="3" width="18" height="25" rx="7" fill="#e8b774" stroke="#8a5a22" stroke-width="1.3"/>
  <path d="M13 10 l14 -3 M13 16 l14 -3 M13 22 l14 -3" stroke="#b77a3a" stroke-width="1.3"/><path d="M14 8 q2 3 4 0 t4 0 t4 0 M14 20 q2 3 4 0 t4 0 t4 0" stroke="#e03b2c" stroke-width="1.3" fill="none"/>`,
'소떡소떡':`<path d="M6 36 L34 4" stroke="#c9995c" stroke-width="1.8" stroke-linecap="round"/>
  ${[[10,31,0],[15,25.3,1],[20,19.6,0],[25,13.9,1],[30,8.2,0]].map(([x,y,t])=>t?`<rect x="${x-5}" y="${y-3.3}" width="10" height="6.6" rx="3.3" fill="#fbf6ea" stroke="#b8a888" stroke-width="1.1" transform="rotate(-49 ${x} ${y})"/>`:`<rect x="${x-5.4}" y="${y-3.5}" width="10.8" height="7" rx="3.5" fill="#c9502e" stroke="#6e210f" stroke-width="1.1" transform="rotate(-49 ${x} ${y})"/><path d="M${x-2} ${y+1} l3 -3" stroke="#f08a5a" stroke-width="1"/>`).join('')}
  <path d="M8 29 q10 -6 22 -24" stroke="#d6341f" stroke-width="1.6" fill="none" opacity=".7" stroke-dasharray="3 3"/>`,
'닭꼬치':`<path d="M20 38 V3" stroke="#c9995c" stroke-width="1.8" stroke-linecap="round"/>
  ${[[20,9,0],[20,16,1],[20,23,0],[20,30,1]].map(([x,y,t])=>t?`<rect x="${x-6}" y="${y-2.6}" width="12" height="5.2" rx="2" fill="#6fb74a" stroke="#2f6a1e" stroke-width="1.1"/><path d="M${x-4} ${y} h8" stroke="#bfe39a" stroke-width="1"/>`:`<path d="M${x-8} ${y-1} q1 -5 8 -5 q8 0 8 5 q0 5 -8 5 q-8 0 -8 -5z" fill="#b8612b" stroke="#5e2a0c" stroke-width="1.2"/><path d="M${x-5} ${y-2} q3 -2 6 0" stroke="#e59b5a" stroke-width="1.1" fill="none"/>`).join('')}`,
'회오리감자':`<path d="M20 39 V2" stroke="#c9995c" stroke-width="1.6" stroke-linecap="round"/>
  ${[0,1,2,3,4,5,6].map(i=>`<ellipse cx="20" cy="${6+i*4.4}" rx="${8+Math.sin(i*1.1)*1.5}" ry="2.6" transform="rotate(${i%2?12:-12} 20 ${6+i*4.4})" fill="#f2c14e" stroke="#9a6a12" stroke-width="1.1"/>`).join('')}
  ${[[14,8],[25,15],[16,21],[24,27],[15,32]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".8" fill="#c0392b"/>`).join('')}`,
'츄러스':`<g transform="rotate(28 20 20)"><rect x="15" y="1" width="10" height="30" rx="5" fill="#c9823e" stroke="#6b3a12" stroke-width="1.3"/>
  <path d="M17.5 4 V28 M20 3 V29 M22.5 4 V28" stroke="#8a4f1e" stroke-width="1"/>${[[17,8],[22,11],[19,16],[23,20],[17,23],[21,6]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".8" fill="#fff6e4"/>`).join('')}
  <path d="M12 24 h16 l-2 14 h-12z" fill="#ff5d8f" stroke="#a8234d" stroke-width="1.2"/><path d="M13.5 29 h13" stroke="#fff" stroke-width="1.3" opacity=".8"/></g>`,
'와플':`<rect x="5" y="9" width="30" height="24" rx="5" fill="#e3a847" stroke="#8a5a12" stroke-width="1.3"/>
  ${[1,2,3,4].map(i=>`<path d="M${5+i*6} 10 V32" stroke="#b77a22" stroke-width="1.3"/>`).join('')}${[1,2,3].map(i=>`<path d="M6 ${9+i*6} H34" stroke="#b77a22" stroke-width="1.3"/>`).join('')}
  <path d="M10 10 q5 -7 10 -2 q5 -6 11 0 q2 3 -1 4 h-18 q-4 0 -2 -2z" fill="#fffaf0" stroke="#d8c7a4" stroke-width="1"/>
  <path d="M17 3 q4 -1 5 3 q-1 4 -5 3 q-3 -2 0 -6z" fill="#ff3b52" stroke="#8e1020" stroke-width="1"/><path d="M18 3 l2 -2 l1 2" stroke="#3aa34a" stroke-width="1.2" fill="none"/>`,
'버블티':`<path d="M24 1 l-3 13" stroke="#ff5d8f" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M9 12 h22 l-2.6 25 q-8.4 2 -16.8 0z" fill="#d9a877" stroke="#7a4a22" stroke-width="1.3"/>
  <path d="M8 12 q12 -8 24 0z" fill="#f3eee6" stroke="#9a8a78" stroke-width="1.2"/><rect x="8" y="11.2" width="24" height="2.6" rx="1.3" fill="#fff" stroke="#9a8a78" stroke-width="1"/>
  ${[[14,32],[18,34],[22,33],[26,32],[16,29],[21,30],[25,28.5],[13,27.5]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.9" fill="#2a1a12"/>`).join('')}<path d="M12 17 v8" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>`,
'크레페':`<path d="M9 13 L20 38 L31 13z" fill="#f0c98a" stroke="#9a6a2a" stroke-width="1.3"/><path d="M12 19 L27 17 M14 25 L25 23" stroke="#d9a860" stroke-width="1"/>
  <path d="M7 14 q2 -8 8 -6 q3 -6 9 -3 q6 -2 8 4 q3 3 -1 6 h-22 q-4 -1 -2 -1z" fill="#fffaf0" stroke="#d8c7a4" stroke-width="1.1"/>
  <path d="M13 6 q4 -1 5 3 q-1 4 -5 3 q-3 -2 0 -6z" fill="#ff3b52" stroke="#8e1020" stroke-width="1"/><circle cx="25" cy="8" r="3.2" fill="#6a3fb5" stroke="#35196b" stroke-width="1"/><path d="M20 12 q3 -2 6 0" stroke="#7a4a22" stroke-width="1.6" fill="none"/>`,
'스테이크 큐브':`<path d="M4 27 h32 l-3 9 h-26z" fill="#fff4e4" stroke="#9a7b58" stroke-width="1.2"/>
  ${[[11,21],[21,17],[29,22],[17,26]].map(([x,y])=>`<path d="M${x-5} ${y-2} l5 -3 l5 3 v6 l-5 3 l-5 -3z" fill="#7a3a1e" stroke="#3a150a" stroke-width="1.1"/><path d="M${x-5} ${y-2} l5 3 l5 -3 l-5 -3z" fill="#a8552e" stroke="#3a150a" stroke-width="1"/><path d="M${x} ${y+1} v6" stroke="#3a150a" stroke-width="1"/><path d="M${x-3} ${y-2} l2 1" stroke="#d98a5a" stroke-width=".8"/>`).join('')}
  <path d="M30 3 L22 18" stroke="#c9995c" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="13" r="1" fill="#3aa34a"/><circle cx="26" cy="12" r=".9" fill="#3aa34a"/>`
};

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

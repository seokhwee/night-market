# 야시장 부자

친구들이 각자 휴대폰이나 태블릿으로 방 코드를 입력해 함께 하는 야시장 테마 온라인 보드게임.

- `server.ts` — Bun 서버. 게임 페이지를 제공하고, 방 코드별로 참가자 상태를 실시간 중계해요. 연결이 끊겨도 60초 동안 자리를 유지해요.
- `public/index.html` — 빌드된 게임 페이지 (직접 고치지 말고 `src/`를 고친 뒤 `python3 build.py`).
- `src/engine.js` — 게임 규칙, `src/chars.js` — 캐릭터 그림, `src/ui.html` — 화면.

로컬 실행: `bun server.ts` 후 http://localhost:3000

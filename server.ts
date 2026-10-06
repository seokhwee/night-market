// 야시장 부자 — realtime room server (Bun). One file: serves the game page and relays per-room presence.
const HTML: string = await Bun.file(new URL("./public/index.html", import.meta.url)).text();

const STATIC: Record<string, string> = {
  "/manifest.webmanifest": "application/manifest+json",
  "/sw.js": "text/javascript; charset=utf-8",
  "/icon-192.png": "image/png",
  "/icon-512.png": "image/png",
  "/apple-touch-icon.png": "image/png",
  "/privacy.html": "text/html; charset=utf-8",
};

type Peer = { id: string; presence: Record<string, unknown>; ws: any | null; away: boolean; timer?: ReturnType<typeof setTimeout>; uid?: string };

/* ── 로그인·토큰 (Supabase) ─────────────────────────────
   SUPABASE_URL, SUPABASE_SERVICE_KEY 가 있어야 켜져요. 토큰은 서버만 바꿀 수 있어요. */
const SB = (Bun.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SBKEY = Bun.env.SUPABASE_SERVICE_KEY || "";
const LOGIN = !!(SB && SBKEY);
const STAKES = [100, 300, 500];
const MIN_STAKE_GAME_MS = Number(Bun.env.MIN_STAKE_MS ?? 3 * 60_000);   // 이보다 빨리 끝난 판돈 게임은 모두 환불
function sbHeaders(extra: Record<string, string> = {}) {
  const h: Record<string, string> = { apikey: SBKEY, "content-type": "application/json", ...extra };
  if (SBKEY.startsWith("eyJ") && !h.Authorization) h.Authorization = "Bearer " + SBKEY;
  return h;
}
async function rpc(fn: string, args: Record<string, unknown>): Promise<any> {
  const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: "POST", headers: sbHeaders(), body: JSON.stringify(args) });
  const t = await r.text();
  if (!r.ok) throw new Error(`rpc ${fn} ${r.status} ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : null;
}
const tokCache = new Map<string, { uid: string; at: number }>();
async function userFromToken(token: string): Promise<string | null> {
  if (!LOGIN || !token || token.length > 4096) return null;
  const c = tokCache.get(token);
  if (c && Date.now() - c.at < 5 * 60_000) return c.uid;
  try {
    const r = await fetch(`${SB}/auth/v1/user`, { headers: sbHeaders({ Authorization: "Bearer " + token }) });
    if (!r.ok) return null;
    const u: any = await r.json();
    if (!u || !u.id) return null;
    if (tokCache.size > 2000) tokCache.clear();
    tokCache.set(token, { uid: u.id, at: Date.now() });
    return u.id;
  } catch { return null; }
}
async function authed(req: Request): Promise<string | null> {
  const h = req.headers.get("authorization") || "";
  return userFromToken(h.replace(/^Bearer\s+/i, ""));
}
const isUuid = (x: unknown) => typeof x === "string" && /^[0-9a-f-]{36}$/i.test(x);
type StakeInfo = { ch: string; host: string; uids: Record<string, string>; at: number; pot: number };
const stakeInfo = new Map<string, StakeInfo>();
const settling = new Set<string>();
async function settleIfOver(ch: string, hostPeer: Peer) {
  const st: any = (hostPeer.presence as any).state;
  if (!LOGIN || !st || st.phase !== "over" || typeof st.stakeGid !== "string") return;
  const gid = st.stakeGid;
  if (settling.has(gid)) return;
  settling.add(gid);
  try {
    const info = stakeInfo.get(gid);
    const m = chans.get(ch);
    const w = Array.isArray(st.players) ? st.players[st.winner] : null;
    const wPeer = w ? (w.id === "@host" ? hostPeer.id : String(w.id)) : "";
    let wUid: string | null = (info && info.uids[wPeer]) || (m && m.get(wPeer)?.uid) || null;
    if (info && Date.now() - info.at < MIN_STAKE_GAME_MS) wUid = null;   // 너무 짧은 판 → 환불
    const r = await rpc("nm_settle", { p_gid: gid, p_winner: wUid });
    if (r && r.ok) server.publish(ch, JSON.stringify({ t: "stakepaid", gid, winner: wUid ? wPeer : null, pot: r.pot || 0, refunded: !!r.refunded }));
    stakeInfo.delete(gid);
  } catch (e) { console.error("settle", e); settling.delete(gid); }
}
if (LOGIN) setInterval(() => { rpc("nm_refund_stale", { p_hours: 6 }).catch(e => console.error("stale", e)); }, 10 * 60_000);
async function apiRoute(u: URL, req: Request): Promise<Response> {
  if (u.pathname === "/api/config") return Response.json({ login: LOGIN });
  if (!LOGIN) return Response.json({ err: "login disabled" }, { status: 503 });
  const uid = await authed(req);
  if (!uid) return Response.json({ err: "auth" }, { status: 401 });
  let body: any = {};
  if (req.method === "POST") { try { body = await req.json(); } catch {} }
  try {
    if (u.pathname === "/api/me") return Response.json(await rpc("nm_daily", { uid }));
    if (u.pathname === "/api/friends") return Response.json(await rpc("nm_friends", { uid }));
    if (u.pathname === "/api/nick" && req.method === "POST") return Response.json(await rpc("nm_nick", { uid, p_nick: String(body.nickname || "").slice(0, 16) }));
    if (u.pathname === "/api/gift" && req.method === "POST") {
      const amt = Math.floor(Number(body.amount));
      if (!isUuid(body.to) || !(amt > 0)) return Response.json({ ok: false, err: "amount" });
      return Response.json(await rpc("nm_gift", { p_from: uid, p_to: body.to, p_amt: amt }));
    }
  } catch (e) { console.error("api", e); return Response.json({ err: "server" }, { status: 500 }); }
  return Response.json({ err: "not found" }, { status: 404 });
}
const chans = new Map<string, Map<string, Peer>>();
const pend = new Map<string, ReturnType<typeof setTimeout>>();
const AWAY_MS = 60_000;
const MAX_PRESENCE = 6000;

function cleanCh(s: string | null) { return (s || "").replace(/[^0-9]/g, "").slice(0, 6); }
function cleanId(s: string | null) { return (s || "").replace(/[^a-z0-9]/gi, "").slice(0, 32); }

function broadcast(ch: string) {
  if (pend.has(ch)) return;
  pend.set(ch, setTimeout(() => {
    pend.delete(ch);
    const m = chans.get(ch);
    if (!m) return;
    const peers = [...m.values()].map(p => ({ peer: p.id, presence: p.presence, away: p.away, li: !!p.uid }));
    server.publish(ch, JSON.stringify({ t: "peers", peers }));
  }, 25));
}

const server = Bun.serve<{ ch: string; id: string }>({
  port: Number(Bun.env.PORT || 3000),
  fetch(req, srv) {
    const u = new URL(req.url);
    if (u.pathname === "/ws") {
      const ch = cleanCh(u.searchParams.get("ch"));
      const id = cleanId(u.searchParams.get("peer"));
      if (ch.length !== 4 || id.length < 8) return new Response("bad request", { status: 400 });
      if (srv.upgrade(req, { data: { ch, id } })) return;
      return new Response("upgrade failed", { status: 400 });
    }
    if (u.pathname === "/api/room") {
      const m = chans.get(cleanCh(u.searchParams.get("code")));
      const host = !!m && [...m.values()].some(p => p.presence && (p.presence as any).host);
      return Response.json({ host, count: m ? m.size : 0 });
    }
    if (u.pathname.startsWith("/api/") && u.pathname !== "/api/room") return apiRoute(u, req);
    if (u.pathname === "/health") return new Response("ok");
    if (u.pathname === "/privacy") u.pathname = "/privacy.html";
    const st = STATIC[u.pathname];
    if (st) return new Response(Bun.file(new URL("./public" + u.pathname, import.meta.url)), { headers: { "content-type": st, "cache-control": u.pathname === "/sw.js" ? "no-cache" : "public, max-age=86400" } });
    if (u.pathname === "/" || u.pathname === "/index.html")
      return new Response(HTML, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
    return new Response("not found", { status: 404 });
  },
  websocket: {
    idleTimeout: 120,
    maxPayloadLength: 16 * 1024,
    open(ws) {
      const { ch, id } = ws.data;
      let m = chans.get(ch);
      if (!m) { m = new Map(); chans.set(ch, m); }
      let p = m.get(id);
      if (p) {
        clearTimeout(p.timer);
        if (p.ws && p.ws !== ws) { try { p.ws.close(); } catch {} }
        p.ws = ws; p.away = false;
      } else {
        if (m.size >= 12) { ws.close(1013, "room full"); return; }
        p = { id, presence: {}, ws, away: false };
        m.set(id, p);
      }
      ws.subscribe(ch);
      broadcast(ch);
    },
    message(ws, raw) {
      const txt = typeof raw === "string" ? raw : new TextDecoder().decode(raw);
      if (txt.length > 12000) return;
      let d: any; try { d = JSON.parse(txt); } catch { return; }
      if (d && d.t === "ping") { ws.send('{"t":"pong"}'); return; }
      const { ch, id } = ws.data;
      const p = chans.get(ch)?.get(id);
      if (!p || p.ws !== ws) return;
      if (d && d.t === "auth") {   // 로그인한 사람은 접속할 때마다 토큰을 보내요
        userFromToken(String(d.token || "")).then(uid => {
          if (p.ws !== ws) return;
          p.uid = uid || undefined;
          try { ws.send(JSON.stringify({ t: "authok", ok: !!uid })); } catch {}
          broadcast(ch);
        });
        return;
      }
      if (d && d.t === "stake") {  // 방장: 판돈 걷기
        const gid = String(d.gid || "").replace(/[^a-z0-9]/gi, "").slice(0, 24), stake = Number(d.stake);
        const reply = (o: any) => { try { ws.send(JSON.stringify({ t: "stakeres", gid, ...o })); } catch {} };
        if (!LOGIN) return reply({ ok: false, err: "disabled" });
        if (!(p.presence as any).host || !gid || !STAKES.includes(stake) || !Array.isArray(d.peers)) return reply({ ok: false, err: "bad" });
        const m = chans.get(ch)!;
        const ids: string[] = d.peers.map((x: any) => (x === "@host" ? id : cleanId(String(x)))).slice(0, 6);
        const missing = ids.filter(x => !m.get(x)?.uid);
        if (missing.length || ids.length < 2) return reply({ ok: false, err: "login", who: missing });
        const uids: Record<string, string> = {}; ids.forEach(x => (uids[x] = m.get(x)!.uid!));
        rpc("nm_hold", { p_gid: gid, p_stake: stake, p_players: ids.map(x => uids[x]) }).then(r => {
          if (r && r.ok) { stakeInfo.set(gid, { ch, host: id, uids, at: Date.now(), pot: r.pot }); reply({ ok: true, pot: r.pot }); }
          else {
            const short = (r && r.short) || [];
            reply({ ok: false, err: (r && r.err) || "fail", who: ids.filter(x => short.includes(uids[x])) });
          }
        }).catch(e => { console.error("hold", e); reply({ ok: false, err: "server" }); });
        return;
      }
      if (d && d.t === "p" && d.d && typeof d.d === "object" && !Array.isArray(d.d)) {
        for (const k of Object.keys(d.d).slice(0, 24)) {
          if (!/^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(k)) continue;
          if (d.d[k] === null) delete p.presence[k]; else p.presence[k] = d.d[k];
        }
        if (JSON.stringify(p.presence).length > MAX_PRESENCE) p.presence = {};
        broadcast(ch);
        if ((p.presence as any).host) settleIfOver(ch, p);
      }
    },
    close(ws) {
      const { ch, id } = ws.data;
      const m = chans.get(ch);
      const p = m?.get(id);
      if (!m || !p || p.ws !== ws) return;
      p.ws = null; p.away = true;
      broadcast(ch);
      p.timer = setTimeout(() => {
        m.delete(id);
        if (!m.size) chans.delete(ch); else broadcast(ch);
      }, AWAY_MS);
    },
  },
});
console.log("night market server on", server.port);

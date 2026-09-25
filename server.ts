// 야시장 부자 — realtime room server (Bun). One file: serves the game page and relays per-room presence.
const HTML: string = await Bun.file(new URL("./public/index.html", import.meta.url)).text();

type Peer = { id: string; presence: Record<string, unknown>; ws: any | null; away: boolean; timer?: ReturnType<typeof setTimeout> };
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
    const peers = [...m.values()].map(p => ({ peer: p.id, presence: p.presence, away: p.away }));
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
    if (u.pathname === "/health") return new Response("ok");
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
      if (d && d.t === "p" && d.d && typeof d.d === "object" && !Array.isArray(d.d)) {
        for (const k of Object.keys(d.d).slice(0, 24)) {
          if (!/^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(k)) continue;
          if (d.d[k] === null) delete p.presence[k]; else p.presence[k] = d.d[k];
        }
        if (JSON.stringify(p.presence).length > MAX_PRESENCE) p.presence = {};
        broadcast(ch);
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

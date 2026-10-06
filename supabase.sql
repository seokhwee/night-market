-- 야시장 부자 · 토큰/판돈 데이터베이스
-- Supabase 대시보드 → SQL Editor → New query 에 전부 붙여 넣고 Run 하세요. (여러 번 실행해도 안전해요)

-- ── 표 ──────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text not null default '손님',
  tokens      integer not null default 0 check (tokens >= 0),
  last_daily  date,
  last_rescue date,
  created_at  timestamptz not null default now()
);

create table if not exists public.ledger (            -- 토큰이 움직인 모든 기록
  id         bigserial primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  delta      integer not null,
  reason     text not null,                           -- signup · daily · rescue · stake · win · refund · gift_out · gift_in
  ref        text,
  created_at timestamptz not null default now()
);
create index if not exists ledger_user_time on public.ledger(user_id, created_at);

create table if not exists public.played_with (       -- 같이 판돈 게임을 한 사이 (선물 가능)
  a       uuid not null references public.profiles(id) on delete cascade,
  b       uuid not null references public.profiles(id) on delete cascade,
  last_at timestamptz not null default now(),
  primary key (a, b)
);

create table if not exists public.stakes (            -- 판돈 게임 한 판
  gid        text primary key,
  stake      integer not null,
  players    uuid[] not null,
  status     text not null default 'held',            -- held · paid · refunded
  winner     uuid,
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

alter table public.profiles add column if not exists nick_set boolean not null default false;  -- 가입 때 닉네임을 직접 정했는지

alter table public.profiles    enable row level security;
alter table public.ledger      enable row level security;
alter table public.played_with enable row level security;
alter table public.stakes      enable row level security;
-- 정책을 하나도 만들지 않아요: 공개 키로는 아무것도 읽거나 쓸 수 없고, 게임 서버(비밀 키)만 접근해요.

-- ── 가입하면 프로필 + 1,000 토큰 ───────────────────────
create or replace function public.nm_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, nickname, tokens)
  values (new.id,
          left(coalesce(nullif(new.raw_user_meta_data->>'nickname',''), nullif(new.raw_user_meta_data->>'name',''),
                        nullif(new.raw_user_meta_data->>'full_name',''), '손님'), 8),
          1000)
  on conflict (id) do nothing;
  if found then insert into public.ledger(user_id, delta, reason) values (new.id, 1000, 'signup'); end if;
  return new;
end $$;
drop trigger if exists nm_on_auth_user_created on auth.users;
create trigger nm_on_auth_user_created after insert on auth.users
  for each row execute function public.nm_new_user();

-- ── 접속할 때: 출석 100 (하루 한 번) · 0이면 구제 300 (하루 한 번) ──
create or replace function public.nm_daily(uid uuid) returns json
language plpgsql security definer set search_path = public as $$
declare today date := (now() at time zone 'Asia/Seoul')::date; p public.profiles; gave int := 0; res int := 0;
begin
  select * into p from public.profiles where id = uid for update;
  if not found then
    insert into public.profiles(id, tokens) values (uid, 1000) returning * into p;
    insert into public.ledger(user_id, delta, reason) values (uid, 1000, 'signup');
  end if;
  if p.last_daily is null or p.last_daily < today then
    update public.profiles set tokens = tokens + 100, last_daily = today where id = uid returning * into p;
    insert into public.ledger(user_id, delta, reason) values (uid, 100, 'daily'); gave := 100;
  end if;
  if p.tokens = 0 and (p.last_rescue is null or p.last_rescue < today) then
    update public.profiles set tokens = tokens + 300, last_rescue = today where id = uid returning * into p;
    insert into public.ledger(user_id, delta, reason) values (uid, 300, 'rescue'); res := 300;
  end if;
  return json_build_object('id', p.id, 'nickname', p.nickname, 'nickSet', p.nick_set, 'tokens', p.tokens, 'daily', gave, 'rescue', res);
end $$;

-- ── 판돈 걷기: 모두 낼 수 있을 때만 한꺼번에 ─────────────
create or replace function public.nm_hold(p_gid text, p_stake int, p_players uuid[]) returns json
language plpgsql security definer set search_path = public as $$
declare short uuid[]; n int;
begin
  if p_stake not in (100, 300, 500) then return json_build_object('ok', false, 'err', 'stake'); end if;
  if cardinality(p_players) < 2 or (select count(distinct x) from unnest(p_players) x) <> cardinality(p_players) then
    return json_build_object('ok', false, 'err', 'players'); end if;
  if exists (select 1 from public.stakes where gid = p_gid) then return json_build_object('ok', false, 'err', 'dup'); end if;
  perform 1 from public.profiles where id = any(p_players) order by id for update;
  select count(*) into n from public.profiles where id = any(p_players);
  if n <> cardinality(p_players) then return json_build_object('ok', false, 'err', 'nouser'); end if;
  select array_agg(id) into short from public.profiles where id = any(p_players) and tokens < p_stake;
  if short is not null then return json_build_object('ok', false, 'err', 'short', 'short', short); end if;
  update public.profiles set tokens = tokens - p_stake where id = any(p_players);
  insert into public.ledger(user_id, delta, reason, ref) select x, -p_stake, 'stake', p_gid from unnest(p_players) x;
  insert into public.stakes(gid, stake, players) values (p_gid, p_stake, p_players);
  insert into public.played_with(a, b) select x, y from unnest(p_players) x, unnest(p_players) y where x <> y
    on conflict (a, b) do update set last_at = now();
  return json_build_object('ok', true, 'pot', p_stake * cardinality(p_players));
end $$;

-- ── 판돈 지급: 1등이 전부 · 1등이 없으면 모두 돌려줌 ──────
create or replace function public.nm_settle(p_gid text, p_winner uuid) returns json
language plpgsql security definer set search_path = public as $$
declare s public.stakes; pot int;
begin
  select * into s from public.stakes where gid = p_gid for update;
  if not found or s.status <> 'held' then return json_build_object('ok', false, 'err', 'state'); end if;
  if p_winner is null or not (p_winner = any(s.players)) then
    update public.profiles set tokens = tokens + s.stake where id = any(s.players);
    insert into public.ledger(user_id, delta, reason, ref) select x, s.stake, 'refund', p_gid from unnest(s.players) x;
    update public.stakes set status = 'refunded', settled_at = now() where gid = p_gid;
    return json_build_object('ok', true, 'refunded', true);
  end if;
  pot := s.stake * cardinality(s.players);
  update public.profiles set tokens = tokens + pot where id = p_winner;
  insert into public.ledger(user_id, delta, reason, ref) values (p_winner, pot, 'win', p_gid);
  update public.stakes set status = 'paid', winner = p_winner, settled_at = now() where gid = p_gid;
  return json_build_object('ok', true, 'pot', pot, 'winner', p_winner);
end $$;

-- ── 끝나지 않은 판(방장이 사라짐 등)은 일정 시간 뒤 모두 환불 ──
create or replace function public.nm_refund_stale(p_hours int) returns int
language plpgsql security definer set search_path = public as $$
declare g text; n int := 0;
begin
  for g in select gid from public.stakes where status = 'held' and created_at < now() - make_interval(hours => p_hours) loop
    perform public.nm_settle(g, null); n := n + 1;
  end loop;
  return n;
end $$;

-- ── 선물: 같이 판돈 게임을 한 친구에게만 · 하루 보내기 300 · 받기 500 ──
create or replace function public.nm_gift(p_from uuid, p_to uuid, p_amt int) returns json
language plpgsql security definer set search_path = public as $$
declare today date := (now() at time zone 'Asia/Seoul')::date; sent int; recv int; bal int;
begin
  if p_amt is null or p_amt <= 0 or p_from = p_to then return json_build_object('ok', false, 'err', 'amount'); end if;
  if not exists (select 1 from public.played_with where a = p_from and b = p_to) then
    return json_build_object('ok', false, 'err', 'friend'); end if;
  perform 1 from public.profiles where id in (p_from, p_to) order by id for update;
  select coalesce(-sum(delta), 0) into sent from public.ledger
    where user_id = p_from and reason = 'gift_out' and (created_at at time zone 'Asia/Seoul')::date = today;
  select coalesce(sum(delta), 0) into recv from public.ledger
    where user_id = p_to and reason = 'gift_in' and (created_at at time zone 'Asia/Seoul')::date = today;
  if sent + p_amt > 300 then return json_build_object('ok', false, 'err', 'sendlimit', 'left', 300 - sent); end if;
  if recv + p_amt > 500 then return json_build_object('ok', false, 'err', 'recvlimit', 'left', 500 - recv); end if;
  select tokens into bal from public.profiles where id = p_from;
  if bal < p_amt then return json_build_object('ok', false, 'err', 'short'); end if;
  update public.profiles set tokens = tokens - p_amt where id = p_from;
  update public.profiles set tokens = tokens + p_amt where id = p_to;
  insert into public.ledger(user_id, delta, reason, ref) values (p_from, -p_amt, 'gift_out', p_to::text), (p_to, p_amt, 'gift_in', p_from::text);
  return json_build_object('ok', true, 'tokens', bal - p_amt, 'sentToday', sent + p_amt);
end $$;

-- ── 친구 목록 (최근에 같이 한 순) + 오늘 보낸 양 ──────────
create or replace function public.nm_friends(uid uuid) returns json
language sql security definer set search_path = public as $$
  select json_build_object(
    'friends', coalesce((select json_agg(json_build_object('id', p.id, 'nickname', p.nickname) order by w.last_at desc)
                         from public.played_with w join public.profiles p on p.id = w.b where w.a = uid), '[]'::json),
    'sentToday', (select coalesce(-sum(delta), 0) from public.ledger
                  where user_id = uid and reason = 'gift_out'
                    and (created_at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date));
$$;

-- ── 닉네임 바꾸기 ─────────────────────────────────────
create or replace function public.nm_nick(uid uuid, p_nick text) returns json
language sql security definer set search_path = public as $$
  update public.profiles set nickname = left(coalesce(nullif(trim(p_nick), ''), nickname), 8), nick_set = true where id = uid
  returning json_build_object('nickname', nickname, 'nickSet', nick_set);
$$;

-- ── 함수는 게임 서버(service_role)만 부를 수 있게 ───────────
do $$ declare f text; begin
  foreach f in array array['nm_daily(uuid)','nm_hold(text,integer,uuid[])','nm_settle(text,uuid)','nm_refund_stale(integer)',
                           'nm_gift(uuid,uuid,integer)','nm_friends(uuid)','nm_nick(uuid,text)','nm_new_user()'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end $$;

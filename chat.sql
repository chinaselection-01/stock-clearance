-- ============================================================
--  stock-clearance.ai — 站内聊天 / In-app messaging
--  在 Supabase 控制台 → SQL Editor 全选执行。
--  依赖：先执行过 schema.sql + accounts.sql
--        （listings.user_id、profiles、auth 基础已就绪）
--
--  作用：
--   1. listings_public 增加 user_id（买家据此定位供应商账号以发消息，owner id 非敏感）
--   2. messages 表 + RLS（参与者可读、发件人可写、收件人可标已读）
--   3. 加入 supabase_realtime 发布，支持实时收消息
--   4. 必要的授权
-- ============================================================

-- ---------- 1. listings_public 增加 user_id ----------
drop view if exists public.listings_public;
create view public.listings_public as
select
  id, title_cn, title_en, cat, belt, qty, unit,
  price_was, price_now, moq, cond, brand,
  desc_cn, desc_en, img, specs,
  supplier_name, supplier_verified, supplier_resp,
  featured, created_at, user_id
from public.listings;
grant select on public.listings_public to anon;
grant select on public.listings_public to authenticated;

-- ---------- 2. messages 表 ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id text references public.listings(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  receiver_id uuid references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);
create index if not exists messages_thread_idx on public.messages (listing_id, created_at);
create index if not exists messages_participant_idx on public.messages (sender_id, receiver_id);

-- ---------- 3. RLS ----------
alter table public.messages enable row level security;
drop policy if exists "messages select participants" on public.messages;
create policy "messages select participants"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
drop policy if exists "messages insert sender" on public.messages;
create policy "messages insert sender"
  on public.messages for insert
  with check (auth.uid() = sender_id);
drop policy if exists "messages update read" on public.messages;
create policy "messages update read"
  on public.messages for update
  using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

-- ---------- 4. 授权 ----------
grant select, insert, update on public.messages to anon, authenticated;

-- ---------- 5. 实时订阅 ----------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

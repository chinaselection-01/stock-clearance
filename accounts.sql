-- ============================================================
--  stock-clearance.ai — Accounts / 账号系统迁移
--  在 Supabase 控制台 → SQL Editor 全选执行。
--  依赖：先执行过 schema.sql（listings / inquiries / listing-images）。
--
--  作用：
--   1. profiles 表 + 触发器（新用户自动建资料）
--   2. listings / inquiries 增加 user_id，归属到账号
--   3. 收紧 RLS：发帖/询盘需登录且归属自己；询盘仅买家本人与对应供应商可见
--   4. avatars 存储桶（头像）
--   5. 必要的表/桶授权
--
--  前置（在 Supabase 控制台 → Authentication 设置）：
--   - Providers → Email 开启（默认开）
--   - Providers → Anonymous 开启（实现“拍照发即建号”）
--   - URL Configuration → Redirect URLs 加入 https://www.stock-clearance.ai/
-- ============================================================

-- ---------- 1. profiles 表 ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'both',
  whatsapp text,
  company text,
  avatar_url text,
  created_at timestamptz not null default now()
);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

-- 新用户（含匿名）自动建一行资料
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    case when new.email is not null then split_part(new.email,'@',1) else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 2. 给 listings / inquiries 增加 user_id ----------
alter table public.listings add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.inquiries add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists listings_user_id_idx on public.listings (user_id);
create index if not exists inquiries_user_id_idx on public.inquiries (user_id);

-- ---------- 3. RLS：listings ----------
-- 浏览公开（保持不变）
drop policy if exists "listings insert public" on public.listings;
create policy "listings insert auth"
  on public.listings for insert
  with check (auth.uid() is not null and user_id = auth.uid());
create policy "listings update own"
  on public.listings for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "listings delete own"
  on public.listings for delete
  using (auth.uid() = user_id);

-- ---------- 4. RLS：inquiries ----------
drop policy if exists "inquiries insert public" on public.inquiries;
drop policy if exists "inquiries read auth" on public.inquiries;
create policy "inquiries insert auth"
  on public.inquiries for insert
  with check (auth.uid() is not null and user_id = auth.uid());
create policy "inquiries select scoped"
  on public.inquiries for select
  using (
    auth.uid() = user_id
    or auth.uid() in (select user_id from public.listings where id = lot_id)
  );

-- ---------- 5. profiles RLS ----------
alter table public.profiles enable row level security;
create policy "profiles read public" on public.profiles for select using (true);
create policy "profiles upsert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

-- ---------- 6. avatars 存储桶 ----------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars read public" on storage.objects;
create policy "avatars read public"
  on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "avatars insert auth" on storage.objects;
create policy "avatars insert auth"
  on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() is not null);

-- ---------- 7. 授权 ----------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.listings to anon, authenticated;
grant select, insert, update, delete on public.inquiries to anon, authenticated;
grant select, insert, update on public.profiles to anon, authenticated;
grant select, insert on storage.objects to anon, authenticated;

-- ============================================================
--  stock-clearance.ai — 账号体系收口补丁
--  在 Supabase 控制台 → SQL Editor 全选执行。
--  背景：profiles 表已存在，但 avatars 存储桶缺失（头像上传 404），
--        且供应商资料需要 city / bio 两个字段（日后店铺页用）。
--  本脚本幂等，可重复执行。
-- ============================================================

-- ---------- 1. avatars 存储桶（缺失，需创建） ----------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 桶策略（先删后建，幂等）
drop policy if exists "avatars read public" on storage.objects;
create policy "avatars read public"
  on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "avatars insert auth" on storage.objects;
create policy "avatars insert auth"
  on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() is not null);

-- ---------- 2. profiles 扩展字段 ----------
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists bio text;

-- ---------- 3. 确保新用户自动建资料触发器存在 ----------
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

-- ---------- 4. 授权（幂等） ----------
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to anon, authenticated;
grant select, insert on storage.objects to anon, authenticated;

-- ---------- 校验 ----------
-- 应返回至少一行（含已存在的测试账号）；avatars 桶应在 Storage 里出现。
-- select * from storage.buckets where id='avatars';
-- select column_name from information_schema.columns where table_name='profiles' order by ordinal_position;

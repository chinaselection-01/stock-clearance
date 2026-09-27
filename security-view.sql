-- ============================================================
--  B 档防爬：隐藏供应商手机号，防止整表被匿名拖走
--  在 Supabase 控制台 → SQL Editor 中全选执行本文件即可。
--
--  问题：原 listings 表用 anon key 直连、select('*') 公开可读，
--        任何人拿 anon key 就能把整张表（含 supplier_whatsapp）
--        整库拖走。
--  解决：建一个 security_definer 安全视图，只暴露非敏感列
--        （过滤 supplier_whatsapp），anon 只能经由视图读，
--        无法直接读基表。前端 loadLots() 改为读该视图。
-- ============================================================

-- 1. 安全视图：白名单列，刻意不含 supplier_whatsapp
--    （Postgres 视图默认以所有者权限读基表，无需额外参数；
--      `with (security_definer)` 不是合法参数，会报 22023）
create or replace view public.listings_public as
select
  id, title_cn, title_en, cat, belt, qty, unit,
  price_was, price_now, moq, cond, brand,
  desc_cn, desc_en, img, specs,
  supplier_name, supplier_verified, supplier_resp,
  featured, created_at
from public.listings;

-- 2. 授权匿名 / 登录用户读视图（这是唯一的公开读通道）
grant select on public.listings_public to anon;
grant select on public.listings_public to authenticated;

-- 3. 撤销匿名 / 登录用户对基表的直接 select（保留 insert 供发布）
revoke select on public.listings from anon;
revoke select on public.listings from authenticated;

-- 说明：
--  * 供应商发布（insert）不受影响，仍写基表；
--  * 视图以定义者（postgres）权限读基表，返回白名单列；
--  * 即使有人拿 anon key 直接 from('listings').select('*')，
--    也会因无 select 权限被拒，拿不到 supplier_whatsapp。

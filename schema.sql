-- ============================================================
--  stock-clearance.ai — Supabase schema
--  在 Supabase 控制台 → SQL Editor 中全选执行本文件即可。
--  会创建：listings（尾货）、inquiries（询盘）两张表 +
--  listing-images 存储桶 + RLS 策略 + 8 条示例种子数据。
-- ============================================================

-- ---------- 表：listings ----------
create table if not exists public.listings (
  id text primary key,
  title_cn text,
  title_en text,
  cat text,
  belt text,
  qty integer,
  unit text default 'pcs',
  price_was numeric,
  price_now numeric,
  moq integer,
  cond text,
  brand text,
  desc_cn text,
  desc_en text,
  img text,
  specs jsonb default '{}'::jsonb,
  supplier_name text,
  supplier_whatsapp text,
  supplier_verified boolean default false,
  supplier_resp text,
  featured boolean default false,
  created_at timestamptz default now()
);
create index if not exists listings_created_at_idx on public.listings (created_at desc);
create index if not exists listings_cat_idx on public.listings (cat);
create index if not exists listings_belt_idx on public.listings (belt);

-- ---------- 表：inquiries ----------
create table if not exists public.inquiries (
  id text primary key,
  lot_id text references public.listings(id) on delete cascade,
  lot_title text,
  name text,
  email text,
  whatsapp text,
  qty text,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

-- ---------- 行级安全（RLS）----------
alter table public.listings enable row level security;
alter table public.inquiries enable row level security;

-- 尾货：任何人可读（撮合公开），任何人可发（MVP 低门槛，上线前加登录收紧写权限）
drop policy if exists "listings read public" on public.listings;
create policy "listings read public" on public.listings for select using (true);
drop policy if exists "listings insert public" on public.listings;

-- 询盘：买家可提交（匿名插入）；读取仅限已登录（默认 deny，保护买家 PII）
-- ⚠️ 上线前务必保留“查询仅登录可见”，否则买家邮箱/WhatsApp 会被任何人读到。
drop policy if exists "inquiries insert public" on public.inquiries;
create policy "inquiries insert public" on public.inquiries for insert with check (true);
drop policy if exists "inquiries read auth" on public.inquiries;
create policy "inquiries read auth" on public.inquiries for select using (auth.uid() is not null);

-- 若早期想先在网页里直接看询盘（仅限内部测试，PII 风险自负），取消下面注释：
-- create policy "inquiries read public TEMP" on public.inquiries for select using (true);

-- ---------- 存储桶：listing-images ----------
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

drop policy if exists "images read public" on storage.objects;
create policy "images read public" on storage.objects for select using (bucket_id='listing-images');
drop policy if exists "images insert public" on storage.objects;
create policy "images insert public" on storage.objects for insert with check (bucket_id='listing-images');

-- ---------- 示例种子数据（8 条，让首屏不空）----------
insert into public.listings (id, title_cn, title_en, cat, belt, qty, unit, price_was, price_now, moq, cond, brand, desc_cn, desc_en, img, specs, supplier_name, supplier_whatsapp, supplier_verified, supplier_resp, featured, created_at)
values
 ('L1001','纯棉 T 恤尾单 5 色 8000 件','Cotton T-shirt Overstock, 5 colors, 8,000 pcs','app','yw',8000,'pcs',3.20,0.85,500,'new','un','混码 S–XL，180–220g 精梳棉，剪标尾单。','Mixed size S–XL, 180–220gsm combed cotton. Tags removed.','',null,'Yiwu Likang Stock Co.','8613800000001',true,'< 6h',true, now() - interval '3 days'),
 ('L1002','猫爬架杂款 800 套','Cat Tree Mixed Lot, 800 sets','pet','zj',800,'sets',18.0,6.40,200,'new','un','多种款式混装，库存新品。','Assorted styles, brand-new stock.','',null,'Zhejiang PetMfg','8613800000002',true,'< 12h',true, now() - interval '2 days'),
 ('L1003','不锈钢保温杯 12oz 3000 个','Stainless Tumblers 12oz, 3,000 pcs','home','zj',3000,'pcs',4.50,1.10,1000,'new','own','304 不锈钢，自有品牌可贴牌。','304 stainless, own brand / OEM available.','',null,'Yongkang STWADD','8613800000003',true,'< 6h',true, now() - interval '1 day'),
 ('L1004','毛绒玩具退货 1200 件','Plush Toys Returns Lot, 1,200 pcs','toy','gd',1200,'pcs',2.80,0.60,300,'ret','un','电商退货，未分级，按斤走。','E-commerce returns, ungraded.','',null,'Guangzhou ToyOut','8613800000004',false,'< 24h',false, now() - interval '12 hours'),
 ('L1005','牛仔裤杂款 600 条','Denim Jeans Mixed Lot, 600 pcs','app','gd',600,'pcs',9.00,2.30,300,'mix','un','多版型混装，部分剪标。','Assorted fits, some tags removed.','',null,'Guangzhou DenimHub','8613800000005',true,'< 12h',false, now() - interval '5 hours'),
 ('L1006','宠物垫 1500 张','Pet Beds Lot, 1,500 pcs','pet','zj',1500,'pcs',4.00,1.20,200,'new','un','珊瑚绒，库存新品。','Coral fleece, brand-new stock.','',null,'Zhejiang PetMfg','8613800000002',true,'< 12h',false, now() - interval '30 minutes'),
 ('L1007','袜子 12000 双','Socks Lot, 12,000 pairs','app','zj',12000,'pr',0.70,0.18,1000,'new','un','运动袜混色，整箱。','Sport socks assorted colors, carton.','',null,'Zhejiang SockCo','8613800000006',false,'< 24h',false, now() - interval '10 minutes'),
 ('L1008','LED 灯泡尾单 5000 个','LED Bulbs Overstock, 5,000 pcs','ele','gd',5000,'pcs',0.90,0.22,500,'new','own','9W 暖白，自有品牌。','9W warm white, own brand.','',null,'Shenzhen LEDPro','8613800000007',true,'< 6h',false, now() - interval '2 minutes')
on conflict (id) do nothing;

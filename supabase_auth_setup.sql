-- =============================================================================
-- 電腦維修管理系統 - Supabase Auth & 使用者權限設定腳本
-- 請至 Supabase Dashboard > SQL Editor 貼上整份執行
-- =============================================================================

-- 1. 啟用 pgcrypto 擴充套件
create extension if not exists pgcrypto;

-- 2. 建立 profiles 使用者設定檔資料表
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '維修系統使用者',
  role_code integer not null default 1, -- 0: 系統管理員, 1: 一般工程師, 2: 維修主管/門市經理
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 啟用 profiles RLS
alter table public.profiles enable row level security;

-- 允許已認證的使用者讀取所有 profile（便於顯示工程師姓名）
drop policy if exists "Allow authenticated read profiles" on public.profiles;
create policy "Allow authenticated read profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

-- 允許使用者更新自己的姓名
drop policy if exists "Allow users update own profile" on public.profiles;
create policy "Allow users update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id);

-- 3. 自動註冊觸發器：新使用者註冊時自動建立 profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), '維修工程師'),
    coalesce((new.raw_user_meta_data->>'role_code')::int, 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. 取得當前使用者角色代碼輔助函式
create or replace function public.current_role_code()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role_code from public.profiles where id = auth.uid()),
    1
  );
$$;

-- 5. 列出所有使用者名單（僅限管理員調用）
create or replace function public.list_repair_users()
returns table (
  id uuid,
  email text,
  name text,
  role_code integer,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed boolean
)
language plpgsql
stable
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception '未登入使用者無法存取';
  end if;

  return query
  select
    u.id,
    coalesce(u.email::text, '')::text,
    coalesce(
      nullif(trim(p.name), ''),
      split_part(coalesce(u.email::text, ''), '@', 1),
      '未命名使用者'
    )::text,
    coalesce(p.role_code, 1)::integer,
    u.created_at,
    u.last_sign_in_at,
    (u.email_confirmed_at is not null)
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by u.created_at desc;
end;
$$;

grant execute on function public.list_repair_users() to authenticated;

-- 6. 設定使用者角色權限（僅限管理員調用）
create or replace function public.set_repair_user_role(
  p_user_id uuid,
  p_role_code integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_old_role integer;
  v_name text;
begin
  if auth.uid() is null then
    raise exception '未登入使用者無法存取';
  end if;

  if p_role_code not in (0, 1, 2) then
    raise exception '無效的角色代碼';
  end if;

  select p.role_code, p.name
    into v_old_role, v_name
  from public.profiles p
  where p.id = p_user_id
  for update;

  if not found then
    raise exception '找不到該使用者 profile';
  end if;

  if p_user_id = auth.uid() and p_role_code <> 0 then
    raise exception '管理員不能將自己的權限降級';
  end if;

  update public.profiles
  set role_code = p_role_code,
      updated_at = now()
  where id = p_user_id;

  return jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'name', v_name,
    'role_code', p_role_code
  );
end;
$$;

grant execute on function public.set_repair_user_role(uuid, integer) to authenticated;

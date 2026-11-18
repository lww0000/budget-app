-- BudgetQuickly – schema för Supabase. Kör i SQL Editor i ett tomt projekt.
-- Säker att köra om: IF NOT EXISTS / DROP POLICY IF EXISTS.

begin;

-- ===================== profiles =====================
-- En rad per användare. id = auth.users.id (koden använder .eq('id', userId)).
create table if not exists public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  name                  text,
  avatar                text,
  plan                  text not null default 'FREE'
                          check (plan in ('FREE', 'PRO', 'PREMIUM')),
  trial_ends_at         timestamptz,
  joined_at             timestamptz not null default now(),
  name_change_count     integer not null default 0,
  notifications_enabled boolean not null default false,
  deleted_at            timestamptz,
  theme                 text default 'ocean',
  custom_theme          jsonb,
  widgets               jsonb,
  income_sources        jsonb not null default '[]'::jsonb,
  expense_categories    jsonb not null default '[]'::jsonb
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated using ((select auth.uid()) = id);

-- ===================== transactions =====================
create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid()
                 references auth.users (id) on delete cascade,
  amount       numeric(14, 2) not null,
  category     text not null,
  description  text not null default '',
  date         timestamptz not null,
  type         text not null check (type in ('income', 'expense', 'bill')),
  is_recurring boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists transactions_user_id_date_idx
  on public.transactions (user_id, date desc);

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;

create policy "transactions_select_own" on public.transactions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "transactions_update_own" on public.transactions
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Explicita rättigheter (nya Supabase-projekt exponerar inte alltid tabeller automatiskt).
grant select, insert, update, delete on public.profiles     to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;

commit;

-- Darinol.id MVP Supabase schema
-- Jalankan file ini di Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'supporter')),
  payment_status text not null default 'none' check (payment_status in ('none', 'pending', 'paid', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  content text not null,
  source_urls text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.manual_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount > 0),
  method text not null default 'qris_manual',
  status text not null default 'pending' check (status in ('none', 'pending', 'paid', 'rejected')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists manual_payments_set_updated_at on public.manual_payments;
create trigger manual_payments_set_updated_at
before update on public.manual_payments
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, plan, payment_status)
  values (new.id, new.email, 'free', 'none')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.saved_ideas enable row level security;
alter table public.manual_payments enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile email" on public.profiles;
-- Tidak ada update policy untuk profiles.
-- Plan/payment_status sebaiknya diubah oleh admin dari Supabase Dashboard atau service role.

drop policy if exists "Users can read own saved ideas" on public.saved_ideas;
create policy "Users can read own saved ideas"
on public.saved_ideas for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own saved ideas" on public.saved_ideas;
create policy "Users can insert own saved ideas"
on public.saved_ideas for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own saved ideas" on public.saved_ideas;
create policy "Users can delete own saved ideas"
on public.saved_ideas for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own manual payments" on public.manual_payments;
create policy "Users can read own manual payments"
on public.manual_payments for select
using (auth.uid() = user_id);

drop policy if exists "Users can create own manual payments" on public.manual_payments;
create policy "Users can create own manual payments"
on public.manual_payments for insert
with check (auth.uid() = user_id);

create index if not exists saved_ideas_user_id_created_at_idx
on public.saved_ideas (user_id, created_at desc);

create index if not exists manual_payments_user_id_created_at_idx
on public.manual_payments (user_id, created_at desc);

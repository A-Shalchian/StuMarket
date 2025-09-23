------------------------------------------------------------
-- 1. Create profiles table for app-specific user data
------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  college text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

------------------------------------------------------------
-- 2. Keep updated_at column fresh automatically
------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

------------------------------------------------------------
-- 3. Auto-insert profile when a new auth.user is created
------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

------------------------------------------------------------
-- 4. Enable Row Level Security (RLS)
------------------------------------------------------------
alter table public.profiles enable row level security;

------------------------------------------------------------
-- 5. Policies (read/update own profile only)
------------------------------------------------------------
create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

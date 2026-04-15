-- ============================================================
-- Organização Estudos — Schema Supabase
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  name        text,
  email       text,
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = user_id);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#f59e0b',
  created_at  timestamptz not null default now()
);

alter table categories enable row level security;

create policy "Users can view own categories"
  on categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on categories for delete
  using (auth.uid() = user_id);

-- ============================================================
-- STUDIES
-- ============================================================
create table if not exists studies (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  description  text,
  category_id  uuid references categories(id) on delete set null,
  status       text not null default 'draft' check (status in ('draft', 'in_progress', 'complete')),
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table studies enable row level security;

create policy "Users can view own studies"
  on studies for select
  using (auth.uid() = user_id);

create policy "Users can insert own studies"
  on studies for insert
  with check (auth.uid() = user_id);

create policy "Users can update own studies"
  on studies for update
  using (auth.uid() = user_id);

create policy "Users can delete own studies"
  on studies for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger studies_updated_at
  before update on studies
  for each row execute procedure update_updated_at_column();

-- ============================================================
-- STUDY MATERIALS
-- ============================================================
create table if not exists study_materials (
  id             uuid primary key default uuid_generate_v4(),
  study_id       uuid not null references studies(id) on delete cascade,
  type           text not null check (type in ('docx', 'audio', 'video', 'infographic', 'slides')),
  file_url       text,
  external_link  text,
  file_name      text,
  file_size      bigint,
  created_at     timestamptz not null default now(),
  constraint study_materials_study_type_unique unique (study_id, type)
);

alter table study_materials enable row level security;

-- Materials inherit access from their parent study
create policy "Users can view own study materials"
  on study_materials for select
  using (
    exists (
      select 1 from studies
      where studies.id = study_materials.study_id
        and studies.user_id = auth.uid()
    )
  );

create policy "Users can insert own study materials"
  on study_materials for insert
  with check (
    exists (
      select 1 from studies
      where studies.id = study_materials.study_id
        and studies.user_id = auth.uid()
    )
  );

create policy "Users can update own study materials"
  on study_materials for update
  using (
    exists (
      select 1 from studies
      where studies.id = study_materials.study_id
        and studies.user_id = auth.uid()
    )
  );

create policy "Users can delete own study materials"
  on study_materials for delete
  using (
    exists (
      select 1 from studies
      where studies.id = study_materials.study_id
        and studies.user_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE
-- ============================================================
-- Run these in the Supabase Dashboard > Storage (create bucket manually)
-- or via Supabase CLI:
--
-- Bucket name: study-materials
-- Public: true (so files can be viewed directly)
--
-- Storage RLS policies (add via Dashboard > Storage > Policies):
--
-- Allow authenticated users to upload:
--   ((bucket_id = 'study-materials'::text) AND (auth.role() = 'authenticated'::text))
--
-- Allow public read:
--   (bucket_id = 'study-materials'::text)

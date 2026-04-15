-- ============================================================
-- FIX: study_materials RLS + Storage policies
-- Cole e rode no SQL Editor do Supabase
-- ============================================================

-- 1. Função SECURITY DEFINER para checar dono do estudo
--    Bypassa RLS na tabela studies ao verificar ownership
create or replace function is_study_owner(p_study_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from studies
    where id = p_study_id
      and user_id = auth.uid()
  );
$$;

-- 2. Recriar policies de study_materials usando a função
drop policy if exists "Users can view own study materials" on study_materials;
drop policy if exists "Users can insert own study materials" on study_materials;
drop policy if exists "Users can update own study materials" on study_materials;
drop policy if exists "Users can delete own study materials" on study_materials;

create policy "Users can view own study materials"
  on study_materials for select
  using (is_study_owner(study_id));

create policy "Users can insert own study materials"
  on study_materials for insert
  with check (is_study_owner(study_id));

create policy "Users can update own study materials"
  on study_materials for update
  using (is_study_owner(study_id));

create policy "Users can delete own study materials"
  on study_materials for delete
  using (is_study_owner(study_id));

-- 3. Garantir bucket existe e é público
insert into storage.buckets (id, name, public)
values ('study-materials', 'study-materials', true)
on conflict (id) do update set public = true;

-- 4. Storage policies
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Public read access" on storage.objects;
drop policy if exists "Authenticated users can delete own files" on storage.objects;

create policy "Authenticated users can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'study-materials');

create policy "Public read access"
  on storage.objects for select
  to public
  using (bucket_id = 'study-materials');

create policy "Authenticated users can delete own files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'study-materials');

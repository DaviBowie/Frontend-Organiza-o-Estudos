import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { type Study, type StudyStatus, type StudyMaterial, type MaterialType } from '../types';

interface FetchOptions {
  search?: string;
  categoryId?: string;
  status?: StudyStatus | '';
  startDate?: string;
  endDate?: string;
}

export function useStudies(options: FetchOptions = {}) {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudies = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('studies')
      .select(`*, category:categories(*), materials:study_materials(*)`)
      .order('updated_at', { ascending: false });

    if (options.search) {
      query = query.or(
        `title.ilike.%${options.search}%,description.ilike.%${options.search}%`
      );
    }
    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.startDate) {
      query = query.gte('created_at', options.startDate);
    }
    if (options.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    const { data, error } = await query;
    if (error) {
      setError(error.message);
    } else {
      setStudies(data ?? []);
    }
    setLoading(false);
  }, [
    options.search,
    options.categoryId,
    options.status,
    options.startDate,
    options.endDate,
  ]);

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  return { studies, loading, error, refetch: fetchStudies };
}

export function useStudy(id: string) {
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudy = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('studies')
      .select(`*, category:categories(*), materials:study_materials(*)`)
      .eq('id', id)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setStudy(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) fetchStudy();
  }, [fetchStudy, id]);

  return { study, loading, error, refetch: fetchStudy };
}

export async function uploadMaterial(
  studyId: string,
  type: MaterialType,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { url: null, error: 'Not authenticated' };

  const ext = file.name.split('.').pop();
  const path = `${user.id}/${studyId}/${type}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('study-materials')
    .upload(path, file);

  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from('study-materials').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function createStudy(
  title: string,
  description: string,
  categoryId: string | null,
  status: StudyStatus,
  tags: string[]
): Promise<{ id: string | null; error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { id: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('studies')
    .insert({
      user_id: user.id,
      title,
      description,
      category_id: categoryId || null,
      status,
      tags,
    })
    .select()
    .single();

  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function updateStudy(
  id: string,
  title: string,
  description: string,
  categoryId: string | null,
  status: StudyStatus,
  tags: string[]
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('studies')
    .update({
      title,
      description,
      category_id: categoryId || null,
      status,
      tags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  return { error: error?.message ?? null };
}

export async function deleteStudy(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('studies').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function saveMaterial(
  studyId: string,
  type: MaterialType,
  fileUrl: string | null,
  externalLink: string | null,
  fileName: string | null,
  fileSize: number | null
): Promise<{ error: string | null }> {
  // Delete existing material of same type
  await supabase
    .from('study_materials')
    .delete()
    .eq('study_id', studyId)
    .eq('type', type);

  if (!fileUrl && !externalLink) return { error: null };

  const { error } = await supabase.from('study_materials').insert({
    study_id: studyId,
    type,
    file_url: fileUrl,
    external_link: externalLink,
    file_name: fileName,
    file_size: fileSize,
  });

  return { error: error?.message ?? null };
}

export async function getDashboardStats() {
  const [studiesRes, materialsRes, categoriesRes] = await Promise.all([
    supabase.from('studies').select('status'),
    supabase.from('study_materials').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
  ]);

  const studies = studiesRes.data ?? [];
  return {
    totalStudies: studies.length,
    totalMaterials: materialsRes.count ?? 0,
    totalCategories: categoriesRes.count ?? 0,
    studiesByStatus: {
      draft: studies.filter((s) => s.status === 'draft').length,
      in_progress: studies.filter((s) => s.status === 'in_progress').length,
      complete: studies.filter((s) => s.status === 'complete').length,
    },
  };
}

export function getMaterialByType(
  materials: StudyMaterial[],
  type: MaterialType
): StudyMaterial | undefined {
  return materials.find((m) => m.type === type);
}

export async function renameMaterial(
  id: string,
  name: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('study_materials')
    .update({ file_name: name })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function reorderMaterials(
  materials: StudyMaterial[]
): Promise<{ error: string | null }> {
  const updates = materials.map((m, index) =>
    supabase
      .from('study_materials')
      .update({ order_index: index })
      .eq('id', m.id)
  );
  const results = await Promise.all(updates);
  const err = results.find((r) => r.error);
  return { error: err?.error?.message ?? null };
}

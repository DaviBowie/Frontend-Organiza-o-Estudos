import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { type Category } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      setError(error.message);
    } else {
      setCategories(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (name: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase.from('categories').insert({
      user_id: user.id,
      name,
      color,
    });

    if (!error) await fetchCategories();
    return { error };
  };

  const updateCategory = async (id: string, name: string, color: string) => {
    const { error } = await supabase
      .from('categories')
      .update({ name, color })
      .eq('id', id);

    if (!error) await fetchCategories();
    return { error };
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) await fetchCategories();
    return { error };
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

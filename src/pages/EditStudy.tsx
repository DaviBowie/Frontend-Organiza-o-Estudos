import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { StudyForm } from '../components/studies/StudyForm';
import { useStudy, updateStudy, saveMaterial, uploadMaterial } from '../hooks/useStudies';
import { useCategories } from '../hooks/useCategories';
import { type MaterialType } from '../types';

export default function EditStudy() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { study, loading: studyLoading } = useStudy(id!);
  const { categories } = useCategories();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(data: any) {
    setSaving(true);
    setError('');

    const tags = data.tags
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);

    const { error: updateError } = await updateStudy(
      id!,
      data.title,
      data.description,
      data.category_id || null,
      data.status,
      tags
    );

    if (updateError) {
      setError(updateError);
      setSaving(false);
      return;
    }

    // Process materials
    const materialTypes: MaterialType[] = ['docx', 'audio', 'video', 'infographic', 'slides'];

    const materialErrors: string[] = [];

    for (const type of materialTypes) {
      const mat = data.materials[type];
      if (!mat || (!mat.file && !mat.link)) continue;

      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileSize: number | null = null;

      if (mat.file) {
        const { url, error: uploadError } = await uploadMaterial(id!, type, mat.file);
        if (uploadError) {
          materialErrors.push(`${type}: ${uploadError}`);
          continue;
        }
        fileUrl = url;
        fileName = mat.file.name;
        fileSize = mat.file.size;
      }

      const { error: saveError } = await saveMaterial(id!, type, fileUrl, mat.link || null, fileName, fileSize);
      if (saveError) materialErrors.push(`${type}: ${saveError}`);
    }

    if (materialErrors.length > 0) {
      setError(`Alguns materiais falharam:\n${materialErrors.join('\n')}\n\nVerifique o bucket "study-materials" no Supabase Storage.`);
      setSaving(false);
      return;
    }

    navigate(`/studies/${id}`);
    setSaving(false);
  }

  if (studyLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-48" />
          <div className="h-64 bg-slate-900 rounded-xl border border-slate-800" />
        </div>
      </Layout>
    );
  }

  if (!study) {
    return (
      <Layout>
        <p className="text-slate-500">Estudo não encontrado.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Voltar
      </button>

      <Header title="Editar Estudo" subtitle={study.title} />

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-800/50 rounded-xl">
          <p className="text-sm text-red-400 whitespace-pre-line">{error}</p>
        </div>
      )}

      <div className="max-w-3xl">
        <StudyForm
          study={study}
          categories={categories}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </div>
    </Layout>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { StudyForm } from '../components/studies/StudyForm';
import { useCategories } from '../hooks/useCategories';
import {
  createStudy,
  saveMaterial,
  uploadMaterial,
} from '../hooks/useStudies';
import { type MaterialType } from '../types';

export default function NewStudy() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(data: any) {
    setLoading(true);
    setError('');

    const tags = data.tags
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);

    const { id, error: createError } = await createStudy(
      data.title,
      data.description,
      data.category_id || null,
      data.status,
      tags
    );

    if (createError || !id) {
      setError(createError ?? 'Erro ao criar estudo');
      setLoading(false);
      return;
    }

    const materialTypes: MaterialType[] = [
      'docx', 'audio', 'video', 'infographic', 'slides',
    ];

    const materialErrors: string[] = [];

    for (const type of materialTypes) {
      const mat = data.materials[type];
      if (!mat || (!mat.file && !mat.link)) continue;

      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileSize: number | null = null;

      if (mat.file) {
        const { url, error: uploadError } = await uploadMaterial(id, type, mat.file);
        if (uploadError) {
          materialErrors.push(`${type}: ${uploadError}`);
          continue;
        }
        fileUrl = url;
        fileName = mat.file.name;
        fileSize = mat.file.size;
      }

      const { error: saveError } = await saveMaterial(
        id,
        type,
        fileUrl,
        mat.link || null,
        fileName,
        fileSize
      );

      if (saveError) {
        materialErrors.push(`${type}: ${saveError}`);
      }
    }

    if (materialErrors.length > 0) {
      setError(
        `Estudo criado, mas alguns materiais falharam:\n${materialErrors.join('\n')}\n\nVerifique se o bucket "study-materials" existe no Supabase Storage com as políticas corretas.`
      );
      setLoading(false);
      // Still navigate — study was created, materials can be added later
      setTimeout(() => navigate(`/studies/${id}`), 3000);
      return;
    }

    navigate(`/studies/${id}`);
    setLoading(false);
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

      <Header
        title="Novo Estudo"
        subtitle="Preencha as informações e adicione os materiais gerados"
      />

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-800/50 rounded-xl">
          <p className="text-sm text-red-400 whitespace-pre-line">{error}</p>
        </div>
      )}

      <div className="max-w-3xl">
        <StudyForm
          categories={categories}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Tag,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { MaterialPlayer } from '../components/studies/MaterialPlayer';
import { Badge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  useStudy,
  deleteStudy,
  renameMaterial,
  reorderMaterials,
} from '../hooks/useStudies';
import {
  formatDate,
  formatRelativeDate,
  STATUS_LABELS,
  STATUS_COLORS,
  MATERIAL_LABELS,
} from '../lib/utils';
import { cn } from '../lib/utils';
import { type StudyMaterial } from '../types';

export default function StudyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { study, loading } = useStudy(id!);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [orderedMaterials, setOrderedMaterials] = useState<StudyMaterial[]>([]);

  // Sync local order when study loads
  useEffect(() => {
    if (study?.materials) {
      const available = study.materials
        .filter((m) => m.file_url || m.external_link)
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      setOrderedMaterials(available);
    }
  }, [study]);

  async function handleDelete() {
    setDeleting(true);
    const { error } = await deleteStudy(id!);
    if (!error) navigate('/studies');
    setDeleting(false);
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const next = [...orderedMaterials];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setOrderedMaterials(next);
    await reorderMaterials(next);
  }

  async function handleMoveDown(index: number) {
    if (index === orderedMaterials.length - 1) return;
    const next = [...orderedMaterials];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setOrderedMaterials(next);
    await reorderMaterials(next);
  }

  async function handleRename(materialId: string, name: string) {
    await renameMaterial(materialId, name);
    setOrderedMaterials((prev) =>
      prev.map((m) => (m.id === materialId ? { ...m, file_name: name } : m))
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-slate-800 rounded-lg w-64" />
          <div className="h-4 bg-slate-800 rounded w-48" />
          <div className="h-48 bg-slate-900 rounded-xl border border-slate-800 mt-8" />
        </div>
      </Layout>
    );
  }

  if (!study) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-slate-500">Estudo não encontrado.</p>
          <Button variant="ghost" onClick={() => navigate('/studies')} className="mt-4">
            Voltar
          </Button>
        </div>
      </Layout>
    );
  }

  const missingTypes = ['audio', 'video', 'infographic', 'slides', 'docx'].filter(
    (type) => !orderedMaterials.some((m) => m.type === type)
  );

  return (
    <Layout>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Voltar
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            {study.category && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: study.category.color + '22',
                  color: study.category.color,
                  border: `1px solid ${study.category.color}44`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: study.category.color }}
                />
                {study.category.name}
              </span>
            )}
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium',
                STATUS_COLORS[study.status]
              )}
            >
              {STATUS_LABELS[study.status]}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-3">
            {study.title}
          </h1>

          {study.description && (
            <p className="text-slate-400 text-base leading-relaxed mb-4">
              {study.description}
            </p>
          )}

          {study.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center mb-4">
              <Tag size={13} className="text-slate-600" />
              {study.tags.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              Criado em {formatDate(study.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              Atualizado {formatRelativeDate(study.updated_at)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-6">
          <Button variant="outline" onClick={() => navigate(`/studies/${id}/edit`)}>
            <Edit size={14} />
            Editar
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Materials */}
      {orderedMaterials.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Materiais ({orderedMaterials.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {orderedMaterials.map((material, index) => (
              <MaterialPlayer
                key={material.id}
                material={material}
                canMoveUp={index > 0}
                canMoveDown={index < orderedMaterials.length - 1}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                onRename={(name) => handleRename(material.id, name)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl">
          <p className="text-slate-600 text-sm">Nenhum material adicionado ainda.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => navigate(`/studies/${id}/edit`)}
          >
            <Edit size={14} />
            Adicionar materiais
          </Button>
        </div>
      )}

      {/* Missing materials */}
      {missingTypes.length > 0 && orderedMaterials.length > 0 && (
        <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-600 mb-2">Materiais não adicionados:</p>
          <div className="flex gap-2 flex-wrap">
            {missingTypes.map((type) => (
              <span key={type} className="text-xs text-slate-600 bg-slate-800 px-2 py-1 rounded">
                {MATERIAL_LABELS[type]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Delete modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Excluir estudo"
        size="sm"
      >
        <p className="text-sm text-slate-400 mb-6">
          Tem certeza que deseja excluir{' '}
          <strong className="text-slate-200">"{study.title}"</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            <Trash2 size={14} />
            Excluir
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}

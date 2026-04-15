import { useState } from 'react';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useCategories } from '../hooks/useCategories';
import { type Category } from '../types';
import { formatDateShort } from '../lib/utils';

const PRESET_COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ef4444', '#f97316', '#06b6d4', '#84cc16',
  '#ec4899', '#6366f1',
];

interface CategoryModalProps {
  category?: Category | null;
  onSave: (name: string, color: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

function CategoryModal({ category, onSave, onClose, loading }: CategoryModalProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState(category?.color ?? PRESET_COLORS[0]);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Nome obrigatório'); return; }
    await onSave(name.trim(), color);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Nome da Categoria"
        placeholder="Ex: Machine Learning"
        value={name}
        onChange={(e) => { setName(e.target.value); setError(''); }}
        error={error}
        autoFocus
      />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Cor</label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none"
              style={{
                backgroundColor: c,
                boxShadow: color === c ? `0 0 0 3px ${c}55, 0 0 0 2px #0f172a` : undefined,
              }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-slate-700 p-0.5"
          />
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-slate-500 font-mono">{color}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {category ? 'Salvar' : 'Criar categoria'}
        </Button>
      </div>
    </form>
  );
}

export default function Categories() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } =
    useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(name: string, color: string) {
    setSaving(true);
    if (editTarget) {
      await updateCategory(editTarget.id, name, color);
    } else {
      await createCategory(name, color);
    }
    setSaving(false);
    setModalOpen(false);
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteCategory(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <Layout>
      <Header
        title="Categorias"
        subtitle="Organize seus estudos por área de conhecimento"
        actions={
          <Button onClick={() => { setEditTarget(null); setModalOpen(true); }}>
            <Plus size={16} />
            Nova Categoria
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-900 rounded-xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="group">
              <CardContent className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: cat.color + '22', border: `2px solid ${cat.color}44` }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 truncate">{cat.name}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Criada em {formatDateShort(cat.created_at)}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditTarget(cat); setModalOpen(true); }}
                    className="p-1.5 text-slate-600 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FolderOpen size={48} />}
          title="Nenhuma categoria"
          description="Crie categorias para organizar seus estudos por área de conhecimento."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              Criar categoria
            </Button>
          }
        />
      )}

      {/* Create/Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        title={editTarget ? 'Editar Categoria' : 'Nova Categoria'}
        size="sm"
      >
        <CategoryModal
          category={editTarget}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          loading={saving}
        />
      </Modal>

      {/* Delete modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir Categoria"
        size="sm"
      >
        <p className="text-sm text-slate-400 mb-6">
          Tem certeza que deseja excluir{' '}
          <strong className="text-slate-200">"{deleteTarget?.name}"</strong>?
          Os estudos nessa categoria não serão excluídos.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
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

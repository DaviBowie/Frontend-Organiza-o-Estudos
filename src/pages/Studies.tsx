import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal, BookOpen, Sparkles } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { StudyCard } from '../components/studies/StudyCard';
import { EmptyState } from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { useStudies } from '../hooks/useStudies';
import { useCategories } from '../hooks/useCategories';
import { type StudyStatus } from '../types';
import { cn } from '../lib/utils';

export default function Studies() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<StudyStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const { studies, loading } = useStudies({
    search: debouncedSearch,
    categoryId,
    status,
  });

  const { categories } = useCategories();

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout((window as any).__searchTimer);
    (window as any).__searchTimer = setTimeout(() => setDebouncedSearch(value), 400);
  }

  return (
    <Layout>
      <Header
        title="Estudos"
        subtitle={`${studies.length} ${studies.length === 1 ? 'estudo encontrado' : 'estudos encontrados'}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/studies/generate')}>
              <Sparkles size={16} />
              Gerar com NotebookLM
            </Button>
            <Button onClick={() => navigate('/studies/new')}>
              <Plus size={16} />
              Novo Estudo
            </Button>
          </div>
        }
      />

      {/* Search and filters */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Buscar por título, descrição..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition-all',
              showFilters || categoryId || status
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
            )}
          >
            <SlidersHorizontal size={15} />
            Filtros
            {(categoryId || status) && (
              <span className="w-4 h-4 bg-amber-500 text-slate-900 text-xs rounded-full flex items-center justify-center font-bold">
                {[categoryId, status].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3 items-end animate-slide-in">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StudyStatus | '')}
                className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="">Todos os status</option>
                <option value="draft">Rascunho</option>
                <option value="in_progress">Em progresso</option>
                <option value="complete">Completo</option>
              </select>
            </div>
            {(categoryId || status) && (
              <button
                onClick={() => { setCategoryId(''); setStatus(''); }}
                className="text-xs text-slate-500 hover:text-slate-300 px-3 py-2 whitespace-nowrap"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-52 bg-slate-900 rounded-xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : studies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studies.map((study) => (
            <StudyCard key={study.id} study={study} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="Nenhum estudo encontrado"
          description={
            debouncedSearch || categoryId || status
              ? 'Tente ajustar seus filtros ou termo de busca.'
              : 'Crie seu primeiro estudo para começar.'
          }
          action={
            !debouncedSearch && !categoryId && !status ? (
              <Button onClick={() => navigate('/studies/new')}>
                <Plus size={16} />
                Novo Estudo
              </Button>
            ) : undefined
          }
        />
      )}
    </Layout>
  );
}

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { StudyCard } from '../components/studies/StudyCard';
import { useStudies } from '../hooks/useStudies';
import { useCategories } from '../hooks/useCategories';
import { type StudyStatus } from '../types';

export default function SearchPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<StudyStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { studies, loading } = useStudies({
    search: debouncedSearch,
    categoryId,
    status,
    startDate,
    endDate,
  });

  const { categories } = useCategories();

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout((window as any).__searchTimer2);
    (window as any).__searchTimer2 = setTimeout(() => setDebouncedSearch(value), 400);
  }

  const hasFilters = debouncedSearch || categoryId || status || startDate || endDate;

  return (
    <Layout>
      <Header
        title="Busca Avançada"
        subtitle="Encontre qualquer estudo com filtros combinados"
      />

      {/* Search and filters panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        {/* Main search */}
        <div className="relative mb-5">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Buscar por título, descrição, tags..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
          />
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StudyStatus | '')}
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="">Todos</option>
              <option value="draft">Rascunho</option>
              <option value="in_progress">Em progresso</option>
              <option value="complete">Completo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">De</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Até</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              {loading ? 'Buscando...' : `${studies.length} resultado(s)`}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setDebouncedSearch('');
                setCategoryId('');
                setStatus('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {!hasFilters ? (
        <div className="text-center py-16">
          <Search size={40} className="mx-auto text-slate-700 mb-3" />
          <p className="text-slate-500 text-sm">
            Use os filtros acima para buscar estudos.
          </p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
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
        <div className="text-center py-16">
          <Search size={40} className="mx-auto text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhum resultado encontrado.</p>
          <p className="text-slate-600 text-xs mt-1">
            Tente termos diferentes ou ajuste os filtros.
          </p>
        </div>
      )}
    </Layout>
  );
}

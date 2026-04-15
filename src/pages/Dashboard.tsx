import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Layers, FolderOpen, TrendingUp } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { StudyCard } from '../components/studies/StudyCard';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useStudies, getDashboardStats } from '../hooks/useStudies';
import { type DashboardStats } from '../types';

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { studies, loading } = useStudies();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  const recentStudies = studies.slice(0, 6);

  return (
    <Layout>
      <Header
        title="Dashboard"
        subtitle="Visão geral da sua biblioteca de estudos"
        actions={
          <Button onClick={() => navigate('/studies/new')}>
            <Plus size={16} />
            Novo Estudo
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BookOpen}
          label="Total de estudos"
          value={stats?.totalStudies ?? 0}
          color="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          icon={Layers}
          label="Materiais gerados"
          value={stats?.totalMaterials ?? 0}
          color="bg-teal-500/10 text-teal-400"
        />
        <StatCard
          icon={FolderOpen}
          label="Categorias"
          value={stats?.totalCategories ?? 0}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Completos"
          value={stats?.studiesByStatus.complete ?? 0}
          color="bg-green-500/10 text-green-400"
        />
      </div>

      {/* Status breakdown */}
      {stats && stats.totalStudies > 0 && (
        <div className="mb-8">
          <div className="flex gap-2 mb-2">
            {[
              { key: 'draft', label: 'Rascunho', color: 'bg-slate-600' },
              { key: 'in_progress', label: 'Em progresso', color: 'bg-amber-500' },
              { key: 'complete', label: 'Completo', color: 'bg-teal-500' },
            ].map(({ key, label, color }) => {
              const count = stats.studiesByStatus[key as keyof typeof stats.studiesByStatus];
              const pct = Math.round((count / stats.totalStudies) * 100);
              return (
                <div key={key} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${color}`} />
                  {label}: {count} ({pct}%)
                </div>
              );
            })}
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full flex overflow-hidden gap-0.5">
            {[
              { key: 'draft', color: 'bg-slate-600' },
              { key: 'in_progress', color: 'bg-amber-500' },
              { key: 'complete', color: 'bg-teal-500' },
            ].map(({ key, color }) => {
              const count = stats.studiesByStatus[key as keyof typeof stats.studiesByStatus];
              const pct = (count / stats.totalStudies) * 100;
              if (!pct) return null;
              return (
                <div
                  key={key}
                  className={`h-full ${color} rounded-full transition-all`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Recent studies */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-300">Estudos Recentes</h2>
        {studies.length > 6 && (
          <button
            onClick={() => navigate('/studies')}
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Ver todos →
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-900 rounded-xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : recentStudies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentStudies.map((study) => (
            <StudyCard key={study.id} study={study} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="Nenhum estudo ainda"
          description="Crie seu primeiro estudo para começar a organizar sua biblioteca de conhecimento."
          action={
            <Button onClick={() => navigate('/studies/new')}>
              <Plus size={16} />
              Criar primeiro estudo
            </Button>
          }
        />
      )}
    </Layout>
  );
}

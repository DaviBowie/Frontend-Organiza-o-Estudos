import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  LogOut,
  GraduationCap,
  Search,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/studies', icon: BookOpen, label: 'Estudos' },
  { to: '/categories', icon: FolderOpen, label: 'Categorias' },
  { to: '/search', icon: Search, label: 'Busca' },
];

export function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-950 border-r border-slate-800/60 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <GraduationCap size={16} className="text-slate-900" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100 leading-tight">
            Org. Estudos
          </p>
          <p className="text-xs text-slate-500">Biblioteca Pessoal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  className={isActive ? 'text-amber-400' : 'text-slate-500'}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-slate-800/60">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-teal-400 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-slate-900">
              {(user?.email ?? 'U')[0].toUpperCase()}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-300 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-900/10 transition-all duration-150"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}

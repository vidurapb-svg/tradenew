import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlayCircle, 
  Target, 
  List, 
  BarChart2, 
  Settings 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Replay Simulator', href: '/replay', icon: PlayCircle },
  { name: 'Challenges', href: '/challenge', icon: Target },
  { name: 'Trade History', href: '/history', icon: List },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-panel border-r border-line flex flex-col h-full shrink-0">
      <div className="flex h-16 items-center flex-shrink-0 px-6 font-mono font-bold tracking-tight text-lg text-ink">
        <span className="text-accent mr-2">/</span>
        TRADE_SIM
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={twMerge(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-panel-hover text-accent'
                    : 'text-ink-muted hover:bg-panel-hover hover:text-ink'
                )}
              >
                <item.icon
                  className={twMerge(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-accent' : 'text-ink-muted group-hover:text-ink'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 border-t border-line p-4">
        <Link
          to="#"
          className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-ink-muted hover:bg-panel-hover hover:text-ink transition-colors"
        >
          <Settings className="text-ink-muted group-hover:text-ink mr-3 h-5 w-5 flex-shrink-0" />
          Settings
        </Link>
      </div>
    </div>
  );
}

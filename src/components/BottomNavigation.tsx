import {
  Clock3,
  Heart,
  Map,
  Settings,
} from 'lucide-react';

import type { BottomTab } from '../types';

interface BottomNavigationProps {
  active: BottomTab;
  onChange: (tab: BottomTab) => void;
}

export default function BottomNavigation({
  active,
  onChange,
}: BottomNavigationProps) {
  const items: {
    id: BottomTab;
    label: string;
    icon: typeof Map;
  }[] = [
    {
      id: 'map',
      label: 'Mapa',
      icon: Map,
    },
    {
      id: 'favorites',
      label: 'Ulubione',
      icon: Heart,
    },
    {
      id: 'history',
      label: 'Historia',
      icon: Clock3,
    },
    {
      id: 'settings',
      label: 'Ustawienia',
      icon: Settings,
    },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-[1000] border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 sm:hidden">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const selected = active === item.id;

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-3 text-[10px] font-bold transition ${
                selected
                  ? 'text-violet-600'
                  : 'text-slate-500'
              }`}
            >
              <Icon
                size={20}
                fill={
                  selected && item.id === 'favorites'
                    ? 'currentColor'
                    : 'none'
                }
              />

              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
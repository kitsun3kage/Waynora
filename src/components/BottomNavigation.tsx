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
    <nav className="absolute bottom-0 left-0 right-0 z-[1000] border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-[0_-8px_30px_rgba(0,0,0,0.35)] sm:hidden">
      <div className="grid grid-cols-4 px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const selected =
            active === item.id;

          return (
            <button
              type="button"
              key={item.id}
              onClick={() =>
                onChange(item.id)
              }
              className={`relative flex flex-col items-center gap-1.5 px-2 py-3 text-[10px] font-bold transition active:scale-95 ${
                selected
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {selected && (
                <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-violet-600 dark:bg-violet-400" />
              )}

              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  selected
                    ? 'bg-violet-100 dark:bg-violet-950/70'
                    : 'bg-transparent'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={
                    selected ? 2.6 : 2
                  }
                  fill={
                    selected &&
                    item.id ===
                      'favorites'
                      ? 'currentColor'
                      : 'none'
                  }
                />
              </span>

              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

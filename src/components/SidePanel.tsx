import {
  Briefcase,
  Clock3,
  Heart,
  Home,
  MapPin,
  Settings,
  Trash2,
  X,
} from 'lucide-react';

import type {
  HistoryItem,
  SavedPlace,
  SearchResult,
} from '../types';

interface SidePanelProps {
  type: 'favorites' | 'history';
  favorites: SavedPlace[];
  history: HistoryItem[];
  home: SavedPlace | null;
  work: SavedPlace | null;
  onSelect: (place: SearchResult) => void;
  onDeleteFavorite: (id: string) => void;
  onClose: () => void;
  onOpenSettings: () => void;
}

export default function SidePanel({
  type,
  favorites,
  history,
  home,
  work,
  onSelect,
  onDeleteFavorite,
  onClose,
  onOpenSettings,
}: SidePanelProps) {
  const places =
    type === 'favorites'
      ? favorites
      : history;

  function toResult(
    place: SavedPlace | HistoryItem,
  ): SearchResult {
    return {
      placeId: place.id,
      displayName: place.address,
      lat: place.coordinates.lat,
      lng: place.coordinates.lng,
    };
  }

  return (
    <div className="absolute inset-0 z-[1200] flex justify-end bg-black/20 backdrop-blur-[2px]">
      <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Waynora
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
              {type === 'favorites'
                ? 'Ulubione'
                : 'Historia'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2.5 dark:bg-slate-800"
            aria-label="Zamknij panel"
          >
            <X size={20} />
          </button>
        </div>

        {type === 'favorites' && (
          <div className="mt-6 space-y-2">
            {home && (
              <button
                type="button"
                onClick={() => onSelect(toResult(home))}
                className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <span className="rounded-xl bg-violet-100 p-2.5 text-violet-600 dark:bg-violet-950">
                  <Home size={19} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">
                    Dom
                  </span>

                  <span className="block truncate text-xs text-slate-500">
                    {home.address}
                  </span>
                </span>
              </button>
            )}

            {work && (
              <button
                type="button"
                onClick={() => onSelect(toResult(work))}
                className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <span className="rounded-xl bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-950">
                  <Briefcase size={19} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">
                    Praca
                  </span>

                  <span className="block truncate text-xs text-slate-500">
                    {work.address}
                  </span>
                </span>
              </button>
            )}
          </div>
        )}

        <div className="mt-6 space-y-2">
          {places.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              {type === 'favorites' ? (
                <Heart
                  size={30}
                  className="mx-auto text-slate-300"
                />
              ) : (
                <Clock3
                  size={30}
                  className="mx-auto text-slate-300"
                />
              )}

              <p className="mt-3 text-sm font-semibold">
                Brak zapisanych miejsc
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Twoje miejsca pojawią się tutaj.
              </p>
            </div>
          ) : (
            places.map((place) => (
              <div
                key={place.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 dark:border-slate-800"
              >
                <button
                  type="button"
                  onClick={() => onSelect(toResult(place))}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
                    <MapPin size={18} />
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">
                      {place.name}
                    </span>

                    <span className="block truncate text-xs text-slate-500">
                      {place.address}
                    </span>
                  </span>
                </button>

                {type === 'favorites' && (
                  <button
                    type="button"
                    onClick={() =>
                      onDeleteFavorite(place.id)
                    }
                    aria-label="Usuń ulubione miejsce"
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="mt-6 flex w-full items-center gap-3 rounded-2xl bg-slate-100 p-4 text-left dark:bg-slate-900"
        >
          <Settings size={19} />

          <span className="text-sm font-bold">
            Ustawienia Waynory
          </span>
        </button>
      </aside>
    </div>
  );
}
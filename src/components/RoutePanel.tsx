import {
  ArrowRight,
  Clock3,
  Navigation,
  Route as RouteIcon,
  X,
} from 'lucide-react';

import type {
  Coordinates,
  Route,
  SearchResult,
} from '../types';

import {
  formatDistance,
  formatDuration,
  getEta,
} from '../utils/navigation';

interface RoutePanelProps {
  destination: SearchResult;
  route: Route | null;
  calculating: boolean;
  units: 'metric' | 'imperial';
  onStart: () => void;
  onClose: () => void;
  userPosition: Coordinates | null;
}

export default function RoutePanel({
  destination,
  route,
  calculating,
  units,
  onStart,
  onClose,
  userPosition,
}: RoutePanelProps) {
  return (
    <section className="absolute bottom-0 left-0 right-0 z-[900] mx-auto max-w-2xl px-3 pb-[calc(12px+env(safe-area-inset-bottom))] sm:bottom-4 sm:px-4">
      <div className="overflow-hidden rounded-[28px] border border-white/30 bg-white/95 shadow-floating backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/95">
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Cel
            </p>

            <h2 className="mt-1 truncate text-lg font-bold text-slate-950 dark:text-white">
              {destination.displayName.split(',')[0]}
            </h2>

            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {destination.displayName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij panel trasy"
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {calculating ? (
          <div className="border-t border-slate-100 px-5 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-violet-100 dark:bg-violet-950" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          </div>
        ) : route ? (
          <>
            <div className="grid grid-cols-3 border-y border-slate-100 dark:border-slate-800">
              <div className="p-4 text-center">
                <RouteIcon
                  size={18}
                  className="mx-auto mb-1.5 text-violet-600"
                />

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Dystans
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                  {formatDistance(
                    route.distance,
                    units,
                  )}
                </p>
              </div>

              <div className="border-x border-slate-100 p-4 text-center dark:border-slate-800">
                <Clock3
                  size={18}
                  className="mx-auto mb-1.5 text-violet-600"
                />

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Czas
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                  {formatDuration(route.duration)}
                </p>
              </div>

              <div className="p-4 text-center">
                <Navigation
                  size={18}
                  className="mx-auto mb-1.5 text-violet-600"
                />

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ETA
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                  {getEta(route.duration)}
                </p>
              </div>
            </div>

            {!userPosition && (
              <p className="px-5 pt-4 text-center text-xs text-amber-600">
                Włącz lokalizację, aby rozpocząć
                nawigację od swojej pozycji.
              </p>
            )}

            <div className="p-4">
              <button
                type="button"
                disabled={!userPosition}
                onClick={onStart}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Navigation size={19} />
                Rozpocznij nawigację
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="border-t border-slate-100 px-5 py-5 text-sm text-red-500 dark:border-slate-800">
            Nie udało się wyznaczyć trasy.
          </div>
        )}
      </div>
    </section>
  );
}
import {
  ChevronDown,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

import type {
  Coordinates,
  Route,
  Settings,
} from '../types';

import {
  formatDistance,
  formatDuration,
  getEta,
  getManeuverArrow,
  getManeuverLabel,
} from '../utils/navigation';

interface NavigationModeProps {
  route: Route;
  position: Coordinates | null;
  settings: Settings;
  muted: boolean;
  onToggleVoice: () => void;
  onExit: () => void;
  rerouting: boolean;
}

export default function NavigationMode({
  route,
  position,
  settings,
  muted,
  onToggleVoice,
  onExit,
  rerouting,
}: NavigationModeProps) {
  const currentStep = route.steps[0];

  return (
    <div className="pointer-events-none absolute inset-0 z-[950]">
      <div className="pointer-events-auto absolute left-3 right-3 top-[calc(12px+env(safe-area-inset-top))] sm:left-5 sm:right-auto sm:w-[380px]">
        <div className="overflow-hidden rounded-[26px] bg-slate-950/95 text-white shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-xs font-semibold text-slate-400">
                Następny manewr
              </p>

              <div className="mt-1 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-3xl font-bold text-slate-950">
                  {getManeuverArrow(currentStep)}
                </div>

                <div>
                  <p className="text-lg font-bold">
                    {getManeuverLabel(currentStep)}
                  </p>

                  <p className="text-sm text-slate-400">
                    {currentStep?.name || 'Droga'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onExit}
              aria-label="Zakończ nawigację"
              className="rounded-full bg-white/10 p-2.5 transition hover:bg-white/20"
            >
              <X size={19} />
            </button>
          </div>

          {currentStep && (
            <div className="border-t border-white/10 px-5 py-3">
              <div className="flex items-center gap-2 text-sm">
                <ChevronDown size={17} className="text-violet-400" />

                <span className="font-semibold">
                  {formatDistance(
                    currentStep.distance,
                    settings.units,
                  )}
                </span>

                <span className="text-slate-500">
                  do manewru
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-auto absolute bottom-[calc(12px+env(safe-area-inset-bottom))] left-3 right-3 sm:bottom-5 sm:left-auto sm:right-5 sm:w-[380px]">
        <div className="rounded-[26px] bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Pozostało
              </p>

              <p className="mt-1 text-lg font-bold">
                {formatDistance(
                  route.distance,
                  settings.units,
                )}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Czas
              </p>

              <p className="mt-1 text-lg font-bold">
                {formatDuration(route.duration)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                ETA
              </p>

              <p className="mt-1 text-lg font-bold">
                {getEta(route.duration)}
              </p>
            </div>
          </div>

          {rerouting && (
            <div className="mt-3 rounded-xl bg-amber-500/15 px-3 py-2 text-center text-xs font-semibold text-amber-300">
              Ponowne wyznaczanie trasy…
            </div>
          )}

          {position && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                GPS aktywny
              </span>

              <button
                type="button"
                onClick={onToggleVoice}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold transition hover:bg-white/20"
                aria-label={
                  muted
                    ? 'Włącz komunikaty głosowe'
                    : 'Wyłącz komunikaty głosowe'
                }
              >
                {muted ? (
                  <VolumeX size={16} />
                ) : (
                  <Volume2 size={16} />
                )}

                {muted ? 'Głos wyłączony' : 'Głos włączony'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
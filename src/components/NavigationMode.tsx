import {
  ChevronDown,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

import {
  useMemo,
} from 'react';

import type {
  Coordinates,
  Route,
  RouteStep,
  Settings,
} from '../types';

import {
  distanceBetween,
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

function getCurrentStep(
  route: Route,
  position: Coordinates | null,
): {
  step: RouteStep | null;
  index: number;
  distance: number;
} {
  if (
    !route.steps ||
    route.steps.length === 0
  ) {
    return {
      step: null,
      index: 0,
      distance: 0,
    };
  }

  if (!position) {
    return {
      step: route.steps[0],
      index: 0,
      distance: route.steps[0].distance,
    };
  }

  let nearestIndex = 0;
  let nearestDistance =
    Number.POSITIVE_INFINITY;

  route.steps.forEach(
    (step, index) => {
      const [
        lat,
        lng,
      ] = step.maneuver.location;

      const distance =
        distanceBetween(
          position,
          {
            lat,
            lng,
          },
        );

      if (
        distance <
        nearestDistance
      ) {
        nearestDistance =
          distance;

        nearestIndex =
          index;
      }
    },
  );

  const step =
    route.steps[nearestIndex];

  return {
    step,
    index: nearestIndex,
    distance: nearestDistance,
  };
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
  const current = useMemo(
    () =>
      getCurrentStep(
        route,
        position,
      ),
    [
      position,
      route,
    ],
  );

  const currentStep =
    current.step;

  const nextStep =
    current.index + 1 <
    route.steps.length
      ? route.steps[
          current.index + 1
        ]
      : null;

  const distanceToManeuver =
    position &&
    currentStep
      ? distanceBetween(
          position,
          {
            lat:
              currentStep
                .maneuver
                .location[0],
            lng:
              currentStep
                .maneuver
                .location[1],
          },
        )
      : current.distance;

  const maneuverArrow =
    currentStep
      ? getManeuverArrow(
          currentStep,
        )
      : '↑';

  const maneuverLabel =
    currentStep
      ? getManeuverLabel(
          currentStep,
        )
      : 'Kontynuuj jazdę';

  const maneuverRoad =
    currentStep?.name ||
    'Droga';

  return (
    <div className="pointer-events-none absolute inset-0 z-[950]">
      {/* Górny panel */}
      <div className="pointer-events-auto absolute left-3 right-3 top-[calc(12px+env(safe-area-inset-top))] sm:left-5 sm:right-auto sm:w-[390px]">
        <div className="waynora-navigation-card overflow-hidden rounded-[28px]">
          <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Następny manewr
              </p>

              <div className="mt-2 flex items-center gap-3">
                <div className="waynora-maneuver-icon">
                  <span>
                    {maneuverArrow}
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-lg font-extrabold text-slate-950 dark:text-white sm:text-xl">
                    {maneuverLabel}
                  </p>

                  <p className="mt-0.5 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                    {maneuverRoad}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onExit}
              aria-label="Zakończ nawigację"
              className="waynora-navigation-icon-button shrink-0"
            >
              <X size={19} />
            </button>
          </div>

          <div className="waynora-navigation-divider" />

          <div className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <ChevronDown
                size={17}
                className="shrink-0 text-violet-600 dark:text-violet-400"
              />

              <span className="text-sm font-extrabold text-slate-950 dark:text-white">
                {formatDistance(
                  distanceToManeuver,
                  settings.units,
                )}
              </span>

              <span className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                do manewru
              </span>
            </div>

            {nextStep && (
              <span className="shrink-0 text-xs font-semibold text-slate-400 dark:text-slate-500">
                Następnie{' '}
                {getManeuverLabel(
                  nextStep,
                ).toLowerCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dolny panel */}
      <div className="pointer-events-auto absolute bottom-[calc(12px+env(safe-area-inset-bottom))] left-3 right-3 sm:bottom-5 sm:left-auto sm:right-5 sm:w-[390px]">
        <div className="waynora-navigation-card rounded-[28px] p-4 sm:p-5">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                Pozostało
              </p>

              <p className="mt-1 truncate text-lg font-extrabold text-slate-950 dark:text-white">
                {formatDistance(
                  route.distance,
                  settings.units,
                )}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                Czas
              </p>

              <p className="mt-1 truncate text-lg font-extrabold text-slate-950 dark:text-white">
                {formatDuration(
                  route.duration,
                )}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                ETA
              </p>

              <p className="mt-1 truncate text-lg font-extrabold text-slate-950 dark:text-white">
                {getEta(
                  route.duration,
                )}
              </p>
            </div>
          </div>

          {rerouting && (
            <div className="mt-4 rounded-2xl border border-amber-300/60 bg-amber-50 px-3 py-2.5 text-center text-xs font-bold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              Ponowne wyznaczanie trasy…
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-3.5 dark:border-slate-800">
            <div className="flex min-w-0 items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>

              <span className="truncate text-xs font-bold text-slate-500 dark:text-slate-400">
                {position
                  ? 'GPS aktywny'
                  : 'Oczekiwanie na GPS'}
              </span>
            </div>

            <button
              type="button"
              onClick={
                onToggleVoice
              }
              className="waynora-voice-button"
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

              <span>
                {muted
                  ? 'Głos wyłączony'
                  : 'Głos włączony'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

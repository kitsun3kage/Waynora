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

export default function NavigationMode({
  route,
  position,
  settings,
  muted,
  onToggleVoice,
  onExit,
  rerouting,
}: NavigationModeProps) {
  const currentStepIndex = useMemo(() => {
    if (!position || !route.steps.length) {
      return 0;
    }

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    route.steps.forEach((step, index) => {
      const [lat, lng] =
        step.maneuver.location;

      const distance = distanceBetween(
        position,
        {
          lat,
          lng,
        },
      );

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    /*
     * Do not go backwards during navigation.
     * A small look-ahead makes the next maneuver
     * appear slightly before reaching its point.
     */
    const lookAhead =
      bestDistance < 35
        ? Math.min(
            bestIndex + 1,
            route.steps.length - 1,
          )
        : bestIndex;

    return lookAhead;
  }, [position, route.steps]);

  const currentStep =
    route.steps[currentStepIndex] ??
    route.steps[0];

  const distanceToManeuver = useMemo(() => {
    if (!position || !currentStep) {
      return currentStep?.distance ?? 0;
    }

    const [lat, lng] =
      currentStep.maneuver.location;

    return Math.min(
      currentStep.distance,
      distanceBetween(position, {
        lat,
        lng,
      }),
    );
  }, [currentStep, position]);

  const remainingDistance = useMemo(() => {
    if (!position || !route.geometry.length) {
      return route.distance;
    }

    let nearestIndex = 0;
    let nearestDistance =
      Number.POSITIVE_INFINITY;

    route.geometry.forEach(
      ([lat, lng], index) => {
        const distance = distanceBetween(
          position,
          {
            lat,
            lng,
          },
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      },
    );

    let remaining = nearestDistance;

    for (
      let index = nearestIndex;
      index < route.geometry.length - 1;
      index += 1
    ) {
      const current =
        route.geometry[index];

      const next =
        route.geometry[index + 1];

      remaining += distanceBetween(
        {
          lat: current[0],
          lng: current[1],
        },
        {
          lat: next[0],
          lng: next[1],
        },
      );
    }

    return Math.min(
      route.distance,
      remaining,
    );
  }, [position, route.distance, route.geometry]);

  const remainingDuration =
    route.distance > 0
      ? route.duration *
        (remainingDistance / route.distance)
      : route.duration;

  return (
    <div className="pointer-events-none absolute inset-0 z-[950]">
      {/* -------------------------------------------------
          TOP MANEUVER CARD
      ------------------------------------------------- */}

      <div className="pointer-events-auto absolute left-3 right-3 top-[calc(12px+env(safe-area-inset-top))] sm:left-5 sm:right-auto sm:w-[390px]">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 text-white shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Następny manewr
              </p>

              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl font-black text-slate-950 shadow-lg">
                  {getManeuverArrow(currentStep)}
                </div>

                <div className="min-w-0">
                  <p className="text-xl font-black leading-tight">
                    {getManeuverLabel(currentStep)}
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-400">
                    {currentStep?.name ||
                      'Droga'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onExit}
              aria-label="Zakończ nawigację"
              className="ml-3 shrink-0 rounded-full bg-white/10 p-2.5 transition hover:bg-white/20 active:scale-95"
            >
              <X size={19} />
            </button>
          </div>

          {currentStep && (
            <div className="border-t border-white/10 px-5 py-3">
              <div className="flex items-center gap-2 text-sm">
                <ChevronDown
                  size={17}
                  className="text-violet-400"
                />

                <span className="font-bold">
                  {formatDistance(
                    distanceToManeuver,
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

      {/* -------------------------------------------------
          BOTTOM NAVIGATION CARD
      ------------------------------------------------- */}

      <div className="pointer-events-auto absolute bottom-[calc(12px+env(safe-area-inset-bottom))] left-3 right-3 sm:bottom-5 sm:left-auto sm:right-5 sm:w-[390px]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-2xl">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Pozostało
              </p>

              <p className="mt-1 text-lg font-black">
                {formatDistance(
                  remainingDistance,
                  settings.units,
                )}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Czas
              </p>

              <p className="mt-1 text-lg font-black">
                {formatDuration(
                  remainingDuration,
                )}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                ETA
              </p>

              <p className="mt-1 text-lg font-black">
                {getEta(
                  remainingDuration,
                )}
              </p>
            </div>
          </div>

          {rerouting && (
            <div className="mt-3 rounded-xl bg-amber-500/15 px-3 py-2 text-center text-xs font-bold text-amber-300">
              Ponowne wyznaczanie trasy…
            </div>
          )}

          {position && (
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.12)]" />

                <span className="text-xs font-semibold text-slate-400">
                  GPS aktywny
                </span>
              </div>

              <button
                type="button"
                onClick={onToggleVoice}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold transition hover:bg-white/20 active:scale-95"
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

                {muted
                  ? 'Głos wyłączony'
                  : 'Głos włączony'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

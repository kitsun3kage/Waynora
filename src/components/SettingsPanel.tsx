import {
  Check,
  Moon,
  Navigation,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

import type { Settings } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
}

export default function SettingsPanel({
  settings,
  onChange,
  onClose,
}: SettingsPanelProps) {
  return (
    <div className="absolute inset-0 z-[1300] flex justify-end bg-black/20 backdrop-blur-[2px]">
      <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Waynora
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Ustawienia
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2.5 dark:bg-slate-800"
            aria-label="Zamknij ustawienia"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() =>
              onChange({
                ...settings,
                darkMode: !settings.darkMode,
              })
            }
            className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left dark:border-slate-800"
          >
            <span className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
              <Moon size={19} />
            </span>

            <span className="flex-1">
              <span className="block text-sm font-bold">
                Tryb ciemny
              </span>

              <span className="block text-xs text-slate-500">
                Ciemny interfejs Waynory
              </span>
            </span>

            {settings.darkMode && (
              <Check className="text-violet-600" size={20} />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({
                ...settings,
                voice: !settings.voice,
              })
            }
            className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left dark:border-slate-800"
          >
            <span className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
              {settings.voice ? (
                <Volume2 size={19} />
              ) : (
                <VolumeX size={19} />
              )}
            </span>

            <span className="flex-1">
              <span className="block text-sm font-bold">
                Komunikaty głosowe
              </span>

              <span className="block text-xs text-slate-500">
                Instrukcje podczas nawigacji
              </span>
            </span>

            {settings.voice && (
              <Check className="text-violet-600" size={20} />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({
                ...settings,
                autoCenter: !settings.autoCenter,
              })
            }
            className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left dark:border-slate-800"
          >
            <span className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
              <Navigation size={19} />
            </span>

            <span className="flex-1">
              <span className="block text-sm font-bold">
                Automatyczne centrowanie
              </span>

              <span className="block text-xs text-slate-500">
                Mapa podąża za lokalizacją
              </span>
            </span>

            {settings.autoCenter && (
              <Check className="text-violet-600" size={20} />
            )}
          </button>

          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm font-bold">
              Jednostki
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {(['metric', 'imperial'] as const).map(
                (unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...settings,
                        units: unit,
                      })
                    }
                    className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                      settings.units === unit
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {unit === 'metric'
                      ? 'Kilometry'
                      : 'Mile'}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
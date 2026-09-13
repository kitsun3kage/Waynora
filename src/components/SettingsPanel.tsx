import {
  Check,
  Compass,
  LocateFixed,
  Moon,
  Navigation,
  RotateCcw,
  Route as RouteIcon,
  Settings,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

import type { Settings as WaynoraSettings } from '../types';

interface SettingsPanelProps {
  settings: WaynoraSettings;
  onChange: (settings: WaynoraSettings) => void;
  onClose: () => void;
}

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onClick: () => void;
}

function SettingRow({
  icon,
  title,
  description,
  enabled,
  onClick,
}: SettingRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/50 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-900 dark:hover:bg-slate-800"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
          enabled
            ? 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </span>

        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </span>

      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? 'bg-violet-600'
            : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled
              ? 'left-6'
              : 'left-1'
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsPanel({
  settings,
  onChange,
  onClose,
}: SettingsPanelProps) {
  function update(
    patch: Partial<WaynoraSettings>,
  ) {
    onChange({
      ...settings,
      ...patch,
    });
  }

  function resetSettings() {
    onChange({
      darkMode: false,
      voice: true,
      units: 'metric',
      autoCenter: true,
      autoReroute: true,
      followLocation: true,
      showTraffic: false,
    });
  }

  return (
    <div className="absolute inset-0 z-[1300] flex justify-end bg-slate-950/25 backdrop-blur-[3px]">
      <aside className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {/* HEADER */}

        <div className="shrink-0 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
                <Settings size={20} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
                  Waynora
                </p>

                <h2 className="mt-0.5 text-xl font-black text-slate-950 dark:text-white">
                  Ustawienia
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-100 p-2.5 text-slate-600 transition hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="Zamknij ustawienia"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <div className="space-y-3">
            <SettingRow
              icon={
                <Moon size={19} />
              }
              title="Tryb ciemny"
              description="Ciemny interfejs całej aplikacji Waynora"
              enabled={settings.darkMode}
              onClick={() =>
                update({
                  darkMode:
                    !settings.darkMode,
                })
              }
            />

            <SettingRow
              icon={
                settings.voice ? (
                  <Volume2 size={19} />
                ) : (
                  <VolumeX size={19} />
                )
              }
              title="Komunikaty głosowe"
              description="Głosowe instrukcje podczas nawigacji"
              enabled={settings.voice}
              onClick={() =>
                update({
                  voice: !settings.voice,
                })
              }
            />

            <SettingRow
              icon={
                <LocateFixed size={19} />
              }
              title="Automatyczne centrowanie"
              description="Mapa automatycznie podąża za Twoją lokalizacją"
              enabled={settings.autoCenter}
              onClick={() =>
                update({
                  autoCenter:
                    !settings.autoCenter,
                })
              }
            />

            <SettingRow
              icon={
                <Navigation size={19} />
              }
              title="Śledzenie pozycji"
              description="Utrzymuj pozycję użytkownika podczas nawigacji"
              enabled={
                settings.followLocation ??
                true
              }
              onClick={() =>
                update({
                  followLocation:
                    !(
                      settings.followLocation ??
                      true
                    ),
                })
              }
            />

            <SettingRow
              icon={
                <RotateCcw size={19} />
              }
              title="Automatyczne przeliczanie"
              description="Przelicz trasę po zjechaniu z wyznaczonej drogi"
              enabled={
                settings.autoReroute ??
                true
              }
              onClick={() =>
                update({
                  autoReroute:
                    !(
                      settings.autoReroute ??
                      true
                    ),
                })
              }
            />

            <SettingRow
              icon={
                <Compass size={19} />
              }
              title="Informacje o ruchu"
              description="Przygotowanie interfejsu pod dane o natężeniu ruchu"
              enabled={
                settings.showTraffic ??
                false
              }
              onClick={() =>
                update({
                  showTraffic:
                    !(
                      settings.showTraffic ??
                      false
                    ),
                })
              }
            />

            {/* UNITS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <RouteIcon size={19} />
                </span>

                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Jednostki
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sposób wyświetlania odległości
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    update({
                      units: 'metric',
                    })
                  }
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] ${
                    settings.units ===
                    'metric'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  Kilometry
                </button>

                <button
                  type="button"
                  onClick={() =>
                    update({
                      units: 'imperial',
                    })
                  }
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] ${
                    settings.units ===
                    'imperial'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  Mile
                </button>
              </div>
            </div>

            {/* STATUS */}

            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 dark:border-violet-950 dark:bg-violet-950/30">
              <div className="flex gap-3">
                <div className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-400">
                  <Check size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-violet-950 dark:text-violet-100">
                    Ustawienia są zapisywane automatycznie
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-violet-700 dark:text-violet-300">
                    Waynora przechowuje preferencje lokalnie w przeglądarce.
                  </p>
                </div>
              </div>
            </div>

            {/* RESET */}

            <button
              type="button"
              onClick={resetSettings}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-red-950 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <RotateCcw size={17} />
              Przywróć ustawienia domyślne
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

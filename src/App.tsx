import {
  LocateFixed,
  Menu,
  Navigation,
  Star,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import StartScreen from './components/StartScreen';
import SearchBar from './components/SearchBar';
import MapView from './components/MapView';
import RoutePanel from './components/RoutePanel';
import NavigationMode from './components/NavigationMode';
import BottomNavigation from './components/BottomNavigation';
import SidePanel from './components/SidePanel';
import SettingsPanel from './components/SettingsPanel';
import StatusMessage from './components/StatusMessage';

import { useGeolocation } from './hooks/useGeolocation';
import { useLocalStorage } from './hooks/useLocalStorage';

import { calculateRoute } from './services/routing';

import type {
  AppScreen,
  BottomTab,
  HistoryItem,
  SavedPlace,
  SearchResult,
  Settings,
  Route,
} from './types';

import {
  distanceBetween,
} from './utils/navigation';

function App() {
  const [screen, setScreen] =
    useState<AppScreen>('start');

  const [activeTab, setActiveTab] =
    useState<BottomTab>('map');

  const [destination, setDestination] =
    useState<SearchResult | null>(null);

  const [route, setRoute] =
    useState<Route | null>(null);

  const [calculating, setCalculating] =
    useState(false);

  const [rerouting, setRerouting] =
    useState(false);

  const [status, setStatus] =
    useState<string | null>(null);

  const [panel, setPanel] =
    useState<'favorites' | 'history' | null>(null);

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const [muted, setMuted] =
    useState(false);

  const [favorites, setFavorites] =
    useLocalStorage<SavedPlace[]>(
      'waynora-favorites',
      [],
    );

  const [home, setHome] =
    useLocalStorage<SavedPlace | null>(
      'waynora-home',
      null,
    );

  const [work, setWork] =
    useLocalStorage<SavedPlace | null>(
      'waynora-work',
      null,
    );

  const [history, setHistory] =
    useLocalStorage<HistoryItem[]>(
      'waynora-history',
      [],
    );

  const [settings, setSettings] =
    useLocalStorage<Settings>(
      'waynora-settings',
      {
        darkMode: false,
        voice: true,
        units: 'metric',
        autoCenter: true,
      },
    );

  const {
    position,
    error: locationError,
    requestLocation,
  } = useGeolocation(screen !== 'start');

  const lastSpokenStep =
    useRef<string | null>(null);

  const previousPosition =
    useRef(position);

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      settings.darkMode,
    );
  }, [settings.darkMode]);

  useEffect(() => {
    if (locationError) {
      setStatus(locationError);
    }
  }, [locationError]);

  const speak = useCallback(
    (text: string) => {
      if (
        !settings.voice ||
        muted ||
        !('speechSynthesis' in window)
      ) {
        return;
      }

      window.speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(text);

      utterance.lang = 'pl-PL';
      utterance.rate = 1;
      utterance.pitch = 1;

      window.speechSynthesis.speak(
        utterance,
      );
    },
    [muted, settings.voice],
  );

  const selectDestination = useCallback(
    async (result: SearchResult) => {
      setDestination(result);
      setActiveTab('map');
      setPanel(null);

      const item: HistoryItem = {
        id: `${result.placeId}-${Date.now()}`,
        name:
          result.displayName.split(',')[0] ||
          'Miejsce',
        address: result.displayName,
        coordinates: {
          lat: result.lat,
          lng: result.lng,
        },
        visitedAt: Date.now(),
      };

      setHistory((current) => [
        item,
        ...current.filter(
          (existing) =>
            existing.coordinates.lat !==
              item.coordinates.lat ||
            existing.coordinates.lng !==
              item.coordinates.lng,
        ),
      ].slice(0, 20));

      if (!position) {
        requestLocation();
        return;
      }

      setCalculating(true);
      setRoute(null);

      try {
        const newRoute =
          await calculateRoute(
            position,
            {
              lat: result.lat,
              lng: result.lng,
            },
          );

        setRoute(newRoute);
      } catch {
        setStatus(
          'Nie udało się wyznaczyć trasy. Spróbuj ponownie.',
        );
      } finally {
        setCalculating(false);
      }
    },
    [
      position,
      requestLocation,
      setHistory,
    ],
  );

  useEffect(() => {
    if (
      !destination ||
      !position ||
      !screen ||
      screen === 'start'
    ) {
      return;
    }

    if (
      !previousPosition.current ||
      !route ||
      screen !== 'navigation'
    ) {
      previousPosition.current = position;
      return;
    }

    const moved = distanceBetween(
      previousPosition.current,
      position,
    );

    if (moved < 10) {
      return;
    }

    previousPosition.current = position;

    const nearest = Math.min(
      ...route.geometry.map((point) =>
        distanceBetween(position, {
          lat: point[0],
          lng: point[1],
        }),
      ),
    );

    if (nearest > 70 && !rerouting) {
      setRerouting(true);

      calculateRoute(
        position,
        {
          lat: destination.lat,
          lng: destination.lng,
        },
      )
        .then((newRoute) => {
          setRoute(newRoute);
          speak('Trasa została ponownie wyznaczona.');
        })
        .catch(() => {
          setStatus(
            'Nie udało się ponownie wyznaczyć trasy.',
          );
        })
        .finally(() => {
          setRerouting(false);
        });
    }
  }, [
    destination,
    position,
    rerouting,
    route,
    screen,
    speak,
  ]);

  useEffect(() => {
    if (
      screen !== 'navigation' ||
      !route?.steps?.length
    ) {
      return;
    }

    const step = route.steps[0];

    const stepId = `${step.name}-${step.distance}-${step.maneuver.type}-${step.maneuver.modifier}`;

    if (lastSpokenStep.current === stepId) {
      return;
    }

    if (step.distance <= 350) {
      lastSpokenStep.current = stepId;

      const direction =
        step.maneuver.modifier === 'left'
          ? 'w lewo'
          : step.maneuver.modifier === 'right'
            ? 'w prawo'
            : '';

      speak(
        `Za ${Math.round(step.distance)} metrów ${
          direction
            ? `skręć ${direction}`
            : 'kontynuuj jazdę'
        }.`,
      );
    }
  }, [route, screen, speak]);

  function startApp() {
    setScreen('map');
    requestLocation();
  }

  function startNavigation() {
    if (!position || !route) {
      setStatus(
        'Poczekaj na uzyskanie lokalizacji GPS.',
      );

      requestLocation();
      return;
    }

    setScreen('navigation');
    setMuted(false);
    lastSpokenStep.current = null;

    speak('Rozpoczynam nawigację.');
  }

  function exitNavigation() {
    setScreen('map');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function closeRoute() {
    setDestination(null);
    setRoute(null);
  }

  function saveFavorite() {
    if (!destination) {
      return;
    }

    const place: SavedPlace = {
      id: destination.placeId,
      name:
        destination.displayName.split(',')[0] ||
        'Miejsce',
      address: destination.displayName,
      coordinates: {
        lat: destination.lat,
        lng: destination.lng,
      },
      createdAt: Date.now(),
    };

    setFavorites((current) => {
      if (
        current.some(
          (item) => item.id === place.id,
        )
      ) {
        return current.filter(
          (item) => item.id !== place.id,
        );
      }

      return [place, ...current];
    });
  }

  function deleteFavorite(id: string) {
    setFavorites((current) =>
      current.filter((item) => item.id !== id),
    );
  }

  function setTab(tab: BottomTab) {
    setActiveTab(tab);

    if (tab === 'map') {
      setPanel(null);
      setSettingsOpen(false);
    }

    if (tab === 'favorites') {
      setPanel('favorites');
      setSettingsOpen(false);
    }

    if (tab === 'history') {
      setPanel('history');
      setSettingsOpen(false);
    }

    if (tab === 'settings') {
      setPanel(null);
      setSettingsOpen(true);
    }
  }

  const destinationIsFavorite =
    destination
      ? favorites.some(
          (item) =>
            item.id === destination.placeId,
        )
      : false;

  const mapBottomPadding =
    useMemo(() => {
      if (screen === 'navigation') {
        return '';
      }

      return 'pb-20 sm:pb-0';
    }, [screen]);

  if (screen === 'start') {
    return (
      <StartScreen onStart={startApp} />
    );
  }

  return (
    <div
      className={`relative h-[100dvh] overflow-hidden bg-slate-100 font-sans text-slate-950 dark:bg-slate-950 dark:text-white ${mapBottomPadding}`}
    >
      <MapView
        userPosition={position}
        destination={
          destination
            ? {
                lat: destination.lat,
                lng: destination.lng,
              }
            : null
        }
        route={route}
        autoCenter={settings.autoCenter}
        navigationMode={
          screen === 'navigation'
        }
      />

      {screen !== 'navigation' && (
        <>
          <div className="absolute left-3 right-3 top-[calc(12px+env(safe-area-inset-top))] z-[1000] mx-auto max-w-2xl">
            <SearchBar
              onSelect={selectDestination}
            />
          </div>

          <div className="absolute left-3 top-[calc(80px+env(safe-area-inset-top))] z-[900] hidden sm:block">
            <button
              type="button"
              onClick={() =>
                setTab('favorites')
              }
              className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/95 px-4 py-3 text-sm font-bold shadow-panel backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95"
            >
              <Star size={17} />
              Ulubione
            </button>
          </div>

          <div className="absolute right-3 top-[calc(80px+env(safe-area-inset-top))] z-[900] flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                requestLocation();

                if (position) {
                  setStatus(
                    'Centrowanie na Twojej lokalizacji.',
                  );
                }
              }}
              aria-label="Moja lokalizacja"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/95 text-slate-800 shadow-panel backdrop-blur-xl transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900/95 dark:text-white"
            >
              <LocateFixed size={21} />
            </button>

            {destination && (
              <button
                type="button"
                onClick={saveFavorite}
                aria-label="Dodaj do ulubionych"
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-panel backdrop-blur-xl transition hover:scale-105 ${
                  destinationIsFavorite
                    ? 'border-violet-200 bg-violet-600 text-white'
                    : 'border-white/40 bg-white/95 text-slate-800 dark:border-slate-700 dark:bg-slate-900/95 dark:text-white'
                }`}
              >
                <Star
                  size={21}
                  fill={
                    destinationIsFavorite
                      ? 'currentColor'
                      : 'none'
                  }
                />
              </button>
            )}
          </div>

          {!position && (
            <div className="absolute bottom-24 left-3 right-3 z-[800] mx-auto max-w-md sm:bottom-5">
              <button
                type="button"
                onClick={requestLocation}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950/90 px-5 py-4 text-sm font-bold text-white shadow-floating backdrop-blur-xl dark:bg-white/95 dark:text-slate-950"
              >
                <Navigation size={18} />
                Włącz lokalizację
              </button>
            </div>
          )}

          {destination && (
            <RoutePanel
              destination={destination}
              route={route}
              calculating={calculating}
              units={settings.units}
              onStart={startNavigation}
              onClose={closeRoute}
              userPosition={position}
            />
          )}
        </>
      )}

      {screen === 'navigation' &&
        route && (
          <NavigationMode
            route={route}
            position={position}
            settings={settings}
            muted={muted}
            onToggleVoice={() =>
              setMuted((current) => !current)
            }
            onExit={exitNavigation}
            rerouting={rerouting}
          />
        )}

      {status && (
        <StatusMessage
          message={status}
          onClose={() => setStatus(null)}
        />
      )}

      {panel && (
        <SidePanel
          type={panel}
          favorites={favorites}
          history={history}
          home={home}
          work={work}
          onSelect={selectDestination}
          onDeleteFavorite={deleteFavorite}
          onClose={() => {
            setPanel(null);
            setActiveTab('map');
          }}
          onOpenSettings={() => {
            setPanel(null);
            setSettingsOpen(true);
            setActiveTab('settings');
          }}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => {
            setSettingsOpen(false);
            setActiveTab('map');
          }}
        />
      )}

      {screen !== 'navigation' && (
        <BottomNavigation
          active={activeTab}
          onChange={setTab}
        />
      )}

      {screen === 'navigation' && (
        <div className="absolute bottom-5 left-5 z-[1100] hidden sm:block">
          <button
            type="button"
            onClick={exitNavigation}
            className="flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-3 text-sm font-bold text-slate-900 shadow-panel backdrop-blur-xl"
          >
            <Menu size={18} />
            Mapa
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-[calc(70px+env(safe-area-inset-bottom))] left-1/2 z-[700] -translate-x-1/2 sm:hidden">
        <div className="rounded-full bg-white/80 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-400 shadow-sm backdrop-blur-md dark:bg-slate-900/80">
          Waynora
        </div>
      </div>
    </div>
  );
}

export default App;
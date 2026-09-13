
import {
  LocateFixed,
  Menu,
  Navigation,
  Star,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
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
  Coordinates,
} from './types';

import {
  distanceBetween,
} from './utils/navigation';

function App() {
  /* -------------------------------------------------------
     SCREEN / NAVIGATION STATE
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     LOCAL STORAGE
  ------------------------------------------------------- */

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
        autoReroute: true,
        followLocation: true,
        showTraffic: false,
      },
    );

  /* -------------------------------------------------------
     GEOLOCATION
  ------------------------------------------------------- */

  const {
    position,
    error: locationError,
    requestLocation,
  } = useGeolocation(
    screen !== 'start',
  );

  /* -------------------------------------------------------
     NAVIGATION REFS
  ------------------------------------------------------- */

  const lastSpokenStep =
    useRef<string | null>(null);

  const previousPosition =
    useRef<Coordinates | null>(null);

  const navigationStarted =
    useRef(false);

  /* -------------------------------------------------------
     DARK MODE
  ------------------------------------------------------- */

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      settings.darkMode,
    );
  }, [settings.darkMode]);

  /* -------------------------------------------------------
     LOCATION ERRORS
  ------------------------------------------------------- */

  useEffect(() => {
    if (!locationError) {
      return;
    }

    setStatus(locationError);
  }, [locationError]);

  /* -------------------------------------------------------
     SPEECH
  ------------------------------------------------------- */

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
      utterance.volume = 1;

      window.speechSynthesis.speak(
        utterance,
      );
    },
    [
      muted,
      settings.voice,
    ],
  );

  /* -------------------------------------------------------
     SEARCH / DESTINATION
  ------------------------------------------------------- */

  const selectDestination = useCallback(
    async (
      result: SearchResult,
    ) => {
      setDestination(result);
      setActiveTab('map');
      setPanel(null);
      setSettingsOpen(false);

      const now = Date.now();

      const historyItem: HistoryItem = {
        id: `${result.placeId}-${now}`,
        name:
          result.name ||
          result.displayName.split(',')[0] ||
          'Miejsce',
        address: result.displayName,
        coordinates: {
          lat: result.lat,
          lng: result.lng,
        },
        visitedAt: now,
      };

      setHistory((current) => [
        historyItem,
        ...current.filter(
          (existing) =>
            existing.coordinates.lat !==
              historyItem.coordinates.lat ||
            existing.coordinates.lng !==
              historyItem.coordinates.lng,
        ),
      ].slice(0, 20));

      if (!position) {
        setRoute(null);
        setCalculating(false);
        requestLocation();

        setStatus(
          'Pobieram Twoją lokalizację GPS…',
        );

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

        setStatus(
          'Trasa została wyznaczona.',
        );
      } catch (error) {
        console.error(
          'Route calculation error:',
          error,
        );

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

  /* -------------------------------------------------------
     AUTO ROUTE CALCULATION AFTER GPS APPEARS
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      !position ||
      !destination ||
      route ||
      calculating ||
      screen === 'start'
    ) {
      return;
    }

    let cancelled = false;

    const buildRoute =
      async () => {
        setCalculating(true);

        try {
          const newRoute =
            await calculateRoute(
              position,
              {
                lat: destination.lat,
                lng: destination.lng,
              },
            );

          if (!cancelled) {
            setRoute(newRoute);
            setStatus(
              'Trasa gotowa.',
            );
          }
        } catch (error) {
          console.error(
            'Automatic route calculation error:',
            error,
          );

          if (!cancelled) {
            setStatus(
              'Nie udało się wyznaczyć trasy.',
            );
          }
        } finally {
          if (!cancelled) {
            setCalculating(false);
          }
        }
      };

    void buildRoute();

    return () => {
      cancelled = true;
    };
  }, [
    calculating,
    destination,
    position,
    route,
    screen,
  ]);

  /* -------------------------------------------------------
     OFF-ROUTE DETECTION / REROUTING
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      screen !== 'navigation' ||
      !destination ||
      !position ||
      !route ||
      !settings.autoReroute
    ) {
      previousPosition.current =
        position;

      return;
    }

    const previous =
      previousPosition.current;

    if (!previous) {
      previousPosition.current =
        position;

      return;
    }

    const moved =
      distanceBetween(
        previous,
        position,
      );

    if (moved < 8) {
      return;
    }

    previousPosition.current =
      position;

    if (!route.geometry.length) {
      return;
    }

    let nearestDistance =
      Number.POSITIVE_INFINITY;

    for (
      const point of route.geometry
    ) {
      const distance =
        distanceBetween(
          position,
          {
            lat: point[0],
            lng: point[1],
          },
        );

      if (
        distance <
        nearestDistance
      ) {
        nearestDistance =
          distance;
      }
    }

    /*
     * 70 m is a reasonable threshold
     * for an initial frontend navigation system.
     */
    if (
      nearestDistance > 70 &&
      !rerouting
    ) {
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

          lastSpokenStep.current =
            null;

          speak(
            'Zjechałeś z trasy. Wyznaczam nową trasę.',
          );
        })
        .catch((error) => {
          console.error(
            'Rerouting error:',
            error,
          );

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
    settings.autoReroute,
    speak,
  ]);

  /* -------------------------------------------------------
     VOICE NAVIGATION
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      screen !== 'navigation' ||
      !route?.steps?.length ||
      !position
    ) {
      return;
    }

    let nearestIndex = 0;
    let nearestDistance =
      Number.POSITIVE_INFINITY;

    route.steps.forEach(
      (step, index) => {
        const [
          lat,
          lng,
        ] =
          step.maneuver.location;

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

    /*
     * Slight look-ahead so the voice
     * doesn't wait until the exact maneuver.
     */
    const step =
      route.steps[
        Math.min(
          nearestIndex,
          route.steps.length - 1,
        )
      ];

    if (!step) {
      return;
    }

    const stepId =
      `${nearestIndex}-${step.name}-${step.distance}-${step.maneuver.type}-${step.maneuver.modifier}`;

    if (
      lastSpokenStep.current ===
      stepId
    ) {
      return;
    }

    const [
      maneuverLat,
      maneuverLng,
    ] =
      step.maneuver.location;

    const distanceToManeuver =
      distanceBetween(
        position,
        {
          lat: maneuverLat,
          lng: maneuverLng,
        },
      );

    /*
     * Voice announcement thresholds.
     */
    if (
      distanceToManeuver >
      350
    ) {
      return;
    }

    lastSpokenStep.current =
      stepId;

    let instruction =
      'kontynuuj jazdę';

    if (
      step.maneuver.type ===
      'arrive'
    ) {
      instruction =
        'dotarłeś do celu';
    } else if (
      step.maneuver.modifier ===
      'left'
    ) {
      instruction =
        'skręć w lewo';
    } else if (
      step.maneuver.modifier ===
      'right'
    ) {
      instruction =
        'skręć w prawo';
    } else if (
      step.maneuver.modifier ===
      'slight left'
    ) {
      instruction =
        'lekko w lewo';
    } else if (
      step.maneuver.modifier ===
      'slight right'
    ) {
      instruction =
        'lekko w prawo';
    } else if (
      step.maneuver.modifier ===
      'sharp left'
    ) {
      instruction =
        'ostro w lewo';
    } else if (
      step.maneuver.modifier ===
      'sharp right'
    ) {
      instruction =
        'ostro w prawo';
    } else if (
      step.maneuver.type ===
      'roundabout'
    ) {
      instruction =
        'wjedź na rondo';
    }

    speak(
      `Za ${Math.round(
        distanceToManeuver,
      )} metrów ${instruction}.`,
    );
  }, [
    position,
    route,
    screen,
    speak,
  ]);

  /* -------------------------------------------------------
     ARRIVAL DETECTION
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      screen !== 'navigation' ||
      !position ||
      !destination
    ) {
      return;
    }

    const distance =
      distanceBetween(
        position,
        {
          lat: destination.lat,
          lng: destination.lng,
        },
      );

    if (distance <= 30) {
      speak(
        'Dotarłeś do celu.',
      );

      setStatus(
        'Dotarłeś do celu.',
      );

      navigationStarted.current =
        false;

      setScreen('map');

      if (
        'speechSynthesis' in
        window
      ) {
        window.speechSynthesis.cancel();
      }
    }
  }, [
    destination,
    position,
    screen,
    speak,
  ]);

  /* -------------------------------------------------------
     START APP
  ------------------------------------------------------- */

  function startApp() {
    setScreen('map');
    setActiveTab('map');
    setPanel(null);
    setSettingsOpen(false);

    requestLocation();
  }

  /* -------------------------------------------------------
     START NAVIGATION
  ------------------------------------------------------- */

  function startNavigation() {
    if (!position) {
      setStatus(
        'Poczekaj na uzyskanie lokalizacji GPS.',
      );

      requestLocation();

      return;
    }

    if (!route) {
      setStatus(
        'Najpierw wyznacz trasę.',
      );

      return;
    }

    setScreen('navigation');

    setActiveTab('map');
    setPanel(null);
    setSettingsOpen(false);

    setMuted(false);

    lastSpokenStep.current =
      null;

    previousPosition.current =
      position;

    navigationStarted.current =
      true;

    speak(
      'Rozpoczynam nawigację.',
    );
  }

  /* -------------------------------------------------------
     EXIT NAVIGATION
  ------------------------------------------------------- */

  function exitNavigation() {
    navigationStarted.current =
      false;

    setScreen('map');
    setActiveTab('map');

    if (
      'speechSynthesis' in
      window
    ) {
      window.speechSynthesis.cancel();
    }

    lastSpokenStep.current =
      null;
  }

  /* -------------------------------------------------------
     CLOSE ROUTE
  ------------------------------------------------------- */

  function closeRoute() {
    if (
      screen === 'navigation'
    ) {
      exitNavigation();
    }

    setDestination(null);
    setRoute(null);
    setCalculating(false);
    setRerouting(false);
  }

  /* -------------------------------------------------------
     FAVORITES
  ------------------------------------------------------- */

  function saveFavorite() {
    if (!destination) {
      return;
    }

    const place: SavedPlace = {
      id: destination.placeId,
      name:
        destination.name ||
        destination.displayName.split(',')[0] ||
        'Miejsce',
      address:
        destination.displayName,
      coordinates: {
        lat: destination.lat,
        lng: destination.lng,
      },
      createdAt: Date.now(),
    };

    setFavorites((current) => {
      const exists =
        current.some(
          (item) =>
            item.id ===
            place.id,
        );

      if (exists) {
        setStatus(
          'Usunięto z ulubionych.',
        );

        return current.filter(
          (item) =>
            item.id !== place.id,
        );
      }

      setStatus(
        'Dodano do ulubionych.',
      );

      return [
        place,
        ...current,
      ];
    });
  }

  function deleteFavorite(
    id: string,
  ) {
    setFavorites((current) =>
      current.filter(
        (item) =>
          item.id !== id,
      ),
    );

    setStatus(
      'Usunięto z ulubionych.',
    );
  }

  /* -------------------------------------------------------
     BOTTOM NAVIGATION
  ------------------------------------------------------- */

  function setTab(
    tab: BottomTab,
  ) {
    if (
      screen === 'navigation'
    ) {
      exitNavigation();
    }

    setActiveTab(tab);

    if (tab === 'map') {
      setPanel(null);
      setSettingsOpen(false);
      setScreen('map');

      return;
    }

    if (
      tab === 'favorites'
    ) {
      setPanel('favorites');
      setSettingsOpen(false);
      setScreen('map');

      return;
    }

    if (
      tab === 'history'
    ) {
      setPanel('history');
      setSettingsOpen(false);
      setScreen('map');

      return;
    }

    if (
      tab === 'settings'
    ) {
      setPanel(null);
      setSettingsOpen(true);
      setScreen('map');
    }
  }

  /* -------------------------------------------------------
     FAVORITE STATE
  ------------------------------------------------------- */

  const destinationIsFavorite =
    destination
      ? favorites.some(
          (item) =>
            item.id ===
            destination.placeId,
        )
      : false;

  /* -------------------------------------------------------
     START SCREEN
  ------------------------------------------------------- */

  if (
    screen === 'start'
  ) {
    return (
      <StartScreen
        onStart={startApp}
      />
    );
  }

  /* -------------------------------------------------------
     MAIN APPLICATION
  ------------------------------------------------------- */

  return (
    <div
      className={[
        'relative',
        'h-[100dvh]',
        'w-full',
        'overflow-hidden',
        'bg-slate-100',
        'font-sans',
        'text-slate-950',
        'dark:bg-slate-950',
        'dark:text-white',
      ].join(' ')}
    >
      {/* ---------------------------------------------------
          MAP
      --------------------------------------------------- */}

      <MapView
        userPosition={
          position
        }
        destination={
          destination
            ? {
                lat:
                  destination.lat,
                lng:
                  destination.lng,
              }
            : null
        }
        route={route}
        autoCenter={
          settings.autoCenter
        }
        navigationMode={
          screen ===
          'navigation'
        }
      />

      {/* ---------------------------------------------------
          NORMAL MAP UI
      --------------------------------------------------- */}

      {screen !== 'navigation' && (
        <>
          {/* SEARCH */}

          <div className="absolute left-3 right-3 top-[calc(12px+env(safe-area-inset-top))] z-[1000] mx-auto max-w-2xl">
            <SearchBar
              onSelect={
                selectDestination
              }
            />
          </div>

          {/* DESKTOP FAVORITES */}

          <div className="absolute left-3 top-[calc(80px+env(safe-area-inset-top))] z-[900] hidden sm:block">
            <button
              type="button"
              onClick={() =>
                setTab(
                  'favorites',
                )
              }
              className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 text-sm font-bold text-slate-800 shadow-xl backdrop-blur-xl transition hover:scale-[1.02] hover:bg-white active:scale-95 dark:border-slate-700 dark:bg-slate-950/95 dark:text-white dark:hover:bg-slate-900"
            >
              <Star
                size={17}
                fill="currentColor"
              />

              Ulubione
            </button>
          </div>

          {/* MAP CONTROLS */}

          <div className="absolute right-3 top-[calc(80px+env(safe-area-inset-top))] z-[900] flex flex-col gap-2">
            {/* MY LOCATION */}

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
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/95 text-slate-800 shadow-xl backdrop-blur-xl transition hover:scale-105 active:scale-95 dark:border-slate-700 dark:bg-slate-950/95 dark:text-white"
            >
              <LocateFixed
                size={21}
              />
            </button>

            {/* FAVORITE */}

            {destination && (
              <button
                type="button"
                onClick={
                  saveFavorite
                }
                aria-label={
                  destinationIsFavorite
                    ? 'Usuń z ulubionych'
                    : 'Dodaj do ulubionych'
                }
                className={[
                  'flex',
                  'h-12',
                  'w-12',
                  'items-center',
                  'justify-center',
                  'rounded-2xl',
                  'border',
                  'shadow-xl',
                  'backdrop-blur-xl',
                  'transition',
                  'hover:scale-105',
                  'active:scale-95',
                  destinationIsFavorite
                    ? 'border-violet-500 bg-violet-600 text-white'
                    : 'border-slate-200/80 bg-white/95 text-slate-800 dark:border-slate-700 dark:bg-slate-950/95 dark:text-white',
                ].join(' ')}
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

          {/* LOCATION REQUEST */}

          {!position && (
            <div className="absolute bottom-24 left-3 right-3 z-[800] mx-auto max-w-md sm:bottom-5">
              <button
                type="button"
                onClick={
                  requestLocation
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950/95 px-5 py-4 text-sm font-bold text-white shadow-2xl backdrop-blur-xl transition hover:bg-slate-900 active:scale-[0.99] dark:border dark:border-slate-700 dark:bg-white/95 dark:text-slate-950"
              >
                <Navigation
                  size={18}
                />

                Włącz lokalizację
              </button>
            </div>
          )}

          {/* ROUTE PANEL */}

          {destination && (
            <RoutePanel
              destination={
                destination
              }
              route={route}
              calculating={
                calculating
              }
              units={
                settings.units
              }
              onStart={
                startNavigation
              }
              onClose={
                closeRoute
              }
              userPosition={
                position
              }
            />
          )}
        </>
      )}

      {/* ---------------------------------------------------
          NAVIGATION MODE
      --------------------------------------------------- */}

      {screen ===
        'navigation' &&
        route && (
          <NavigationMode
            route={route}
            position={
              position
            }
            settings={
              settings
            }
            muted={
              muted
            }
            onToggleVoice={() =>
              setMuted(
                (current) =>
                  !current,
              )
            }
            onExit={
              exitNavigation
            }
            rerouting={
              rerouting
            }
          />
        )}

      {/* ---------------------------------------------------
          STATUS MESSAGE
      --------------------------------------------------- */}

      {status && (
        <StatusMessage
          message={status}
          onClose={() =>
            setStatus(null)
          }
        />
      )}

      {/* ---------------------------------------------------
          SIDE PANEL
      --------------------------------------------------- */}

      {panel && (
        <SidePanel
          type={panel}
          favorites={
            favorites
          }
          history={
            history
          }
          home={home}
          work={work}
          onSelect={
            selectDestination
          }
          onDeleteFavorite={
            deleteFavorite
          }
          onClose={() => {
            setPanel(null);
            setActiveTab('map');
          }}
          onOpenSettings={() => {
            setPanel(null);
            setSettingsOpen(
              true,
            );
            setActiveTab(
              'settings',
            );
          }}
        />
      )}

      {/* ---------------------------------------------------
          SETTINGS
      --------------------------------------------------- */}

      {settingsOpen && (
        <SettingsPanel
          settings={
            settings
          }
          onChange={
            setSettings
          }
          onClose={() => {
            setSettingsOpen(
              false,
            );
            setActiveTab(
              'map',
            );
          }}
        />
      )}

      {/* ---------------------------------------------------
          MOBILE BOTTOM NAVIGATION
      --------------------------------------------------- */}

      {screen !==
        'navigation' && (
        <BottomNavigation
          active={
            activeTab
          }
          onChange={
            setTab
          }
        />
      )}

      {/* ---------------------------------------------------
          DESKTOP NAVIGATION EXIT BUTTON
      --------------------------------------------------- */}

      {screen ===
        'navigation' && (
        <div className="absolute bottom-5 left-5 z-[1100] hidden sm:block">
          <button
            type="button"
            onClick={
              exitNavigation
            }
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-xl transition hover:bg-slate-900 active:scale-95"
          >
            <Menu
              size={18}
            />

            Mapa
          </button>
        </div>
      )}

      {/* ---------------------------------------------------
          WAYNORA BRAND
      --------------------------------------------------- */}

      <div className="pointer-events-none absolute bottom-[calc(70px+env(safe-area-inset-bottom))] left-1/2 z-[700] -translate-x-1/2 sm:hidden">
        <div className="rounded-full border border-slate-200/50 bg-white/80 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 shadow-sm backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-950/80 dark:text-slate-500">
          Waynora
        </div>
      </div>
    </div>
  );
}

export default App;

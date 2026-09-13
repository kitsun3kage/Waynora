export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface SearchResult {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
  type: string;
  category: string;
  name: string;
}

export interface RouteManeuver {
  type: string;
  modifier?: string;
  location: [number, number];
  instruction?: string;
}

export interface RouteStep {
  distance: number;
  duration: number;
  name: string;
  maneuver: RouteManeuver;
}

export interface RouteLeg {
  distance: number;
  duration: number;
  steps: RouteStep[];
}

export interface Route {
  distance: number;
  duration: number;
  geometry: [number, number][];
  steps: RouteStep[];
  summary: string;
  legs?: RouteLeg[];
}

export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
}

export interface FavoritePlace extends SavedPlace {}

export interface HistoryItem {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  timestamp: number;
}

export interface Settings {
  voice: boolean;
  autoCenter: boolean;
  units: 'metric' | 'imperial';
  darkMode: boolean;
  autoReroute: boolean;
  followLocation: boolean;
  showTraffic: boolean;
}

export type AppScreen =
  | 'start'
  | 'home'
  | 'search'
  | 'route'
  | 'navigation'
  | 'favorites'
  | 'history'
  | 'settings';

export type BottomTab =
  | 'home'
  | 'favorites'
  | 'history'
  | 'settings';

export type NavigationStatus =
  | 'idle'
  | 'calculating'
  | 'ready'
  | 'navigating'
  | 'arrived'
  | 'error';

export interface NavigationState {
  status: NavigationStatus;
  currentStepIndex: number;
  distanceToNextManeuver: number;
  remainingDistance: number;
  remainingDuration: number;
  eta: Date | null;
}

export interface LocationState {
  coordinates: Coordinates | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

export interface AppError {
  message: string;
  code?: string;
}

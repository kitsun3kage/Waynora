export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SearchResult {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
  category?: string;
}

export interface RouteStep {
  distance: number;
  duration: number;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
}

export interface Route {
  distance: number;
  duration: number;
  geometry: [number, number][];
  steps: RouteStep[];
}

export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  createdAt: number;
}

export type AppScreen =
  | 'start'
  | 'map'
  | 'navigation';

export type BottomTab =
  | 'map'
  | 'favorites'
  | 'history'
  | 'settings';

export interface Settings {
  darkMode: boolean;
  voice: boolean;
  units: 'metric' | 'imperial';
  autoCenter: boolean;
}

export interface HistoryItem {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  visitedAt: number;
}
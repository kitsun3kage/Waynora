const ROUTING_URL =
  import.meta.env.VITE_ROUTING_URL ||
  'https://router.project-osrm.org';

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

export interface CalculatedRoute {
  distance: number;
  duration: number;
  geometry: [number, number][];
  legs: RouteLeg[];
  summary: string;
}

interface OsrmRoute {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
  };
  legs: RouteLeg[];
  name?: string;
}

interface OsrmResponse {
  code: string;
  routes?: OsrmRoute[];
}

export async function calculateRoute(
  from: [number, number],
  to: [number, number]
): Promise<CalculatedRoute> {
  const coordinates = `${from[1]},${from[0]};${to[1]},${to[0]}`;

  const url =
    `${ROUTING_URL}/route/v1/driving/${coordinates}` +
    `?overview=full` +
    `&geometries=geojson` +
    `&steps=true` +
    `&alternatives=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Nie udało się pobrać trasy. Kod HTTP: ${response.status}`
    );
  }

  const data: OsrmResponse = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('Nie znaleziono trasy.');
  }

  const route = data.routes[0];

  return {
    distance: route.distance,
    duration: route.duration,
    geometry: route.geometry.coordinates.map(
      ([lng, lat]): [number, number] => [lat, lng]
    ),
    legs: route.legs,
    summary: route.name || 'Trasa'
  };
}

/**
 * Alias zachowany dla kompatybilności z innymi komponentami.
 */
export async function getRoute(
  from: [number, number],
  to: [number, number]
): Promise<CalculatedRoute> {
  return calculateRoute(from, to);
}

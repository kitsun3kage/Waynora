import type { Coordinates } from '../types';

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
  steps: RouteStep[];
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

function coordinatesToLatLng(
  coordinates: Coordinates | [number, number]
): [number, number] {
  if (Array.isArray(coordinates)) {
    return [coordinates[0], coordinates[1]];
  }

  return [coordinates.lat, coordinates.lng];
}

export async function calculateRoute(
  from: Coordinates | [number, number],
  to: Coordinates | [number, number]
): Promise<CalculatedRoute> {
  const fromLatLng = coordinatesToLatLng(from);
  const destinationLatLng = coordinatesToLatLng(to);

  const coordinates =
    `${fromLatLng[1]},${fromLatLng[0]};` +
    `${destinationLatLng[1]},${destinationLatLng[0]}`;

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

  if (
    data.code !== 'Ok' ||
    !data.routes ||
    data.routes.length === 0
  ) {
    throw new Error('Nie znaleziono trasy.');
  }

  const route = data.routes[0];

  const steps = route.legs.flatMap(
    (leg) => leg.steps
  );

  return {
    distance: route.distance,
    duration: route.duration,
    geometry: route.geometry.coordinates.map(
      ([lng, lat]): [number, number] => [lat, lng]
    ),
    legs: route.legs,
    steps,
    summary: route.name || 'Trasa',
  };
}

export async function getRoute(
  from: Coordinates | [number, number],
  to: Coordinates | [number, number]
): Promise<CalculatedRoute> {
  return calculateRoute(from, to);
}

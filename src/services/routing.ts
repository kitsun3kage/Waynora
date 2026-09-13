import type { Coordinates, Route, RouteStep } from '../types';

const ROUTING_URL =
  import.meta.env.VITE_ROUTING_URL ||
  'https://router.project-osrm.org';

export async function calculateRoute(
  start: Coordinates,
  destination: Coordinates,
): Promise<Route> {
  const coordinates = [
    `${start.lng},${start.lat}`,
    `${destination.lng},${destination.lat}`,
  ].join(';');

  const url =
    `${ROUTING_URL}/route/v1/driving/${coordinates}` +
    '?overview=full&geometries=geojson&steps=true&alternatives=true';

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Nie udało się wyznaczyć trasy.');
  }

  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error('Nie znaleziono możliwej trasy.');
  }

  const route = data.routes[0];

  const steps: RouteStep[] = (route.legs?.[0]?.steps || []).map(
    (step: {
      distance: number;
      duration: number;
      name: string;
      maneuver: {
        type: string;
        modifier?: string;
        location: [number, number];
      };
    }) => ({
      distance: step.distance,
      duration: step.duration,
      name: step.name,
      maneuver: step.maneuver,
    }),
  );

  return {
    distance: route.distance,
    duration: route.duration,
    geometry: route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng],
    ),
    steps,
  };
}
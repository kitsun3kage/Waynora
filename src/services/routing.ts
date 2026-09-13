const ROUTING_URL =
  import.meta.env.VITE_ROUTING_URL ||
  'https://router.project-osrm.org';

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

export interface RouteData {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
  };
  legs: {
    steps: RouteStep[];
  }[];
}

export async function getRoute(
  from: [number, number],
  to: [number, number]
): Promise<RouteData> {
  const coordinates = `${from[1]},${from[0]};${to[1]},${to[0]}`;

  const url =
    `${ROUTING_URL}/route/v1/driving/${coordinates}` +
    `?overview=full` +
    `&geometries=geojson` +
    `&steps=true` +
    `&alternatives=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Routing error: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error('Nie znaleziono trasy.');
  }

  return data.routes[0];
}

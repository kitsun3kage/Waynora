import type { SearchResult } from '../types';

const NOMINATIM_URL =
  import.meta.env.VITE_NOMINATIM_URL ||
  'https://nominatim.openstreetmap.org';

let lastRequestTime = 0;

function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;

  if (elapsed < 1100) {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, 1100 - elapsed);
    });
  }

  return Promise.resolve();
}

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const trimmed = query.trim();

  if (trimmed.length < 3) {
    return [];
  }

  await throttle();

  lastRequestTime = Date.now();

  const url = new URL(`${NOMINATIM_URL}/search`);

  url.searchParams.set('q', trimmed);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '7');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('accept-language', 'pl');

  const response = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Wyszukiwanie jest obecnie niedostępne.');
  }

  const data = await response.json();

  return data.map((item: {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    type?: string;
    category?: string;
  }) => ({
    placeId: String(item.place_id),
    displayName: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
    type: item.type,
    category: item.category,
  }));
}
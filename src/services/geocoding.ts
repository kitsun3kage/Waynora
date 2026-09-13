const NOMINATIM_URL =
  import.meta.env.VITE_NOMINATIM_URL ||
  'https://nominatim.openstreetmap.org';

export interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  category: string;
  name?: string;
}

export interface SearchResult {
  placeId: number;
  displayName: string;
  lat: number;
  lng: number;
  type: string;
  category: string;
  name: string;
}

export async function searchPlaces(
  query: string,
  signal?: AbortSignal
): Promise<SearchResult[]> {
  const url = new URL(`${NOMINATIM_URL}/search`);

  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '7');
  url.searchParams.set('accept-language', 'pl');

  const response = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(
      `Nie udało się wyszukać miejsca. Kod HTTP: ${response.status}`
    );
  }

  const data: GeocodingResult[] = await response.json();

  return data.map((item) => ({
    placeId: item.place_id,
    displayName: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
    type: item.type,
    category: item.category,
    name: item.name || item.display_name.split(',')[0]
  }));
}

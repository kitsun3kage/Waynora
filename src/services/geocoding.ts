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
}

export async function searchPlaces(
  query: string,
  signal?: AbortSignal
): Promise<GeocodingResult[]> {
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
    throw new Error(`Geocoding error: ${response.status}`);
  }

  return response.json();
}

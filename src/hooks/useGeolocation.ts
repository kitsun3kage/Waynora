import { useCallback, useEffect, useRef, useState } from 'react';
import type { Coordinates } from '../types';

interface GeolocationState {
  position: Coordinates | null;
  accuracy: number | null;
  heading: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(enabled = true) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    accuracy: null,
    heading: null,
    loading: false,
    error: null,
  });

  const watchId = useRef<number | null>(null);

  const success = useCallback((position: GeolocationPosition) => {
    setState({
      position: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      loading: false,
      error: null,
    });
  }, []);

  const failure = useCallback((error: GeolocationPositionError) => {
    let message = 'Nie udało się pobrać lokalizacji.';

    if (error.code === error.PERMISSION_DENIED) {
      message = 'Dostęp do lokalizacji został zablokowany.';
    }

    if (error.code === error.POSITION_UNAVAILABLE) {
      message = 'Lokalizacja jest obecnie niedostępna.';
    }

    if (error.code === error.TIMEOUT) {
      message = 'Pobieranie lokalizacji trwało zbyt długo.';
    }

    setState((current) => ({
      ...current,
      loading: false,
      error: message,
    }));
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((current) => ({
        ...current,
        loading: false,
        error: 'Ta przeglądarka nie obsługuje geolokalizacji.',
      }));

      return;
    }

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    navigator.geolocation.getCurrentPosition(
      success,
      failure,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      },
    );
  }, [failure, success]);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      return;
    }

    requestLocation();

    watchId.current = navigator.geolocation.watchPosition(
      success,
      failure,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000,
      },
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [enabled, failure, requestLocation, success]);

  return {
    ...state,
    requestLocation,
  };
}
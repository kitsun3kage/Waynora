import type { RouteStep } from '../types';

export function formatDistance(
  meters: number,
  units: 'metric' | 'imperial' = 'metric',
): string {
  if (units === 'imperial') {
    const miles = meters / 1609.344;

    if (miles < 0.1) {
      return `${Math.round(meters * 3.28084)} ft`;
    }

    return `${miles.toFixed(1)} mi`;
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} godz.`;
  }

  return `${hours} godz. ${remainingMinutes} min`;
}

export function getEta(seconds: number): string {
  const date = new Date(Date.now() + seconds * 1000);

  return date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getManeuverLabel(step?: RouteStep): string {
  if (!step) {
    return 'Kontynuuj jazdę';
  }

  const modifier = step.maneuver.modifier;

  if (step.maneuver.type === 'arrive') {
    return 'Dojechałeś do celu';
  }

  if (step.maneuver.type === 'depart') {
    return 'Rozpocznij jazdę';
  }

  if (modifier === 'left') {
    return 'Skręć w lewo';
  }

  if (modifier === 'right') {
    return 'Skręć w prawo';
  }

  if (modifier === 'slight left') {
    return 'Lekko w lewo';
  }

  if (modifier === 'slight right') {
    return 'Lekko w prawo';
  }

  if (modifier === 'sharp left') {
    return 'Ostry skręt w lewo';
  }

  if (modifier === 'sharp right') {
    return 'Ostry skręt w prawo';
  }

  if (modifier === 'uturn') {
    return 'Zawróć';
  }

  return 'Kontynuuj jazdę';
}

export function getManeuverArrow(step?: RouteStep): string {
  if (!step) {
    return '↑';
  }

  if (step.maneuver.modifier === 'left') {
    return '←';
  }

  if (step.maneuver.modifier === 'right') {
    return '→';
  }

  if (step.maneuver.modifier === 'slight left') {
    return '↖';
  }

  if (step.maneuver.modifier === 'slight right') {
    return '↗';
  }

  if (step.maneuver.modifier === 'uturn') {
    return '↶';
  }

  return '↑';
}

export function distanceBetween(
  first: { lat: number; lng: number },
  second: { lat: number; lng: number },
): number {
  const earthRadius = 6371000;

  const lat1 = first.lat * Math.PI / 180;
  const lat2 = second.lat * Math.PI / 180;

  const deltaLat =
    (second.lat - first.lat) * Math.PI / 180;

  const deltaLng =
    (second.lng - first.lng) * Math.PI / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) ** 2;

  return earthRadius * 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a),
  );
}
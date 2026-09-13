import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet';

import L from 'leaflet';
import { useEffect } from 'react';

import type {
  Coordinates,
  Route,
} from '../types';

import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  userPosition: Coordinates | null;
  destination: Coordinates | null;
  route: Route | null;
  autoCenter: boolean;
  navigationMode: boolean;
}

const destinationIcon = L.divIcon({
  className: 'waynora-destination-marker',
  html: `
    <div style="
      width:42px;
      height:42px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:linear-gradient(135deg,#7c3aed,#2563eb);
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 8px 20px rgba(37,99,235,.35);
      border:3px solid white;
    ">
      <div style="
        width:12px;
        height:12px;
        background:white;
        border-radius:50%;
      "></div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

const userIcon = L.divIcon({
  className: 'waynora-user-marker',
  html: `
    <div style="
      width:24px;
      height:24px;
      border-radius:50%;
      background:#2563eb;
      border:4px solid white;
      box-shadow:0 0 0 8px rgba(37,99,235,.18), 0 5px 15px rgba(0,0,0,.2);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapController({
  userPosition,
  autoCenter,
  navigationMode,
}: {
  userPosition: Coordinates | null;
  autoCenter: boolean;
  navigationMode: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!userPosition || !autoCenter) {
      return;
    }

    map.flyTo(
      [userPosition.lat, userPosition.lng],
      navigationMode ? 17 : 14,
      {
        duration: 0.8,
      },
    );
  }, [
    autoCenter,
    map,
    navigationMode,
    userPosition,
  ]);

  return null;
}

export default function MapView({
  userPosition,
  destination,
  route,
  autoCenter,
  navigationMode,
}: MapViewProps) {
  const initialCenter: [number, number] =
    userPosition
      ? [userPosition.lat, userPosition.lng]
      : [52.2297, 21.0122];

  return (
    <MapContainer
      center={initialCenter}
      zoom={13}
      zoomControl={false}
      className="absolute inset-0 z-0 h-full w-full"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        userPosition={userPosition}
        autoCenter={autoCenter}
        navigationMode={navigationMode}
      />

      {route && (
        <Polyline
          positions={route.geometry}
          pathOptions={{
            color: '#2563eb',
            weight: 8,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      {userPosition && (
        <>
          <CircleMarker
            center={[
              userPosition.lat,
              userPosition.lng,
            ]}
            radius={20}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#2563eb',
              fillOpacity: 0.08,
              weight: 0,
            }}
          />

          <Marker
            position={[
              userPosition.lat,
              userPosition.lng,
            ]}
            icon={userIcon}
          />
        </>
      )}

      {destination && (
        <Marker
          position={[
            destination.lat,
            destination.lng,
          ]}
          icon={destinationIcon}
        />
      )}
    </MapContainer>
  );
}
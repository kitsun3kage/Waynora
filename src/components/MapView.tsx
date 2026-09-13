import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet';

import L from 'leaflet';
import { useEffect, useMemo } from 'react';

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

/* ---------------------------------------------------------
   DESTINATION MARKER
--------------------------------------------------------- */

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

/* ---------------------------------------------------------
   NORMAL USER MARKER
--------------------------------------------------------- */

const normalUserIcon = L.divIcon({
  className: 'waynora-user-marker',
  html: `
    <div style="
      width:24px;
      height:24px;
      border-radius:50%;
      background:#2563eb;
      border:4px solid white;
      box-shadow:
        0 0 0 8px rgba(37,99,235,.18),
        0 5px 15px rgba(0,0,0,.2);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/* ---------------------------------------------------------
   NAVIGATION ARROW
--------------------------------------------------------- */

function createNavigationIcon(heading?: number | null) {
  const rotation =
    typeof heading === 'number' && Number.isFinite(heading)
      ? heading
      : 0;

  return L.divIcon({
    className: 'waynora-user-marker',
    html: `
      <div
        class="waynora-navigation-arrow"
        style="transform:rotate(${rotation}deg)"
      >
        <div class="waynora-navigation-arrow__body"></div>
      </div>
    `,
    iconSize: [46, 58],
    iconAnchor: [23, 29],
  });
}

/* ---------------------------------------------------------
   MAP CAMERA CONTROLLER
--------------------------------------------------------- */

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
    const container = map.getContainer();

    if (navigationMode) {
      container.classList.add('waynora-navigation-map');
    } else {
      container.classList.remove('waynora-navigation-map');
    }

    return () => {
      container.classList.remove('waynora-navigation-map');
    };
  }, [map, navigationMode]);

  useEffect(() => {
    if (!userPosition || !autoCenter) {
      return;
    }

    const zoom = navigationMode ? 17 : 14;

    /*
     * In navigation mode the user marker is intentionally
     * placed slightly below the center of the screen.
     *
     * This imitates the camera framing used by modern
     * navigation applications.
     */
    if (navigationMode) {
      const targetPoint = map.project(
        [userPosition.lat, userPosition.lng],
        zoom,
      );

      const offsetPoint = L.point(
        targetPoint.x,
        targetPoint.y + 120,
      );

      const target = map.unproject(
        offsetPoint,
        zoom,
      );

      map.flyTo(target, zoom, {
        duration: 0.8,
        easeLinearity: 0.15,
      });

      return;
    }

    map.flyTo(
      [userPosition.lat, userPosition.lng],
      zoom,
      {
        duration: 0.8,
        easeLinearity: 0.2,
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

/* ---------------------------------------------------------
   MAP VIEW
--------------------------------------------------------- */

export default function MapView({
  userPosition,
  destination,
  route,
  autoCenter,
  navigationMode,
}: MapViewProps) {
  const initialCenter: [number, number] =
    userPosition
      ? [
          userPosition.lat,
          userPosition.lng,
        ]
      : [52.2297, 21.0122];

  const navigationIcon = useMemo(
    () =>
      createNavigationIcon(
        userPosition?.heading,
      ),
    [userPosition?.heading],
  );

  return (
    <MapContainer
      center={initialCenter}
      zoom={13}
      zoomControl={false}
      className="absolute inset-0 z-0 h-full w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        userPosition={userPosition}
        autoCenter={autoCenter}
        navigationMode={navigationMode}
      />

      {/* Route shadow */}
      {route && (
        <Polyline
          positions={route.geometry}
          pathOptions={{
            color: '#0f172a',
            weight: navigationMode ? 13 : 11,
            opacity: navigationMode ? 0.22 : 0.12,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      {/* Main route */}
      {route && (
        <Polyline
          positions={route.geometry}
          pathOptions={{
            color: '#2563eb',
            weight: navigationMode ? 8 : 7,
            opacity: 0.92,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      {/* User position */}
      {userPosition && (
        <>
          {!navigationMode && (
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
          )}

          <Marker
            position={[
              userPosition.lat,
              userPosition.lng,
            ]}
            icon={
              navigationMode
                ? navigationIcon
                : normalUserIcon
            }
            zIndexOffset={1000}
          />
        </>
      )}

      {/* Destination */}
      {destination && (
        <Marker
          position={[
            destination.lat,
            destination.lng,
          ]}
          icon={destinationIcon}
          zIndexOffset={900}
        />
      )}
    </MapContainer>
  );
}

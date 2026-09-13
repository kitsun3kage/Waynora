import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet';

import L from 'leaflet';
import { useEffect, useRef } from 'react';

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
    <div class="waynora-user-location">
      <div class="waynora-user-heading">
        <div class="waynora-user-heading-inner"></div>
      </div>

      <div class="waynora-user-dot"></div>
    </div>
  `,
  iconSize: [54, 54],
  iconAnchor: [27, 27],
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

  const previousNavigationMode =
    useRef(navigationMode);

  useEffect(() => {
    if (!userPosition || !autoCenter) {
      return;
    }

    const target: [number, number] = [
      userPosition.lat,
      userPosition.lng,
    ];

    const enteringNavigation =
      navigationMode &&
      !previousNavigationMode.current;

    const leavingNavigation =
      !navigationMode &&
      previousNavigationMode.current;

    previousNavigationMode.current =
      navigationMode;

    if (enteringNavigation) {
      map.flyTo(
        target,
        17,
        {
          duration: 1.2,
          easeLinearity: 0.15,
        },
      );

      return;
    }

    if (leavingNavigation) {
      map.flyTo(
        target,
        14,
        {
          duration: 0.9,
          easeLinearity: 0.2,
        },
      );

      return;
    }

    if (navigationMode) {
      map.flyTo(
        target,
        17,
        {
          duration: 0.7,
          easeLinearity: 0.15,
        },
      );

      return;
    }

    map.flyTo(
      target,
      14,
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

  useEffect(() => {
    const container =
      map.getContainer();

    if (navigationMode) {
      container.classList.add(
        'waynora-navigation-3d',
      );
    } else {
      container.classList.remove(
        'waynora-navigation-3d',
      );
    }

    return () => {
      container.classList.remove(
        'waynora-navigation-3d',
      );
    };
  }, [
    map,
    navigationMode,
  ]);

  return null;
}

function NavigationCamera({
  navigationMode,
  heading,
}: {
  navigationMode: boolean;
  heading: number | null | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    if (!navigationMode) {
      return;
    }

    const container =
      map.getContainer();

    if (
      heading === null ||
      heading === undefined ||
      Number.isNaN(heading)
    ) {
      container.style.setProperty(
        '--waynora-heading',
        '0deg',
      );

      return;
    }

    container.style.setProperty(
      '--waynora-heading',
      `${-heading}deg`,
    );
  }, [
    heading,
    map,
    navigationMode,
  ]);

  useEffect(() => {
    const container =
      map.getContainer();

    if (!navigationMode) {
      container.style.removeProperty(
        '--waynora-heading',
      );
    }
  }, [
    map,
    navigationMode,
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
      ? [
          userPosition.lat,
          userPosition.lng,
        ]
      : [52.2297, 21.0122];

  const heading =
    userPosition?.heading;

  return (
    <div
      className={[
        'absolute',
        'inset-0',
        'z-0',
        'h-full',
        'w-full',
        navigationMode
          ? 'waynora-map-navigation-active'
          : '',
      ].join(' ')}
    >
      <MapContainer
        center={initialCenter}
        zoom={13}
        zoomControl={false}
        attributionControl={true}
        className="absolute inset-0 z-0 h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapController
          userPosition={userPosition}
          autoCenter={autoCenter}
          navigationMode={navigationMode}
        />

        <NavigationCamera
          navigationMode={
            navigationMode
          }
          heading={heading}
        />

        {route && (
          <>
            <Polyline
              positions={route.geometry}
              pathOptions={{
                color: '#ffffff',
                weight: navigationMode
                  ? 13
                  : 11,
                opacity: navigationMode
                  ? 0.9
                  : 0.65,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              className="waynora-route-outline"
            />

            <Polyline
              positions={route.geometry}
              pathOptions={{
                color: '#2563eb',
                weight: navigationMode
                  ? 8
                  : 7,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              className="waynora-route-line"
            />
          </>
        )}

        {userPosition && (
          <>
            <CircleMarker
              center={[
                userPosition.lat,
                userPosition.lng,
              ]}
              radius={
                navigationMode
                  ? 28
                  : 20
              }
              pathOptions={{
                color: '#2563eb',
                fillColor: '#2563eb',
                fillOpacity:
                  navigationMode
                    ? 0.11
                    : 0.08,
                weight: 0,
              }}
            />

            <Marker
              position={[
                userPosition.lat,
                userPosition.lng,
              ]}
              icon={userIcon}
              zIndexOffset={1000}
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
            zIndexOffset={500}
          />
        )}
      </MapContainer>

      {navigationMode && (
        <div className="pointer-events-none absolute inset-0 z-[400]">
          <div className="waynora-navigation-vignette" />

          <div className="waynora-navigation-horizon" />
        </div>
      )}
    </div>
  );
}

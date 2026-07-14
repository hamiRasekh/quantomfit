'use client';

import type { Theme, SxProps } from '@mui/material/styles';
import type { MapRef, MapProps as ReactMapProps } from 'react-map-gl/maplibre';

import { lazy, Suspense, useEffect } from 'react';

import NoSsr from '@mui/material/NoSsr';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';

import { MAP_STYLES } from './map-styles';

// ----------------------------------------------------------------------

const LazyMap = lazy(() => import('react-map-gl/maplibre'));

// RTL plugin setup - only initialized once
let rtlPluginInitialized = false;

function initializeRTLPlugin() {
  if (rtlPluginInitialized || typeof window === 'undefined') return;

  // Dynamically import maplibre-gl to set RTL plugin
  import('maplibre-gl').then((maplibregl) => {
    if (!rtlPluginInitialized) {
      maplibregl.setRTLTextPlugin(
        'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js',
        true // Lazy load the plugin
      );
      rtlPluginInitialized = true;
    }
  }).catch((error) => {
    console.error('Failed to initialize RTL plugin:', error);
  });
}

export type MapProps = ReactMapProps & {
  sx?: SxProps<Theme>;
  ref?: React.RefObject<MapRef | null>;
};

export function Map({ ref, sx, ...other }: MapProps) {
  // Initialize RTL plugin on component mount
  useEffect(() => {
    initializeRTLPlugin();
  }, []);

  const renderFallback = () => (
    <Skeleton
      variant="rectangular"
      sx={{
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        position: 'absolute',
      }}
    />
  );

  return (
    <MapRoot sx={sx}>
      <NoSsr fallback={renderFallback()}>
        <Suspense fallback={renderFallback()}>
          <LazyMap ref={ref} mapStyle={MAP_STYLES.light} {...other} />
        </Suspense>
      </NoSsr>
    </MapRoot>
  );
}

// ----------------------------------------------------------------------

const MapRoot = styled('div')({
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
});

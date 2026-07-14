'use client';

import { useEffect, useId, useRef, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { loadLeaflet } from '../utils/load-leaflet';

type Props = {
  latitude?: number | null;
  longitude?: number | null;
  isDark: boolean;
  onPick: (coords: { lat: number; lng: number }) => void;
};

const DEFAULT_CENTER: [number, number] = [35.6892, 51.389];
const DEFAULT_ZOOM = 13;

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export function CompanyNeshanMapPicker({ latitude, longitude, isDark, onPick }: Props) {
  const reactId = useId();
  const mapDomId = `factory-map-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onPickRef = useRef(onPick);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    let disposed = false;

    (async () => {
      try {
        await loadLeaflet();
        const L = window.L;
        if (disposed || !L) return;

        const centerLat = latitude ?? DEFAULT_CENTER[0];
        const centerLng = longitude ?? DEFAULT_CENTER[1];
        const zoom = latitude != null && longitude != null ? 15 : DEFAULT_ZOOM;

        const map = L.map(mapDomId).setView([centerLat, centerLng], zoom);
        L.tileLayer(OSM_TILE_URL, {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        mapRef.current = map;

        const marker = L.marker([centerLat, centerLng], { draggable: true }).addTo(map);
        markerRef.current = marker;

        const emit = (lat: number, lng: number) => onPickRef.current({ lat, lng });

        map.on('click', (event) => {
          const { lat, lng } = event.latlng;
          marker.setLatLng([lat, lng]);
          emit(lat, lng);
        });

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          emit(pos.lat, pos.lng);
        });

        if (!disposed) setLoading(false);
      } catch {
        if (!disposed) {
          setError('بارگذاری نقشه با خطا مواجه شد. اتصال اینترنت را بررسی کنید.');
          setLoading(false);
        }
      }
    })();

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [mapDomId]);

  useEffect(() => {
    if (!markerRef.current || latitude == null || longitude == null) return;
    markerRef.current.setLatLng([latitude, longitude]);
    mapRef.current?.setView([latitude, longitude], 15);
  }, [latitude, longitude]);

  if (error) {
    return <Alert severity="warning">{error}</Alert>;
  }

  return (
    <Box
      className="factory-map-wrap"
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: isDark ? 'rgba(148,182,255,0.25)' : 'rgba(4,4,74,0.12)',
        '& .leaflet-container': {
          fontFamily: 'inherit',
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          px: 1.5,
          py: 0.75,
          bgcolor: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(248,250,252,0.95)',
          color: 'text.secondary',
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(148,182,255,0.15)' : 'rgba(4,4,74,0.08)',
        }}
      >
        روی نقشه کلیک کنید یا مارکر را بکشید تا موقعیت کارخانه مشخص شود.
      </Typography>
      {loading && (
        <StackFallback>
          <CircularProgress size={28} />
        </StackFallback>
      )}
      <Box id={mapDomId} sx={{ width: '100%', height: 330, zIndex: 0 }} />
    </Box>
  );
}

function StackFallback({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'rgba(0,0,0,0.25)',
      }}
    >
      {children}
    </Box>
  );
}

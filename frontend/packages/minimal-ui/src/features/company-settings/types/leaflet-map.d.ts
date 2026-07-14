export {};

declare global {
  type LeafletLatLng = { lat: number; lng: number };

  type LeafletMapClickEvent = { latlng: LeafletLatLng };

  type LeafletMarker = {
    addTo: (map: LeafletMap) => LeafletMarker;
    on: (event: 'dragend', handler: () => void) => void;
    setLatLng: (latlng: [number, number]) => void;
    getLatLng: () => LeafletLatLng;
  };

  type LeafletMap = {
    on: (event: 'click', handler: (e: LeafletMapClickEvent) => void) => LeafletMap;
    remove: () => void;
    setView: (latlng: [number, number], zoom: number) => LeafletMap;
  };

  type LeafletTileLayer = {
    addTo: (map: LeafletMap) => LeafletTileLayer;
  };

  type LeafletApi = {
    map: (elementId: string, options?: Record<string, unknown>) => LeafletMap;
    tileLayer: (url: string, options?: { maxZoom?: number; attribution?: string }) => LeafletTileLayer;
    marker: (latlng: [number, number], options?: { draggable?: boolean }) => LeafletMarker;
  };

  interface Window {
    L?: LeafletApi;
  }
}

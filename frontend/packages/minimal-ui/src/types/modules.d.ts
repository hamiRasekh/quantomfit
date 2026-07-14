declare module 'nprogress' {
  interface NProgress {
    start(): void;
    done(force?: boolean): void;
    set(n: number): NProgress;
    isStarted(): boolean;
    configure(options: Record<string, unknown>): NProgress;
  }
  const nprogress: NProgress;
  export default nprogress;
}

declare module 'autosuggest-highlight/parse' {
  export type ParsePart = { text: string; highlight: boolean };
  export default function parse(text: string, matches: number[][]): ParsePart[];
}

declare module 'autosuggest-highlight/match' {
  export default function match(text: string, query: string, options?: { insideWords?: boolean }): number[][];
}

declare module '@neshan-maps-platform/mapbox-gl' {
  type NeshanLngLat = { lng: number; lat: number };

  type NeshanMapInstance = {
    on(event: string, handler: (e: { lngLat: NeshanLngLat }) => void): void;
    remove(): void;
  };

  type NeshanMarkerInstance = {
    setLngLat(coords: [number, number]): NeshanMarkerInstance;
    addTo(map: NeshanMapInstance): NeshanMarkerInstance;
    on(event: string, handler: () => void): void;
    getLngLat(): NeshanLngLat;
  };

  type NeshanMapConstructor = {
    new (config: Record<string, unknown>): NeshanMapInstance;
    mapTypes: { neshanVector: string; neshanVectorNight: string };
  };

  type NeshanMarkerConstructor = {
    new (config?: { draggable?: boolean; color?: string }): NeshanMarkerInstance;
  };

  const nmp: {
    Map: NeshanMapConstructor;
    Marker: NeshanMarkerConstructor;
  };

  export default nmp;
}

declare module '@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css';

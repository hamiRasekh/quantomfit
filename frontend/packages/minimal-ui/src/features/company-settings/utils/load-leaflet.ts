const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

let loadPromise: Promise<void> | null = null;

export function loadLeaflet(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Leaflet requires a browser environment'));
  }

  if (window.L?.map) {
    return Promise.resolve();
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      if (!document.querySelector('link[data-leaflet-css]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = LEAFLET_CSS;
        link.dataset.leafletCss = 'true';
        document.head.appendChild(link);
      }

      if (document.querySelector('script[data-leaflet-js]')) {
        const waitForL = () => {
          if (window.L?.map) {
            resolve();
            return;
          }
          window.setTimeout(waitForL, 50);
        };
        waitForL();
        return;
      }

      const script = document.createElement('script');
      script.src = LEAFLET_JS;
      script.async = true;
      script.dataset.leafletJs = 'true';
      script.onload = () => resolve();
      script.onerror = () => {
        loadPromise = null;
        reject(new Error('بارگذاری Leaflet ناموفق بود'));
      };
      document.body.appendChild(script);
    });
  }

  return loadPromise;
}

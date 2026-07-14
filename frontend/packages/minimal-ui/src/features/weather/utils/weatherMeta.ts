export interface WeatherMeta {
  icon: string;
  text: string;
}

export function weatherMeta(code: number): WeatherMeta {
  if (code === 0) {
    return { icon: '☀', text: 'صاف' };
  }
  if (code >= 1 && code <= 3) {
    return { icon: '⛅', text: 'نیمه ابری' };
  }
  if (code >= 4 && code <= 49) {
    return { icon: '🌫', text: 'مه آلود' };
  }
  if (code >= 50 && code <= 69) {
    return { icon: '🌧', text: 'بارانی' };
  }
  if (code >= 70 && code <= 79) {
    return { icon: '❄', text: 'برفی' };
  }
  if (code >= 80 && code <= 99) {
    return { icon: '⛈', text: 'رگبار و طوفانی' };
  }
  return { icon: '🌤', text: 'متغیر' };
}

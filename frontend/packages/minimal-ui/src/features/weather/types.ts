export interface WeatherCurrent {
  time: string;
  temperature: number;
  humidity: number;
  rain: number;
  weather_code: number;
}

export interface WeatherDay {
  date: string;
  temperature_max: number;
  temperature_min: number;
  humidity_mean: number;
  precipitation_sum: number;
  precipitation_probability: number;
  weather_code: number;
}

export interface WeatherResponse {
  ok: true;
  date: string;
  temperature_max: number;
  temperature_min: number;
  humidity_mean: number;
  precipitation_sum: number;
  precipitation_probability: number;
  weather_code: number;
  current: WeatherCurrent | null;
  days: WeatherDay[];
  cached: boolean;
}

export function deriveAmbientTemperature(weather: WeatherResponse): number {
  const today = new Date().toISOString().slice(0, 10);
  if (
    weather.date === today &&
    weather.current?.temperature != null &&
    Number.isFinite(weather.current.temperature)
  ) {
    return Math.round(weather.current.temperature * 10) / 10;
  }
  return Math.round(((weather.temperature_max + weather.temperature_min) / 2) * 10) / 10;
}

export function displayTemperature(weather: WeatherResponse): number {
  if (weather.current?.temperature != null && Number.isFinite(weather.current.temperature)) {
    return Math.round(weather.current.temperature * 10) / 10;
  }
  return deriveAmbientTemperature(weather);
}

import { Injectable, Logger } from '@nestjs/common';

export interface WeatherInfo {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  cityName: string;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger('WeatherService');
  // Small in-memory cache so repeated dashboard loads for the same city
  // within a few minutes don't hammer the free-tier rate limit.
  private cache = new Map<string, { data: WeatherInfo; expiresAt: number }>();
  private readonly TTL_MS = 10 * 60 * 1000;

  async getWeatherByCity(city: string): Promise<WeatherInfo | null> {
    if (!city) return null;

    const key = city.trim().toLowerCase();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENWEATHER_API_KEY not set — weather data unavailable.');
      return null;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city,
      )}&appid=${apiKey}&units=metric`;
      const res = await fetch(url);
      if (!res.ok) {
        this.logger.warn(`Weather lookup failed for "${city}": ${res.status}`);
        return null;
      }
      const data: any = await res.json();

      const info: WeatherInfo = {
        temp: Math.round(data.main?.temp),
        feelsLike: Math.round(data.main?.feels_like),
        description: data.weather?.[0]?.description || '',
        icon: data.weather?.[0]?.icon || '',
        cityName: data.name || city,
      };

      this.cache.set(key, { data: info, expiresAt: Date.now() + this.TTL_MS });
      return info;
    } catch (err) {
      this.logger.warn(`Weather lookup error for "${city}": ${err.message}`);
      return null;
    }
  }
}

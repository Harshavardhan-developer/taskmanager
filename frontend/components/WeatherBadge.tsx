import { CloudSun } from 'lucide-react';
import { Weather } from '../lib/types';

export function WeatherBadge({ weather }: { weather?: Weather | null }) {
  if (!weather) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
      <CloudSun className="h-3.5 w-3.5 text-blue-500" />
      <span>
        {weather.cityName}: {weather.temp}°C, {weather.description}
      </span>
    </div>
  );
}

import { describe, expect, it, vi } from 'vitest';
import { fetchOpenMeteoWeather, searchOpenMeteoCities, weatherCodeLabel } from './weatherProvider';

describe('weatherProvider', () => {
  it('maps an Open-Meteo forecast into the small living-room snapshot', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL) => new Response(JSON.stringify({
      current: { temperature_2m: 18.4, weather_code: 2 },
      daily: {
        temperature_2m_max: [21.2],
        temperature_2m_min: [13.7],
        precipitation_probability_max: [16],
        weather_code: [2]
      }
    }), { status: 200 }));

    const snapshot = await fetchOpenMeteoWeather({
      latitude: 31.23,
      longitude: 121.47,
      locationLabel: '上海',
      fetcher: fetcher as typeof fetch,
      now: 123
    });

    expect(snapshot).toEqual({
      locationLabel: '上海',
      currentTemperature: 18,
      highTemperature: 21,
      lowTemperature: 14,
      precipitationProbability: 16,
      weatherCode: 2,
      condition: '多云',
      fetchedAt: 123
    });
    expect(String(fetcher.mock.calls[0]?.[0])).toContain('forecast_days=1');
  });

  it('returns localized manual-city candidates', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL) => new Response(JSON.stringify({
      results: [{ id: 1, name: '上海', admin1: '上海', country: '中国', latitude: 31.23, longitude: 121.47 }]
    }), { status: 200 }));

    await expect(searchOpenMeteoCities('上海', fetcher as typeof fetch)).resolves.toEqual([
      { id: 1, label: '上海 · 上海 · 中国', latitude: 31.23, longitude: 121.47 }
    ]);
  });

  it('uses a friendly fallback for unknown weather codes', () => {
    expect(weatherCodeLabel(500)).toBe('天气变化中');
  });
});

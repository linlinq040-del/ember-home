import { describe, expect, it } from 'vitest';
import { weatherNote } from './weatherNote';
import type { WeatherSnapshot } from './weatherProvider';

function snapshot(overrides: Partial<WeatherSnapshot> = {}): WeatherSnapshot {
  return {
    locationLabel: '上海',
    currentTemperature: 20,
    highTemperature: 24,
    lowTemperature: 16,
    afternoonTemperature: 23,
    eveningTemperature: 18,
    precipitationProbability: 0,
    weatherCode: 0,
    afternoonWeatherCode: 0,
    eveningWeatherCode: 0,
    isDay: true,
    condition: '晴朗',
    fetchedAt: 1,
    ...overrides
  };
}

describe('weatherNote', () => {
  const today = new Date(2026, 7, 1, 12);

  it('prioritizes hazardous weather over temperature and time of day', () => {
    expect(weatherNote(snapshot({ weatherCode: 95, currentTemperature: 38, isDay: false }), today)[0]).toMatch(/雷声|风雨/);
    expect(weatherNote(snapshot({ weatherCode: 61 }), today)[0]).toMatch(/雨/);
  });

  it('uses temperature and night-specific copy for ordinary weather', () => {
    expect(weatherNote(snapshot({ currentTemperature: 38 }), today)[1]).toContain('水');
    expect(weatherNote(snapshot({ currentTemperature: 2 }), today)[0]).toContain('冷');
    expect(weatherNote(snapshot({ isDay: false }), today)[0]).toMatch(/夜|月亮/);
  });

  it('keeps the selected wording stable throughout the same day', () => {
    const morning = new Date(2026, 7, 1, 8);
    const evening = new Date(2026, 7, 1, 20);
    expect(weatherNote(snapshot(), morning)).toEqual(weatherNote(snapshot(), evening));
  });
});

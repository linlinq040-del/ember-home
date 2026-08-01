import { useEffect, useState, type FormEvent } from 'react';
import {
  fetchOpenMeteoWeather,
  requestBrowserCoordinates,
  searchOpenMeteoCities,
  weatherVisualKind,
  type WeatherCity,
  type WeatherSnapshot,
  type WeatherVisualKind
} from './weatherProvider';

const WEATHER_CACHE_KEY = 'ember-home.weather-cache.v1';
const WEATHER_SETTINGS_KEY = 'ember-home.weather-settings.v1';
const WEATHER_CACHE_TTL_MS = 25 * 60 * 1000;

type WeatherSettings = {
  hidden: boolean;
  manualCity?: WeatherCity;
};

function readJson<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Weather is optional; storage failure must never block the living room.
  }
}

function readFreshSnapshot() {
  const snapshot = readJson<WeatherSnapshot>(WEATHER_CACHE_KEY);
  if (!snapshot || Date.now() - snapshot.fetchedAt > WEATHER_CACHE_TTL_MS) return null;
  return snapshot;
}

function rainCopy(probability: number) {
  if (probability >= 70) return `降雨概率 ${probability}%，记得带伞`;
  if (probability >= 40) return `可能下雨 · ${probability}%`;
  return `降雨概率 ${probability}%`;
}

const WEATHER_BACKGROUNDS: Record<WeatherVisualKind, string> = {
  clear: '/assets/weather/clear-day.png',
  'partly-cloudy': '/assets/weather/partly-cloudy.png',
  overcast: '/assets/weather/overcast-day.png',
  rain: '/assets/weather/rain-day.png',
  storm: '/assets/weather/storm-day.png',
  snow: '/assets/weather/snow-day.png',
  fog: '/assets/weather/fog-day.png',
  night: '/assets/weather/clear-night.png'
};

function WeatherIcon({ kind }: { kind: WeatherVisualKind }) {
  return <i className="ember-preview-weather-icon" data-kind={kind} aria-hidden="true" />;
}

export function WeatherCard() {
  const [settings, setSettings] = useState<WeatherSettings>(() => readJson<WeatherSettings>(WEATHER_SETTINGS_KEY) ?? { hidden: false });
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(() => readFreshSnapshot());
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [cities, setCities] = useState<WeatherCity[]>([]);

  useEffect(() => {
    writeJson(WEATHER_SETTINGS_KEY, settings);
  }, [settings]);

  const loadWeather = async (location: { latitude: number; longitude: number; label: string }) => {
    setLoading(true);
    setError('');
    try {
      const nextSnapshot = await fetchOpenMeteoWeather({
        latitude: location.latitude,
        longitude: location.longitude,
        locationLabel: location.label
      });
      setSnapshot(nextSnapshot);
      writeJson(WEATHER_CACHE_KEY, nextSnapshot);
      setPanelOpen(false);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '天气服务暂时不可用。');
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = async () => {
    setLoading(true);
    setError('');
    try {
      const coordinates = await requestBrowserCoordinates();
      setSettings({ hidden: false });
      await loadWeather({ ...coordinates, label: '当前位置' });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '没有取得定位权限，请手动选择城市。');
      setLoading(false);
      setPanelOpen(true);
    }
  };

  const searchCities = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const results = await searchOpenMeteoCities(cityQuery);
      setCities(results);
      if (!results.length) setError('没有找到这个城市，请换一种写法。');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '城市搜索暂时不可用。');
    } finally {
      setLoading(false);
    }
  };

  const chooseCity = (city: WeatherCity) => {
    setSettings({ hidden: false, manualCity: city });
    void loadWeather({ latitude: city.latitude, longitude: city.longitude, label: city.label });
  };

  if (settings.hidden) {
    return (
      <button
        className="ember-preview-weather-restore"
        type="button"
        onClick={() => setSettings((current) => ({ ...current, hidden: false }))}
      >
        显示天气卡片
      </button>
    );
  }

  const displayLocation = snapshot?.locationLabel.split(' · ')[0] ?? '选择城市';
  const currentKind = weatherVisualKind(snapshot?.weatherCode ?? 2, snapshot?.isDay ?? true);
  const afternoonKind = weatherVisualKind(snapshot?.afternoonWeatherCode ?? snapshot?.weatherCode ?? 2, true);
  const eveningKind = weatherVisualKind(snapshot?.eveningWeatherCode ?? snapshot?.weatherCode ?? 2, false);
  const backgroundAsset = WEATHER_BACKGROUNDS[currentKind];

  return (
    <article className="ember-preview-weather-card">
      <img src={backgroundAsset} alt={`${snapshot?.condition ?? '多云'}天气场景`} />
      <button className="ember-preview-weather-live" type="button" onClick={() => setPanelOpen((open) => !open)} aria-label="设置天气" aria-live="polite">
        <span className="ember-preview-weather-location">{loading ? '正在更新' : displayLocation}</span>
        <strong>{snapshot ? `${snapshot.currentTemperature}°` : '--°'}</strong>
        <b>{snapshot?.condition ?? '等待天气数据'}</b>
        <small>{snapshot ? `最高 ${snapshot.highTemperature}° · 最低 ${snapshot.lowTemperature}°` : '点击这里接入天气'}</small>
      </button>
      <div className="ember-preview-weather-forecast" aria-label="今日分时天气">
        <span><small>现在</small><WeatherIcon kind={currentKind} /><b>{snapshot ? `${snapshot.currentTemperature}°` : '--°'}</b></span>
        <span><small>下午</small><WeatherIcon kind={afternoonKind} /><b>{snapshot ? `${snapshot.afternoonTemperature ?? snapshot.highTemperature}°` : '--°'}</b></span>
        <span><small>今晚</small><WeatherIcon kind={eveningKind} /><b>{snapshot ? `${snapshot.eveningTemperature ?? snapshot.lowTemperature}°` : '--°'}</b></span>
      </div>
      <span className="ember-preview-weather-rain">{snapshot ? rainCopy(snapshot.precipitationProbability) : '点击左上方接入真实天气'}</span>
      <span className="ember-preview-weather-note" aria-hidden="true">风有一点凉，<br />回来时我在家等你。♡</span>

      {panelOpen ? (
        <div className="ember-preview-weather-panel">
          <div className="ember-preview-weather-panel-actions">
            <button type="button" onClick={() => void useCurrentLocation()} disabled={loading}>使用当前位置</button>
            {settings.manualCity ? (
              <button type="button" onClick={() => void loadWeather({
                latitude: settings.manualCity!.latitude,
                longitude: settings.manualCity!.longitude,
                label: settings.manualCity!.label
              })} disabled={loading}>刷新常住城市</button>
            ) : null}
            <button type="button" onClick={() => setSettings((current) => ({ ...current, hidden: true }))}>隐藏卡片</button>
          </div>
          <small className="ember-preview-weather-privacy">
            定位只用于本次天气查询，精确坐标不会保存。天气数据：<a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
          </small>
          <form onSubmit={searchCities}>
            <input value={cityQuery} onChange={(event) => setCityQuery(event.target.value)} placeholder="输入常住城市，例如上海" aria-label="常住城市" />
            <button type="submit" disabled={loading || cityQuery.trim().length < 2}>搜索</button>
          </form>
          {error ? <p>{error}</p> : null}
          {cities.length ? (
            <div className="ember-preview-weather-city-list">
              {cities.map((city) => <button type="button" key={city.id} onClick={() => chooseCity(city)}>{city.label}</button>)}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

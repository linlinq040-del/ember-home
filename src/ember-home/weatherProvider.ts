export type WeatherSnapshot = {
  locationLabel: string;
  currentTemperature: number;
  highTemperature: number;
  lowTemperature: number;
  precipitationProbability: number;
  weatherCode: number;
  condition: string;
  fetchedAt: number;
};

export type WeatherCity = {
  id: number;
  label: string;
  latitude: number;
  longitude: number;
};

type FetchLike = typeof fetch;

const WEATHER_CODE_LABELS: Record<number, string> = {
  0: '晴朗',
  1: '大致晴朗',
  2: '多云',
  3: '阴天',
  45: '有雾',
  48: '雾凇',
  51: '小毛毛雨',
  53: '毛毛雨',
  55: '较强毛毛雨',
  56: '轻微冻雨',
  57: '冻雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  66: '轻微冻雨',
  67: '较强冻雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  77: '米雪',
  80: '局部阵雨',
  81: '阵雨',
  82: '强阵雨',
  85: '小阵雪',
  86: '强阵雪',
  95: '雷阵雨',
  96: '雷雨伴小冰雹',
  99: '雷雨伴冰雹'
};

export function weatherCodeLabel(code: number) {
  return WEATHER_CODE_LABELS[code] ?? '天气变化中';
}

function assertCoordinate(value: number, min: number, max: number, label: string) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${label}无效。`);
  }
}

function rounded(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error('天气服务返回了无效温度。');
  return Math.round(number);
}

export async function fetchOpenMeteoWeather(args: {
  latitude: number;
  longitude: number;
  locationLabel: string;
  fetcher?: FetchLike;
  now?: number;
}): Promise<WeatherSnapshot> {
  assertCoordinate(args.latitude, -90, 90, '纬度');
  assertCoordinate(args.longitude, -180, 180, '经度');
  const fetcher = args.fetcher ?? fetch;
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(args.latitude));
  url.searchParams.set('longitude', String(args.longitude));
  url.searchParams.set('current', 'temperature_2m,weather_code');
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '1');

  const response = await fetcher(url);
  if (!response.ok) throw new Error(`天气服务暂时不可用（${response.status}）。`);
  const payload = await response.json() as {
    current?: { temperature_2m?: number; weather_code?: number };
    daily?: {
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
      precipitation_probability_max?: number[];
      weather_code?: number[];
    };
  };
  const weatherCode = Number(payload.current?.weather_code ?? payload.daily?.weather_code?.[0]);
  if (!Number.isFinite(weatherCode)) throw new Error('天气服务没有返回当前天气。');

  return {
    locationLabel: args.locationLabel.trim() || '当前位置',
    currentTemperature: rounded(payload.current?.temperature_2m),
    highTemperature: rounded(payload.daily?.temperature_2m_max?.[0]),
    lowTemperature: rounded(payload.daily?.temperature_2m_min?.[0]),
    precipitationProbability: Math.max(0, Math.min(100, rounded(payload.daily?.precipitation_probability_max?.[0] ?? 0))),
    weatherCode,
    condition: weatherCodeLabel(weatherCode),
    fetchedAt: args.now ?? Date.now()
  };
}

export async function searchOpenMeteoCities(
  query: string,
  fetcher: FetchLike = fetch
): Promise<WeatherCity[]> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return [];
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', normalizedQuery);
  url.searchParams.set('count', '5');
  url.searchParams.set('language', 'zh');
  url.searchParams.set('format', 'json');
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`城市搜索暂时不可用（${response.status}）。`);
  const payload = await response.json() as {
    results?: Array<{
      id?: number;
      name?: string;
      admin1?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
    }>;
  };

  return (payload.results ?? []).flatMap((result) => {
    const id = Number(result.id);
    const latitude = Number(result.latitude);
    const longitude = Number(result.longitude);
    if (!Number.isFinite(id) || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !result.name) return [];
    return [{
      id,
      label: [result.name, result.admin1, result.country].filter(Boolean).join(' · '),
      latitude,
      longitude
    }];
  });
}

export function requestBrowserCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('当前浏览器不支持定位，请手动选择城市。'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }),
      () => reject(new Error('没有取得定位权限，请手动选择城市。')),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 20 * 60 * 1000 }
    );
  });
}

import { weatherVisualKind, type WeatherSnapshot } from './weatherProvider';

export type WeatherNote = readonly [string, string];

const NOTES = {
  default: [
    ['风有一点凉，', '回来时我在家等你。♡'],
    ['外面的天很柔和，', '家里也一直亮着。♡']
  ],
  clear: [
    ['阳光很好，', '今天也要开心一点。♡'],
    ['天亮得很温柔，', '出门走走也很好。♡']
  ],
  overcast: [
    ['云把天空遮住了，', '但家里还是亮的。♡'],
    ['今天的云有点厚，', '回来就暖和了。♡']
  ],
  rain: [
    ['外面在下雨，', '回来时慢一点。♡'],
    ['雨还没有停，', '记得带好伞。♡']
  ],
  storm: [
    ['雷声有点近，', '今天早点回来。♡'],
    ['外面风雨很大，', '我在家里等你。♡']
  ],
  snow: [
    ['雪落得很安静，', '我在家等你。♡'],
    ['外面正在下雪，', '回来时注意脚下。♡']
  ],
  fog: [
    ['今天雾有点浓，', '路上要看清一点。♡'],
    ['远处都藏进雾里了，', '慢慢走，不着急。♡']
  ],
  hot: [
    ['今天有点热，', '记得多喝一点水。♡'],
    ['太阳很有精神，', '你要记得避避暑。♡']
  ],
  cold: [
    ['外面很冷，', '出门多穿一件。♡'],
    ['温度降下来了，', '别让自己着凉。♡']
  ],
  night: [
    ['夜已经深了，', '我一直在家。♡'],
    ['月亮出来了，', '回来时慢慢走。♡']
  ]
} as const;

type NoteGroup = keyof typeof NOTES;

function dailyIndex(now: Date, weatherCode: number, length: number) {
  const dayKey = now.getFullYear() * 372 + now.getMonth() * 31 + now.getDate() + weatherCode;
  return Math.abs(dayKey) % length;
}

export function weatherNote(snapshot: WeatherSnapshot | null, now = new Date()): WeatherNote {
  if (!snapshot) return NOTES.default[0];

  const kind = weatherVisualKind(snapshot.weatherCode, snapshot.isDay);
  let group: NoteGroup;

  if (kind === 'storm') group = 'storm';
  else if (kind === 'rain') group = 'rain';
  else if (kind === 'snow') group = 'snow';
  else if (kind === 'fog') group = 'fog';
  else if (snapshot.currentTemperature >= 35) group = 'hot';
  else if (snapshot.currentTemperature <= 5) group = 'cold';
  else if (!snapshot.isDay) group = 'night';
  else if (kind === 'clear') group = 'clear';
  else if (kind === 'overcast') group = 'overcast';
  else group = 'default';

  const candidates = NOTES[group];
  return candidates[dailyIndex(now, snapshot.weatherCode, candidates.length)];
}

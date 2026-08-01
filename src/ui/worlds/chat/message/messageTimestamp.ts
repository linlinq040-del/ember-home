const MESSAGE_TIME_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  hourCycle: 'h23'
});

export function formatMessageTimestamp(timestamp: number) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '';
  return MESSAGE_TIME_FORMATTER.format(new Date(timestamp));
}

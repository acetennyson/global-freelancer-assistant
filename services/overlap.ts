interface ClientWindow {
  timezone: string;
  send_window?: string;
}

export function getBestOverlapWindow(clients: ClientWindow[]): string | null {
  if (!clients.length) return null;

  // Count how many clients are available at each hour (0-23) in UTC
  const scores = new Array(24).fill(0);

  for (const client of clients) {
    const [startStr, endStr] = (client.send_window || '10:00-14:00').split('-');
    const startLocal = parseInt(startStr.split(':')[0]);
    const endLocal = parseInt(endStr.split(':')[0]);

    // Convert local window to UTC hours
    const now = new Date();
    const utcOffset = getUTCOffset(client.timezone, now);

    for (let h = startLocal; h < endLocal; h++) {
      const utcHour = ((h - utcOffset) % 24 + 24) % 24;
      scores[utcHour]++;
    }
  }

  // Find the hour with the most overlap
  const maxScore = Math.max(...scores);
  if (maxScore === 0) return null;

  const bestHour = scores.indexOf(maxScore);
  const endHour = bestHour + 1;

  return `${String(bestHour).padStart(2, '0')}:00–${String(endHour).padStart(2, '0')}:00 UTC (${maxScore}/${clients.length} clients)`;
}

function getUTCOffset(timezone: string, date: Date): number {
  const utcStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'UTC' }).format(date);
  const localStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: timezone }).format(date);
  return parseInt(localStr) - parseInt(utcStr);
}

'use client';

import { useEffect, useState } from 'react';

interface ClockEntry {
  name: string;
  timezone: string;
  available: boolean;
  send_window?: string;
}

function getTime(timezone: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: timezone,
  }).format(new Date());
}

function getCountdown(timezone: string, sendWindow = '10:00-14:00') {
  const localHour = parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: timezone }).format(new Date()));
  const localMin = parseInt(new Intl.DateTimeFormat('en-US', { minute: 'numeric', timeZone: timezone }).format(new Date()));
  const endHour = parseInt(sendWindow.split('-')[1].split(':')[0]);
  let minsLeft = (endHour * 60) - (localHour * 60 + localMin);
  if (minsLeft <= 0) minsLeft = 0;
  const h = Math.floor(minsLeft / 60);
  const m = minsLeft % 60;
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

function getShortTZ(timezone: string) {
  return timezone.split('/').pop()?.replace(/_/g, ' ') ?? timezone;
}

export default function WorldClockStrip({ clients }: { clients: ClockEntry[] }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!clients.length) return null;

  const seen = new Set<string>();
  const unique = clients.filter(c => {
    if (seen.has(c.timezone)) return false;
    seen.add(c.timezone);
    return true;
  });

  return (
    <div className="shrink-0 border-b overflow-x-auto" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="flex min-w-max px-2 py-1.5 gap-1">
        {unique.map(c => (
          <div key={c.timezone}
            className="flex flex-col items-center px-4 py-2 rounded-xl min-w-[120px] transition-all"
            style={{
              background: c.available ? 'var(--green-subtle)' : 'var(--bg-card)',
              border: `1px solid ${c.available ? 'var(--green)' : 'var(--border)'}`,
              opacity: c.available ? 1 : 0.6,
            }}>
            <div className="text-xs font-medium truncate max-w-[108px]" style={{ color: 'var(--text-secondary)' }}>
              {c.name}
            </div>
            <div className="text-sm font-mono font-bold mt-0.5" style={{ color: c.available ? 'var(--green)' : 'var(--text)' }}>
              {c.available ? getCountdown(c.timezone, c.send_window) : getTime(c.timezone)}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {getShortTZ(c.timezone)} · {c.available ? 'active' : 'inactive'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const getLocalHour = (timezone: string): number =>
  parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: timezone }).format(new Date()));

export const isBusinessHours = (timezone: string, window = '10:00-14:00'): boolean => {
  const hour = getLocalHour(timezone);
  const [start, end] = window.split('-').map(t => parseInt(t.split(':')[0]));
  return hour >= start && hour < end;
};

export const getLocalTime = (timezone: string): string =>
  new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone }).format(new Date());

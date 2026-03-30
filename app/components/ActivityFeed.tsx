'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Log {
  id: number;
  client_name: string;
  action: string;
  detail: string | null;
  created_at: string;
}

const ACTION_STYLE: Record<string, { icon: string; color: string }> = {
  draft_generated: { icon: '✨', color: 'text-blue-400' },
  marked_ready:    { icon: '✓',  color: 'text-yellow-400' },
  sent:            { icon: '📧', color: 'text-green-400' },
  send_now:        { icon: '🚀', color: 'text-orange-400' },
  failed:          { icon: '✕',  color: 'text-red-400' },
  responded:       { icon: '💬', color: 'text-purple-400' },
  unresponded:     { icon: '↩',  color: 'text-zinc-400' },
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityFeed() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    fetch('/api/activity')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLogs(data); })
      .finally(() => setLoading(false));

    // Realtime subscription
    const channel = supabase
      .channel('activity_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        payload => setLogs(prev => [payload.new as Log, ...prev].slice(0, 20))
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="text-xs uppercase tracking-widest font-medium px-4 py-3" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
        Activity
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && <div className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>Loading...</div>}
        {!loading && logs.length === 0 && (
          <div className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No activity yet</div>
        )}
        {logs.map(log => {
          const style = ACTION_STYLE[log.action] || { icon: '•', color: 'text-zinc-400' };
          return (
            <div key={log.id} className="px-4 py-3 transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-medium ${style.color}`}>{style.icon} {log.client_name}</span>
                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{timeAgo(log.created_at)}</span>
              </div>
              <div className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>{log.action.replace(/_/g, ' ')}</div>
              {log.detail && <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{log.detail}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

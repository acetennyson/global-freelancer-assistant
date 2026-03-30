'use client';

import { useEffect, useState } from 'react';
import ClientForm from './components/ClientForm';
import WorldClockStrip from './components/WorldClockStrip';
import ActivityFeed from './components/ActivityFeed';
import ThemeToggle from './components/ThemeToggle';
import ChatWidget from './components/ChatWidget';
import { getBestOverlapWindow } from '@/services/overlap';

interface Client {
  notion_page_id: string;
  name: string;
  timezone: string;
  status: string;
  ai_draft: string;
  email: string;
  send_status: string;
  scheduled_message: string;
  project: string;
  last_update: string;
  next_action: string;
  send_window: string;
  localTime?: string;
  available?: boolean;
}

function getLocalTime(timezone: string) {
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone }).format(new Date());
}

function isBusinessHours(timezone: string, sendWindow = '10:00-14:00') {
  const hour = parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: timezone }).format(new Date()));
  const [start, end] = sendWindow.split('-').map(t => parseInt(t.split(':')[0]));
  return hour >= start && hour < end;
}

function getHoursUntilAvailable(timezone: string, sendWindow = '10:00-14:00') {
  const now = new Date();
  const localHour = parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: timezone }).format(now));
  const startHour = parseInt(sendWindow.split('-')[0].split(':')[0]);
  let hoursUntil = startHour - localHour;
  if (hoursUntil <= 0) hoursUntil += 24;
  return hoursUntil === 1 ? '1h' : `${hoursUntil}h`;
}

const SEND_STATUS_STYLE: Record<string, string> = {
  Draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Ready: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Sent: 'bg-green-500/10 text-green-400 border-green-500/20',
  Failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  Responded: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const [generating, setGenerating] = useState(false);
  const [marking, setMarking] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [search, setSearch] = useState('');
  const [draftHistory, setDraftHistory] = useState<{id: number; draft: string; created_at: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [token, setToken] = useState('');
  const [dbId, setDbId] = useState('');
  const [saved, setSaved] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setToken(localStorage.getItem('notion_token') || '');
    setDbId(localStorage.getItem('notion_db_id') || '');
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error((await res.json()).error);
      const data: Client[] = await res.json();
      const enriched = data.map(c => ({ ...c, localTime: getLocalTime(c.timezone), available: isBusinessHours(c.timezone, c.send_window || '10:00-14:00') }));
      setClients(enriched);
      if (selected) setSelected(enriched.find(c => c.notion_page_id === selected.notion_page_id) || null);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleSync() {
    setSyncing(true);
    await fetch('/api/notion/sync');
    await fetchClients();
    setSyncing(false);
  }

  async function handleGenerateDraft(id?: string) {
    const targetId = id || selected?.notion_page_id;
    if (!targetId) return;
    setGenerating(true); setError('');
    try {
      const res = await fetch('/api/generate-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notion_page_id: targetId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchClients();
    } catch (e: any) { setError(e.message); }
    finally { setGenerating(false); }
  }

  async function handleMarkReady() {
    if (!selected) return;
    setMarking(true);
    try {
      await fetch('/api/mark-ready', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notion_page_id: selected.notion_page_id, client_name: selected.name }) });
      await fetchClients();
    } finally { setMarking(false); }
  }

  async function handleSendNow(id?: string) {
    const targetId = id || selected?.notion_page_id;
    if (!targetId) return;
    setSending(true); setError('');
    try {
      const res = await fetch('/api/send-now', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notion_page_id: targetId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchClients();
    } catch (e: any) { setError(e.message); }
    finally { setSending(false); }
  }

  async function handleSendAllReady() {
    setSendingAll(true); setError('');
    try {
      await fetch('/api/send-all-ready', { method: 'POST' });
      await fetchClients();
    } finally { setSendingAll(false); }
  }

  async function handleToggleResponded() {
    if (!selected) return;
    const responded = selected.send_status !== 'Responded';
    try {
      await fetch('/api/mark-responded', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notion_page_id: selected.notion_page_id, client_name: selected.name, responded }) });
      await fetchClients();
    } catch (e: any) { setError(e.message); }
  }

  async function loadDraftHistory(id: string) {
    const res = await fetch(`/api/draft-history?id=${id}`);
    const data = await res.json();
    if (Array.isArray(data)) setDraftHistory(data);
    setShowHistory(true);
  }

  function saveSettings() {
    localStorage.setItem('notion_token', token);
    localStorage.setItem('notion_db_id', dbId);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    fetchClients();
  }

  if (!mounted) return null;
  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.project?.toLowerCase().includes(search.toLowerCase()));
  const available = filtered.filter(c => c.available);
  const sleeping = filtered.filter(c => !c.available);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Topbar */}
      <header className="shrink-0 px-5 h-14 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">G</div>
          <span className="font-semibold text-sm truncate max-w-[80px] sm:max-w-none">NightShift</span>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs max-w-[120px] sm:max-w-xs truncate" style={{ color: 'var(--red)' }}>{error}</span>}
          <button onClick={handleSync} disabled={syncing}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            ↻ Sync
          </button>
          <button onClick={handleSendAllReady} disabled={sendingAll}
            className="text-xs px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 border border-green-500/20 text-green-400 transition-colors disabled:opacity-40 hidden sm:block">
            {sendingAll ? 'Sending...' : '⚡ Send All Ready'}
          </button>
          <ThemeToggle />
          <button onClick={() => setShowSettings(s => !s)}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: showSettings ? 'var(--accent-subtle)' : 'var(--bg-secondary)', border: '1px solid var(--border)', color: showSettings ? 'var(--accent)' : 'var(--text-secondary)' }}>
            ⚙
          </button>
        </div>
      </header>

      {/* Settings dropdown */}
      {showSettings && (
        <div className="shrink-0 px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="flex gap-3 max-w-2xl flex-wrap">
            <input type="password" placeholder="Notion Token" value={token} onChange={e => setToken(e.target.value)}
              className="flex-1 min-w-0 rounded-lg px-3 py-2 text-xs focus:outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <input type="text" placeholder="Database ID" value={dbId} onChange={e => setDbId(e.target.value)}
              className="flex-1 min-w-0 rounded-lg px-3 py-2 text-xs focus:outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <button onClick={saveSettings}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-colors text-white"
              style={{ background: 'var(--accent)' }}>
              {saved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* World clock strip */}
      <WorldClockStrip clients={clients.map(c => ({ name: c.name, timezone: c.timezone, available: c.available ?? false, send_window: c.send_window }))} />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${selected ? 'hidden sm:flex' : 'flex'} w-full sm:w-72 shrink-0 flex-col overflow-hidden`}
          style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          {/* Stats strip */}
          <div className="shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="px-4 pt-3 pb-1 text-xs" style={{ color: 'var(--text-muted)' }}>Client overview</div>
            <div className="grid grid-cols-3">
            {[
              { label: 'Total', value: clients.length, color: 'var(--text)' },
              { label: 'Available', value: available.length, color: 'var(--green)' },
              { label: 'Ready', value: clients.filter(c => c.send_status === 'Ready').length, color: 'var(--accent)' },
            ].map((s, i) => (
              <div key={s.label} className="py-3 text-center" style={{ borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          </div>

          {/* Search */}
          <div className="shrink-0 px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <input type="text" placeholder="Search clients..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>

          {/* Client list */}
          <div className="flex-1 overflow-y-auto">
            {loading && <div className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading...</div>}

            {!loading && available.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs uppercase tracking-widest font-medium sticky top-0" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
                  ☀️ Available
                </div>
                {available.map(c => <ClientRow key={c.notion_page_id} client={c} selected={selected?.notion_page_id === c.notion_page_id} onClick={() => setSelected(s => s?.notion_page_id === c.notion_page_id ? null : c)} />)}
              </div>
            )}

            {!loading && sleeping.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs text-zinc-600 uppercase tracking-widest font-medium sticky top-0 bg-[#0a0a0a]">
                  🌙 Sleeping
                </div>
                {sleeping.map(c => <ClientRow key={c.notion_page_id} client={c} selected={selected?.notion_page_id === c.notion_page_id} onClick={() => setSelected(s => s?.notion_page_id === c.notion_page_id ? null : c)} />)}
              </div>
            )}

            {!loading && clients.length === 0 && !error && (
              <div className="text-xs text-center py-8 px-4" style={{ color: 'var(--text-muted)' }}>No clients found. Add one below.</div>
            )}
          </div>
        </aside>

        {/* Detail panel */}
        <main className={`${selected ? 'flex' : 'hidden sm:flex'} flex-1 overflow-y-auto p-4 sm:p-6 flex-col`}>
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-6">
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a client to view details</div>
              {clients.length > 1 && (() => {
                const overlap = getBestOverlapWindow(clients);
                return overlap ? (
                  <div className="rounded-xl px-5 py-4 max-w-sm" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border)' }}>
                    <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Best overlap window</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{overlap}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Best time to reach most clients simultaneously</div>
                  </div>
                ) : null;
              })()}
            </div>
          ) : (
            <div className="max-w-2xl w-full">
              <button onClick={() => setSelected(null)} className="sm:hidden flex items-center gap-2 text-sm mb-4 transition-colors" style={{ color: 'var(--text-muted)' }}>
                ← Back
              </button>
              {/* Client header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{selected.timezone} · {selected.localTime}</div>
                  {selected.project && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>📁 {selected.project}</div>}
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="text-xs px-2.5 py-1 rounded-full border font-medium"
                    style={{ background: selected.available ? 'var(--green-subtle)' : 'var(--bg-secondary)', color: selected.available ? 'var(--green)' : 'var(--text-muted)', borderColor: selected.available ? 'var(--green)' : 'var(--border)' }}>
                    {selected.available ? '☀️ Available' : `🌙 Available in ${getHoursUntilAvailable(selected.timezone, selected.send_window)}`}
                  </span>
                  {selected.send_status && (
                    <span className="text-xs px-2.5 py-1 rounded-full" style={getSendStatusStyle(selected.send_status)}>
                      {selected.send_status}
                    </span>
                  )}
                  <button onClick={() => setSelected(null)} className="transition-colors ml-1" style={{ color: 'var(--text-muted)' }}>✕</button>
                </div>
              </div>

              {/* Context fields */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Project', value: selected.project },
                  { label: 'Last Update', value: selected.last_update },
                  { label: 'Next Action', value: selected.next_action || '—' },
                ].map(f => (
                  <div key={f.label} className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</div>
                    <div className="text-sm" style={{ color: f.value ? 'var(--text)' : 'var(--text-muted)' }}>{f.value || 'Not set'}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-6 flex-wrap">
                <button onClick={() => handleGenerateDraft()} disabled={generating}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-40"
                  style={{ background: 'linear-gradient(to right, var(--accent), #06b6d4)' }}>
                  {generating ? '✨ Generating...' : '✨ Generate Draft'}
                </button>
                {selected.ai_draft && selected.send_status !== 'Sent' && selected.send_status !== 'Ready' && (
                  <button onClick={handleMarkReady} disabled={marking}
                    className="px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-40"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    {marking ? '...' : '✓ Mark Ready'}
                  </button>
                )}
                {selected.ai_draft && (
                  <button onClick={() => handleSendNow()} disabled={sending}
                    className="px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-40"
                    style={{ background: 'var(--orange-subtle)', border: '1px solid var(--orange)', color: 'var(--orange)' }}>
                    {sending ? 'Sending...' : '🚀 Send Now'}
                  </button>
                )}
                <button onClick={() => setEditingClient(selected)}
                  className="px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  ✏️ Edit
                </button>
                {selected.send_status === 'Sent' && (
                  <button onClick={handleToggleResponded}
                    className="px-4 py-2 rounded-lg text-sm transition-colors"
                    style={{ background: 'var(--purple-subtle)', border: '1px solid var(--purple)', color: 'var(--purple)' }}>
                    💬 Mark Responded
                  </button>
                )}
                {selected.send_status === 'Responded' && (
                  <button onClick={handleToggleResponded}
                    className="px-4 py-2 rounded-lg text-sm transition-colors"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    ↩ Unmark Responded
                  </button>
                )}
                <button onClick={() => { setShowHistory(false); loadDraftHistory(selected.notion_page_id); }}
                  className="px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  📋 History
                </button>
              </div>

              {/* AI Draft */}
              {selected.ai_draft && (
                <div className="rounded-xl p-5" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent)', borderLeftWidth: '3px' }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--accent)' }}>AI Draft</div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{selected.ai_draft}</p>
                  <button onClick={() => navigator.clipboard.writeText(selected.ai_draft)}
                    className="mt-3 text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
                    Copy to clipboard
                  </button>
                </div>
              )}

              {showHistory && draftHistory.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--text-muted)' }}>Draft History</div>
                    <button onClick={() => setShowHistory(false)} className="text-xs" style={{ color: 'var(--text-muted)' }}>✕ Close</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {draftHistory.map(h => (
                      <div key={h.id} className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{new Date(h.created_at).toLocaleString()}</div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{h.draft}</p>
                        <button onClick={() => navigator.clipboard.writeText(h.draft)}
                          className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>Copy</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Activity feed — right panel, desktop only */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col overflow-hidden" style={{ borderLeft: '1px solid var(--border)' }}>
          <ActivityFeed />
        </aside>
      </div>

      {/* Mobile bottom bar */}
      <div className="sm:hidden shrink-0 px-4 py-3 flex gap-2" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <button onClick={handleSendAllReady} disabled={sendingAll}
          className="flex-1 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
          style={{ background: 'var(--green-subtle)', border: '1px solid var(--green)', color: 'var(--green)' }}>
          {sendingAll ? 'Sending...' : '⚡ Send All Ready'}
        </button>
      </div>

      {/* Floating + button */}
      <button onClick={() => { setEditingClient(null); setShowAddWidget(true); }}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg hover:scale-105 transition-transform z-40 text-white"
        style={{ background: 'linear-gradient(135deg, var(--accent), #06b6d4)', boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}>
        +
      </button>

      {/* Chat widget */}
      <ChatWidget
        clients={clients}
        onSelectClient={id => setSelected(clients.find(c => c.notion_page_id === id) || null)}
        onSendNow={id => handleSendNow(id)}
        onGenerateDraft={id => handleGenerateDraft(id)}
      />

      {(showAddWidget || editingClient) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => { setShowAddWidget(false); setEditingClient(null); }} />
          <div className="relative w-full sm:w-[480px]">
            <ClientForm
              notion_page_id={editingClient?.notion_page_id}
              initial={editingClient || undefined}
              onSave={() => { setShowAddWidget(false); setEditingClient(null); fetchClients(); }}
              onCancel={() => { setShowAddWidget(false); setEditingClient(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ClientRow({ client, selected, onClick }: { client: Client; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full text-left px-4 py-3 transition-colors"
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        borderLeft: selected ? '2px solid var(--accent)' : '2px solid transparent',
        background: selected ? 'var(--accent-subtle)' : 'transparent',
      }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{client.name}</span>
        <span className="text-xs shrink-0 ml-2" style={{ color: client.available ? 'var(--green)' : 'var(--text-muted)' }}>
          {client.available ? client.localTime : `in ${getHoursUntilAvailable(client.timezone, client.send_window)}`}
        </span>
      </div>
      <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{client.project || client.timezone}</div>
      {client.send_status && (
        <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded"
          style={getSendStatusStyle(client.send_status)}>
          {client.send_status}
        </span>
      )}
    </button>
  );
}

function getSendStatusStyle(status: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    Draft:     { background: 'var(--yellow-subtle)', color: 'var(--yellow)', border: '1px solid var(--yellow)' },
    Ready:     { background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent)' },
    Sent:      { background: 'var(--green-subtle)',  color: 'var(--green)',  border: '1px solid var(--green)' },
    Failed:    { background: 'var(--red-subtle)',    color: 'var(--red)',    border: '1px solid var(--red)' },
    Responded: { background: 'var(--purple-subtle)', color: 'var(--purple)', border: '1px solid var(--purple)' },
  };
  return map[status] || { background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' };
}

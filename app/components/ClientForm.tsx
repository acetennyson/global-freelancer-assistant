'use client';

import { useState } from 'react';

interface ClientFormProps {
  notion_page_id?: string;
  initial?: {
    name?: string;
    timezone?: string;
    project?: string;
    last_update?: string;
    next_action?: string;
    email?: string;
    send_window?: string;
    status?: string;
  };
  onSave: () => void;
  onCancel: () => void;
}

const TIMEZONES = typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl
  ? (Intl as any).supportedValuesOf('timeZone') as string[]
  : ['UTC', 'America/New_York', 'Europe/London', 'Africa/Lagos', 'Asia/Tokyo'];

export default function ClientForm({ notion_page_id, initial = {}, onSave, onCancel }: ClientFormProps) {
  const isEdit = !!notion_page_id;
  const [form, setForm] = useState({
    name: initial.name ?? '',
    timezone: initial.timezone ?? 'UTC',
    project: initial.project ?? '',
    last_update: initial.last_update ?? '',
    next_action: initial.next_action ?? '',
    email: initial.email ?? '',
    send_window: initial.send_window ?? '10:00-14:00',
    status: initial.status ?? 'In progress',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required');
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/save-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notion_page_id, ...form }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <h3 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>{isEdit ? 'Edit Client' : 'Add New Client'}</h3>

      {error && <div className="mb-4 text-sm rounded-lg p-3" style={{ color: 'var(--red)', background: 'var(--red-subtle)', border: '1px solid var(--red)' }}>{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Field label="Name *" value={form.name} onChange={v => set('name', v)} placeholder="Sarah Chen" />
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>Timezone *</label>
          <input list="tz-list" value={form.timezone} onChange={e => set('timezone', e.target.value)}
            placeholder="America/New_York"
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <datalist id="tz-list">
            {TIMEZONES.map(tz => <option key={tz} value={tz} />)}
          </datalist>
        </div>
        <Field label="Email" value={form.email} onChange={v => set('email', v)} placeholder="sarah@example.com" type="email" />
        <Field label="Project" value={form.project} onChange={v => set('project', v)} placeholder="E-commerce redesign" />
        <Field label="Send Window" value={form.send_window} onChange={v => set('send_window', v)} placeholder="10:00-14:00" />
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <option value="Not started">Not started</option>
            <option value="In progress">In progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <TextArea label="Last Update" value={form.last_update} onChange={v => set('last_update', v)}
          placeholder="Delivered homepage mockup v2" />
        <TextArea label="Next Action (optional)" value={form.next_action} onChange={v => set('next_action', v)}
          placeholder="Waiting for client feedback" />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm transition-colors"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 text-white"
          style={{ background: 'var(--accent)' }}>
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Client'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }} />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }} />
    </div>
  );
}

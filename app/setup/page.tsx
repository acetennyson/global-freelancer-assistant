'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Field {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  hint?: string;
}

interface Step {
  id: string;
  title: string;
  icon: string;
  description: string;
  link?: { label: string; url: string };
  instructions: string[];
  fields: Field[];
  validateEndpoint?: string;
  optional?: boolean;
}

const STEPS: Step[] = [
  {
    id: 'notion',
    title: 'Notion',
    icon: '📝',
    description: 'Connect your Notion workspace to read and write client data.',
    link: { label: 'Open Notion Integrations', url: 'https://www.notion.so/my-integrations' },
    instructions: [
      'Go to notion.so/my-integrations',
      'Click "New integration"',
      'Give it a name (e.g. "NightShift") and select your workspace',
      'Copy the "Internal Integration Token" (starts with ntn_)',
      'Open your Clients database in Notion',
      'Click ··· → Connections → Connect to your integration',
      'Copy the database ID from the URL (32 chars before the ?)',
    ],
    fields: [
      { key: 'NOTION_TOKEN', label: 'Integration Token', placeholder: 'ntn_...', type: 'password' },
      { key: 'NOTION_DATABASE_ID', label: 'Database ID', placeholder: '32-character ID from the URL' },
    ],
    validateEndpoint: '/api/setup/validate-notion',
  },
  {
    id: 'supabase',
    title: 'Supabase',
    icon: '🗄️',
    description: 'Store activity logs, draft history, and enable real-time updates.',
    link: { label: 'Open Supabase', url: 'https://supabase.com/dashboard' },
    instructions: [
      'Go to supabase.com and create a new project',
      'Once created, go to Project Settings → API',
      'Copy the "Project URL" and "anon public" key',
      'Go to SQL Editor and run the contents of supabase/all.sql',
    ],
    fields: [
      { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Project URL', placeholder: 'https://xxxx.supabase.co' },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Anon Key', placeholder: 'eyJ...', type: 'password' },
    ],
    validateEndpoint: '/api/setup/validate-supabase',
  },
  {
    id: 'gmail',
    title: 'Gmail',
    icon: '📧',
    description: 'Send emails to clients via your Gmail account.',
    link: { label: 'Open Google Account Security', url: 'https://myaccount.google.com/security' },
    instructions: [
      'Go to myaccount.google.com → Security',
      'Enable 2-Step Verification if not already on',
      'Search for "App passwords" and open it',
      'Select "Mail" and generate a password',
      'Copy the 16-character app password',
    ],
    fields: [
      { key: 'GMAIL_USER', label: 'Gmail Address', placeholder: 'you@gmail.com' },
      { key: 'GMAIL_APP_PASSWORD', label: 'App Password', placeholder: 'xxxx xxxx xxxx xxxx', type: 'password', hint: '16-character app password, not your regular password' },
    ],
    validateEndpoint: '/api/setup/validate-gmail',
  },
  {
    id: 'ai',
    title: 'AI Keys',
    icon: '🤖',
    description: 'At least one AI provider is required. Add multiple for automatic fallback.',
    instructions: [
      'Get a free Gemini key at aistudio.google.com',
      'Get a free Groq key at console.groq.com',
      'Add multiple keys separated by commas for rotation',
      'All other providers are optional',
    ],
    fields: [
      { key: 'GEMINI_API_KEYS', label: 'Gemini API Keys', placeholder: 'key1,key2,key3', hint: 'Free at aistudio.google.com' },
      { key: 'GROQ_API_KEYS', label: 'Groq API Keys', placeholder: 'key1,key2', hint: 'Free at console.groq.com' },
      { key: 'ANTHROPIC_API_KEYS', label: 'Anthropic Keys (optional)', placeholder: 'key1,key2' },
      { key: 'DEEPSEEK_API_KEYS', label: 'DeepSeek Keys (optional)', placeholder: 'key1,key2' },
      { key: 'HUGGINGFACE_API_KEYS', label: 'HuggingFace Keys (optional)', placeholder: 'key1,key2' },
    ],
    optional: true,
  },
  {
    id: 'profile',
    title: 'Your Profile',
    icon: '👤',
    description: 'Personalize how the AI signs your emails.',
    instructions: [],
    fields: [
      { key: 'FREELANCER_NAME', label: 'Your Name', placeholder: 'John Doe', hint: 'Used in AI-generated email sign-offs' },
    ],
    optional: true,
  },
];

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const step = STEPS[currentStep];

  function setValue(key: string, value: string) {
    setValues(v => ({ ...v, [key]: value }));
    setErrors(e => ({ ...e, [step.id]: '' }));
  }

  async function validate() {
    if (!step.validateEndpoint) {
      setValidated(v => ({ ...v, [step.id]: true }));
      next();
      return;
    }
    setValidating(true);
    try {
      const body: Record<string, string> = {};
      step.fields.forEach(f => { if (values[f.key]) body[f.key] = values[f.key]; });
      const res = await fetch(step.validateEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setValidated(v => ({ ...v, [step.id]: true }));
        next();
      } else {
        setErrors(e => ({ ...e, [step.id]: data.error || 'Validation failed' }));
      }
    } catch {
      setErrors(e => ({ ...e, [step.id]: 'Connection error' }));
    } finally {
      setValidating(false);
    }
  }

  function next() {
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
    else setDone(true);
  }

  function skip() {
    next();
  }

  const envContent = Object.entries(values)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>You're all set!</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Copy your environment variables below and add them to your <code>.env.local</code> file or Vercel dashboard.</p>
          </div>
          <div className="rounded-xl p-4 mb-6 font-mono text-xs leading-relaxed" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)', whiteSpace: 'pre' }}>
            {envContent || '# No values entered'}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigator.clipboard.writeText(envContent)}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white"
              style={{ background: 'var(--accent)' }}>
              Copy to clipboard
            </button>
            <Link href="/dashboard"
              className="flex-1 py-3 rounded-xl text-sm font-medium text-center"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">N</div>
            <span className="font-semibold">NightShift</span>
          </div>
          <h1 className="text-2xl font-bold mt-4">Setup</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Connect your services to get started. Takes about 5 minutes.</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1 h-1.5 rounded-full transition-all"
              style={{ background: i <= currentStep ? 'var(--accent)' : 'var(--border)' }} />
          ))}
        </div>

        {/* Step */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{step.icon}</span>
            <div>
              <div className="font-semibold">{step.title}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Step {currentStep + 1} of {STEPS.length}</div>
            </div>
            {step.optional && <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Optional</span>}
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>{step.description}</p>

          {step.link && (
            <a href={step.link.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg mb-5 transition-colors"
              style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
              {step.link.label} ↗
            </a>
          )}

          {step.instructions.length > 0 && (
            <ol className="mb-5 flex flex-col gap-1.5">
              {step.instructions.map((inst, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{i + 1}</span>
                  {inst}
                </li>
              ))}
            </ol>
          )}

          <div className="flex flex-col gap-3 mb-5">
            {step.fields.map(f => (
              <div key={f.key}>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                <input type={f.type || 'text'} value={values[f.key] || ''} onChange={e => setValue(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                {f.hint && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{f.hint}</div>}
              </div>
            ))}
          </div>

          {errors[step.id] && (
            <div className="mb-4 text-sm p-3 rounded-lg" style={{ background: 'var(--red-subtle)', color: 'var(--red)', border: '1px solid var(--red)' }}>
              {errors[step.id]}
            </div>
          )}

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button onClick={() => setCurrentStep(s => s - 1)}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                ← Back
              </button>
            )}
            {step.optional && (
              <button onClick={skip}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                Skip
              </button>
            )}
            <button onClick={validate} disabled={validating}
              className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors"
              style={{ background: 'var(--accent)' }}>
              {validating ? 'Validating...' : currentStep === STEPS.length - 1 ? 'Finish' : 'Continue →'}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/dashboard" className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Skip setup and go to dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

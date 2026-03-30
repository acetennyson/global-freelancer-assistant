'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  actions?: { label: string; onClick: () => void }[];
}

interface ChatWidgetProps {
  clients: {
    notion_page_id: string;
    name: string;
    ai_draft?: string;
    send_status?: string;
    available?: boolean;
  }[];
  onSelectClient?: (id: string) => void;
  onSendNow?: (id: string) => void;
  onGenerateDraft?: (id: string) => void;
}

const SUGGESTIONS = [
  'Who should I reach out to first today?',
  'Which client has been waiting the longest?',
  'What did I last do for each client?',
  'What\'s the best time to reach all my clients?',
];

export default function ChatWidget({ clients, onSelectClient, onSendNow, onGenerateDraft }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getActionsForResponse(text: string): { label: string; onClick: () => void }[] {
    const actions: { label: string; onClick: () => void }[] = [];
    for (const client of clients) {
      if (text.toLowerCase().includes(client.name.toLowerCase())) {
        if (onSelectClient)
          actions.push({ label: `View ${client.name}`, onClick: () => { onSelectClient(client.notion_page_id); setOpen(false); } });
        if (onGenerateDraft && !client.ai_draft)
          actions.push({ label: `Generate Draft`, onClick: () => onGenerateDraft(client.notion_page_id) });
        if (onSendNow && client.ai_draft && client.send_status !== 'Sent')
          actions.push({ label: `Send Now`, onClick: () => onSendNow(client.notion_page_id) });
      }
    }
    return actions;
  }

  async function send(question: string) {
    if (!question.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: question };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context: clients }),
      });
      const data = await res.json();
      const answer = data.answer || data.error;
      setMessages(m => [...m, { role: 'assistant', content: answer, actions: getActionsForResponse(answer) }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Chat bubble */}
      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-20 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg hover:scale-105 transition-transform z-40 text-white"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-4 w-[360px] max-h-[520px] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center text-xs text-white font-bold">AI</div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Assistant</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Ask about your clients</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[200px]">
            {messages.length === 0 && (
              <div className="flex flex-col gap-2">
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Try asking:</div>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-left text-xs px-3 py-2 rounded-lg transition-colors"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed"
                  style={{
                    background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: m.role === 'user' ? '#fff' : 'var(--text)',
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  }}>
                  {m.content}
                </div>
                {m.actions && m.actions.length > 0 && (
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {m.actions.map((a, j) => (
                      <button key={j} onClick={a.onClick}
                        className="text-xs px-3 py-1 rounded-full transition-colors"
                        style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Ask anything about your clients..."
              className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <button onClick={() => send(input)} disabled={loading || !input.trim()}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-colors"
              style={{ background: 'var(--accent)' }}>
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

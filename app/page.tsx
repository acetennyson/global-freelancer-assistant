'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { siteConfig } from './config';
import ThemeToggle from './components/ThemeToggle';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.5 },
});

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
        <div className="absolute top-[60%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/8 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">N</div>
            <span className="font-semibold tracking-tight">{siteConfig.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm hidden sm:block transition-colors" style={{ color: 'var(--text-secondary)' }}>How it works</button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm hidden sm:block transition-colors" style={{ color: 'var(--text-secondary)' }}>Features</button>
            <ThemeToggle />
            <Link href="/dashboard" className="text-sm px-4 py-2 rounded-lg font-medium text-white transition-colors" style={{ background: 'var(--accent)' }}>
              Open Dashboard →
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <motion.div {...fadeUp(0)}
            className="inline-flex items-center gap-2 bg-white/5 border border-[var(--border)] rounded-full px-4 py-1.5 text-xs text-[var(--text-secondary)] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            Built for the Notion MCP Challenge
          </motion.div>

          <motion.h1 {...fadeUp(1)}
            className="text-6xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6 whitespace-pre-line">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              {siteConfig.tagline}
            </span>
          </motion.h1>

          <motion.p {...fadeUp(2)}
            className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            {siteConfig.description}
          </motion.p>

          <motion.div {...fadeUp(3)}
            className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/dashboard"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25">
              Open Dashboard →
            </Link>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-xl bg-white/5 border border-[var(--border)] text-[var(--text)] font-medium hover:bg-white/10 transition-colors">
              See how it works
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div {...fadeUp(4)}
            className="mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {siteConfig.stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-[var(--text-muted)] text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Mock dashboard preview */}
        <section className="max-w-4xl mx-auto px-6 pb-24">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/60 backdrop-blur overflow-hidden shadow-2xl shadow-black/50">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-card)]/80">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="ml-3 flex-1 bg-[var(--bg-secondary)] rounded-md px-3 py-1 text-xs text-[var(--text-muted)]">localhost:3000/dashboard</div>
            </div>
            {/* Fake dashboard content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm font-semibold">Global Freelancer Sync</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">AI-powered client outreach across timezones</div>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)]">↻ Sync Notion</div>
                  <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)]">⚙ Settings</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[['4', 'Total Clients', ''], ['2', 'Available Now', 'text-green-400'], ['1', 'Pending Drafts', 'text-blue-400']].map(([v, l, c]) => (
                  <div key={l} className="bg-[var(--bg-secondary)]/60 rounded-xl p-3 border border-zinc-700/50">
                    <div className={`text-xl font-bold ${c}`}>{v}</div>
                    <div className="text-[var(--text-muted)] text-xs mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">☀️ Available Now — 2 clients</div>
              {[
                { name: 'Sarah Chen', tz: 'America/New_York · 07:18 PM', draft: true },
                { name: 'James Okafor', tz: 'Africa/Lagos · 01:18 AM', draft: false },
              ].map((c) => (
                <div key={c.name} className="bg-[var(--bg-secondary)]/40 border border-zinc-700/40 rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{c.tz}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-950 text-green-400 border border-green-900">Available</span>
                  </div>
                  {c.draft && (
                    <div className="mt-3 bg-[var(--bg-card)] rounded-lg p-3 border-l-2 border-blue-500">
                      <div className="text-blue-400 text-xs font-semibold mb-1">AI DRAFT</div>
                      <div className="text-[var(--text-secondary)] text-xs">Hi Sarah, just checking in — happy to share a quick update on where things stand...</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-[var(--border)]">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">How it works</div>
            <h2 className="text-3xl font-bold">Four steps to smarter outreach</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {siteConfig.howItWorks.map((h, i) => (
              <motion.div key={h.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[var(--bg-card)]/60 border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--border)] transition-colors">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-500/40 to-cyan-500/40 bg-clip-text text-transparent mb-4">{h.step}</div>
                <h3 className="font-semibold mb-2">{h.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{h.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-[var(--border)]">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">Features</div>
            <h2 className="text-3xl font-bold">Everything you need, nothing you don't</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {siteConfig.features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className={`bg-gradient-to-br ${f.gradient} border ${f.border} rounded-2xl p-6 hover:scale-[1.02] transition-transform`}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Use cases */}
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-[var(--border)]">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">Use cases</div>
            <h2 className="text-3xl font-bold">Built for real freelancer problems</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {siteConfig.useCases.map((u, i) => (
              <motion.div key={u.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[var(--bg-card)]/60 border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--border)] transition-colors">
                <div className="text-3xl mb-4">{u.emoji}</div>
                <h3 className="font-semibold mb-3">{u.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{u.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-10">
            <div className="text-4xl mb-6">💬</div>
            <blockquote className="text-xl font-medium text-[var(--text)] leading-relaxed mb-6">
              "{siteConfig.testimonial.quote}"
            </blockquote>
            <cite className="text-[var(--text-muted)] text-sm not-italic">— {siteConfig.testimonial.author}</cite>
          </motion.div>
        </section>

        {/* Stack */}
        <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[var(--border)] text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-6">Built with</div>
          <div className="flex flex-wrap justify-center gap-3">
            {siteConfig.stack.map((s) => (
              <span key={s.name} className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-full px-4 py-1.5 text-sm font-medium ${s.color}`}>
                {s.name}
              </span>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border border-blue-500/20 rounded-3xl p-16">
            <h2 className="text-4xl font-bold mb-4">Ready to sync globally?</h2>
            <p className="text-[var(--text-secondary)] mb-10 max-w-md mx-auto">Connect your Notion workspace and start reaching clients at exactly the right time.</p>
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-xl shadow-blue-500/30">
              Open Dashboard →
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-8 text-center text-[var(--text-muted)] text-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <span>{siteConfig.name} · Built for the Notion MCP Challenge</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

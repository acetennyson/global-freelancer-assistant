export const siteConfig = {
  name: 'NightShift',
  tagline: 'Reach the right client\nat the right time.',
  description:
    'An AI-powered command center for freelancers managing global clients across timezones. Connect your Notion workspace and let the AI handle the timing — you stay in control.',

  stats: [
    { value: '1.5B+', label: 'Remote workers globally' },
    { value: '3', label: 'MCP tools' },
    { value: '5', label: 'AI providers with fallback' },
  ],

  features: [
    {
      icon: '🌍',
      title: 'Timezone Intelligence',
      description:
        "See every client's local time at a glance. Know instantly who's at their desk and who's asleep — no mental math required.",
      gradient: 'from-blue-500/10 to-cyan-500/10',
      border: 'border-blue-500/20',
    },
    {
      icon: '✍️',
      title: 'AI-Drafted Outreach',
      description:
        'The MCP agent drafts personalized messages using your project context, last update, and sent message history — then writes them directly into Notion for review.',
      gradient: 'from-purple-500/10 to-pink-500/10',
      border: 'border-purple-500/20',
    },
    {
      icon: '🧠',
      title: 'AI Memory',
      description:
        'Each new draft builds on previously sent messages. The AI knows what the client already received and continues the conversation naturally.',
      gradient: 'from-violet-500/10 to-purple-500/10',
      border: 'border-violet-500/20',
    },
    {
      icon: '🔁',
      title: 'Human-in-the-Loop',
      description:
        'You stay in control. Every draft sits in Notion waiting for your approval. Mark it Ready — the system sends it when the client is at their desk.',
      gradient: 'from-orange-500/10 to-yellow-500/10',
      border: 'border-orange-500/20',
    },
    {
      icon: '⏰',
      title: 'Auto-Send While You Sleep',
      description:
        'Mark a message as Ready and go to sleep. The cron job checks every 15 minutes and sends automatically when the client enters their active window.',
      gradient: 'from-indigo-500/10 to-blue-500/10',
      border: 'border-indigo-500/20',
    },
    {
      icon: '💬',
      title: 'AI Chat Assistant',
      description:
        'Ask "Who should I reach out to first?" or "Which client has been waiting the longest?" — the assistant knows your full client state and answers instantly.',
      gradient: 'from-pink-500/10 to-rose-500/10',
      border: 'border-pink-500/20',
    },
    {
      icon: '⚡',
      title: 'Notion as Your Hub',
      description:
        'No new tools to learn. Your client data lives in Notion. The AI reads it, enriches it, and writes back to it — Notion stays the single source of truth.',
      gradient: 'from-green-500/10 to-emerald-500/10',
      border: 'border-green-500/20',
    },
    {
      icon: '🤖',
      title: 'MCP-Powered Agent',
      description:
        'Built on the Model Context Protocol — the same standard used by Claude Desktop. Plug it into any MCP-compatible AI client and give it timezone superpowers.',
      gradient: 'from-red-500/10 to-rose-500/10',
      border: 'border-red-500/20',
    },
    {
      icon: '📊',
      title: 'Real-Time Activity Feed',
      description:
        'Every action — draft generated, email sent, client responded — is logged to Supabase and pushed to your dashboard instantly via Supabase Realtime.',
      gradient: 'from-teal-500/10 to-cyan-500/10',
      border: 'border-teal-500/20',
    },
  ],

  useCases: [
    {
      emoji: '📅',
      title: 'End-of-week updates',
      body: "It's Friday 4 PM WAT. You want to send weekly updates to all active clients. The tool checks who's still in business hours, drafts a personalized update for each, and skips the ones where it's already evening.",
    },
    {
      emoji: '🚀',
      title: 'Deliver at the right moment',
      body: 'You finished a design file at midnight WAT. Your client in San Francisco is still at their desk (3 PM PST). The app flags them as available and drafts a delivery message for you to review and send immediately.',
    },
    {
      emoji: '🌙',
      title: 'Send while you sleep',
      body: "You write a message for a client in Tokyo at 11 PM WAT. Their business hours start at 1 AM your time. Mark it Ready and go to sleep — the app sends it automatically when they're at their desk.",
    },
    {
      emoji: '🗓️',
      title: 'Coordinate across timezones',
      body: 'You need to schedule a call with clients in London, New York, and Lagos. The dashboard shows their local times and the best overlap window so you can find the right slot instantly.',
    },
  ],

  howItWorks: [
    { step: '01', title: 'Connect Notion', body: 'Run the /setup wizard — it guides you through linking your Notion integration and pointing it at your Clients database.' },
    { step: '02', title: 'Add your clients', body: 'Each row is a client with a name, timezone, project context, and send window. Add them from the dashboard or directly in Notion.' },
    { step: '03', title: 'Generate a draft', body: 'Click Generate Draft. The AI reads the client\'s project context and sent history, then writes a personalized message into Notion.' },
    { step: '04', title: 'Approve & it sends itself', body: 'Review the draft, mark it Ready. The system sends it when the client enters their active window — even while you sleep.' },
  ],

  stack: [
    { name: 'Next.js 15', color: 'text-white' },
    { name: 'Notion MCP', color: 'text-orange-400' },
    { name: 'Supabase Realtime', color: 'text-green-400' },
    { name: 'TypeScript', color: 'text-blue-400' },
    { name: 'Gemini / Groq / Claude', color: 'text-purple-400' },
    { name: 'Nodemailer', color: 'text-red-400' },
    { name: 'Tailwind CSS', color: 'text-cyan-400' },
    { name: 'Framer Motion', color: 'text-pink-400' },
    { name: 'next-themes', color: 'text-yellow-400' },
  ],

  testimonial: {
    quote: "I used to spend 20 minutes every Friday figuring out who to update and what to say. Now it's done before I finish my coffee.",
    author: 'A freelancer in Cameroon, WAT',
  },

  cta: {
    label: 'Open Dashboard',
    href: '/dashboard',
  },
};

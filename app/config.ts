export const siteConfig = {
  name: 'NightShift',
  tagline: 'Reach the right client\nat the right time.',
  description:
    'An AI-powered command center for freelancers managing global clients across timezones. Connect your Notion workspace and let the AI handle the timing — you stay in control.',

  stats: [
    { value: '8+', label: 'Timezones supported' },
    { value: '3', label: 'MCP tools' },
    { value: '0', label: 'Wrong-time messages' },
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
        'The MCP agent drafts personalized messages for available clients and writes them directly into your Notion database for review.',
      gradient: 'from-purple-500/10 to-pink-500/10',
      border: 'border-purple-500/20',
    },
    {
      icon: '🔁',
      title: 'Human-in-the-Loop',
      description:
        'You stay in control. Every draft sits in Notion waiting for your approval before anything gets sent.',
      gradient: 'from-orange-500/10 to-yellow-500/10',
      border: 'border-orange-500/20',
    },
    {
      icon: '⚡',
      title: 'Notion as Your Hub',
      description:
        'No new tools to learn. Your client data lives in Notion. The AI reads it, enriches it, and writes back to it.',
      gradient: 'from-green-500/10 to-emerald-500/10',
      border: 'border-green-500/20',
    },
    {
      icon: '🤖',
      title: 'MCP-Powered Agent',
      description:
        'Built on the Model Context Protocol — the same standard used by Claude Desktop. Plug it into any MCP-compatible AI client.',
      gradient: 'from-red-500/10 to-rose-500/10',
      border: 'border-red-500/20',
    },
    {
      icon: '📊',
      title: 'Supabase Sync',
      description:
        'Client data is mirrored to Supabase for fast queries and interaction logging — giving your AI memory across sessions.',
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
      emoji: '🗓️',
      title: 'Coordinate across timezones',
      body: 'You need to schedule a call with clients in London, New York, and Lagos. The dashboard shows their local times side by side so you can find the overlap window instantly.',
    },
  ],

  howItWorks: [
    { step: '01', title: 'Connect Notion', body: 'Link your Notion integration and point it at your Clients database.' },
    { step: '02', title: 'Add your clients', body: 'Each row is a client with a name, timezone, and status. That\'s it.' },
    { step: '03', title: 'Let the AI work', body: 'The MCP agent checks timezones, drafts messages, and writes them to Notion.' },
    { step: '04', title: 'Review & send', body: 'You see the drafts in your dashboard. Approve, edit, or discard — your call.' },
  ],

  stack: [
    { name: 'Next.js 15', color: 'text-white' },
    { name: 'Notion MCP', color: 'text-orange-400' },
    { name: 'Supabase', color: 'text-green-400' },
    { name: 'TypeScript', color: 'text-blue-400' },
    { name: 'Tailwind CSS', color: 'text-cyan-400' },
    { name: 'Framer Motion', color: 'text-purple-400' },
  ],

  testimonial: {
    quote: "I used to spend 20 minutes every Friday figuring out who to update and what to say. Now it's done before I finish my coffee.",
    author: 'A freelancer in Cameroon, WAT',
  },
};

This is a submission for the [Notion MCP Challenge](https://dev.to/challenges/notion-2026-03
-04)

## What I Built

Global Freelancer Sync — an AI-powered command center for freelancers and remote workers 
managing clients across timezones.

There are over 1.5 billion remote workers globally. A growing number are based in Africa, 
Southeast Asia, and Latin America — regions where the talent is world-class but the timezone
gap with clients in the US and Europe is real and constant. Every day, these freelancers 
face the same invisible tax:

- *Is it a good time to send this update, or will it land at 2 AM their time?*
- *I finished this deliverable at midnight — do I hold it until morning or send now?*
- *I have 8 clients across 5 timezones. Who do I reach out to first today?*

This isn't a small inconvenience. Sending a message at the wrong time looks unprofessional. 
Missing the right window means waiting another day. Doing this mental math for every client,
every day, is a real productivity drain — and it compounds when you're managing multiple 
clients across multiple continents.

Global Freelancer Sync solves this. It connects to your Notion Clients database, tracks each
client's local time and active window, and uses AI to draft personalized outreach messages 
— only when it makes sense to send them. You review the drafts, approve them, and the system
sends automatically when the client is at their desk. You stay in control. The timezone 
math disappears.

This isn't just a tool for one freelancer in Cameroon. It's infrastructure for the global 
remote workforce — the developers in Lagos, the designers in Nairobi, the consultants in 
Manila — who are doing world-class work but fighting a daily battle with time.

Here's what it does:

- Connects to your Notion Clients database and reads each client's timezone, project 
context, and last update
- Shows a live world clock strip — who's available right now, who's sleeping, and how long 
until each client's window opens
- Uses AI (Gemini, Claude, DeepSeek, Groq, HuggingFace with automatic key rotation and 
fallback) to draft personalized outreach emails using your project context and sent message 
history
- Learns from previous sent messages — each new draft builds on what the client already 
received, so nothing feels repetitive
- Lets you review and approve drafts — you stay in control
- Auto-sends emails via Gmail when clients enter their active window, even while you sleep
- Logs every action to Supabase with a real-time activity feed powered by Supabase Realtime
- Includes a chat assistant that knows your full client state and can answer questions like 
"Who should I reach out to first today?" or "Which client has been waiting the longest?"

The core philosophy: AI handles the timing and the words. You handle the decisions. Human-in
-the-loop, by design — which is exactly what the global remote workforce needs.

## Video Demo

<!-- Record a 2-3 minute walkthrough showing:
1. The dashboard with world clock strip
2. Selecting a client and generating a draft
3. Marking as Ready
4. The activity feed updating in real time
5. The chat assistant answering a question
-->

## Show us the code

GitHub: [your repo link here]

Live demo: [your Vercel URL here]

Tech stack:
- Next.js 15 (App Router)
- Notion SDK + MCP TypeScript SDK
- Supabase (activity logs, draft history, sent history, Realtime)
- Multi-provider AI: Gemini 2.5 Flash → Claude → DeepSeek → Groq → HuggingFace
- Nodemailer (Gmail SMTP)
- Vercel Cron (every 15 minutes)
- Framer Motion + next-themes (light/dark/system)

## How I Used Notion MCP

Notion is the single source of truth for everything client-related. The MCP server exposes 
three tools that any MCP-compatible AI client (like Claude Desktop) can call:

`get_client_local_times`
Returns every active client's current local time, availability status, and whether they're 
within their send window. Claude can call this to answer "who's available right now?" 
without any manual timezone math.

`generate_client_outreach`
Takes a client_id, checks if the client is in their business hours window, reads their 
project context from Notion (Project, Last_Update, Next_Action), generates a personalized 
draft using Gemini, and writes it directly back to the AI_Draft column in Notion. The 
freelancer sees the draft appear in their dashboard and can approve or edit before sending.

`sync_and_draft`
A combined tool that fetches the client from Supabase, checks their timezone window, 
generates a context-aware draft, and writes it to Notion — all in one call. Designed for 
batch workflows where you want to draft for all available clients at once.

What MCP unlocks:
Without MCP, this would be a closed app — useful only through the dashboard. With MCP, any 
AI agent can become a timezone-aware outreach assistant. You can tell Claude Desktop: "Draft 
updates for all clients who are currently in business hours" and it calls 
`get_client_local_times`, identifies the available ones, then calls `generate_client_outreach` 
for each — writing personalized drafts into Notion for you to review. The AI does the work. 
You approve and send.

That's the human-in-the-loop system the challenge asked for. And for the millions of remote 
workers navigating timezone gaps every single day, it's the workflow that finally gives them
their time back.
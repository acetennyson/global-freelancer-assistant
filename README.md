# NightShift

**Reach the right client at the right time.**

An AI-powered command center for freelancers managing global clients across timezones. Built with Next.js, Supabase, Notion, and the Model Context Protocol (MCP).

## The Problem

As a freelancer in a region like Cameroon (WAT), you're working with clients in New York, London, Tokyo. The questions you constantly face:

- Who should I reach out to right now?
- Is it a good time to send this update or invoice?
- What should I even say to each of them?

Doing this manually for 8+ clients across 5 timezones is tedious and easy to get wrong.

## What This Does

This app connects to your Notion "Clients" database, checks each client's local time, and uses an AI agent (via MCP) to draft contextual outreach messages — only when it makes sense to send them. You review the drafts, approve them, and the app sends automatically when the client enters their active window. You stay in control.

## Real Use Cases

### End-of-week updates to multiple clients

It's Friday 4 PM WAT. You want to send weekly status updates to all active clients. The MCP tool checks who's still in business hours, drafts a personalized update for each of those clients directly into their Notion row, and skips the ones where it's already evening — so you're not dumping work on them right before their weekend.

### Sending a deliverable at the right time

You just finished a design file at midnight WAT. Your client in San Francisco is still at their desk (it's 3 PM PST). Instead of holding the file until morning, the app flags that the client is available and drafts a delivery message for you to review and send immediately.

### Coordinating a meeting across timezones

You need to schedule a call with three clients — one in London, one in New York, one in Lagos. The dashboard shows their current local times side by side, so you can instantly see the overlap window without opening a timezone converter.

### Scheduled sending while you sleep

You write a message for a client in Tokyo at 11 PM WAT. Their business hours start at 1 AM your time. Mark it "Ready" and go to sleep — the app sends it automatically when they're at their desk.

## Tech Stack

- **Next.js 15** (App Router) — dashboard UI
- **Supabase** — activity logs, draft history, client sync
- **Notion SDK** (`@notionhq/client`) — reads client data, writes AI drafts
- **MCP TypeScript SDK** — exposes tools to an AI agent (e.g. Claude Desktop)
- **Multi-provider AI** — Gemini, Claude, DeepSeek, Groq, HuggingFace with automatic key rotation and fallback
- **Nodemailer** — sends emails via Gmail
- **Vercel Cron** — checks every 15 minutes and auto-sends when clients are in their window

## MCP Tools

| Tool | What it does |
|---|---|
| `get_client_local_times` | Returns which clients are currently in business hours vs. inactive |
| `generate_client_outreach` | Checks timezone, drafts a greeting in Notion if client is available |
| `sync_and_draft` | Fetches client from Supabase, checks hours, writes draft to Notion |

## Dashboard Features

- **World clock strip** — live ticking clocks for all client timezones
- **Availability countdown** — shows time remaining in client's active window
- **AI draft generation** — context-aware drafts using project, last update, and next action
- **Draft history** — all previous drafts per client stored in Supabase
- **Send Now** — bypass timezone window for urgent messages
- **Send All Ready** — manually trigger sends for all approved messages
- **Auto-send via cron** — runs every 15 minutes, sends when client is in their window
- **Responded tracking** — mark when a client replies
- **Activity feed** — real-time log of every action powered by Supabase
- **Search & filter** — find clients instantly

## Notion Database Setup

Create a database with these columns:

| Column | Type |
|---|---|
| `Name` | Title |
| `Timezone` | Select (IANA timezone e.g. `America/New_York`) |
| `Status` | Status |
| `AI_Draft` | Text |
| `Client_Email` | Email |
| `Send_Status` | Select (`Draft`, `Ready`, `Sent`, `Failed`, `Responded`) |
| `Scheduled_Message` | Text |
| `Project` | Text |
| `Last_Update` | Text |
| `Next_Action` | Text |
| `Send_Window` | Text (e.g. `10:00-14:00`, defaults to `10:00-14:00`) |

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in your credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Supabase Setup

Run `supabase/all.sql` in your Supabase SQL editor to create the required tables.

### MCP Setup (Claude Desktop)

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "global-freelancer-sync": {
      "command": "npx",
      "args": ["tsx", "/path/to/mcp-server/index.ts"],
      "env": {
        "NOTION_TOKEN": "your_token",
        "NOTION_DATABASE_ID": "your_db_id"
      }
    }
  }
}
```

## Project Structure

```
/app                      → Next.js App Router pages & API routes
  /api
    /clients              → Fetch active clients
    /generate-draft       → AI draft generation
    /send-now             → Immediate send (bypasses window)
    /send-all-ready       → Manual cron trigger
    /mark-ready           → Mark draft as ready to send
    /mark-responded       → Mark client as responded
    /draft-history        → Fetch draft history from Supabase
    /activity             → Fetch activity feed from Supabase
    /cron/send            → Auto-send cron job (every 15 min)
    /notion/sync          → Sync Notion → Supabase
  /components
    /WorldClockStrip      → Live ticking world clocks
    /ActivityFeed         → Supabase-powered activity log
    /ClientForm           → Add/edit client widget
/services
  notion.ts               → Notion API calls
  supabase.ts             → Supabase sync, logs, draft history
  time.ts                 → isBusinessHours() and timezone utils
  ai.ts                   → Multi-provider AI with key rotation
  email.ts                → Nodemailer email sending
/mcp-server
  index.ts                → MCP tool definitions
/supabase
  all.sql                 → Database schema
```

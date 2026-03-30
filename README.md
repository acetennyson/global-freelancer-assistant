<div align="center">

# 🌙 NightShift

### *Reach the right client at the right time.*

**An AI-powered command center for freelancers managing global clients across timezones.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Notion](https://img.shields.io/badge/Notion-MCP-black?style=flat-square&logo=notion)](https://notion.so)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)

</div>

---

## 🌍 The Problem

There are over **1.5 billion remote workers** globally. A growing number are based in Africa, Southeast Asia, and Latin America — regions where the talent is world-class but the timezone gap with clients in the US and Europe is real and constant.

Every day, these freelancers face the same invisible tax:

> *"Is it a good time to send this update, or will it land at 2 AM their time?"*
> *"I finished this deliverable at midnight — do I hold it until morning?"*
> *"I have 8 clients across 5 timezones. Who do I reach out to first today?"*

**NightShift solves this.** It connects to your Notion Clients database, tracks each client's local time and active window, and uses AI to draft personalized outreach — only when it makes sense to send. You approve. The system sends. You sleep.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🕐 **World Clock Strip** | Live ticking clocks with countdown for available clients |
| ✍️ **AI Draft Generation** | Context-aware drafts using project, last update & sent history |
| 🧠 **AI Memory** | Each draft builds on previously sent messages for natural continuity |
| 💬 **Chat Assistant** | Ask "Who should I reach out to first?" with full client context |
| 🎯 **Best Overlap Window** | Shows when most clients are simultaneously available |
| 🚀 **Send Now** | Bypass timezone window for urgent messages |
| ⚡ **Send All Ready** | Manually trigger sends for all approved messages |
| ⏰ **Auto-send Cron** | Runs every 15 min, sends when client enters their window |
| 📋 **Draft History** | All previous drafts per client stored in Supabase |
| 💬 **Responded Tracking** | Mark when a client replies |
| 📊 **Activity Feed** | Real-time log powered by Supabase Realtime |
| 🔍 **Search & Filter** | Find clients instantly |
| ✏️ **Add/Edit Clients** | Floating widget, saves directly to Notion |
| 🌗 **Theme Support** | Light / Dark / System via CSS variables |

---

## 🤖 MCP Tools

NightShift exposes 3 tools to any MCP-compatible AI client (Claude Desktop, etc.):

| Tool | What it does |
|---|---|
| `get_client_local_times` | Returns which clients are in business hours vs. inactive |
| `generate_client_outreach` | Checks timezone, drafts a message in Notion if client is available |
| `sync_and_draft` | Reads from Supabase cache, checks hours, writes AI draft to Notion |

---

## 🛠 Tech Stack

```
Next.js 15 (App Router)    → Dashboard UI
Notion SDK + MCP SDK       → Client data & AI tools
Supabase                   → Logs, history, Realtime
Multi-provider AI          → Gemini → Claude → DeepSeek → Groq → HuggingFace
Nodemailer                 → Gmail email sending
next-themes                → Light/Dark/System theme
Framer Motion              → Animations
```

---

## 🗄 Notion Database Schema

| Column | Type | Notes |
|---|---|---|
| `Name` | Title | Client name |
| `Timezone` | Select | IANA e.g. `America/New_York` |
| `Status` | Status | Filter: `In progress` = active |
| `AI_Draft` | Text | Generated draft |
| `Client_Email` | Email | Where to send |
| `Send_Status` | Select | `Draft` / `Ready` / `Sent` / `Failed` / `Responded` |
| `Scheduled_Message` | Text | Manual override message |
| `Project` | Text | AI context |
| `Last_Update` | Text | AI context |
| `Next_Action` | Text | AI context (optional) |
| `Send_Window` | Text | e.g. `10:00-14:00` (default) |

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/nightshift
cd nightshift
npm install
cp .env.example .env.local
npm run dev
```

Open **[localhost:3000/setup](http://localhost:3000/setup)** for the guided setup wizard.

### Supabase

Run `supabase/all.sql` in your Supabase SQL editor.

### Claude Desktop (MCP)

```json
{
  "mcpServers": {
    "nightshift": {
      "command": "npx",
      "args": ["tsx", "/path/to/mcp-server/index.ts"],
      "env": {
        "NOTION_TOKEN": "your_token",
        "NOTION_DATABASE_ID": "your_db_id",
        "GEMINI_API_KEYS": "your_gemini_key"
      }
    }
  }
}
```

### Auto-send Cron (cron-job.org — free)

Vercel Hobby doesn't support sub-daily crons. Use [cron-job.org](https://cron-job.org):

- **URL**: `https://your-app.vercel.app/api/cron/send`
- **Method**: GET
- **Interval**: Every 15 minutes
- **Header**: `Authorization: Bearer YOUR_CRON_SECRET`

---

## ⚙️ Configuration

All tunable settings live in `services/config.ts` and can be overridden via environment variables:

| Variable | Default | Description |
|---|---|---|
| `FREELANCER_NAME` | `"Your Freelancer"` | Name used in AI email sign-offs |
| `DRAFT_WORD_LIMIT` | `120` | Max words for generated drafts |
| `SENT_HISTORY_LIMIT` | `3` | Previous sent messages passed to AI as context |
| `DRAFT_HISTORY_LIMIT` | `10` | Max drafts shown in the history panel |

Set any of these in your `.env.local` to override the defaults:

```env
FREELANCER_NAME=John Doe
DRAFT_WORD_LIMIT=150
SENT_HISTORY_LIMIT=5
```

---



All endpoints are relative to your app URL. Protected endpoints require `Authorization: Bearer YOUR_CRON_SECRET`.

### `GET /api/clients`
Returns all active clients (Status = "In progress") with local time and availability.

### `POST /api/generate-draft`
Generates an AI draft for a client using project context and sent history.
```json
{ "notion_page_id": "string" }
```

### `POST /api/send-now`
Sends the current draft immediately, bypassing the timezone window.
```json
{ "notion_page_id": "string" }
```

### `POST /api/send-all-ready`
Sends all clients with `Send_Status = Ready` who are currently in their window.
No body required.

### `POST /api/mark-ready`
Marks a client's draft as ready to send.
```json
{ "notion_page_id": "string", "client_name": "string" }
```

### `POST /api/mark-responded`
Toggles a client's responded status.
```json
{ "notion_page_id": "string", "client_name": "string", "responded": true }
```

### `GET /api/draft-history?id=NOTION_PAGE_ID`
Returns the last 10 generated drafts for a client.

### `GET /api/activity`
Returns the last 20 activity log entries.

### `POST /api/chat`
Ask the AI assistant a question with full client context.
```json
{ "question": "Who should I reach out to first?", "context": [...clients] }
```

### `GET /api/notion/sync`
Syncs all active clients from Notion to Supabase.

### `POST /api/save-client`
Creates or updates a client in Notion. If `notion_page_id` is provided, updates existing. Otherwise creates new.
```json
{
  "notion_page_id": "string (optional — omit to create)",
  "name": "string",
  "timezone": "America/New_York",
  "project": "string",
  "last_update": "string",
  "next_action": "string (optional)",
  "email": "string",
  "send_window": "10:00-14:00",
  "status": "In progress"
}
```

### `GET /api/cron/send` *(protected)*
Triggered by cron-job.org every 15 minutes. Sends emails to all `Ready` clients in their window.
Requires header: `Authorization: Bearer YOUR_CRON_SECRET`

---

```
/app
  /setup          → Guided setup wizard with screenshots
  /dashboard      → Main client management dashboard
  /api            → All API routes (clients, drafts, send, cron, chat...)
  /components     → WorldClockStrip, ActivityFeed, ChatWidget, ClientForm, ThemeToggle
/services
  notion.ts       → Notion API
  supabase.ts     → Supabase sync, logs, history
  time.ts         → Timezone utilities
  ai.ts           → Multi-provider AI with key rotation
  email.ts        → Nodemailer
  overlap.ts      → Best overlap window
  config.ts       → Tunable constants
/mcp-server
  index.ts        → MCP tool definitions
/supabase
  all.sql         → Full database schema
```

---

<div align="center">

Built for the **[Notion MCP Challenge](https://dev.to/challenges/notion-2026-03-04)** · Made with ☕ from Cameroon 🇨🇲

</div>

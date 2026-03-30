# Why This Stack?

## Why Supabase instead of Notion for logs?

Notion is the source of truth for client data — it's where you manage projects, drafts, and send status. But it's not designed for high-frequency writes like activity logging.

Reasons we use Supabase for logs and draft history:

- **Rate limits** — Notion's API has strict rate limits. Logging every action (draft generated, email sent, failed) would exhaust them quickly, breaking the core functionality.
- **Query speed** — Supabase (PostgreSQL) is orders of magnitude faster for filtering and paginating logs than the Notion API.
- **Write frequency** — Activity logs and draft history are written on every user action. Notion pages are not optimized for this pattern.
- **Separation of concerns** — Notion is the human-facing workspace. Supabase is the machine-facing data layer. Each does what it's best at.

## Why not store everything in Notion?

You could create a separate Notion database for logs. But:
- Every log entry = one API call to Notion
- Notion enforces a rate limit of ~3 requests/second
- A busy session (generate draft + mark ready + send) would trigger 3+ log writes in seconds, causing failures
- Notion's filter/sort API is not designed for time-series data

Supabase handles all of this natively with zero rate limit concerns on the free tier.

## Why sent_history instead of draft_history for AI context?

Draft history contains every generated draft — including ones you discarded, regenerated, or never sent. Using those as AI context would pollute the model with messages the client never received, leading to confusing continuity ("following up on X" when X was never sent).

`sent_history` only contains messages that were actually delivered. The AI builds on what the client has already read, making each new draft feel like a natural continuation of the conversation.

## Why Nodemailer over Resend/SendGrid?

Resend and SendGrid have free tier limits (3,000/month and 100/day respectively). Nodemailer with Gmail has no sending limit beyond Gmail's own (500/day for regular accounts, 2,000/day for Google Workspace). For a freelancer sending updates to 8-10 clients, Gmail is more than sufficient and requires no third-party account.

## Why multi-provider AI with key rotation?

A single AI provider with a single key is a single point of failure. Free tier quotas are small — Gemini's free tier can be exhausted in a single session of testing. By rotating through multiple keys per provider and falling back to the next provider on failure, the app stays functional even when individual keys hit rate limits. This is especially important for a tool that needs to work reliably at any time of day.

## Why CSS variables for theming instead of Tailwind dark mode?

Tailwind's `dark:` prefix requires adding duplicate classes for every element. CSS variables allow a single class change on the root element to update the entire UI. Adding a new themed component requires zero extra work — it just uses `var(--bg)`, `var(--text)`, etc. and inherits the current theme automatically.

## Why a /setup wizard?

Setting up the app requires credentials from 4+ different services (Notion, Supabase, Gmail, AI providers). Without guidance, users would need to figure out where to find each key, what format it should be in, and whether it's working. The setup wizard provides step-by-step instructions with screenshots, inline validation, and a final `.env` block ready to copy — reducing setup time from 30+ minutes of trial and error to under 5 minutes.

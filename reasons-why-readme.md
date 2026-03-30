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

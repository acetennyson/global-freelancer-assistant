# TODO

## Completed
- [x] Draft history — previous drafts per client (Supabase)
- [x] "Responded" toggle — mark if client replied
- [x] Search/filter in sidebar
- [x] Best overlap window
- [x] Email subject line — AI generates subject per email
- [x] AI memory — last 3 drafts passed as context for continuity
- [x] World clock strip with countdown/local time
- [x] Activity feed (Supabase logs)
- [x] Send Now, Send All Ready, auto-send cron
- [x] Multi-provider AI with key rotation and fallback
- [x] Light/Dark/System theme
- [x] Mobile-responsive layout
- [x] Add/Edit client form (floating widget)

## Planned Features

### User Settings via Supabase Auth
Instead of requiring all configuration via `.env`, support a non-dev onboarding flow:
- Supabase Auth (email + OAuth) as the authentication layer
- `user_settings` table with Row Level Security — each user owns their own settings
- Notion token, AI keys, Gmail credentials stored per user in Supabase
- Onboarding wizard that guides non-dev users step by step
- `.env` variables remain the default for self-hosted/dev installs
- After login, settings are fetched from Supabase and override env defaults

This solves the "circular key problem" because:
- Supabase anon key is public by design (RLS handles security)
- All other secrets are stored behind auth, only accessible to the authenticated user

### Notion OAuth
- Instead of manually creating an integration token, guide users through Notion OAuth
- After auth, automatically create the Clients database with the correct schema

### Setup Wizard
- First-run detection
- Step-by-step guided setup with inline validation
- Direct links to each service's key generation page

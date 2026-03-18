# JarvisMissionControl

Linear-style mission control dashboard for Jarvis / OpenClaw.

## Current v1

- Password-protected dashboard
- Task kanban board
- Live activity feed
- Agent usage/status panel
- Memory page mirroring `USER.md`, `MEMORY.md`, and today's note
- Whole-workspace docs/file browser
- Dashboard task ingest API (`/api/ingest`)
- Designed to expand into deeper OpenClaw/AWS bridge integrations

## Why the connector section exists

This Vercel app can render the mission control UI, but fully live v2 features (real-time subagent token usage, cron inspection, heartbeat-driven execution, and direct OpenClaw task dispatch from the hosted site) need a secure bridge from the Vercel deployment to the OpenClaw runtime in AWS.

That bridge is the next phase.

## Local dev

```bash
npm install
npm run dev
```

## Deploy

- Push to GitHub
- Import repo into Vercel
- Set env vars / auth strategy as needed

## Security

The current password is stored in `data/settings.json` for fast setup. Move that to an environment variable before treating this as production-grade.

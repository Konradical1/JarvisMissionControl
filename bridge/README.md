# Bridge service

This service is meant to run on the AWS/OpenClaw machine, not on Vercel.

## Purpose

Expose a secure JSON bridge so the Vercel-hosted dashboard can:
- fetch real OpenClaw usage/session/cron data
- read/write mission-control task state
- send messages/tasks back into the OpenClaw agent runtime

## Endpoints

- `GET /health`
- `GET /snapshot`
- `POST /tasks`
- `POST /message`

## Required env

- `JMC_BRIDGE_TOKEN` - shared bearer token
- `JMC_TARGET` - recipient/session target (currently Konrad's Telegram id)
- `JMC_WORKSPACE` - OpenClaw workspace root (defaults to parent dir)
- `JMC_BRIDGE_PORT` - port (default 4318)

## Run

```bash
cd JarvisMissionControl
JMC_BRIDGE_TOKEN=replace-me \
JMC_TARGET=7612783711 \
node bridge/server.mjs
```

## Recommended production shape

- bind behind Nginx/Caddy
- restrict ingress if possible
- keep bearer token only in server env + Vercel env
- optionally add IP filtering and signed requests later

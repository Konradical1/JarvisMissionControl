import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const PORT = Number(process.env.JMC_BRIDGE_PORT || 4318);
const TOKEN = process.env.JMC_BRIDGE_TOKEN || '';
const WORKSPACE = process.env.JMC_WORKSPACE || path.resolve(process.cwd(), '..');
const TARGET = process.env.JMC_TARGET || '7612783711';
const TARGET_SESSION_KEY = process.env.JMC_TARGET_SESSION_KEY || `agent:main:telegram:direct:${TARGET}`;
const OPENCLAW_BIN = process.env.OPENCLAW_BIN || 'openclaw';
const SNAPSHOT_TTL_MS = Number(process.env.JMC_SNAPSHOT_TTL_MS || 15000);
const COMMAND_TIMEOUT_MS = Number(process.env.JMC_COMMAND_TIMEOUT_MS || 4000);

let snapshotCache = null;
let snapshotCacheAt = 0;
let inflightSnapshot = null;

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

function send(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function auth(req) {
  if (!TOKEN) return true;
  const header = req.headers.authorization || '';
  return header === `Bearer ${TOKEN}`;
}

function appDataPath(name) {
  return path.join(process.cwd(), 'data', name);
}

function readJsonMaybe(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function readTextMaybe(relativePath) {
  try { return fs.readFileSync(path.join(WORKSPACE, relativePath), 'utf8'); } catch { return ''; }
}

function appendFeed(item) {
  const feedPath = appDataPath('feed.json');
  const feed = readJsonMaybe(feedPath, []);
  const entry = {
    id: `feed-${Date.now()}`,
    time: new Date().toISOString(),
    type: 'event',
    ...item
  };
  feed.unshift(entry);
  writeJson(feedPath, feed);
  snapshotCache = null;
  return entry;
}

async function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

async function oc(args, label = args.join(' ')) {
  const start = Date.now();
  const result = await withTimeout(
    execFileAsync(OPENCLAW_BIN, args, {
      cwd: WORKSPACE,
      maxBuffer: 1024 * 1024 * 4,
      timeout: COMMAND_TIMEOUT_MS
    }),
    COMMAND_TIMEOUT_MS + 500,
    label
  );
  log('cmd', label, 'ms=', Date.now() - start);
  return result.stdout.trim();
}

function queueAgentMessage(message) {
  const sessionId = getTelegramSessionId();
  const args = ['agent', '--session-id', sessionId, '--message', message, '--deliver'];
  const child = spawn(OPENCLAW_BIN, args, {
    cwd: WORKSPACE,
    detached: true,
    stdio: 'ignore',
    env: process.env
  });
  child.unref();
  log('queued agent message', args.join(' '));
  appendFeed({ type: 'command', message: `Direct command queued: ${message}` });
}

function getTelegramSessionId() {
  const sessionsStore = '/home/ubuntu/.openclaw/agents/main/sessions/sessions.json';
  try {
    const raw = JSON.parse(fs.readFileSync(sessionsStore, 'utf8'));

    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      if (raw[TARGET_SESSION_KEY]?.sessionId) return raw[TARGET_SESSION_KEY].sessionId;
      const keyedFallback = Object.entries(raw).find(([key]) => key.includes(TARGET));
      if (keyedFallback?.[1]?.sessionId) return keyedFallback[1].sessionId;
    }

    const sessions = raw.sessions || raw.items || raw;
    if (Array.isArray(sessions)) {
      const match = sessions.find((s) => s.key === TARGET_SESSION_KEY || s.sessionKey === TARGET_SESSION_KEY);
      if (match?.sessionId) return match.sessionId;
      const fallback = sessions.find((s) => String(s.key || '').includes(TARGET));
      if (fallback?.sessionId) return fallback.sessionId;
    }
  } catch (error) {
    log('session lookup failed', String(error));
  }
  throw new Error(`Could not resolve target session id for ${TARGET_SESSION_KEY}`);
}

async function buildSnapshotFresh() {
  const [statusRaw, sessionsRaw, cronListRaw, cronStatusRaw] = await Promise.allSettled([
    oc(['status', '--usage', '--json'], 'status'),
    oc(['sessions', '--all-agents', '--json'], 'sessions'),
    oc(['cron', 'list', '--all', '--json'], 'cron list'),
    oc(['cron', 'status', '--json'], 'cron status')
  ]);

  const tasks = readJsonMaybe(appDataPath('tasks.json'), []);
  const feed = readJsonMaybe(appDataPath('feed.json'), []);
  const localAgents = readJsonMaybe(appDataPath('agents.json'), []);

  return {
    generatedAt: new Date().toISOString(),
    bridge: {
      ok: true,
      workspace: WORKSPACE,
      target: TARGET,
      cached: false
    },
    openclaw: {
      status: statusRaw.status === 'fulfilled' ? JSON.parse(statusRaw.value) : { error: String(statusRaw.reason) },
      sessions: sessionsRaw.status === 'fulfilled' ? JSON.parse(sessionsRaw.value) : { error: String(sessionsRaw.reason) },
      cron: {
        list: cronListRaw.status === 'fulfilled' ? JSON.parse(cronListRaw.value) : { error: String(cronListRaw.reason) },
        status: cronStatusRaw.status === 'fulfilled' ? JSON.parse(cronStatusRaw.value) : { error: String(cronStatusRaw.reason) }
      }
    },
    missionControl: {
      tasks,
      feed,
      agents: localAgents,
      memory: {
        user: readTextMaybe('USER.md'),
        memory: readTextMaybe('MEMORY.md')
      }
    }
  };
}

async function getSnapshot() {
  const now = Date.now();
  if (snapshotCache && now - snapshotCacheAt < SNAPSHOT_TTL_MS) {
    return { ...snapshotCache, bridge: { ...(snapshotCache.bridge || {}), cached: true } };
  }
  if (inflightSnapshot) return inflightSnapshot;
  inflightSnapshot = buildSnapshotFresh()
    .then((snapshot) => {
      snapshotCache = snapshot;
      snapshotCacheAt = Date.now();
      return snapshot;
    })
    .catch((error) => {
      log('snapshot error', String(error));
      if (snapshotCache) {
        return { ...snapshotCache, bridge: { ...(snapshotCache.bridge || {}), cached: true, warning: String(error) } };
      }
      return {
        generatedAt: new Date().toISOString(),
        bridge: { ok: false, error: String(error), cached: false },
        openclaw: { status: {}, sessions: {}, cron: {} },
        missionControl: {
          tasks: readJsonMaybe(appDataPath('tasks.json'), []),
          feed: readJsonMaybe(appDataPath('feed.json'), []),
          agents: readJsonMaybe(appDataPath('agents.json'), []),
          memory: { user: readTextMaybe('USER.md'), memory: readTextMaybe('MEMORY.md') }
        }
      };
    })
    .finally(() => {
      inflightSnapshot = null;
    });
  return inflightSnapshot;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    if (!auth(req)) return send(res, 401, { ok: false, error: 'Unauthorized' });
    if (req.method === 'GET' && req.url === '/health') {
      return send(res, 200, { ok: true, service: 'jarvis-mission-control-bridge', time: new Date().toISOString() });
    }
    if (req.method === 'GET' && req.url === '/snapshot') {
      return send(res, 200, await getSnapshot());
    }
    if (req.method === 'GET' && req.url === '/feed') {
      return send(res, 200, readJsonMaybe(appDataPath('feed.json'), []));
    }
    if (req.method === 'POST' && req.url === '/feed') {
      const body = await readBody(req);
      return send(res, 201, appendFeed(body));
    }
    if (req.method === 'POST' && req.url === '/tasks') {
      const body = await readBody(req);
      const tasksPath = appDataPath('tasks.json');
      const tasks = readJsonMaybe(tasksPath, []);
      const task = {
        id: `task-${Date.now()}`,
        title: body.title || 'Untitled task',
        detail: body.detail || '',
        status: body.status || 'inbox',
        priority: body.priority || 'medium',
        owner: body.owner || 'jarvis',
        source: body.source || 'bridge',
        createdAt: new Date().toISOString()
      };
      tasks.unshift(task);
      writeJson(tasksPath, tasks);
      appendFeed({ type: 'task', taskId: task.id, message: `Task created: ${task.title}` });
      return send(res, 201, { ok: true, task });
    }
    if (req.method === 'POST' && req.url === '/message') {
      const body = await readBody(req);
      queueAgentMessage(body.message || '');
      return send(res, 202, { ok: true, queued: true });
    }
    return send(res, 404, { ok: false, error: 'Not found' });
  } catch (error) {
    log('request error', req.method, req.url, String(error));
    return send(res, 500, { ok: false, error: String(error) });
  }
});

process.on('uncaughtException', (error) => {
  log('uncaughtException', error?.stack || String(error));
});
process.on('unhandledRejection', (error) => {
  log('unhandledRejection', error?.stack || String(error));
});

server.listen(PORT, () => {
  log(`Jarvis Mission Control bridge listening on :${PORT}`);
});

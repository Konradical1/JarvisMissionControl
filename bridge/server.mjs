import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const PORT = Number(process.env.JMC_BRIDGE_PORT || 4318);
const TOKEN = process.env.JMC_BRIDGE_TOKEN || '';
const WORKSPACE = process.env.JMC_WORKSPACE || path.resolve(process.cwd(), '..');
const TARGET = process.env.JMC_TARGET || '7612783711';
const OPENCLAW_BIN = process.env.OPENCLAW_BIN || 'openclaw';

function send(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function auth(req) {
  if (!TOKEN) return true;
  const header = req.headers.authorization || '';
  return header === `Bearer ${TOKEN}`;
}

function readJsonMaybe(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function readTextMaybe(relativePath) {
  try { return fs.readFileSync(path.join(WORKSPACE, relativePath), 'utf8'); } catch { return ''; }
}

async function oc(args) {
  const { stdout } = await execFileAsync(OPENCLAW_BIN, args, { cwd: WORKSPACE, maxBuffer: 1024 * 1024 * 4 });
  return stdout.trim();
}

async function buildSnapshot() {
  const [statusRaw, sessionsRaw, cronListRaw, cronStatusRaw] = await Promise.allSettled([
    oc(['status', '--usage', '--json']),
    oc(['sessions', '--all-agents', '--json']),
    oc(['cron', 'list', '--all', '--json']),
    oc(['cron', 'status', '--json'])
  ]);

  const appData = path.join(process.cwd(), 'data');
  const tasks = readJsonMaybe(path.join(appData, 'tasks.json'), []);
  const feed = readJsonMaybe(path.join(appData, 'feed.json'), []);
  const localAgents = readJsonMaybe(path.join(appData, 'agents.json'), []);

  return {
    generatedAt: new Date().toISOString(),
    bridge: {
      ok: true,
      workspace: WORKSPACE,
      target: TARGET
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

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  if (!auth(req)) return send(res, 401, { ok: false, error: 'Unauthorized' });

  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { ok: true, service: 'jarvis-mission-control-bridge', time: new Date().toISOString() });
  }

  if (req.method === 'GET' && req.url === '/snapshot') {
    try {
      return send(res, 200, await buildSnapshot());
    } catch (error) {
      return send(res, 500, { ok: false, error: String(error) });
    }
  }

  if (req.method === 'POST' && req.url === '/tasks') {
    try {
      const body = await readBody(req);
      const appData = path.join(process.cwd(), 'data');
      const tasksPath = path.join(appData, 'tasks.json');
      const feedPath = path.join(appData, 'feed.json');
      const tasks = readJsonMaybe(tasksPath, []);
      const feed = readJsonMaybe(feedPath, []);
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
      feed.unshift({ id: `feed-${Date.now()}`, time: new Date().toISOString(), type: 'task', taskId: task.id, message: `Bridge task created: ${task.title}` });
      fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
      fs.writeFileSync(feedPath, JSON.stringify(feed, null, 2));
      return send(res, 201, { ok: true, task });
    } catch (error) {
      return send(res, 500, { ok: false, error: String(error) });
    }
  }

  if (req.method === 'POST' && req.url === '/message') {
    try {
      const body = await readBody(req);
      const args = ['agent', '--to', TARGET, '--message', body.message || ''];
      if (body.deliver) args.push('--deliver');
      args.push('--json');
      const result = await oc(args);
      return send(res, 200, { ok: true, result: JSON.parse(result) });
    } catch (error) {
      return send(res, 500, { ok: false, error: String(error) });
    }
  }

  return send(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Jarvis Mission Control bridge listening on :${PORT}`);
});

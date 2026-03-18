import { readJson, readTextMaybe, listWorkspace } from './store';
import { fetchBridge } from './remote';

export async function getSnapshot() {
  if (process.env.JMC_BRIDGE_URL) {
    try {
      return await fetchBridge('/snapshot');
    } catch (error) {
      return { bridgeError: String(error) };
    }
  }
  return null;
}

export async function getTasks() {
  const snapshot = await getSnapshot();
  return snapshot?.missionControl?.tasks || readJson('tasks.json', []);
}

export async function getFeed() {
  const snapshot = await getSnapshot();
  return snapshot?.missionControl?.feed || readJson('feed.json', []);
}

export async function getAgents() {
  const snapshot = await getSnapshot();
  const local = readJson('agents.json', []);
  const sessions = snapshot?.openclaw?.sessions?.recent || snapshot?.openclaw?.status?.sessions?.recent || [];
  const derived = sessions.map((session) => ({
    id: session.key,
    name: session.key,
    type: session.kind,
    model: session.model || 'unknown',
    usage: {
      window: 'session',
      left: session.percentUsed != null ? `${100 - session.percentUsed}% free` : 'n/a',
      cached: 'n/a'
    },
    status: 'active'
  }));
  return derived.length ? derived : local;
}

export async function getSettings() {
  const local = readJson('settings.json', {});
  const snapshot = await getSnapshot();
  return {
    ...local,
    connector: process.env.JMC_BRIDGE_URL
      ? {
          mode: 'remote-bridge',
          status: snapshot?.bridgeError ? 'error' : 'connected',
          notes: snapshot?.bridgeError || `Connected to ${process.env.JMC_BRIDGE_URL}`
        }
      : local.connector
  };
}

export async function getMemoryBundle() {
  const snapshot = await getSnapshot();
  return {
    user: snapshot?.missionControl?.memory?.user || readTextMaybe('USER.md'),
    memory: snapshot?.missionControl?.memory?.memory || readTextMaybe('MEMORY.md'),
    today: readTextMaybe('memory/2026-03-18.md')
  };
}

export function getDocs(path = '') {
  return {
    entries: listWorkspace(path),
    content: path ? readTextMaybe(path) : '',
    path
  };
}

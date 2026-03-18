import { readJson, readTextMaybe, listWorkspace } from './store';

export function getTasks() {
  return readJson('tasks.json', []);
}

export function getFeed() {
  return readJson('feed.json', []);
}

export function getAgents() {
  return readJson('agents.json', []);
}

export function getSettings() {
  return readJson('settings.json', {});
}

export function getMemoryBundle() {
  return {
    user: readTextMaybe('USER.md'),
    memory: readTextMaybe('MEMORY.md'),
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

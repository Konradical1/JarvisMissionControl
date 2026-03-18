import fs from 'fs';
import path from 'path';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const workspaceRoot = path.resolve(root, '..');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function readJson(file, fallback) {
  ensureDir(dataDir);
  const full = path.join(dataDir, file);
  if (!fs.existsSync(full)) {
    if (fallback !== undefined) {
      writeJson(file, fallback);
      return fallback;
    }
    return null;
  }
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

export function writeJson(file, value) {
  ensureDir(dataDir);
  const full = path.join(dataDir, file);
  fs.writeFileSync(full, JSON.stringify(value, null, 2));
}

export function getWorkspaceRoot() {
  return workspaceRoot;
}

export function safeWorkspacePath(relativePath = '') {
  const clean = relativePath.replace(/^\/+/, '');
  const full = path.resolve(workspaceRoot, clean);
  if (!full.startsWith(workspaceRoot)) {
    throw new Error('Invalid path');
  }
  return full;
}

export function readTextMaybe(relativePath) {
  try {
    return fs.readFileSync(safeWorkspacePath(relativePath), 'utf8');
  } catch {
    return '';
  }
}

export function listWorkspace(relativeDir = '') {
  const dir = safeWorkspacePath(relativeDir);
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries
    .filter((entry) => !entry.name.startsWith('.git'))
    .map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? 'dir' : 'file',
      path: path.posix.join(relativeDir, entry.name)
    }))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export async function fetchBridge(pathname, options = {}) {
  const base = process.env.JMC_BRIDGE_URL;
  const token = process.env.JMC_BRIDGE_TOKEN;
  if (!base) return null;

  const res = await fetch(`${base}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`Bridge request failed: ${res.status}`);
  }
  return res.json();
}

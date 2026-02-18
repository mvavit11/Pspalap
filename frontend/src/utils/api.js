const API_URL = import.meta.env.VITE_API_URL || '';

export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export function solscanTx(sig, network = 'mainnet') {
  const cluster = network === 'devnet' ? '?cluster=devnet' : '';
  return `https://solscan.io/tx/${sig}${cluster}`;
}

export function solscanToken(mint, network = 'mainnet') {
  const cluster = network === 'devnet' ? '?cluster=devnet' : '';
  return `https://solscan.io/token/${mint}${cluster}`;
}

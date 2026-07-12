const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export async function fetchHistory(limit = 200) {
  const res = await fetch(`${SERVER_URL}/api/messages?limit=${limit}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to load history (${res.status})`);
  }
  const data = await res.json();
  return data.messages;
}

// Fallback path used only if the socket is not connected when the user hits send.
export async function sendMessageViaRest({ username, text }) {
  const res = await fetch(`${SERVER_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, text }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to send message (${res.status})`);
  }
  const data = await res.json();
  return data.message;
}

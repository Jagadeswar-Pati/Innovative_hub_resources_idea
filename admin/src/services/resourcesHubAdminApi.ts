const API_BASE =
  import.meta.env.VITE_RESOURCES_ADMIN_API_URL || 'http://localhost:5001/api/resources/admin';
const ADMIN_KEY = import.meta.env.VITE_RESOURCES_ADMIN_KEY || '';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ADMIN_KEY) headers['x-admin-key'] = ADMIN_KEY;
  return headers;
}

export async function getResourcesPosts() {
  const res = await fetch(`${API_BASE}/posts`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch posts');
  return data;
}

export async function deleteResourcesPost(id: string) {
  const res = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete post');
  return data;
}

export async function getPaidCollaborations() {
  const res = await fetch(`${API_BASE}/collaborations/paid`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch collaborations');
  return data;
}

export async function getRevenueStats() {
  const res = await fetch(`${API_BASE}/revenue`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch revenue');
  return data;
}

export async function banUser(userId: string) {
  const res = await fetch(`${API_BASE}/users/${userId}/ban`, {
    method: 'POST',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to ban user');
  return data;
}

export async function unbanUser(userId: string) {
  const res = await fetch(`${API_BASE}/users/${userId}/unban`, {
    method: 'POST',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to unban user');
  return data;
}

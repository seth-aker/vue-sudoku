import {config } from '@/config/index'
const API_BASE = config.API_BASE_URL
export async function getUser(csrfToken: string) {
  const res = await fetch(`${API_BASE}/api/auth/session`, {
    method: 'POST',
    headers: {'X-CSRF-Token': csrfToken}
  })
  console.log(res)
  const body = await res.json();
  console.log(body)
}

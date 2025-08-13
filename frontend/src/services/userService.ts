import {config } from '@/config/index'
const API_BASE = config.API_BASE_URL
export async function getUser(userId: string, accessToken: string) {
  const res = await fetch(`${API_BASE}/api/user/${userId}`, {
    method: 'GET',
    headers: {'Authorization': `Bearer ${accessToken}`}
  })
  const body = await res.json();
  console.log(body);
  return body;
}

export async function updateUser(userId: string, accessToken: string, body: any) {
  const res = await fetch(`${API_BASE}/api/user/${userId}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  })
  if(res.status !== 200) {
    throw new Error("An error occured updating the user")
  }
}

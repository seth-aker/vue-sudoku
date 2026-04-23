import {config } from '@/config/index'
const API_BASE = config.API_BASE_URL

export async function login(email: string, password: string) {
  const body = {email, password}
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    credentials: 'include'
  })
  if(res.ok) {
    const cookies = res.headers.getSetCookie()
    cookies.forEach((cookie) => console.log(cookie))
  }
  return res
  
}

export async function logout() {
  const res = await fetch(`${API_BASE}/auth/logout`)
  return res.status
}

export async function register(email: string, password: string, name?: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password,
      name
    })
  })

  return res.status
}
export async function getUser(userId: string | undefined, accessToken: string) {
  console.log("Calling get user")
  const res = await fetch(`${API_BASE}/user/${userId ? userId : ''}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
  }
  })
  const body = await res.json();
  return body;
}

export async function updateUser(userId: string | undefined, accessToken: string, body: any) {
  const res = await fetch(`${API_BASE}/user/${userId}`, {
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

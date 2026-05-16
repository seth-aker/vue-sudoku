import { AuthResponseDto, UserDto, UserStats } from '@/src/domain';
import { tokenStore } from '@/src/lib/secureStore';

import { ServiceResult, apiFetch } from './http';

const stripToken = (dto: AuthResponseDto): UserDto => {
  const { token: _token, ...user } = dto;
  return user;
};

export async function login(
  username: string,
  password: string,
): Promise<ServiceResult<UserDto>> {
  const res = await apiFetch<AuthResponseDto>('/auth/login', {
    method: 'POST',
    body: { username, password },
    auth: false,
  });
  if (!res.success || !res.body) {
    return { success: false, message: res.message ?? 'Login failed' };
  }
  await tokenStore.set(res.body.token);
  return { success: true, body: stripToken(res.body) };
}

export async function register(
  username: string,
  password: string,
  displayName?: string,
): Promise<ServiceResult<UserDto>> {
  const res = await apiFetch<AuthResponseDto>('/auth/register', {
    method: 'POST',
    body: { username, password, displayName },
    auth: false,
  });
  if (!res.success || !res.body) {
    return { success: false, message: res.message ?? 'Registration failed' };
  }
  await tokenStore.set(res.body.token);
  return { success: true, body: stripToken(res.body) };
}

/** JWT logout is client-side: discard the stored token. */
export async function logout(): Promise<ServiceResult<void>> {
  await tokenStore.clear();
  return { success: true };
}

/** Resolve the current user from a stored token, if any. */
export async function checkSession(): Promise<ServiceResult<UserDto>> {
  const token = await tokenStore.get();
  if (!token) {
    return { success: false, message: 'Not authenticated' };
  }
  const res = await apiFetch<UserDto>('/users/me');
  if (!res.success || !res.body) {
    // Token invalid/expired — clear it so the app falls back to anonymous.
    await tokenStore.clear();
    return { success: false, message: res.message ?? 'Not authenticated' };
  }
  return { success: true, body: res.body };
}

export async function getUserStats(
  userId: string,
): Promise<ServiceResult<UserStats>> {
  return apiFetch<UserStats>(`/users/${userId}/stats`);
}

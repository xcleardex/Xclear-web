import type { AuthResponse } from '@/types/auth'

/** Privy Token 登录 */
export async function privyLogin(privyToken: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/privy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ privyToken }),
  })
  return res.json()
}

/** 获取当前用户信息 (验证 token) */
export async function getMe(token: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return { success: false }
  return res.json()
}

/** 从 localStorage 获取 token 用于 API 请求 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
}

/** 构造带 Auth 的 headers */
export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra }
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

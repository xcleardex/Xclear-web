import type { AuthResponse, WalletNonceResponse } from '@/types/auth'

/** 邮箱注册 */
export async function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  })
  return res.json()
}

/** 邮箱登录 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

/** Privy Token 登录 */
export async function privyLogin(privyToken: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/privy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ privyToken }),
  })
  return res.json()
}

/** 获取钱包签名 Nonce */
export async function getWalletNonce(address: string): Promise<WalletNonceResponse> {
  const res = await fetch(`/api/auth/wallet/nonce?address=${encodeURIComponent(address)}`)
  return res.json()
}

/** 钱包签名登录 */
export async function walletLogin(
  address: string,
  message: string,
  signature: string,
): Promise<AuthResponse> {
  const res = await fetch('/api/auth/wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, message, signature }),
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

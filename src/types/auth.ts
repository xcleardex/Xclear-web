/** 后端认证用户信息 */
export interface AuthUser {
  id: string
  email?: string
  displayName?: string
  walletAddress?: string
}

/** 认证 API 通用响应 */
export interface AuthResponse {
  success: boolean
  token?: string
  message?: string
  user?: AuthUser
}

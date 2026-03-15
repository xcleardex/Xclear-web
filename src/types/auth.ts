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

/** 钱包 Nonce 响应 */
export interface WalletNonceResponse {
  success: boolean
  message?: string
  nonce?: string
  address?: string
}

/** EIP-1193 Provider 接口 */
export interface EIP1193Provider {
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
  providers?: EIP1193Provider[]
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

declare global {
  interface Window {
    okxwallet?: EIP1193Provider
    phantom?: { ethereum?: EIP1193Provider }
  }
}

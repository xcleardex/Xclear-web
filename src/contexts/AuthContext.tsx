import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { usePrivy } from '@privy-io/react-auth'
import type { AuthUser, EIP1193Provider } from '@/types/auth'
import * as authApi from '@/lib/auth-api'

interface AuthContextValue {
  /** 当前已认证用户 */
  user: AuthUser | null
  /** 是否已登录 */
  isAuthenticated: boolean
  /** 初始化 / 操作进行中 */
  loading: boolean
  /** 错误消息 */
  error: string | null
  /** 邮箱登录 */
  loginWithEmail: (email: string, password: string) => Promise<boolean>
  /** 邮箱注册 */
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<boolean>
  /** 钱包签名登录 */
  loginWithWallet: (providerKey: WalletProviderKey) => Promise<boolean>
  /** 通过 Privy 登录（打开 Privy 弹窗） */
  loginWithPrivy: () => void
  /** 登出 */
  logout: () => void
  /** 清除错误 */
  clearError: () => void
}

export type WalletProviderKey = 'metamask' | 'okx' | 'coinbase' | 'phantom' | 'injected'

const AuthContext = createContext<AuthContextValue | null>(null)

/** 根据 key 获取对应的 EIP-1193 provider */
function getWalletProvider(key: WalletProviderKey): EIP1193Provider | null {
  switch (key) {
    case 'metamask': {
      const eth = window.ethereum
      if (eth?.providers) {
        const mm = eth.providers.find((p: EIP1193Provider) => p.isMetaMask)
        if (mm) return mm
      }
      return eth?.isMetaMask ? eth : null
    }
    case 'okx':
      return (window as any).okxwallet ?? null
    case 'coinbase': {
      const eth = window.ethereum
      if (eth?.providers) {
        const cb = eth.providers.find((p: EIP1193Provider) => p.isCoinbaseWallet)
        if (cb) return cb
      }
      return eth?.isCoinbaseWallet ? eth : null
    }
    case 'phantom':
      return window.phantom?.ethereum ?? null
    case 'injected':
      return window.ethereum ?? null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authenticated, login: privyLogin, logout: privyLogout, getAccessToken } = usePrivy()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [privySyncPending, setPrivySyncPending] = useState(false)

  /* ---------- 初始化：尝试用 localStorage 中的 token 恢复会话 ---------- */
  useEffect(() => {
    const token = authApi.getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }
    authApi.getMe(token).then((res) => {
      if (res.success && res.user) {
        setUser(res.user)
      } else {
        localStorage.removeItem('auth_token')
      }
    }).catch(() => {
      localStorage.removeItem('auth_token')
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  /* ---------- Privy 认证同步 ---------- */
  useEffect(() => {
    if (!privySyncPending || !authenticated) return

    const syncPrivy = async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await authApi.privyLogin(token)
        if (res.success && res.token) {
          localStorage.setItem('auth_token', res.token)
          setUser(res.user ?? null)
        } else {
          setError(res.message ?? 'Privy 登录失败')
        }
      } catch {
        setError('Privy 登录失败')
      } finally {
        setPrivySyncPending(false)
      }
    }
    syncPrivy()
  }, [authenticated, privySyncPending, getAccessToken])

  /* ---------- 邮箱登录 ---------- */
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.login(email, password)
      if (res.success && res.token) {
        localStorage.setItem('auth_token', res.token)
        setUser(res.user ?? null)
        return true
      }
      setError(res.message ?? '登录失败')
      return false
    } catch {
      setError('网络错误，请重试')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /* ---------- 邮箱注册 ---------- */
  const registerWithEmail = useCallback(async (email: string, password: string, displayName?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.register(email, password, displayName)
      if (res.success && res.token) {
        localStorage.setItem('auth_token', res.token)
        setUser(res.user ?? null)
        return true
      }
      setError(res.message ?? '注册失败')
      return false
    } catch {
      setError('网络错误，请重试')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /* ---------- 钱包签名登录 ---------- */
  const loginWithWallet = useCallback(async (providerKey: WalletProviderKey) => {
    setLoading(true)
    setError(null)
    try {
      const provider = getWalletProvider(providerKey)
      if (!provider) {
        setError('未检测到对应钱包，请先安装')
        setLoading(false)
        return false
      }

      // 1. 请求连接获取地址
      const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[]
      const address = accounts[0]
      if (!address) {
        setError('未获取到钱包地址')
        setLoading(false)
        return false
      }

      // 2. 向后端请求 nonce
      const nonceRes = await authApi.getWalletNonce(address)
      if (!nonceRes.success || !nonceRes.nonce) {
        setError(nonceRes.message ?? '获取 nonce 失败')
        setLoading(false)
        return false
      }

      // 3. EIP-191 personal_sign
      const message = nonceRes.nonce
      const signature = (await provider.request({
        method: 'personal_sign',
        params: [message, address],
      })) as string

      // 4. 后端验签
      const res = await authApi.walletLogin(address, message, signature)
      if (res.success && res.token) {
        localStorage.setItem('auth_token', res.token)
        setUser(res.user ?? null)
        return true
      }
      setError(res.message ?? '钱包登录失败')
      return false
    } catch (err: any) {
      if (err?.code === 4001) {
        setError('用户取消了操作')
      } else {
        setError('钱包登录失败')
      }
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /* ---------- Privy 登录 ---------- */
  const loginWithPrivyHandler = useCallback(() => {
    setError(null)
    setPrivySyncPending(true)
    privyLogin()
  }, [privyLogin])

  /* ---------- 登出 ---------- */
  const logoutHandler = useCallback(() => {
    localStorage.removeItem('auth_token')
    setUser(null)
    setError(null)
    if (authenticated) {
      privyLogout()
    }
  }, [authenticated, privyLogout])

  /* ---------- 清除错误 ---------- */
  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        loginWithEmail,
        registerWithEmail,
        loginWithWallet,
        loginWithPrivy: loginWithPrivyHandler,
        logout: logoutHandler,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

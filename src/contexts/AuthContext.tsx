import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { usePrivy } from '@privy-io/react-auth'
import type { AuthUser } from '@/types/auth'
import * as authApi from '@/lib/auth-api'

interface AuthContextValue {
  /** 当前已认证用户 */
  user: AuthUser | null
  /** 是否已登录 */
  isAuthenticated: boolean
  /** 初始化 / 操作进行中 */
  loading: boolean
  /** 通过 Privy 登录（打开 Privy 弹窗） */
  login: () => void
  /** 登出 */
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authenticated, login: privyLogin, logout: privyLogout, getAccessToken } = usePrivy()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
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

  /* ---------- Privy 认证同步：登录后自动同步到后端 ---------- */
  useEffect(() => {
    if (!authenticated) return
    // 如果已有本地 user，不重复同步
    if (user && !privySyncPending) return

    const syncPrivy = async () => {
      setLoading(true)
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await authApi.privyLogin(token)
        if (res.success && res.token) {
          localStorage.setItem('auth_token', res.token)
          setUser(res.user ?? null)
        }
      } catch {
        // 静默失败
      } finally {
        setLoading(false)
        setPrivySyncPending(false)
      }
    }
    syncPrivy()
  }, [authenticated, privySyncPending, getAccessToken, user])

  /* ---------- Privy 登录 ---------- */
  const loginHandler = useCallback(() => {
    setPrivySyncPending(true)
    privyLogin()
  }, [privyLogin])

  /* ---------- 登出 ---------- */
  const logoutHandler = useCallback(() => {
    localStorage.removeItem('auth_token')
    setUser(null)
    if (authenticated) {
      privyLogout()
    }
  }, [authenticated, privyLogout])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login: loginHandler,
        logout: logoutHandler,
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

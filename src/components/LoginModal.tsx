import { useState } from 'react'
import { X, Mail, Wallet, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuth, type WalletProviderKey } from '@/contexts/AuthContext'

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

const walletOptions: { key: WalletProviderKey; label: string; icon: string }[] = [
  { key: 'metamask', label: 'MetaMask', icon: '🦊' },
  { key: 'okx', label: 'OKX Wallet', icon: '⬡' },
  { key: 'coinbase', label: 'Coinbase', icon: '🔵' },
  { key: 'phantom', label: 'Phantom', icon: '👻' },
  { key: 'injected', label: '其他钱包', icon: '🔗' },
]

const LoginModal = ({ open, onClose }: LoginModalProps) => {
  const { loginWithEmail, registerWithEmail, loginWithWallet, loginWithPrivy, loading, error, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  if (!open) return null

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let success: boolean
    if (isRegister) {
      success = await registerWithEmail(email, password, displayName || undefined)
    } else {
      success = await loginWithEmail(email, password)
    }
    if (success) {
      resetAndClose()
    }
  }

  const handleWalletLogin = async (key: WalletProviderKey) => {
    const success = await loginWithWallet(key)
    if (success) {
      resetAndClose()
    }
  }

  const handlePrivyLogin = () => {
    loginWithPrivy()
    onClose()
  }

  const resetAndClose = () => {
    setEmail('')
    setPassword('')
    setDisplayName('')
    setIsRegister(false)
    clearError()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/60" onClick={resetAndClose} />

      {/* 弹窗 */}
      <Card className="relative z-10 w-full max-w-md p-6 bg-card border border-border shadow-xl">
        {/* 关闭按钮 */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">登录 XClear</h2>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <Tabs defaultValue="email" className="w-full" onValueChange={() => clearError()}>
          <TabsList className="w-full">
            <TabsTrigger value="email" className="flex-1 gap-1">
              <Mail size={14} />
              邮箱
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex-1 gap-1">
              <Wallet size={14} />
              钱包
            </TabsTrigger>
            <TabsTrigger value="privy" className="flex-1 gap-1">
              <Shield size={14} />
              Privy
            </TabsTrigger>
          </TabsList>

          {/* ====== 邮箱登录 / 注册 ====== */}
          <TabsContent value="email">
            <form onSubmit={handleEmailSubmit} className="space-y-4 mt-4">
              {isRegister && (
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">昵称（可选）</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="输入昵称"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-muted-foreground mb-1">邮箱</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入邮箱地址"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">密码</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '处理中...' : isRegister ? '注册' : '登录'}
              </Button>
              <div className="text-center text-sm">
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => {
                    setIsRegister(!isRegister)
                    clearError()
                  }}
                >
                  {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
                </button>
              </div>
            </form>
          </TabsContent>

          {/* ====== 钱包登录 ====== */}
          <TabsContent value="wallet">
            <div className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground text-center">
                选择钱包进行签名登录
              </p>
              {walletOptions.map((w) => (
                <Button
                  key={w.key}
                  variant="outline"
                  className="w-full justify-start gap-3 h-12 text-base"
                  disabled={loading}
                  onClick={() => handleWalletLogin(w.key)}
                >
                  <span className="text-xl">{w.icon}</span>
                  {w.label}
                </Button>
              ))}
            </div>
          </TabsContent>

          {/* ====== Privy 登录 ====== */}
          <TabsContent value="privy">
            <div className="space-y-4 mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                使用 Privy 提供的安全登录方式，<br />
                支持邮箱、手机号、社交账号及钱包。
              </p>
              <Button className="w-full" disabled={loading} onClick={handlePrivyLogin}>
                <Shield size={18} className="mr-2" />
                使用 Privy 登录
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

export default LoginModal

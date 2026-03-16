import { Wallet, Settings, Copy, ExternalLink, Power, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'

const Header = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuth()

  const walletAddress = user?.walletAddress ?? ''
  
  // 格式化地址显示（前6位...后4位，类似 0x1234...5678）
  const formatAddress = (address: string) => {
    if (!address) return ''
    if (address.length <= 10) return address
    // 如果是 0x 开头，保留 0x
    if (address.startsWith('0x')) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // 复制地址到剪贴板
  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      // 可以添加 toast 提示
    }
  }

  // 在浏览器中查看（使用 Etherscan 等区块浏览器）
  const viewInBrowser = () => {
    if (walletAddress) {
      // 这里可以根据链类型选择不同的浏览器
      window.open(`https://etherscan.io/address/${walletAddress}`, '_blank')
    }
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Logo 和导航菜单 */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">XC</span>
          <span className="text-2xl font-bold">XClear</span>
        </div>
        
        <nav className="flex items-center gap-6">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">交易</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">LP池</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">推荐</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">统计</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">排行榜</a>
          <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <a href="#">生态系统</a>
            <span className="text-xs">▼</span>
          </div>
        </nav>
      </div>

      {/* 右侧操作区 */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {walletAddress ? <Wallet size={18} /> : <User size={18} />}
                <span>{walletAddress ? formatAddress(walletAddress) : (user?.displayName || user?.email || '已登录')}</span>
                <span className="text-xs">▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
               <DropdownMenuLabel className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    {walletAddress ? <Wallet size={14} className="text-primary" /> : <User size={14} className="text-primary" />}
                  </div>
                  <span className="font-medium">{walletAddress ? formatAddress(walletAddress) : (user?.displayName || user?.email || '已登录')}</span>
                </div>
                {walletAddress && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyAddress()
                  }}
                >
                  <Copy size={14} />
                </Button>
                )}
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <div className="px-2 py-2">
                <div className="text-xs text-muted-foreground mb-1">永续合约账户总价值</div>
                <div className="text-lg font-semibold">--</div>
              </div>
              
              <DropdownMenuSeparator />
              
              <div className="px-2 py-2 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-primary border-primary/50 hover:bg-primary/10">
                  充值
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-primary border-primary/50 hover:bg-primary/10">
                  提现
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-primary border-primary/50 hover:bg-primary/10">
                  转账
                </Button>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={viewInBrowser} className="cursor-pointer">
                <ExternalLink size={16} className="mr-2" />
                在浏览器中查看
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                <Power size={16} className="mr-2" />
                断开连接
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={login}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Wallet size={18} />
            <span>登录</span>
          </Button>
        )}
        <Button variant="ghost" size="icon">
          <Settings size={20} />
        </Button>
      </div>
    </header>
  )
}

export default Header

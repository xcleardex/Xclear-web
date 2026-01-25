import { X } from 'lucide-react'

interface TradingPair {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

const tradingPairs: TradingPair[] = [
  { symbol: 'XAU/USD', name: '黄金', price: 2034.56, change: 1.23, changePercent: 1.23 },
  { symbol: 'XAG/USD', name: '白银', price: 24.32, change: -0.45, changePercent: -0.45 },
  { symbol: 'WTI/USD', name: '原油', price: 78.45, change: 2.15, changePercent: 2.15 },
  { symbol: 'EUR/USD', name: '欧元/美元', price: 1.085, change: 0.12, changePercent: 0.12 },
  { symbol: 'GBP/USD', name: '英镑/美元', price: 1.265, change: -0.23, changePercent: -0.23 },
  { symbol: 'USD/JPY', name: '美元/日元', price: 149.23, change: 0.45, changePercent: 0.45 },
  { symbol: 'GBP/JPY', name: '英镑/日元', price: 188.76, change: -0.12, changePercent: -0.12 },
]

interface TradingPairsProps {
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
  isVisible: boolean
  onVisibilityChange: (visible: boolean) => void
}

const TradingPairs = ({ selectedSymbol, onSymbolChange, isVisible, onVisibilityChange }: TradingPairsProps) => {
  if (!isVisible) {
    return (
      <div className="w-8 relative">
        <button
          onClick={() => onVisibilityChange(true)}
          className="absolute left-0 top-0 bottom-0 w-8 bg-card border-r border-border hover:bg-accent transition-colors z-10 flex items-center justify-center"
        >
          <span className="text-xs">▶</span>
        </button>
      </div>
    )
  }

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* 标题栏 */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border">
        <h2 className="font-semibold">交易对</h2>
        <button
          onClick={() => onVisibilityChange(false)}
          className="p-1 hover:bg-accent rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* 交易对列表 */}
      <div className="flex-1 overflow-y-auto">
        {tradingPairs.map((pair) => (
          <div
            key={pair.symbol}
            onClick={() => onSymbolChange(pair.symbol)}
            className={`px-4 py-3 cursor-pointer border-b border-border transition-colors ${
              selectedSymbol === pair.symbol
                ? 'bg-primary/20 border-l-2 border-l-primary'
                : 'hover:bg-accent'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{pair.symbol}</span>
              <span
                className={`text-sm ${
                  pair.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {pair.change >= 0 ? '+' : ''}
                {pair.changePercent}%
              </span>
            </div>
            <div className="text-sm text-muted-foreground">{pair.price.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TradingPairs

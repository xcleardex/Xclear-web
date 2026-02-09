import { useState } from 'react'
import TradingViewChart from './TradingViewChart'
import PositionList from './PositionList'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTradingContext } from '@/contexts/TradingContext'
import { cn } from '@/lib/utils'
import type { TVBar } from '@/lib/tradingview-ws-datafeed'

interface ChartPanelProps {
  symbol: string
}

const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1D']

const ChartPanel = ({ symbol }: ChartPanelProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m')
  const [infoBar, setInfoBar] = useState<TVBar | null>(null)
  const { setCurrentPrice, connectionStatus } = useTradingContext()

  const statusConfig = {
    connected: { color: 'bg-green-500', text: '已连接' },
    disconnected: { color: 'bg-red-500', text: '未连接' },
    reconnecting: { color: 'bg-yellow-500', text: '重连中...' },
  }
  const { color: statusColor, text: statusText } = statusConfig[connectionStatus]

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* OHLCV 信息栏 */}
      <div className="px-6 py-3 border-b border-border">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">开盘:</span>
            <span>{infoBar?.open?.toFixed(2) ?? '-'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">最高:</span>
            <span className="text-green-400">{infoBar?.high?.toFixed(2) ?? '-'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">最低:</span>
            <span className="text-red-400">{infoBar?.low?.toFixed(2) ?? '-'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">收盘:</span>
            <span>{infoBar?.close?.toFixed(2) ?? '-'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">成交量:</span>
            <span>{infoBar?.volume?.toFixed(4) ?? '-'}</span>
          </div>
          {/* 连接状态 */}
          <div className="ml-auto flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', statusColor)} />
            <span className="text-xs text-muted-foreground">{statusText}</span>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="flex-1 min-h-0">
        <TradingViewChart
          symbol={symbol}
          interval={selectedTimeframe}
          onBarUpdate={setInfoBar}
          onCurrentPriceChange={setCurrentPrice}
        />
      </div>

      {/* 时间周期选择 */}
      <div className="px-6 py-3 border-t border-border flex gap-2">
        {timeframes.map((tf) => (
          <Button
            key={tf}
            onClick={() => setSelectedTimeframe(tf)}
            variant={selectedTimeframe === tf ? "default" : "outline"}
            size="sm"
          >
            {tf}
          </Button>
        ))}
      </div>

      {/* 标签页 */}
      <div className="border-t border-border">
        <Tabs defaultValue="持仓" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
            <TabsTrigger value="持仓" className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              持仓
            </TabsTrigger>
            <TabsTrigger value="仓位历史" className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              仓位历史
            </TabsTrigger>
            <TabsTrigger value="交易历史" className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              交易历史
            </TabsTrigger>
          </TabsList>
          <TabsContent value="持仓" className="m-0">
            <PositionList />
          </TabsContent>
          <TabsContent value="仓位历史" className="p-6 text-center text-muted-foreground m-0">
            <p>暂无仓位历史</p>
          </TabsContent>
          <TabsContent value="交易历史" className="p-6 text-center text-muted-foreground m-0">
            <p>暂无交易历史</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ChartPanel

import { useState } from 'react'
import TradingViewChart from './TradingViewChart'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ChartPanelProps {
  symbol: string
}

const ChartPanel = ({ symbol }: ChartPanelProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M')

  const timeframes = ['1D', '1W', '1M']

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* 价格和统计信息 */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">2,025.75</h1>
            <span className="text-green-400 text-sm">+1.23%</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">24h 成交量</div>
            <div className="text-lg font-semibold">$1250.00M</div>
          </div>
        </div>
        
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-400">24h 最高: </span>
            <span className="text-green-400">2066.26</span>
          </div>
          <div>
            <span className="text-gray-400">24h 最低: </span>
            <span className="text-red-400">1985.23</span>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="flex-1 min-h-0">
        <TradingViewChart symbol={symbol} interval={selectedTimeframe} />
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
          <TabsContent value="持仓" className="p-6 text-center text-muted-foreground m-0">
            <div>
              <p className="mb-2">暂无持仓</p>
              <p className="text-sm">开仓后持仓将显示在这里</p>
            </div>
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

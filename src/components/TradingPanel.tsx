import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

interface TradingPanelProps {
  symbol: string
}

const TradingPanel = ({ symbol }: TradingPanelProps) => {
  const [quantity, setQuantity] = useState(0.52)
  const [leverage, setLeverage] = useState(10)

  const quantityButtons = [-0.5, -0.1, 0.1, 0.5]

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(0, prev + delta))
  }

  return (
    <div className="flex-1 bg-card border-b border-border p-4 overflow-y-auto">
      {/* 交易对选择 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">{symbol}+</span>
          <ChevronDown size={16} className="text-muted-foreground" />
        </div>
        <div className="text-lg font-semibold">
          {symbol === 'XAU/USD' ? '黄金' : 
           symbol === 'XAG/USD' ? '白银' :
           symbol === 'WTI/USD' ? '原油' : symbol}
        </div>
      </div>

      {/* 执行方式 */}
      <div className="mb-4">
        <Select defaultValue="market">
          <SelectTrigger>
            <SelectValue placeholder="Market Execution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="market">Market Execution</SelectItem>
            <SelectItem value="limit">Limit Order</SelectItem>
            <SelectItem value="stop">Stop Order</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 数量调整 */}
      <div className="mb-4">
        <div className="text-sm text-muted-foreground mb-2">数量</div>
        <div className="flex items-center gap-2 mb-2">
          {quantityButtons.map((delta) => (
            <Button
              key={delta}
              onClick={() => handleQuantityChange(delta)}
              variant={delta === 0.52 ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              {delta > 0 ? '+' : ''}{delta}
            </Button>
          ))}
        </div>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
          className="text-right"
        />
      </div>

      {/* 杠杆 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">杠杆</span>
          <span className="text-primary font-semibold">{leverage}x</span>
        </div>
        <Slider
          min={1}
          max={100}
          value={[leverage]}
          onValueChange={(value) => setLeverage(value[0])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1x</span>
          <span>100x</span>
        </div>
      </div>

      {/* 止损/止盈 */}
      <div className="mb-4 space-y-2">
        <Card>
          <CardContent className="flex items-center justify-between p-2">
            <div>
              <div className="text-xs text-muted-foreground">Stop Loss</div>
              <div className="text-sm">not set</div>
            </div>
            <Button variant="outline" size="sm">
              +
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-2">
            <div>
              <div className="text-xs text-muted-foreground">Take Profit</div>
              <div className="text-sm">not set</div>
            </div>
            <Button variant="outline" size="sm">
              +
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 买卖价格 */}
      <div className="mb-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Sell</span>
          <span className="text-red-400 font-semibold">2033.46</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Buy</span>
          <span className="text-green-400 font-semibold">2035.66</span>
        </div>
      </div>

      {/* 交易按钮 */}
      <div className="space-y-2 mb-4">
        <Button className="w-full bg-red-500 hover:bg-red-600">
          Sell by Market
        </Button>
        <Button className="w-full bg-blue-500 hover:bg-blue-600">
          Buy by Market
        </Button>
      </div>

      {/* 警告信息 */}
      <div className="text-xs text-yellow-400 bg-yellow-400/10 p-2 rounded">
        Attention! The trade will be executed at market conditions, difference with requested price may be significant!
      </div>
    </div>
  )
}

export default TradingPanel

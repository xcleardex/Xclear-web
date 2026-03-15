import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { openPosition } from '@/lib/api'
import { useTradingContext } from '@/contexts/TradingContext'

interface TradingPanelProps {
  symbol: string
}

const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20, 50, 100] as const

const TradingPanel = ({ symbol }: TradingPanelProps) => {
  const { currentPrice, userId, refreshPositions } = useTradingContext()

  const [isLong, setIsLong] = useState(true)
  const [leverage, setLeverage] = useState(10)
  const [margin, setMargin] = useState('100')
  const [marginRatio, setMarginRatio] = useState(50) // 逐仓保证金比例，默认50%
  const [isSubmitting, setIsSubmitting] = useState(false)

  const marginNum = parseFloat(margin) || 0
  // 逐仓保证金 = 用户输入保证金 × 逐仓比例
  const isolatedMargin = marginNum * (marginRatio / 100)
  const notionalValue = marginNum * leverage
  const normalizedSymbol = symbol.replace('/', '')

  const estimatedLiqPrice = useMemo(() => {
    if (currentPrice <= 0 || isolatedMargin <= 0) return null
    // 强平价基于逐仓保证金：当 equity = isolatedMargin * 50% 时强平
    const ratio = 0.5 / leverage
    return isLong
      ? currentPrice * (1 - ratio)
      : currentPrice * (1 + ratio)
  }, [currentPrice, isolatedMargin, leverage, isLong])

  const handleSubmit = async () => {
    if (marginNum <= 0) {
      alert('请输入有效的保证金金额')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await openPosition({
        userID: userId,
        symbol: normalizedSymbol,
        isLong,
        leverage,
        margin: isolatedMargin,
      })
      if (result.success) {
        alert(
          `开仓成功!\n\n持仓ID: ${result.positionId}\n入场价: ${result.position?.entryPrice.toFixed(2)}\n逐仓保证金: ${isolatedMargin.toFixed(2)} USDT\n名义价值: ${result.position?.notionalSize.toFixed(2)} USDT\n预估强平价: ${result.position?.liquidationPrice.toFixed(2)}`
        )
        await refreshPositions()
      } else {
        alert(`开仓失败: ${result.message}`)
      }
    } catch (e) {
      alert(`开仓请求失败: ${(e as Error).message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 bg-card border-b border-border p-4 overflow-y-auto">
      {/* 保证金模式 */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary font-medium">逐仓</span>
        <span className="text-xs text-muted-foreground">Isolated Margin</span>
      </div>

      {/* 方向选择 */}
      <div className="mb-4">
        <div className="text-sm text-muted-foreground mb-2">方向</div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsLong(true)}
            variant="outline"
            className={cn(
              'flex-1',
              isLong && 'bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30'
            )}
          >
            做多 Long
          </Button>
          <Button
            onClick={() => setIsLong(false)}
            variant="outline"
            className={cn(
              'flex-1',
              !isLong && 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30'
            )}
          >
            做空 Short
          </Button>
        </div>
      </div>

      {/* 杠杆选择 */}
      <div className="mb-4">
        <div className="text-sm text-muted-foreground mb-2">杠杆倍数</div>
        <div className="flex flex-wrap gap-2">
          {LEVERAGE_OPTIONS.map((lev) => (
            <Button
              key={lev}
              onClick={() => setLeverage(lev)}
              variant={leverage === lev ? 'default' : 'outline'}
              size="sm"
            >
              {lev}x
            </Button>
          ))}
        </div>
      </div>

      {/* 保证金输入 */}
      <div className="mb-4">
        <div className="text-sm text-muted-foreground mb-2">投入金额 (USDT)</div>
        <Input
          type="number"
          value={margin}
          onChange={(e) => setMargin(e.target.value)}
          placeholder="输入投入金额"
          min="1"
          step="1"
        />
      </div>

      {/* 逐仓保证金比例 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">逐仓保证金比例</span>
          <span className="text-sm font-medium text-primary">{marginRatio}%</span>
        </div>
        <Slider
          value={[marginRatio]}
          onValueChange={(v) => setMarginRatio(v[0])}
          min={10}
          max={100}
          step={5}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>10%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* 订单预览 */}
      <Card className="mb-4">
        <CardContent className="p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">交易对</span>
            <span>{normalizedSymbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">逐仓保证金</span>
            <span className="text-primary font-medium">{isolatedMargin.toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">名义价值</span>
            <span>{notionalValue.toLocaleString()} USDT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">预估强平价</span>
            <span>{estimatedLiqPrice?.toFixed(2) ?? '-'}</span>
          </div>
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <Button
        className={cn(
          'w-full',
          isLong
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        )}
        onClick={handleSubmit}
        disabled={isSubmitting || marginNum <= 0}
      >
        {isSubmitting
          ? '开仓中...'
          : `${isLong ? '开多' : '开空'} ${normalizedSymbol}`}
      </Button>
    </div>
  )
}

export default TradingPanel

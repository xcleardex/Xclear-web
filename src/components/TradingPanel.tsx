import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const marginNum = parseFloat(margin) || 0
  const notionalValue = marginNum * leverage
  const normalizedSymbol = symbol.replace('/', '')

  const estimatedLiqPrice = useMemo(() => {
    if (currentPrice <= 0 || marginNum <= 0) return null
    const ratio = 0.5 / leverage
    return isLong
      ? currentPrice * (1 - ratio)
      : currentPrice * (1 + ratio)
  }, [currentPrice, marginNum, leverage, isLong])

  const handleSubmit = async () => {
    if (!userId) {
      alert('请先连接钱包')
      return
    }
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
        margin: marginNum,
      })
      if (result.success) {
        alert(
          `开仓成功!\n\n持仓ID: ${result.positionId}\n入场价: ${result.position?.entryPrice.toFixed(2)}\n名义价值: ${result.position?.notionalSize.toFixed(2)} USDT\n预估强平价: ${result.position?.liquidationPrice.toFixed(2)}`
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
        <div className="text-sm text-muted-foreground mb-2">保证金 (USDT)</div>
        <Input
          type="number"
          value={margin}
          onChange={(e) => setMargin(e.target.value)}
          placeholder="输入保证金金额"
          min="1"
          step="1"
        />
      </div>

      {/* 订单预览 */}
      <Card className="mb-4">
        <CardContent className="p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">交易对</span>
            <span>{normalizedSymbol}</span>
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

      {/* 未连接钱包提示 */}
      {!userId && (
        <div className="text-xs text-yellow-400 bg-yellow-400/10 p-2 rounded mt-3 text-center">
          请先连接钱包后再进行交易
        </div>
      )}
    </div>
  )
}

export default TradingPanel

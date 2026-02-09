import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { closePosition } from '@/lib/api'
import { useTradingContext } from '@/contexts/TradingContext'
import type { Position } from '@/types/trading'

const PositionList = () => {
  const { positions, positionsLoading, refreshPositions } = useTradingContext()

  if (positionsLoading && positions.length === 0) {
    return <div className="p-6 text-center text-muted-foreground">加载中...</div>
  }

  if (positions.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p className="mb-2">暂无持仓</p>
        <p className="text-sm">开仓后持仓将显示在这里</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">
          当前持仓 ({positions.length})
        </span>
        <Button variant="ghost" size="sm" onClick={refreshPositions}>
          刷新
        </Button>
      </div>
      <div className="space-y-3 max-h-[200px] overflow-y-auto">
        {positions.map((pos) => (
          <PositionItem key={pos.id} position={pos} />
        ))}
      </div>
    </div>
  )
}

const PositionItem = ({ position }: { position: Position }) => {
  const { refreshPositions } = useTradingContext()
  const [closing, setClosing] = useState(false)

  const handleClose = async () => {
    if (!confirm('确认平仓？')) return
    setClosing(true)
    try {
      const result = await closePosition(position.id)
      if (result.success) {
        await refreshPositions()
      } else {
        alert(`平仓失败: ${result.message}`)
      }
    } catch (e) {
      alert(`平仓请求失败: ${(e as Error).message}`)
    } finally {
      setClosing(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-sm">{position.symbol}</span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded',
            position.isLong
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          )}>
            {position.isLong ? '多' : '空'} {position.leverage}x
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs mb-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">保证金</span>
            <span>{position.margin.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">入场价</span>
            <span>{position.entryPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">名义价值</span>
            <span>{position.notionalSize.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">强平价</span>
            <span>{position.liquidationPrice.toFixed(2)}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs hover:bg-red-500 hover:text-white"
          onClick={handleClose}
          disabled={closing}
        >
          {closing ? '平仓中...' : '平仓'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default PositionList

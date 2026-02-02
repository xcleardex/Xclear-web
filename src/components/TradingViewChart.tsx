import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'
import { subscribeTradingViewWsBars, type TVBar } from '@/lib/tradingview-ws-datafeed'

interface TradingViewChartProps {
  symbol: string
  interval?: string
}

/**
 * TradingView Lightweight Charts + WebSocket 数据
 * 数据源: ws://54.153.138.55:8080/hub/tradingview?id=<随机id>
 */
const TradingViewChart = ({ symbol, interval = '1M' }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const barsCacheRef = useRef<Map<number, TVBar>>(new Map())
  const hasSetDataRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    const el = containerRef.current
    el.innerHTML = ''

    const chart = createChart(el, {
      layout: {
        background: { type: 'solid', color: '#0A0E27' },
        textColor: '#D1D5DB',
      },
      grid: {
        vertLines: { color: '#1E293B' },
        horzLines: { color: '#1E293B' },
      },
      width: el.clientWidth,
      height: el.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1E293B',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
    })

    const series = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    chartRef.current = chart
    barsCacheRef.current = new Map()
    hasSetDataRef.current = false

    // 转换 symbol 格式：XAU/USD -> XAUUSD
    const normalizedSymbol = symbol.replace('/', '')
    // 转换 interval 格式：1M -> 1（分钟），如果后端用不同格式可调整
    const normalizedInterval = interval === '1M' ? '1' : interval === '1W' ? '10080' : interval === '1D' ? '1440' : interval

    const unsubscribe = subscribeTradingViewWsBars(normalizedSymbol, normalizedInterval, (bar: TVBar) => {
      const key = bar.time
      barsCacheRef.current.set(key, { ...bar })
      const bars = Array.from(barsCacheRef.current.values()).sort((a, b) => a.time - b.time)

      const candle = { time: bar.time, open: bar.open, high: bar.high, low: bar.low, close: bar.close }

      if (!hasSetDataRef.current && bars.length > 0) {
        hasSetDataRef.current = true
        series.setData(bars.map((b) => ({ time: b.time, open: b.open, high: b.high, low: b.low, close: b.close })))
        chart.timeScale().fitContent()
      } else {
        series.update(candle)
      }
    })

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      unsubscribe()
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [symbol, interval])

  return <div ref={containerRef} className="w-full h-full" />
}

export default TradingViewChart

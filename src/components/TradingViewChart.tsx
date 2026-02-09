import { useEffect, useRef } from 'react'
import { createChart, ColorType, type IChartApi, type ISeriesApi, type CandlestickData, type UTCTimestamp } from 'lightweight-charts'
import { subscribeTradingViewWsBars, type TVBar } from '@/lib/tradingview-ws-datafeed'
import { getUdfHistory } from '@/lib/api'

interface TradingViewChartProps {
  symbol: string
  interval?: string
  onBarUpdate?: (bar: TVBar | null) => void
  onCurrentPriceChange?: (price: number) => void
}

/** 将 UI 时间周期映射到后端 resolution */
function mapIntervalToResolution(interval: string): string {
  const map: Record<string, string> = {
    '1m': '1', '5m': '5', '15m': '15', '30m': '30',
    '1h': '60', '4h': '240', '1D': 'D',
  }
  return map[interval] || interval
}

const TradingViewChart = ({ symbol, interval = '1m', onBarUpdate, onCurrentPriceChange }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const latestBarRef = useRef<TVBar | null>(null)
  const barsCacheRef = useRef<Map<number, TVBar>>(new Map())
  const hasSetDataRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    const el = containerRef.current
    el.innerHTML = ''

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: '#0A0E27' },
        textColor: '#D1D5DB',
      },
      grid: {
        vertLines: { color: '#1E293B' },
        horzLines: { color: '#1E293B' },
      },
      width: el.clientWidth,
      height: el.clientHeight,
      crosshair: {
        mode: 0, // CrosshairMode.Normal
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2a2e39',
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    })

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries
    barsCacheRef.current = new Map()
    hasSetDataRef.current = false
    latestBarRef.current = null

    // 十字光标交互
    chart.subscribeCrosshairMove((param) => {
      if (!onBarUpdate) return
      if (param.time) {
        const data = param.seriesData.get(candleSeries) as CandlestickData | undefined
        if (data) {
          onBarUpdate({
            time: data.time as number,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volume: barsCacheRef.current.get(data.time as number)?.volume,
          })
          return
        }
      }
      // 鼠标离开图表区域，回退到最新 bar
      onBarUpdate(latestBarRef.current)
    })

    const normalizedSymbol = symbol.replace('/', '')
    const normalizedInterval = mapIntervalToResolution(interval)

    const setup = async () => {
      // 加载历史数据
      try {
        const now = Math.floor(Date.now() / 1000)
        const from = now - 7 * 24 * 60 * 60
        const data = await getUdfHistory(normalizedSymbol, normalizedInterval, from, now)
        if (cancelled) return

        if (data.s === 'ok' && data.t?.length > 0) {
          const candles: CandlestickData[] = data.t.map((t, i) => ({
            time: t as UTCTimestamp,
            open: data.o[i],
            high: data.h[i],
            low: data.l[i],
            close: data.c[i],
          }))

          const volumes = data.t.map((t, i) => ({
            time: t as UTCTimestamp,
            value: data.v[i],
            color: data.c[i] >= data.o[i] ? '#26a69a80' : '#ef535080',
          }))

          candleSeries.setData(candles)
          volumeSeries.setData(volumes)
          chart.timeScale().fitContent()
          hasSetDataRef.current = true

          // 填充缓存
          data.t.forEach((t, i) => {
            barsCacheRef.current.set(t, {
              time: t,
              open: data.o[i],
              high: data.h[i],
              low: data.l[i],
              close: data.c[i],
              volume: data.v[i],
            })
          })

          // 更新最新 bar
          const lastIdx = data.t.length - 1
          const lastBar: TVBar = {
            time: data.t[lastIdx],
            open: data.o[lastIdx],
            high: data.h[lastIdx],
            low: data.l[lastIdx],
            close: data.c[lastIdx],
            volume: data.v[lastIdx],
          }
          latestBarRef.current = lastBar
          onBarUpdate?.(lastBar)
          onCurrentPriceChange?.(lastBar.close)
        }
      } catch (e) {
        console.warn('[TradingViewChart] Failed to load historical data:', e)
      }

      if (cancelled) return

      // 订阅实时数据
      const unsubscribe = subscribeTradingViewWsBars(normalizedSymbol, normalizedInterval, (bar: TVBar) => {
        if (cancelled) return
        const key = bar.time
        barsCacheRef.current.set(key, { ...bar })

        const candle = { time: bar.time as UTCTimestamp, open: bar.open, high: bar.high, low: bar.low, close: bar.close }

        if (!hasSetDataRef.current) {
          hasSetDataRef.current = true
          const bars = Array.from(barsCacheRef.current.values()).sort((a, b) => a.time - b.time)
          candleSeries.setData(bars.map(b => ({
            time: b.time as UTCTimestamp, open: b.open, high: b.high, low: b.low, close: b.close,
          })))
          chart.timeScale().fitContent()
        } else {
          candleSeries.update(candle)
        }

        // 更新成交量
        if (bar.volume !== undefined) {
          volumeSeries.update({
            time: bar.time as UTCTimestamp,
            value: bar.volume,
            color: bar.close >= bar.open ? '#26a69a80' : '#ef535080',
          })
        }

        latestBarRef.current = bar
        onCurrentPriceChange?.(bar.close)
        onBarUpdate?.(bar)
      })

      // 存储取消订阅函数
      cleanupRef.current = unsubscribe
    }

    // 保存清理函数引用
    const cleanupRef = { current: () => {} }

    setup()

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelled = true
      cleanupRef.current()
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [symbol, interval])

  return <div ref={containerRef} className="w-full h-full" />
}

export default TradingViewChart

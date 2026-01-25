import { useEffect, useRef } from 'react'

interface TradingViewChartProps {
  symbol: string
  interval?: string
}

// TradingView 交易对映射 - 使用更通用的交易对代码
const symbolMap: Record<string, string> = {
  'XAU/USD': 'TVC:GOLD', // 使用 TVC (TradingView Commodities) 前缀
  'XAG/USD': 'TVC:SILVER',
  'WTI/USD': 'TVC:USOIL',
  'EUR/USD': 'FX_IDC:EURUSD',
  'GBP/USD': 'FX_IDC:GBPUSD',
  'USD/JPY': 'FX_IDC:USDJPY',
  'GBP/JPY': 'FX_IDC:GBPJPY',
}

const TradingViewChart = ({ symbol, interval = '1M' }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const widgetRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 清理之前的脚本和组件
    if (widgetRef.current) {
      try {
        widgetRef.current.remove()
      } catch (e) {
        // 忽略清理错误
      }
      widgetRef.current = null
    }

    if (scriptRef.current && scriptRef.current.parentNode) {
      scriptRef.current.parentNode.removeChild(scriptRef.current)
    }

    // 清理容器内容
    containerRef.current.innerHTML = ''

    // 确保容器有唯一 ID
    const containerId = `tradingview-${symbol.replace('/', '-').toLowerCase()}-${Date.now()}`
    containerRef.current.id = containerId

    // 创建新的脚本
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        const tvSymbol = symbolMap[symbol] || `FX:${symbol.replace('/', '')}`
        
        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: interval === '1D' ? 'D' : interval === '1W' ? 'W' : 'M',
          timezone: 'Asia/Shanghai',
          theme: 'dark',
          style: '1',
          locale: 'zh_CN',
          toolbar_bg: '#0A0E27',
          enable_publishing: false,
          allow_symbol_change: true, // 允许用户更改交易对，避免显示错误通知
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerId,
          // 禁用某些可能触发通知的功能
          disabled_features: ['use_localstorage_for_settings', 'header_symbol_search'],
          // 深色主题配置
          studies_overrides: {
            'volume.volume.color.0': '#00FFFF',
          },
          overrides: {
            'paneProperties.background': '#0A0E27',
            'paneProperties.backgroundType': 'solid',
            'paneProperties.vertGridProperties.color': '#1E293B',
            'paneProperties.horzGridProperties.color': '#1E293B',
            'symbolWatermarkProperties.transparency': 90,
            'scalesProperties.textColor': '#D1D5DB',
          },
        })
      }
    }

    scriptRef.current = script
    document.head.appendChild(script)

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove()
        } catch (e) {
          // 忽略清理错误
        }
        widgetRef.current = null
      }
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current)
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, interval])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
    />
  )
}

// 扩展 Window 接口
declare global {
  interface Window {
    TradingView: any
  }
}

export default TradingViewChart

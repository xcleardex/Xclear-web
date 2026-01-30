/**
 * TradingView Charting Library 自定义 Datafeed
 * 使用 WebSocket ws://54.153.138.55:8080/hub/tradingview?id=<随机id> 作为数据源
 * 使用 reconnecting-websocket 实现断线自动重连，保持稳定连接
 *
 * 使用前需将 TradingView Charting Library 放入 public/charting_library/
 * 文档: https://www.tradingview.com/charting-library-docs/
 */

import ReconnectingWebSocket from 'reconnecting-websocket'
import { generateTradingViewWsId } from './utils'

const WS_BASE_URL = 'ws://54.153.138.55:8080/hub/tradingview'

/** 可通过 .env 的 VITE_WS_URL 覆盖 */
function getWsBaseUrl(): string {
  const url = import.meta.env.VITE_WS_URL
  if (url) return url.replace(/\/$/, '')
  return WS_BASE_URL
}

/** 稳定连接配置：自动重连、超时与重试间隔 */
const WS_OPTIONS = {
  connectionTimeout: 5000,
  maxRetries: Infinity,
  minReconnectionDelay: 2000,
  maxReconnectionDelay: 15000,
  reconnectionDelayGrowFactor: 1.3,
  minUptime: 3000,
}

/** TradingView Bar 格式：time 为 Unix 秒 */
export interface TVBar {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

/** 后端 WebSocket 可能下发的 K 线格式（兼容 time 秒/毫秒 及 o,h,l,c 简写） */
interface WsBarPayload {
  time: number
  open?: number
  high?: number
  low?: number
  close?: number
  volume?: number
  o?: number
  h?: number
  l?: number
  c?: number
}

function normalizeBar(payload: WsBarPayload): TVBar {
  let time = payload.time
  if (time > 1e12) time = Math.floor(time / 1000) // 毫秒转秒
  return {
    time,
    open: payload.open ?? payload.o ?? 0,
    high: payload.high ?? payload.h ?? 0,
    low: payload.low ?? payload.l ?? 0,
    close: payload.close ?? payload.c ?? 0,
    volume: payload.volume,
  }
}

/** 单个订阅的上下文 */
interface Subscriber {
  onTick: (bar: TVBar) => void
  onResetCacheNeeded: () => void
}

/**
 * 创建使用指定 WebSocket 的 Datafeed 对象（TradingView Datafeed API）
 * 每次创建会生成新的随机 id 连接
 */
export function createTradingViewWsDatafeed() {
  const wsId = generateTradingViewWsId()
  const wsUrl = `${getWsBaseUrl()}?id=${wsId}`

  let ws: ReconnectingWebSocket | null = null
  const subscribers = new Map<string, Subscriber>()
  /** 历史 K 线缓存，供 getBars 使用（若后端先推历史再推实时） */
  const barsCache: TVBar[] = []
  let cacheResolution: string | null = null
  let cacheSymbol: string | null = null

  const connect = () => {
    if (ws?.readyState === WebSocket.OPEN) return
    try {
      ws = new ReconnectingWebSocket(wsUrl, [], WS_OPTIONS)
      ws.onopen = () => {
        console.log('[TradingView Datafeed] WebSocket connected', wsUrl)
      }
      ws.onmessage = (event: MessageEvent) => {
        try {
          const raw = typeof event.data === 'string' ? event.data : ''
          const data = JSON.parse(raw) as WsBarPayload | WsBarPayload[] | { bars?: WsBarPayload[]; bar?: WsBarPayload }
          const bars: TVBar[] = []
          if (Array.isArray(data)) {
            data.forEach((b) => bars.push(normalizeBar(b)))
          } else if (data && typeof data === 'object') {
            if (Array.isArray((data as { bars?: WsBarPayload[] }).bars)) {
              (data as { bars: WsBarPayload[] }).bars.forEach((b) => bars.push(normalizeBar(b)))
            } else if ((data as { bar?: WsBarPayload }).bar) {
              bars.push(normalizeBar((data as { bar: WsBarPayload }).bar!))
            } else if ('time' in data && typeof (data as WsBarPayload).time === 'number') {
              bars.push(normalizeBar(data as WsBarPayload))
            }
          }
          if (bars.length === 0) return
          bars.sort((a, b) => a.time - b.time)
          bars.forEach((bar) => {
            const existing = barsCache.findIndex((b) => b.time === bar.time)
            if (existing >= 0) {
              barsCache[existing] = { ...bar }
            } else {
              barsCache.push({ ...bar })
            }
            barsCache.sort((a, b) => a.time - b.time)
          })
          subscribers.forEach((sub) => {
            bars.forEach((bar) => sub.onTick(bar))
            if (bars.length > 1) sub.onResetCacheNeeded()
          })
        } catch (e) {
          console.warn('[TradingView Datafeed] parse message error', e)
        }
      }
      ws.onerror = (e: unknown) => {
        console.warn('[TradingView Datafeed] WebSocket error', e)
      }
      ws.onclose = () => {
        console.log('[TradingView Datafeed] WebSocket closed (将自动重连)')
      }
    } catch (e) {
      console.error('[TradingView Datafeed] WebSocket connect error', e)
    }
  }

  const disconnect = () => {
    if (ws) {
      ws.close()
      ws = null
    }
  }

  return {
    onReady(callback: (config: Record<string, unknown>) => void) {
      setTimeout(
        () =>
          callback({
            supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M'],
            supports_search: false,
            supports_group_request: false,
            supports_marks: false,
            supports_timescale_marks: false,
            supports_time: true,
          }),
        0
      )
    },

    resolveSymbol(
      symbolName: string,
      onResolve: (info: Record<string, unknown>) => void,
      _onError: (msg: string) => void
    ) {
      setTimeout(() => {
        onResolve({
          ticker: symbolName,
          name: symbolName,
          description: symbolName,
          type: 'crypto',
          session: '24x7',
          timezone: 'Asia/Shanghai',
          exchange: '',
          minmov: 1,
          pricescale: 100,
          has_intraday: true,
          has_weekly_and_monthly: true,
          supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M'],
          volume_precision: 2,
          data_status: 'streaming',
        })
      }, 0)
    },

    getBars(
      symbolInfo: { ticker?: string },
      resolution: string,
      periodParams: { from: number; to: number; countBack: number; firstDataRequest?: boolean },
      onResult: (bars: TVBar[], meta: { noData?: boolean; nextTime?: number }) => void,
      _onError: (msg: string) => void
    ) {
      setTimeout(() => {
        const from = periodParams.from
        const to = periodParams.to
        const key = `${symbolInfo.ticker || ''}_${resolution}`
        if (cacheSymbol === key && cacheResolution === resolution && barsCache.length > 0) {
          const filtered = barsCache.filter((b) => b.time >= from && b.time < to)
          onResult(filtered.length ? filtered : [], filtered.length ? {} : { noData: true })
          return
        }
        cacheSymbol = key
        cacheResolution = resolution
        connect()
        const filtered = barsCache.filter((b) => b.time >= from && b.time < to)
        onResult(filtered.length ? filtered : [], filtered.length ? {} : { noData: true })
      }, 0)
    },

    subscribeBars(
      _symbolInfo: Record<string, unknown>,
      _resolution: string,
      onTick: (bar: TVBar) => void,
      listenerGuid: string,
      onResetCacheNeededCallback: () => void
    ) {
      subscribers.set(listenerGuid, { onTick, onResetCacheNeeded: onResetCacheNeededCallback })
      connect()
    },

    unsubscribeBars(listenerGuid: string) {
      subscribers.delete(listenerGuid)
      if (subscribers.size === 0) disconnect()
    },
  }
}

/**
 * 订阅 WebSocket K 线流，供 Lightweight Charts 等使用
 * 返回取消订阅函数
 */
export function subscribeTradingViewWsBars(onBar: (bar: TVBar) => void): () => void {
  const wsId = generateTradingViewWsId()
  const wsUrl = `${getWsBaseUrl()}?id=${wsId}`
  let ws: ReconnectingWebSocket | null = null

  const parseMessage = (raw: string) => {
    try {
      const data = JSON.parse(raw) as WsBarPayload | WsBarPayload[] | { bars?: WsBarPayload[]; bar?: WsBarPayload }
      const bars: TVBar[] = []
      if (Array.isArray(data)) {
        data.forEach((b) => bars.push(normalizeBar(b)))
      } else if (data && typeof data === 'object') {
        if (Array.isArray((data as { bars?: WsBarPayload[] }).bars)) {
          (data as { bars: WsBarPayload[] }).bars.forEach((b) => bars.push(normalizeBar(b)))
        } else if ((data as { bar?: WsBarPayload }).bar) {
          bars.push(normalizeBar((data as { bar: WsBarPayload }).bar!))
        } else if ('time' in data && typeof (data as WsBarPayload).time === 'number') {
          bars.push(normalizeBar(data as WsBarPayload))
        }
      }
      bars.sort((a, b) => a.time - b.time)
      bars.forEach((bar) => onBar(bar))
    } catch (e) {
      console.warn('[TradingView WS] parse message error', e)
    }
  }

  ws = new ReconnectingWebSocket(wsUrl, [], WS_OPTIONS)
  ws.onopen = () => {
    console.log('[TradingView WS] connected', wsUrl)
  }
  ws.onmessage = (event: MessageEvent) => {
    const raw = typeof event.data === 'string' ? event.data : ''
    if (raw) parseMessage(raw)
  }

  return () => {
    if (ws) {
      ws.close()
      ws = null
    }
  }
}

/**
 * TradingView Charting Library 自定义 Datafeed
 * 使用 SignalR Hub http://54.153.138.55:8080/hub/tradingview 作为数据源
 * 使用 @microsoft/signalr 实现连接，支持自动重连
 *
 * 使用前需将 TradingView Charting Library 放入 public/charting_library/
 * 文档: https://www.tradingview.com/charting-library-docs/
 */

import * as signalR from '@microsoft/signalr'

const HUB_BASE_URL = 'http://54.153.138.55:8080/hub/tradingview'

/** 可通过 .env 的 VITE_HUB_URL 覆盖 */
function getHubUrl(): string {
  const url = import.meta.env.VITE_HUB_URL || import.meta.env.VITE_WS_URL
  if (url) return url.replace(/^ws/, 'http').replace(/\/$/, '').replace(/\?.*$/, '')
  return HUB_BASE_URL
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
  open?: number | string
  high?: number | string
  low?: number | string
  close?: number | string
  volume?: number | string
  o?: number
  h?: number
  l?: number
  c?: number
}

/** 后端 BarUpdate 事件的数据格式 */
interface BarUpdatePayload {
  symbol: string
  resolution: string
  bar: WsBarPayload
}

function normalizeBar(payload: WsBarPayload): TVBar {
  let time = payload.time
  if (time > 1e12) time = Math.floor(time / 1000) // 毫秒转秒
  return {
    time,
    open: parseFloat(String(payload.open ?? payload.o ?? 0)),
    high: parseFloat(String(payload.high ?? payload.h ?? 0)),
    low: parseFloat(String(payload.low ?? payload.l ?? 0)),
    close: parseFloat(String(payload.close ?? payload.c ?? 0)),
    volume: payload.volume ? parseFloat(String(payload.volume)) : undefined,
  }
}

/** 单个订阅的上下文 */
interface Subscriber {
  onTick: (bar: TVBar) => void
  onResetCacheNeeded: () => void
  symbol: string
  resolution: string
}

/** 处理 SignalR 推送的 BarUpdate 数据 */
function handleBarUpdate(
  data: BarUpdatePayload,
  barsCache: TVBar[],
  subscribers: Map<string, Subscriber>
) {
  const bar = normalizeBar(data.bar)
  
  // 更新缓存
  const existing = barsCache.findIndex((b) => b.time === bar.time)
  if (existing >= 0) {
    barsCache[existing] = { ...bar }
  } else {
    barsCache.push({ ...bar })
  }
  barsCache.sort((a, b) => a.time - b.time)
  
  // 通知匹配的订阅者
  subscribers.forEach((sub) => {
    if (sub.symbol === data.symbol && sub.resolution === data.resolution) {
      sub.onTick(bar)
    }
  })
}

/**
 * 创建使用 SignalR Hub 的 Datafeed 对象（TradingView Datafeed API）
 * 使用 @microsoft/signalr 实现连接，支持自动重连
 */
export function createTradingViewWsDatafeed() {
  let connection: signalR.HubConnection | null = null
  const subscribers = new Map<string, Subscriber>()
  /** 历史 K 线缓存，供 getBars 使用（若后端先推历史再推实时） */
  const barsCache: TVBar[] = []
  let cacheResolution: string | null = null
  let cacheSymbol: string | null = null
  let pingInterval: ReturnType<typeof setInterval> | null = null

  const connect = async () => {
    if (connection?.state === signalR.HubConnectionState.Connected) return

    try {
      connection = new signalR.HubConnectionBuilder()
        .withUrl(getHubUrl())
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build()

      // 监听连接成功
      connection.on('Connected', (data: { connectionId: string }) => {
        console.log('[TradingView Datafeed] Connected:', data.connectionId)
      })

      // 监听订阅确认
      connection.on('Subscribed', (response: { success: boolean; message?: string }) => {
        if (response.success) {
          console.log('[TradingView Datafeed] Subscribed successfully')
        } else {
          console.warn('[TradingView Datafeed] Subscribe failed:', response.message)
        }
      })

      // 监听取消订阅确认
      connection.on('Unsubscribed', (response: { subscriberUID: string }) => {
        console.log('[TradingView Datafeed] Unsubscribed:', response.subscriberUID)
      })

      // 监听 K线更新（后端推送的主要事件）
      connection.on('BarUpdate', (data: BarUpdatePayload) => {
        handleBarUpdate(data, barsCache, subscribers)
      })

      // 监听 Pong 心跳响应
      connection.on('Pong', (data: { timestamp: number }) => {
        console.log('[TradingView Datafeed] Pong:', data.timestamp)
      })

      connection.onreconnecting((error) => {
        console.warn('[TradingView Datafeed] SignalR reconnecting...', error)
      })

      connection.onreconnected(async (connectionId) => {
        console.log('[TradingView Datafeed] SignalR reconnected', connectionId)
        // 重连后重新订阅所有
        for (const [uid, sub] of subscribers) {
          try {
            await connection?.invoke('Subscribe', sub.symbol, sub.resolution, uid)
          } catch (e) {
            console.warn('[TradingView Datafeed] Resubscribe failed:', e)
          }
        }
      })

      connection.onclose((error) => {
        console.log('[TradingView Datafeed] SignalR closed', error)
        if (pingInterval) {
          clearInterval(pingInterval)
          pingInterval = null
        }
      })

      await connection.start()
      console.log('[TradingView Datafeed] SignalR connected', getHubUrl())

      // 启动心跳
      pingInterval = setInterval(async () => {
        if (connection?.state === signalR.HubConnectionState.Connected) {
          try {
            await connection.invoke('Ping')
          } catch (e) {
            // 忽略
          }
        }
      }, 30000)
    } catch (e) {
      console.error('[TradingView Datafeed] SignalR connect error', e)
    }
  }

  const disconnect = async () => {
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
    if (connection) {
      await connection.stop()
      connection = null
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
      symbolInfo: { ticker?: string; name?: string },
      resolution: string,
      onTick: (bar: TVBar) => void,
      listenerGuid: string,
      onResetCacheNeededCallback: () => void
    ) {
      const symbol = symbolInfo.ticker || symbolInfo.name || ''
      subscribers.set(listenerGuid, {
        onTick,
        onResetCacheNeeded: onResetCacheNeededCallback,
        symbol,
        resolution,
      })
      connect().then(async () => {
        // 向后端订阅
        if (connection?.state === signalR.HubConnectionState.Connected) {
          try {
            await connection.invoke('Subscribe', symbol, resolution, listenerGuid)
          } catch (e) {
            console.warn('[TradingView Datafeed] Subscribe invoke failed:', e)
          }
        }
      })
    },

    unsubscribeBars(listenerGuid: string) {
      const sub = subscribers.get(listenerGuid)
      subscribers.delete(listenerGuid)
      
      // 向后端取消订阅
      if (connection?.state === signalR.HubConnectionState.Connected && sub) {
        connection.invoke('Unsubscribe', listenerGuid).catch((e) => {
          console.warn('[TradingView Datafeed] Unsubscribe invoke failed:', e)
        })
      }
      
      if (subscribers.size === 0) disconnect()
    },
  }
}

/**
 * 单例 SignalR 连接管理器，供 Lightweight Charts 等使用
 */
import type { ConnectionStatus } from '@/types/trading'

type StatusListener = (status: ConnectionStatus) => void
const statusListeners = new Set<StatusListener>()

function notifyStatus(status: ConnectionStatus) {
  statusListeners.forEach(fn => fn(status))
}

/** 注册连接状态变化监听器，返回取消函数 */
export function onConnectionStatusChange(listener: StatusListener): () => void {
  statusListeners.add(listener)
  return () => { statusListeners.delete(listener) }
}

/** 获取当前连接状态 */
export function getConnectionStatus(): ConnectionStatus {
  if (sharedConnection?.state === signalR.HubConnectionState.Connected) return 'connected'
  if (sharedConnection?.state === signalR.HubConnectionState.Reconnecting) return 'reconnecting'
  return 'disconnected'
}

let sharedConnection: signalR.HubConnection | null = null
let sharedConnectionPromise: Promise<void> | null = null
let sharedSubscribers = new Map<string, (bar: TVBar) => void>()
let sharedHeartbeat: ReturnType<typeof setInterval> | null = null

async function getSharedConnection(): Promise<signalR.HubConnection> {
  if (sharedConnection?.state === signalR.HubConnectionState.Connected) {
    return sharedConnection
  }

  // 如果正在连接中，等待连接完成
  if (sharedConnectionPromise) {
    await sharedConnectionPromise
    return sharedConnection!
  }

  // 创建新连接
  sharedConnection = new signalR.HubConnectionBuilder()
    .withUrl(getHubUrl(), {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Information)
    .build()

  // 监听连接成功
  sharedConnection.on('Connected', (data: { connectionId: string }) => {
    console.log('[TradingView SignalR] Connected:', data.connectionId)
  })

  // 监听 K线更新
  sharedConnection.on('BarUpdate', (data: BarUpdatePayload) => {
    const bar = normalizeBar(data.bar)
    sharedSubscribers.forEach((callback) => callback(bar))
  })

  // 监听 Pong
  sharedConnection.on('Pong', (data: { timestamp: number }) => {
    console.log('[TradingView SignalR] Pong:', data.timestamp)
  })

  sharedConnection.onreconnecting(() => {
    console.warn('[TradingView SignalR] reconnecting...')
    notifyStatus('reconnecting')
  })

  sharedConnection.onreconnected(async (connectionId) => {
    console.log('[TradingView SignalR] reconnected', connectionId)
    notifyStatus('connected')
    // 重连后重新订阅所有
    for (const [uid] of sharedSubscribers) {
      try {
        await sharedConnection?.invoke('Subscribe', '', '', uid)
      } catch (e) {
        console.warn('[TradingView SignalR] Resubscribe failed:', e)
      }
    }
  })

  sharedConnection.onclose(() => {
    console.log('[TradingView SignalR] closed')
    notifyStatus('disconnected')
    if (sharedHeartbeat) {
      clearInterval(sharedHeartbeat)
      sharedHeartbeat = null
    }
  })

  sharedConnectionPromise = sharedConnection.start().then(() => {
    console.log('[TradingView SignalR] connected', getHubUrl())
    notifyStatus('connected')
    // 启动心跳
    if (!sharedHeartbeat) {
      sharedHeartbeat = setInterval(async () => {
        if (sharedConnection?.state === signalR.HubConnectionState.Connected) {
          try {
            await sharedConnection.invoke('Ping')
          } catch (e) {
            // 忽略
          }
        }
      }, 30000)
    }
  })

  await sharedConnectionPromise
  sharedConnectionPromise = null
  return sharedConnection
}

/**
 * 订阅 SignalR K 线流，供 Lightweight Charts 等使用
 * @param symbol 交易对，如 "XAUUSD"
 * @param resolution 周期，如 "1" "5" "15" "60" "1D"
 * @param onBar K线更新回调
 * 返回取消订阅函数
 */
export function subscribeTradingViewWsBars(
  symbol: string,
  resolution: string,
  onBar: (bar: TVBar) => void
): () => void {
  const subscriberId = `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`
  
  sharedSubscribers.set(subscriberId, onBar)
  
  // 确保连接已建立，并订阅
  getSharedConnection()
    .then(async (conn) => {
      try {
        await conn.invoke('Subscribe', symbol, resolution, subscriberId)
        console.log(`[TradingView SignalR] Subscribed: ${symbol} ${resolution}`)
      } catch (e) {
        console.warn('[TradingView SignalR] Subscribe invoke failed:', e)
      }
    })
    .catch((e) => {
      console.error('[TradingView SignalR] connect error', e)
    })

  return () => {
    sharedSubscribers.delete(subscriberId)
    // 向后端取消订阅
    if (sharedConnection?.state === signalR.HubConnectionState.Connected) {
      sharedConnection.invoke('Unsubscribe', subscriberId).catch(() => {})
    }
  }
}

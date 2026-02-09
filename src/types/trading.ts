/** 开仓请求体 POST /api/clearing/open */
export interface OpenPositionRequest {
  userID: string
  symbol: string
  isLong: boolean
  leverage: number
  margin: number
}

/** 持仓对象 */
export interface Position {
  id: string
  symbol: string
  isLong: boolean
  leverage: number
  margin: number
  entryPrice: number
  notionalSize: number
  liquidationPrice: number
}

/** 开仓响应 */
export interface OpenPositionResponse {
  success: boolean
  message?: string
  positionId?: string
  position?: Position
}

/** 平仓响应 */
export interface ClosePositionResponse {
  success: boolean
  message?: string
}

/** TradingView UDF 历史数据响应 */
export interface UdfHistoryResponse {
  s: 'ok' | 'error' | 'no_data'
  t: number[]
  o: number[]
  h: number[]
  l: number[]
  c: number[]
  v: number[]
}

/** SignalR 连接状态 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'

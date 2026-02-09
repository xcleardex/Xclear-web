import type {
  OpenPositionRequest,
  OpenPositionResponse,
  ClosePositionResponse,
  Position,
  UdfHistoryResponse,
} from '@/types/trading'

/** 开仓 */
export async function openPosition(req: OpenPositionRequest): Promise<OpenPositionResponse> {
  const res = await fetch('/api/clearing/open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  return res.json()
}

/** 平仓 */
export async function closePosition(positionId: string): Promise<ClosePositionResponse> {
  const res = await fetch(`/api/clearing/close/${positionId}`, {
    method: 'DELETE',
  })
  return res.json()
}

/** 获取用户持仓列表 */
export async function getUserPositions(userId: string): Promise<Position[]> {
  const res = await fetch(`/api/clearing/positions/user/${encodeURIComponent(userId)}`)
  return res.json()
}

/** 加载历史 K 线数据（UDF 格式） */
export async function getUdfHistory(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<UdfHistoryResponse> {
  const params = new URLSearchParams({
    symbol,
    resolution,
    from: String(from),
    to: String(to),
  })
  const res = await fetch(`/api/udf/history?${params}`)
  return res.json()
}

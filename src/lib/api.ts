import type {
  OpenPositionRequest,
  OpenPositionResponse,
  ClosePositionResponse,
  Position,
  UdfHistoryResponse,
} from '@/types/trading'
import { authHeaders } from '@/lib/auth-api'

/** 开仓 */
export async function openPosition(req: OpenPositionRequest): Promise<OpenPositionResponse> {
  const res = await fetch('/api/clearing/open', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(req),
  })
  return res.json()
}

/** 平仓 */
export async function closePosition(positionId: string): Promise<ClosePositionResponse> {
  const res = await fetch(`/api/clearing/close/${positionId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return res.json()
}

/** 获取用户持仓列表 */
export async function getUserPositions(userId: string): Promise<Position[]> {
  const res = await fetch(`/api/clearing/positions/user/${encodeURIComponent(userId)}`, {
    headers: authHeaders(),
  })
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

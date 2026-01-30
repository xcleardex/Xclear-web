import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 生成 TradingView WebSocket 连接用的随机 id（与后端 hub 约定一致）
 * 返回约 22 位字母数字字符串，用于 ws url 的 query id
 */
export function generateTradingViewWsId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 22; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

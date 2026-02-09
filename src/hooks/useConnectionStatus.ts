import { useState, useEffect } from 'react'
import { getConnectionStatus, onConnectionStatusChange } from '@/lib/tradingview-ws-datafeed'
import type { ConnectionStatus } from '@/types/trading'

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(getConnectionStatus())

  useEffect(() => {
    const unsubscribe = onConnectionStatusChange(setStatus)
    setStatus(getConnectionStatus())
    return unsubscribe
  }, [])

  return status
}

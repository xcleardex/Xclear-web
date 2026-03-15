import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserPositions } from '@/lib/api'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'
import type { Position, ConnectionStatus } from '@/types/trading'

interface TradingContextValue {
  userId: string
  currentPrice: number
  setCurrentPrice: (p: number) => void
  positions: Position[]
  positionsLoading: boolean
  refreshPositions: () => Promise<void>
  connectionStatus: ConnectionStatus
}

const TradingContext = createContext<TradingContextValue | null>(null)

const DEMO_USER_ID = 'demo_user_001'

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const connectionStatus = useConnectionStatus()

  const userId = user?.id ?? DEMO_USER_ID

  const [currentPrice, setCurrentPrice] = useState(0)
  const [positions, setPositions] = useState<Position[]>([])
  const [positionsLoading, setPositionsLoading] = useState(false)

  const refreshPositions = useCallback(async () => {
    if (!userId) {
      setPositions([])
      return
    }
    setPositionsLoading(true)
    try {
      const result = await getUserPositions(userId)
      setPositions(result)
    } catch (e) {
      console.error('[TradingContext] Failed to load positions:', e)
    } finally {
      setPositionsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refreshPositions()
    const interval = setInterval(refreshPositions, 30000)
    return () => clearInterval(interval)
  }, [refreshPositions])

  return (
    <TradingContext.Provider value={{
      userId,
      currentPrice,
      setCurrentPrice,
      positions,
      positionsLoading,
      refreshPositions,
      connectionStatus,
    }}>
      {children}
    </TradingContext.Provider>
  )
}

export function useTradingContext(): TradingContextValue {
  const ctx = useContext(TradingContext)
  if (!ctx) throw new Error('useTradingContext must be used within TradingProvider')
  return ctx
}

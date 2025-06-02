// src/providers/graph-store-provider.tsx
'use client'

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from 'react'
import { useStore } from 'zustand'
import { createGraphStore, type GraphState } from '@/stores/graph-store'

type GraphStore = ReturnType<typeof createGraphStore>

const GraphStoreContext = createContext<GraphStore | null>(null)

export const GraphStoreProvider = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<GraphStore | null>(null)

  if (!storeRef.current) {
    storeRef.current = createGraphStore()
  }

  return (
    <GraphStoreContext.Provider value={storeRef.current}>
      {children}
    </GraphStoreContext.Provider>
  )
}

export const useGraphStore = <T,>(selector: (state: GraphState) => T): T => {
  const store = useContext(GraphStoreContext)
  if (!store) throw new Error('useGraphStore must be inside GraphStoreProvider')
  return useStore(store, selector)
}

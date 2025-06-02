// src/stores/graph-store.ts
import { createStore } from 'zustand/vanilla'

export type GraphState = {
  graphHtml: string
  setGraphHtml: (html: string) => void
}

export const createGraphStore = (initialState?: Partial<GraphState>) =>
  createStore<GraphState>((set) => ({
    graphHtml: '',
    setGraphHtml: (html) => set({ graphHtml: html }),
    ...initialState,
  }))

import { create } from 'zustand'
import type { GameState, GameConfig, GameAction, GameEvent } from '@/types/game'
import { createGameState, processAction } from '@/game/engine'

interface GameStore {
  // State
  game: GameState | null
  events: GameEvent[]
  error: string | null

  // Actions
  initGame: (config: GameConfig) => void
  dispatch: (action: GameAction) => void
  clearError: () => void
  clearEvents: () => void
}

const defaultConfig: GameConfig = {
  playerCount: 4,
  includeRedDora: true,
  playerNames: ['You', 'Hana', 'Kenji', 'Yuki'],
  aiDifficulties: ['easy', 'medium', 'hard'],
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  events: [],
  error: null,

  initGame: (config: GameConfig = defaultConfig) => {
    const game = createGameState(config)
    set({ game, events: [], error: null })
  },

  dispatch: (action: GameAction) => {
    const { game } = get()
    if (!game) {
      set({ error: 'Game not initialized' })
      return
    }

    const result = processAction(game, action)

    if (!result.success) {
      set({ error: result.error || 'Unknown error' })
      return
    }

    // Force re-render by creating new game reference
    set({
      game: { ...game },
      events: [...get().events, ...result.events],
      error: null,
    })
  },

  clearError: () => set({ error: null }),
  clearEvents: () => set({ events: [] }),
}))

// Selector hooks for common data
export const useCurrentPlayer = () =>
  useGameStore((state) =>
    state.game ? state.game.players[state.game.currentPlayerIndex] : null
  )

export const useHumanPlayer = () =>
  useGameStore((state) => (state.game ? state.game.players[0] : null))

export const useGamePhase = () =>
  useGameStore((state) => state.game?.phase ?? 'waiting')

export const useRemainingTiles = () =>
  useGameStore((state) => state.game?.wall.tiles.length ?? 0)

import { create } from 'zustand'
import type { GameState, GameConfig, GameAction, GameEvent } from '@/types/game'
import { createGameState, processAction } from '@/game/engine'
import {
  saveGame as persistSave,
  loadGame as persistLoad,
  clearSave as persistClear,
  hasSavedGame as persistHasSave,
  getSaveTimestamp,
} from './persistence'
import { useTutorialStore } from './tutorialStore'
import { validateTutorialAction, stepRequiresValidation } from '@/tutorial/validation'

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

  // Persistence
  saveGame: () => void
  loadGame: () => boolean
  clearSave: () => void
  hasSavedGame: () => boolean
  getSaveTime: () => string | null
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

    // Tutorial validation intercept
    const tutorialStore = useTutorialStore.getState()
    if (tutorialStore.isActive) {
      const currentStep = tutorialStore.getCurrentStep()
      if (currentStep && stepRequiresValidation(currentStep)) {
        const validation = validateTutorialAction(currentStep, action, game)
        if (!validation.valid) {
          // Show validation feedback without processing action
          tutorialStore.setFeedback(validation.message || 'Try again', 'error')
          return
        }
        // Valid action - will advance tutorial after processing
        // Process the action first, then notify tutorial
        const result = processAction(game, action)

        if (!result.success) {
          set({ error: result.error || 'Unknown error' })
          return
        }

        // Force re-render by creating new game reference
        const newGame = { ...game }
        set({
          game: newGame,
          events: [...get().events, ...result.events],
          error: null,
        })

        // Notify tutorial that action was completed
        tutorialStore.onActionCompleted(validation.message)
        return
      }
    }

    const result = processAction(game, action)

    if (!result.success) {
      set({ error: result.error || 'Unknown error' })
      return
    }

    // Force re-render by creating new game reference
    const newGame = { ...game }
    set({
      game: newGame,
      events: [...get().events, ...result.events],
      error: null,
    })

    // Auto-save after certain actions complete (skip during tutorial)
    const autoSaveActions = ['discard', 'skip_call', 'chi', 'pon', 'kan']
    if (autoSaveActions.includes(action.type) && newGame.phase === 'playing' && !tutorialStore.isActive) {
      persistSave(newGame)
    }
  },

  clearError: () => set({ error: null }),
  clearEvents: () => set({ events: [] }),

  // Persistence methods
  saveGame: () => {
    const { game } = get()
    if (game) {
      persistSave(game)
    }
  },

  loadGame: () => {
    const saveData = persistLoad()
    if (saveData) {
      set({ game: saveData.gameState, events: [], error: null })
      return true
    }
    return false
  },

  clearSave: () => {
    persistClear()
  },

  hasSavedGame: () => {
    return persistHasSave()
  },

  getSaveTime: () => {
    return getSaveTimestamp()
  },
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

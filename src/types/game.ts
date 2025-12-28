import type { Tile, WindValue } from './tiles'
import type { PlayerHand, FuritenState } from './hand'
import type { Meld } from './melds'
import type { Wall } from '@/game/tiles/wall'

export type GamePhase =
  | 'waiting' // Game not started
  | 'dealing' // Dealing initial hands
  | 'playing' // Normal gameplay
  | 'calling' // Waiting for call decisions after discard
  | 'kan' // Processing a kan
  | 'riichi' // Player declaring riichi
  | 'win' // Someone has won
  | 'draw' // Exhaustive draw

export type CallType = 'chi' | 'pon' | 'kan' | 'ron'

export interface PendingCall {
  type: CallType
  playerIndex: number
  tiles: Tile[] // Tiles from hand to use in the call
  targetTile: Tile // The tile being called
}

export interface Player {
  name: string
  hand: PlayerHand
  furiten: FuritenState
  score: number
  seatWind: WindValue
  isDealer: boolean
  isHuman: boolean
  aiPersonality?: string
  aiDifficulty?: 'easy' | 'medium' | 'hard'
}

export interface GameState {
  // Game configuration
  playerCount: 2 | 3 | 4
  includeRedDora: boolean

  // Round info
  roundWind: WindValue
  roundNumber: number // 1-4 within each wind
  honba: number // Repeat counter
  riichiSticks: number // Unclaimed riichi sticks on table

  // Game phase
  phase: GamePhase
  currentPlayerIndex: number
  turnNumber: number

  // Tile management
  wall: Wall
  lastDiscard: Tile | null
  lastDiscardPlayerIndex: number | null

  // Players
  players: Player[]

  // Pending actions
  pendingCalls: PendingCall[]
  pendingWinners: number[] // Player indices who can ron

  // Last drawn tile (for display purposes)
  lastDrawnTile: Tile | null

  // Win state
  winner: number | null
  winningTile: Tile | null
  isTsumo: boolean
}

export interface GameConfig {
  playerCount: 2 | 3 | 4
  includeRedDora: boolean
  playerNames: string[]
  aiDifficulties: Array<'easy' | 'medium' | 'hard'>
  aiPersonalities?: string[]
}

// Action types for game flow
export type GameAction =
  | { type: 'start_game' }
  | { type: 'draw' }
  | { type: 'discard'; tileId: string }
  | { type: 'chi'; tiles: [string, string] } // IDs of tiles from hand to use
  | { type: 'pon'; tiles: [string, string] }
  | { type: 'kan'; tiles: string[]; kanType: 'ankan' | 'daiminkan' | 'shouminkan' }
  | { type: 'riichi'; discardTileId: string }
  | { type: 'tsumo' }
  | { type: 'ron' }
  | { type: 'skip_call' }
  | { type: 'next_round' }

// Result of processing an action
export interface ActionResult {
  success: boolean
  error?: string
  stateChanged: boolean
  events: GameEvent[]
}

// Events that occur during gameplay (for animations/sounds)
export type GameEvent =
  | { type: 'tile_drawn'; playerIndex: number; tile: Tile }
  | { type: 'tile_discarded'; playerIndex: number; tile: Tile }
  | { type: 'meld_called'; playerIndex: number; meld: Meld; calledFrom: number }
  | { type: 'riichi_declared'; playerIndex: number }
  | { type: 'kan_declared'; playerIndex: number; kanType: string }
  | { type: 'tsumo'; playerIndex: number }
  | { type: 'ron'; winnerIndex: number; loserIndex: number }
  | { type: 'draw'; reason: string }
  | { type: 'round_end'; scores: number[] }

import type { Tile, TileDefinition, WindValue } from './tiles'
import type { Meld } from './melds'

export interface PlayerHand {
  tiles: Tile[] // Concealed tiles in hand (13-14)
  melds: Meld[] // Called melds
  discards: Tile[] // Tiles this player has discarded
  riichiTurn: number | null // Turn number when riichi was declared, or null
  riichiStick: boolean // Whether player has placed riichi stick
  ippatsu: boolean // Can still get ippatsu (first turn after riichi, no calls)
}

export interface HandAnalysis {
  shanten: number // Tiles away from tenpai (-1 = winning hand)
  waitingTiles: TileDefinition[] // Tiles that complete the hand (when tenpai)
  isTenpai: boolean
  isComplete: boolean
}

export interface WinningHand {
  tiles: Tile[]
  melds: Meld[]
  winningTile: Tile
  isTsumo: boolean // Self-draw vs ron
  seatWind: WindValue
  roundWind: WindValue
  isRiichi: boolean
  isDoubleRiichi: boolean
  isIppatsu: boolean
  isRinshan: boolean // Win on kan replacement
  isChankan: boolean // Win on opponent's added kan
  isHaitei: boolean // Last tile from wall
  isHoutei: boolean // Last discard
  doraCount: number
  uraDoraCount: number
  akadoraCount: number
}

// State for tracking furiten
export interface FuritenState {
  // Permanent furiten: discarded a winning tile
  permanent: boolean
  // Temporary furiten: passed on a ron opportunity this turn
  temporary: boolean
  // Riichi furiten: passed on a ron opportunity after riichi
  riichi: boolean
}

export function createEmptyHand(): PlayerHand {
  return {
    tiles: [],
    melds: [],
    discards: [],
    riichiTurn: null,
    riichiStick: false,
    ippatsu: false,
  }
}

export function createFuritenState(): FuritenState {
  return {
    permanent: false,
    temporary: false,
    riichi: false,
  }
}

export function isFuriten(state: FuritenState): boolean {
  return state.permanent || state.temporary || state.riichi
}

export function getTileCount(hand: PlayerHand): number {
  let count = hand.tiles.length
  for (const meld of hand.melds) {
    count += meld.tiles.length
  }
  return count
}

export function isOpen(hand: PlayerHand): boolean {
  return hand.melds.some((m) => m.isOpen)
}

export function isClosed(hand: PlayerHand): boolean {
  // A closed hand has no open melds
  // Closed kans (ankan) don't make the hand open
  return hand.melds.every((m) => !m.isOpen || m.type === 'kan' && m.kanType === 'ankan')
}

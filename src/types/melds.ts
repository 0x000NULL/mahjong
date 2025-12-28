import type { Tile } from './tiles'

// Types of melds (sets)
export type MeldType = 'chi' | 'pon' | 'kan'

// Kan subtypes
export type KanType =
  | 'ankan' // Closed kan (4 tiles in hand)
  | 'daiminkan' // Open kan (called from discard)
  | 'shouminkan' // Added kan (added to existing pon)

export interface Meld {
  type: MeldType
  tiles: Tile[]
  isOpen: boolean // Whether meld is visible to opponents
  calledFrom?: number // Player index the tile was called from (for open melds)
  kanType?: KanType // Only for kan melds
}

// A chi (sequence) - must be from the player to your left
export interface Chi extends Meld {
  type: 'chi'
  tiles: [Tile, Tile, Tile]
  isOpen: true
  calledFrom: number
}

// A pon (triplet) - can be from any player
export interface Pon extends Meld {
  type: 'pon'
  tiles: [Tile, Tile, Tile]
  isOpen: true
  calledFrom: number
}

// A kan (quad) - various types
export interface Kan extends Meld {
  type: 'kan'
  tiles: [Tile, Tile, Tile, Tile]
  kanType: KanType
}

export function isChi(meld: Meld): meld is Chi {
  return meld.type === 'chi'
}

export function isPon(meld: Meld): meld is Pon {
  return meld.type === 'pon'
}

export function isKan(meld: Meld): meld is Kan {
  return meld.type === 'kan'
}

export function isOpenMeld(meld: Meld): boolean {
  if (meld.type === 'kan') {
    return meld.kanType !== 'ankan'
  }
  return meld.isOpen
}

export function getMeldTileCount(meld: Meld): number {
  return meld.type === 'kan' ? 4 : 3
}

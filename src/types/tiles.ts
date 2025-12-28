// Mahjong tile type definitions

export type Suit = 'man' | 'pin' | 'sou'
export type Honor = 'wind' | 'dragon'
export type TileType = Suit | Honor

export type WindValue = 'east' | 'south' | 'west' | 'north'
export type DragonValue = 'white' | 'green' | 'red'
export type SuitValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type TileValue = SuitValue | WindValue | DragonValue

// Base tile definition (without instance ID)
export interface TileDefinition {
  type: TileType
  value: TileValue
  isRedDora?: boolean // Red five (aka-dora)
}

// Instance of a tile with unique ID for tracking
export interface Tile extends TileDefinition {
  id: string // Unique identifier for this specific tile instance
}

// Tile state during gameplay
export interface TileState {
  tile: Tile
  isDiscarded: boolean
  isInMeld: boolean
  isTsumoPick: boolean // Was this the tile just drawn
  discardedBy?: number // Player index who discarded
  turnDiscarded?: number // Which turn it was discarded
}

// Constants
export const SUIT_VALUES: readonly SuitValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
export const WIND_VALUES: readonly WindValue[] = ['east', 'south', 'west', 'north'] as const
export const DRAGON_VALUES: readonly DragonValue[] = ['white', 'green', 'red'] as const
export const SUITS: readonly Suit[] = ['man', 'pin', 'sou'] as const
export const HONORS: readonly Honor[] = ['wind', 'dragon'] as const

// Total tiles: 34 unique × 4 = 136 tiles
// Optionally 3 red fives (one per suit) = 136 tiles still (replace regular 5s)
export const TOTAL_TILES = 136
export const HAND_SIZE = 13
export const HAND_SIZE_WITH_DRAW = 14
export const DEAD_WALL_SIZE = 14
export const DORA_INDICATOR_COUNT = 5 // Max dora indicators visible

// Type guards
export function isSuit(type: TileType): type is Suit {
  return type === 'man' || type === 'pin' || type === 'sou'
}

export function isHonor(type: TileType): type is Honor {
  return type === 'wind' || type === 'dragon'
}

export function isSuitValue(value: TileValue): value is SuitValue {
  return typeof value === 'number' && value >= 1 && value <= 9
}

export function isWindValue(value: TileValue): value is WindValue {
  return WIND_VALUES.includes(value as WindValue)
}

export function isDragonValue(value: TileValue): value is DragonValue {
  return DRAGON_VALUES.includes(value as DragonValue)
}

export function isTerminal(tile: TileDefinition): boolean {
  return isSuit(tile.type) && (tile.value === 1 || tile.value === 9)
}

export function isSimple(tile: TileDefinition): boolean {
  if (!isSuit(tile.type) || !isSuitValue(tile.value)) return false
  return tile.value >= 2 && tile.value <= 8
}

export function isTerminalOrHonor(tile: TileDefinition): boolean {
  return isHonor(tile.type) || isTerminal(tile)
}

export function isGreen(tile: TileDefinition): boolean {
  // Green tiles: 2,3,4,6,8 sou and green dragon
  if (tile.type === 'dragon' && tile.value === 'green') return true
  if (tile.type === 'sou' && isSuitValue(tile.value)) {
    return [2, 3, 4, 6, 8].includes(tile.value)
  }
  return false
}

import type {
  Tile,
  TileDefinition,
  TileType,
  TileValue,
  Suit,
  SuitValue,
  WindValue,
  DragonValue,
} from '@/types/tiles'
import {
  SUITS,
  SUIT_VALUES,
  WIND_VALUES,
  DRAGON_VALUES,
  isSuit,
  isSuitValue,
  isWindValue,
} from '@/types/tiles'

let tileIdCounter = 0

/**
 * Creates a unique tile instance
 */
export function createTile(
  type: TileType,
  value: TileValue,
  isRedDora = false
): Tile {
  return {
    id: `tile_${++tileIdCounter}`,
    type,
    value,
    isRedDora,
  }
}

/**
 * Creates all 136 tiles for a standard Riichi Mahjong game
 * @param includeRedDora - If true, includes 3 red fives (one per suit)
 */
export function createFullTileSet(includeRedDora = true): Tile[] {
  const tiles: Tile[] = []

  // Create suited tiles (3 suits × 9 values × 4 copies = 108 tiles)
  for (const suit of SUITS) {
    for (const value of SUIT_VALUES) {
      for (let copy = 0; copy < 4; copy++) {
        // For red dora: one copy of 5 in each suit is red
        const isRedDora = includeRedDora && value === 5 && copy === 0
        tiles.push(createTile(suit, value, isRedDora))
      }
    }
  }

  // Create wind tiles (4 winds × 4 copies = 16 tiles)
  for (const wind of WIND_VALUES) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push(createTile('wind', wind))
    }
  }

  // Create dragon tiles (3 dragons × 4 copies = 12 tiles)
  for (const dragon of DRAGON_VALUES) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push(createTile('dragon', dragon))
    }
  }

  return tiles
}

/**
 * Fisher-Yates shuffle
 */
export function shuffleTiles(tiles: Tile[]): Tile[] {
  const shuffled = [...tiles]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Compare two tiles for equality (same type and value, ignoring ID)
 */
export function tilesEqual(a: TileDefinition, b: TileDefinition): boolean {
  return a.type === b.type && a.value === b.value
}

/**
 * Compare two tiles for sorting
 * Order: man < pin < sou < wind < dragon
 * Within suits: 1-9
 * Winds: east < south < west < north
 * Dragons: white < green < red
 */
export function compareTiles(a: TileDefinition, b: TileDefinition): number {
  const typeOrder: Record<TileType, number> = {
    man: 0,
    pin: 1,
    sou: 2,
    wind: 3,
    dragon: 4,
  }

  if (a.type !== b.type) {
    return typeOrder[a.type] - typeOrder[b.type]
  }

  // Same type, compare values
  if (isSuit(a.type) && isSuitValue(a.value) && isSuitValue(b.value)) {
    return a.value - b.value
  }

  if (isWindValue(a.value) && isWindValue(b.value)) {
    return WIND_VALUES.indexOf(a.value) - WIND_VALUES.indexOf(b.value)
  }

  // Dragons
  const dragonOrder: Record<DragonValue, number> = { white: 0, green: 1, red: 2 }
  return dragonOrder[a.value as DragonValue] - dragonOrder[b.value as DragonValue]
}

/**
 * Sort tiles in standard display order
 */
export function sortTiles<T extends TileDefinition>(tiles: T[]): T[] {
  return [...tiles].sort(compareTiles)
}

/**
 * Get the dora tile from a dora indicator
 * The dora is the next tile in sequence
 */
export function getDoraFromIndicator(indicator: TileDefinition): TileDefinition {
  if (isSuit(indicator.type) && isSuitValue(indicator.value)) {
    // 9 wraps to 1
    const nextValue = (indicator.value % 9) + 1
    return { type: indicator.type, value: nextValue as SuitValue }
  }

  if (indicator.type === 'wind' && isWindValue(indicator.value)) {
    // East -> South -> West -> North -> East
    const idx = WIND_VALUES.indexOf(indicator.value)
    const nextIdx = (idx + 1) % 4
    return { type: 'wind', value: WIND_VALUES[nextIdx] }
  }

  // Dragons: White -> Green -> Red -> White
  const dragonOrder: DragonValue[] = ['white', 'green', 'red']
  const idx = dragonOrder.indexOf(indicator.value as DragonValue)
  const nextIdx = (idx + 1) % 3
  return { type: 'dragon', value: dragonOrder[nextIdx] }
}

/**
 * Count how many dora a hand contains
 */
export function countDora(
  hand: TileDefinition[],
  doraIndicators: TileDefinition[]
): number {
  let count = 0
  const doraTiles = doraIndicators.map(getDoraFromIndicator)

  for (const tile of hand) {
    for (const dora of doraTiles) {
      if (tilesEqual(tile, dora)) {
        count++
      }
    }
    // Red dora count as additional dora
    if (tile.isRedDora) {
      count++
    }
  }

  return count
}

/**
 * Get a readable string representation of a tile
 */
export function tileToString(tile: TileDefinition): string {
  if (isSuit(tile.type)) {
    const suitChar = { man: 'm', pin: 'p', sou: 's' }[tile.type]
    const redMarker = tile.isRedDora ? 'r' : ''
    return `${redMarker}${tile.value}${suitChar}`
  }

  if (tile.type === 'wind') {
    return { east: 'E', south: 'S', west: 'W', north: 'N' }[tile.value as WindValue]
  }

  return { white: 'Wh', green: 'Gr', red: 'Rd' }[tile.value as DragonValue]
}

/**
 * Parse a string notation back to a tile definition
 * Examples: "1m", "r5p", "E", "Wh"
 */
export function parseTileString(str: string): TileDefinition | null {
  str = str.trim()

  // Check for honor tiles first
  const windMap: Record<string, WindValue> = { E: 'east', S: 'south', W: 'west', N: 'north' }
  if (windMap[str]) {
    return { type: 'wind', value: windMap[str] }
  }

  const dragonMap: Record<string, DragonValue> = { Wh: 'white', Gr: 'green', Rd: 'red' }
  if (dragonMap[str]) {
    return { type: 'dragon', value: dragonMap[str] }
  }

  // Parse suited tiles
  const match = str.match(/^(r)?([1-9])([mps])$/)
  if (match) {
    const isRedDora = match[1] === 'r'
    const value = parseInt(match[2], 10) as SuitValue
    const suitMap: Record<string, Suit> = { m: 'man', p: 'pin', s: 'sou' }
    const type = suitMap[match[3]]

    if (isRedDora && value !== 5) return null // Only 5 can be red

    return { type, value, isRedDora }
  }

  return null
}

/**
 * Group tiles by type and value for counting
 */
export function groupTiles(tiles: TileDefinition[]): Map<string, number> {
  const groups = new Map<string, number>()

  for (const tile of tiles) {
    const key = `${tile.type}:${tile.value}`
    groups.set(key, (groups.get(key) || 0) + 1)
  }

  return groups
}

/**
 * Check if a tile can form a sequence with other tiles
 */
export function canFormSequence(tile: TileDefinition): boolean {
  return isSuit(tile.type)
}

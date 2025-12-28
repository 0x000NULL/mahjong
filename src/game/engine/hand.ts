import type { Tile, TileDefinition, SuitValue } from '@/types/tiles'
import type { PlayerHand, HandAnalysis } from '@/types/hand'
import { isSuit, isSuitValue } from '@/types/tiles'
import { tilesEqual, sortTiles, compareTiles } from '@/game/tiles'

/**
 * Add a tile to hand and sort
 */
export function addTileToHand(hand: PlayerHand, tile: Tile): void {
  hand.tiles.push(tile)
  hand.tiles.sort(compareTiles)
}

/**
 * Remove a specific tile from hand by ID
 */
export function removeTileFromHand(hand: PlayerHand, tileId: string): Tile | null {
  const index = hand.tiles.findIndex((t) => t.id === tileId)
  if (index === -1) return null
  return hand.tiles.splice(index, 1)[0]
}

/**
 * Remove a tile matching the definition (uses first match)
 */
export function removeTileByDefinition(hand: PlayerHand, tile: TileDefinition): Tile | null {
  const index = hand.tiles.findIndex((t) => tilesEqual(t, tile))
  if (index === -1) return null
  return hand.tiles.splice(index, 1)[0]
}

/**
 * Check if hand contains a specific tile definition
 */
export function handContains(hand: PlayerHand, tile: TileDefinition): boolean {
  return hand.tiles.some((t) => tilesEqual(t, tile))
}

/**
 * Count how many of a tile definition are in hand
 */
export function countInHand(hand: PlayerHand, tile: TileDefinition): number {
  return hand.tiles.filter((t) => tilesEqual(t, tile)).length
}

/**
 * Get all tiles (hand + melds) for analysis
 */
export function getAllTiles(hand: PlayerHand): Tile[] {
  const tiles = [...hand.tiles]
  for (const meld of hand.melds) {
    tiles.push(...meld.tiles)
  }
  return tiles
}

/**
 * Calculate shanten (tiles away from tenpai)
 * Uses a simplified algorithm for now
 * Returns -1 for a complete hand
 */
export function calculateShanten(tiles: TileDefinition[]): number {
  // Group tiles by type:value
  const groups = new Map<string, number>()
  for (const tile of tiles) {
    const key = `${tile.type}:${tile.value}`
    groups.set(key, (groups.get(key) || 0) + 1)
  }

  // Try standard form (4 melds + 1 pair)
  const standardShanten = calculateStandardShanten(tiles)

  // Try chiitotsu (7 pairs)
  const chiitoitsuShanten = calculateChiitoitsuShanten(groups)

  // Try kokushi (13 orphans)
  const kokushiShanten = calculateKokushiShanten(tiles)

  return Math.min(standardShanten, chiitoitsuShanten, kokushiShanten)
}

/**
 * Calculate shanten for standard hand form (4 melds + 1 pair)
 * This is a simplified version - full algorithm is more complex
 */
function calculateStandardShanten(tiles: TileDefinition[]): number {
  const sorted = sortTiles(tiles)
  let minShanten = 8 // Maximum possible shanten

  // Try each tile as the pair
  const tried = new Set<string>()

  for (let i = 0; i < sorted.length; i++) {
    const tile = sorted[i]
    const key = `${tile.type}:${tile.value}`
    if (tried.has(key)) continue
    tried.add(key)

    // Check if we can form a pair with this tile
    const count = sorted.filter((t) => tilesEqual(t, tile)).length
    if (count >= 2) {
      // Remove pair and count melds/taatsu in remaining
      const remaining = [...sorted]
      removeMatching(remaining, tile, 2)
      const { melds, taatsu } = countMeldsAndTaatsu(remaining)
      const shanten = 8 - 2 * melds - taatsu - 1 // -1 for having pair
      minShanten = Math.min(minShanten, shanten)
    }
  }

  // Also try without pair
  const { melds, taatsu } = countMeldsAndTaatsu(sorted)
  const shantenNoPair = 8 - 2 * melds - taatsu
  minShanten = Math.min(minShanten, shantenNoPair)

  return Math.max(-1, minShanten)
}

function removeMatching(tiles: TileDefinition[], target: TileDefinition, count: number): void {
  let removed = 0
  for (let i = tiles.length - 1; i >= 0 && removed < count; i--) {
    if (tilesEqual(tiles[i], target)) {
      tiles.splice(i, 1)
      removed++
    }
  }
}

function countMeldsAndTaatsu(tiles: TileDefinition[]): { melds: number; taatsu: number } {
  const remaining = [...tiles]
  let melds = 0
  let taatsu = 0

  // First extract triplets
  const groups = new Map<string, number>()
  for (const tile of remaining) {
    const key = `${tile.type}:${tile.value}`
    groups.set(key, (groups.get(key) || 0) + 1)
  }

  for (const [key, count] of groups) {
    if (count >= 3) {
      melds++
      const [type, value] = key.split(':')
      removeMatching(remaining, { type: type as TileDefinition['type'], value: parseValue(value) }, 3)
      groups.set(key, count - 3)
    }
  }

  // Then extract sequences (suited tiles only)
  remaining.sort(compareTiles)
  for (let i = 0; i < remaining.length - 2; i++) {
    const t1 = remaining[i]
    if (!isSuit(t1.type) || !isSuitValue(t1.value)) continue

    const t2Value = (t1.value + 1) as SuitValue
    const t3Value = (t1.value + 2) as SuitValue
    if (t2Value > 9 || t3Value > 9) continue

    const t2Idx = remaining.findIndex(
      (t, idx) => idx > i && t.type === t1.type && t.value === t2Value
    )
    if (t2Idx === -1) continue

    const t3Idx = remaining.findIndex(
      (t, idx) => idx > t2Idx && t.type === t1.type && t.value === t3Value
    )
    if (t3Idx === -1) continue

    melds++
    remaining.splice(t3Idx, 1)
    remaining.splice(t2Idx, 1)
    remaining.splice(i, 1)
    i-- // Recheck this position
  }

  // Count taatsu (pairs and partial sequences)
  const remainingGroups = new Map<string, number>()
  for (const tile of remaining) {
    const key = `${tile.type}:${tile.value}`
    remainingGroups.set(key, (remainingGroups.get(key) || 0) + 1)
  }

  // Pairs
  for (const count of remainingGroups.values()) {
    if (count >= 2) taatsu++
  }

  // Partial sequences (ryanmen, kanchan, penchan)
  for (let i = 0; i < remaining.length - 1; i++) {
    const t1 = remaining[i]
    if (!isSuit(t1.type) || !isSuitValue(t1.value)) continue

    for (let gap = 1; gap <= 2; gap++) {
      const t2Value = (t1.value + gap) as SuitValue
      if (t2Value > 9) continue

      const t2Idx = remaining.findIndex(
        (t, idx) => idx > i && t.type === t1.type && t.value === t2Value
      )
      if (t2Idx !== -1) {
        taatsu++
        remaining.splice(t2Idx, 1)
        remaining.splice(i, 1)
        i--
        break
      }
    }
  }

  // Cap taatsu (can only use 4 - melds taatsu at most)
  taatsu = Math.min(taatsu, 4 - melds)

  return { melds, taatsu }
}

function parseValue(str: string): TileDefinition['value'] {
  const num = parseInt(str, 10)
  if (!isNaN(num)) return num as SuitValue
  return str as TileDefinition['value']
}

/**
 * Calculate shanten for chiitotsu (7 pairs)
 */
function calculateChiitoitsuShanten(groups: Map<string, number>): number {
  let pairs = 0
  let singles = 0

  for (const count of groups.values()) {
    if (count >= 2) pairs++
    else if (count === 1) singles++
  }

  // Need 7 pairs, shanten = 6 - pairs + max(0, 7 - pairs - singles)
  // But simplified: shanten = 6 - pairs
  return 6 - pairs
}

/**
 * Calculate shanten for kokushi (13 orphans)
 */
function calculateKokushiShanten(tiles: TileDefinition[]): number {
  const terminalHonors = new Set<string>()
  let hasPair = false

  const targetTiles = [
    { type: 'man', value: 1 },
    { type: 'man', value: 9 },
    { type: 'pin', value: 1 },
    { type: 'pin', value: 9 },
    { type: 'sou', value: 1 },
    { type: 'sou', value: 9 },
    { type: 'wind', value: 'east' },
    { type: 'wind', value: 'south' },
    { type: 'wind', value: 'west' },
    { type: 'wind', value: 'north' },
    { type: 'dragon', value: 'white' },
    { type: 'dragon', value: 'green' },
    { type: 'dragon', value: 'red' },
  ] as TileDefinition[]

  for (const target of targetTiles) {
    const count = tiles.filter((t) => tilesEqual(t, target)).length
    if (count >= 1) {
      terminalHonors.add(`${target.type}:${target.value}`)
    }
    if (count >= 2) {
      hasPair = true
    }
  }

  // Shanten = 13 - unique terminals/honors - (has pair ? 1 : 0)
  return 13 - terminalHonors.size - (hasPair ? 1 : 0)
}

/**
 * Get waiting tiles when in tenpai
 */
export function getWaitingTiles(tiles: TileDefinition[]): TileDefinition[] {
  const waits: TileDefinition[] = []
  const shanten = calculateShanten(tiles)

  if (shanten !== 0) return waits // Not in tenpai

  // Try adding each possible tile and check if it completes the hand
  const allPossibleTiles = generateAllTileDefinitions()

  for (const testTile of allPossibleTiles) {
    const testHand = [...tiles, testTile]
    if (calculateShanten(testHand) === -1) {
      waits.push(testTile)
    }
  }

  return waits
}

function generateAllTileDefinitions(): TileDefinition[] {
  const tiles: TileDefinition[] = []

  // Suited tiles
  for (const type of ['man', 'pin', 'sou'] as const) {
    for (let value = 1; value <= 9; value++) {
      tiles.push({ type, value: value as SuitValue })
    }
  }

  // Winds
  for (const value of ['east', 'south', 'west', 'north'] as const) {
    tiles.push({ type: 'wind', value })
  }

  // Dragons
  for (const value of ['white', 'green', 'red'] as const) {
    tiles.push({ type: 'dragon', value })
  }

  return tiles
}

/**
 * Analyze the current state of a hand
 */
export function analyzeHand(hand: PlayerHand): HandAnalysis {
  const tiles = hand.tiles.map((t) => ({ type: t.type, value: t.value }))
  const shanten = calculateShanten(tiles)

  return {
    shanten,
    waitingTiles: shanten === 0 ? getWaitingTiles(tiles) : [],
    isTenpai: shanten === 0,
    isComplete: shanten === -1,
  }
}

/**
 * Check if discarding a specific tile is valid
 */
export function canDiscard(hand: PlayerHand, tile: Tile): boolean {
  return hand.tiles.some((t) => t.id === tile.id)
}

/**
 * Check if the hand is in tenpai
 */
export function isTenpai(hand: PlayerHand): boolean {
  const tiles = hand.tiles.map((t) => ({ type: t.type, value: t.value }))
  return calculateShanten(tiles) === 0
}

/**
 * Check if the hand is complete (has won)
 */
export function isCompleteHand(hand: PlayerHand): boolean {
  const tiles = hand.tiles.map((t) => ({ type: t.type, value: t.value }))
  return calculateShanten(tiles) === -1
}

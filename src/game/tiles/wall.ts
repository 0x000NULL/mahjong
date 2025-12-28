import type { Tile } from '@/types/tiles'
import { DEAD_WALL_SIZE, DORA_INDICATOR_COUNT } from '@/types/tiles'
import { createFullTileSet, shuffleTiles } from './index'

export interface Wall {
  // Main drawable wall
  tiles: Tile[]
  // Dead wall (14 tiles: 4 kan replacement tiles + 5 dora indicators + 5 ura-dora)
  deadWall: Tile[]
  // Track revealed dora indicators (starts with 1, increases with kan)
  revealedDoraCount: number
}

/**
 * Creates and shuffles a new wall for a game
 */
export function createWall(includeRedDora = true): Wall {
  const allTiles = shuffleTiles(createFullTileSet(includeRedDora))

  // Last 14 tiles become the dead wall
  const deadWall = allTiles.splice(-DEAD_WALL_SIZE)

  return {
    tiles: allTiles,
    deadWall,
    revealedDoraCount: 1, // First dora indicator is revealed at start
  }
}

/**
 * Draw a tile from the wall
 * Returns null if wall is exhausted
 */
export function drawFromWall(wall: Wall): Tile | null {
  if (wall.tiles.length === 0) {
    return null
  }
  return wall.tiles.shift()!
}

/**
 * Draw a replacement tile for kan from the dead wall
 * Returns null if no more kan draws available
 */
export function drawKanReplacement(wall: Wall): Tile | null {
  // Kan replacement tiles are drawn from the end of dead wall
  // We use indices 0-3 for kan replacements
  const kanReplacementIndex = 4 - wall.revealedDoraCount
  if (kanReplacementIndex < 0) {
    return null // No more kan replacement tiles
  }

  const tile = wall.deadWall[kanReplacementIndex]
  // Mark as used (we don't actually remove, just track)
  return tile
}

/**
 * Get the currently visible dora indicators
 */
export function getDoraIndicators(wall: Wall): Tile[] {
  // Dora indicators are at indices 4, 6, 8, 10, 12 in dead wall
  // (alternating with ura-dora at 5, 7, 9, 11, 13)
  const indicators: Tile[] = []
  for (let i = 0; i < wall.revealedDoraCount && i < DORA_INDICATOR_COUNT; i++) {
    const index = 4 + i * 2
    if (index < wall.deadWall.length) {
      indicators.push(wall.deadWall[index])
    }
  }
  return indicators
}

/**
 * Get the ura-dora indicators (revealed after riichi win)
 */
export function getUraDoraIndicators(wall: Wall): Tile[] {
  // Ura-dora are at indices 5, 7, 9, 11, 13 in dead wall
  const indicators: Tile[] = []
  for (let i = 0; i < wall.revealedDoraCount && i < DORA_INDICATOR_COUNT; i++) {
    const index = 5 + i * 2
    if (index < wall.deadWall.length) {
      indicators.push(wall.deadWall[index])
    }
  }
  return indicators
}

/**
 * Reveal a new dora indicator (called after kan)
 */
export function revealNewDora(wall: Wall): void {
  if (wall.revealedDoraCount < DORA_INDICATOR_COUNT) {
    wall.revealedDoraCount++
  }
}

/**
 * Get remaining drawable tiles count
 */
export function getRemainingTiles(wall: Wall): number {
  return wall.tiles.length
}

/**
 * Check if the wall is exhausted (game ends in draw)
 */
export function isWallExhausted(wall: Wall): boolean {
  return wall.tiles.length === 0
}

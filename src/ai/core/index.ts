import type { GameState, GameAction } from '@/types/game'
import type { Player } from '@/types/game'
import type { Tile } from '@/types/tiles'
import { isCompleteHand } from '@/game/engine/hand'

export interface AIDecision {
  action: GameAction
  reasoning?: string
}

/**
 * Base AI that makes decisions for a player
 */
export function getAIDecision(
  state: GameState,
  playerIndex: number
): AIDecision | null {
  const player = state.players[playerIndex]

  // If it's not this player's turn during playing phase, no action needed
  if (state.phase !== 'playing' || state.currentPlayerIndex !== playerIndex) {
    return null
  }

  // Check for tsumo (winning by self-draw)
  if (isCompleteHand(player.hand)) {
    return {
      action: { type: 'tsumo' },
      reasoning: 'Complete hand - declaring tsumo',
    }
  }

  // Otherwise, discard a tile
  const tileToDiscard = selectDiscard(player, state)

  return {
    action: { type: 'discard', tileId: tileToDiscard.id },
    reasoning: `Discarding ${tileToDiscard.type} ${tileToDiscard.value}`,
  }
}

/**
 * Select which tile to discard
 * Simple AI: discard most "useless" tile
 */
function selectDiscard(player: Player, _state: GameState): Tile {
  const hand = player.hand.tiles
  const difficulty = player.aiDifficulty || 'easy'

  if (difficulty === 'easy') {
    // Random discard
    const randomIndex = Math.floor(Math.random() * hand.length)
    return hand[randomIndex]
  }

  // For medium/hard, try to find isolated tiles to discard

  // Simple heuristic: prefer discarding isolated honor tiles or terminals
  const isolatedTiles = hand.filter((tile) => {
    const sameType = hand.filter((t) => t.type === tile.type)
    if (tile.type === 'wind' || tile.type === 'dragon') {
      // Honors: isolated if only 1 copy
      return sameType.filter((t) => t.value === tile.value).length === 1
    }
    // Suits: check for no adjacent tiles
    if (typeof tile.value === 'number') {
      const tileVal = tile.value
      const hasAdjacent = sameType.some((t) => {
        const v = t.value as number
        return Math.abs(v - tileVal) <= 1 && t.id !== tile.id
      })
      return !hasAdjacent
    }
    return false
  })

  if (isolatedTiles.length > 0) {
    // Prefer isolated honors > isolated terminals > isolated simples
    const isolatedHonors = isolatedTiles.filter(
      (t) => t.type === 'wind' || t.type === 'dragon'
    )
    if (isolatedHonors.length > 0) {
      return isolatedHonors[Math.floor(Math.random() * isolatedHonors.length)]
    }

    const isolatedTerminals = isolatedTiles.filter(
      (t) => typeof t.value === 'number' && (t.value === 1 || t.value === 9)
    )
    if (isolatedTerminals.length > 0) {
      return isolatedTerminals[Math.floor(Math.random() * isolatedTerminals.length)]
    }

    return isolatedTiles[Math.floor(Math.random() * isolatedTiles.length)]
  }

  // Fallback: random
  return hand[Math.floor(Math.random() * hand.length)]
}

/**
 * Check if AI should make a call (chi/pon/kan/ron)
 */
export function getAICallDecision(
  state: GameState,
  playerIndex: number
): AIDecision | null {
  if (state.phase !== 'calling') {
    return null
  }

  const player = state.players[playerIndex]
  const pendingCalls = state.pendingCalls.filter((c) => c.playerIndex === playerIndex)

  if (pendingCalls.length === 0) {
    return null
  }

  // Check for ron first (highest priority)
  const ronCall = pendingCalls.find((c) => c.type === 'ron')
  if (ronCall && !player.furiten.permanent && !player.furiten.riichi) {
    return {
      action: { type: 'ron' },
      reasoning: 'Can win with ron',
    }
  }

  // For other calls, decide based on difficulty
  const difficulty = player.aiDifficulty || 'easy'

  if (difficulty === 'easy') {
    // Easy AI rarely calls (10% chance)
    if (Math.random() > 0.1) {
      return {
        action: { type: 'skip_call' },
        reasoning: 'Skipping call opportunity',
      }
    }
  }

  // Medium/Hard: consider if call improves hand
  // For now, just skip most calls to keep hands closed
  return {
    action: { type: 'skip_call' },
    reasoning: 'Keeping hand closed',
  }
}

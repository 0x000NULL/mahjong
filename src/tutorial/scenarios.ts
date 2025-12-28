/**
 * Tutorial Scenarios
 * Pre-built game states for interactive tutorial steps
 */

import type { TileDefinition } from '@/types/tiles'

export interface TutorialScenarioConfig {
  id: string
  description: string
  // Player's hand tiles (13 tiles)
  playerHand: TileDefinition[]
  // Tile the player just drew (optional - makes it 14 tiles)
  drawnTile?: TileDefinition
  // Expected action from the player
  expectedAction: 'discard' | 'chi' | 'pon' | 'ron' | 'tsumo'
}

/**
 * Scenario for the first discard practice
 * Simple hand with an obvious discard choice
 */
const PRACTICE_DISCARD: TutorialScenarioConfig = {
  id: 'practice-discard',
  description: 'Practice discarding a tile',
  playerHand: [
    // A semi-organized hand with 13 tiles
    { type: 'man', value: 1 },
    { type: 'man', value: 2 },
    { type: 'man', value: 3 },
    { type: 'pin', value: 4 },
    { type: 'pin', value: 5 },
    { type: 'pin', value: 6 },
    { type: 'sou', value: 2 },
    { type: 'sou', value: 3 },
    { type: 'sou', value: 4 },
    { type: 'sou', value: 7 },
    { type: 'sou', value: 7 },
    { type: 'wind', value: 'east' },
    { type: 'dragon', value: 'white' },
  ],
  // Give them a random tile to discard
  drawnTile: { type: 'wind', value: 'north' },
  expectedAction: 'discard',
}

/**
 * All available tutorial scenarios
 */
export const TUTORIAL_SCENARIOS: Record<string, TutorialScenarioConfig> = {
  'practice-discard': PRACTICE_DISCARD,
}

/**
 * Get a scenario by ID
 */
export function getScenarioById(scenarioId: string): TutorialScenarioConfig | undefined {
  return TUTORIAL_SCENARIOS[scenarioId]
}

/**
 * Check if a scenario exists
 */
export function hasScenario(scenarioId: string): boolean {
  return scenarioId in TUTORIAL_SCENARIOS
}

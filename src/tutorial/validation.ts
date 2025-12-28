/**
 * Tutorial Action Validation
 * Validates player actions during interactive tutorial steps
 */

import type { GameAction, GameState } from '@/types/game'
import type { TutorialStep, TutorialActionValidation } from './steps'

export interface ValidationResult {
  valid: boolean
  message?: string
}

/**
 * Validates a game action against the current tutorial step requirements
 */
export function validateTutorialAction(
  step: TutorialStep,
  action: GameAction,
  gameState: GameState
): ValidationResult {
  // No validation required for 'next' action type or steps without actionType
  if (!step.actionType || step.actionType === 'next' || step.actionType === 'acknowledge') {
    return { valid: true }
  }

  const validation = step.actionValidation

  switch (step.actionType) {
    case 'discard':
      return validateDiscard(action, gameState, validation)

    case 'discard_any':
      return validateDiscardAny(action, validation)

    case 'call_chi':
      return validateChi(action, validation)

    case 'call_pon':
      return validatePon(action, validation)

    case 'call_ron':
      return validateRon(action, validation)

    case 'call_tsumo':
      return validateTsumo(action, validation)

    case 'skip_call':
      return validateSkip(action, validation)

    default:
      return { valid: true }
  }
}

/**
 * Validates a discard action with specific tile requirements
 */
function validateDiscard(
  action: GameAction,
  gameState: GameState,
  validation?: TutorialActionValidation
): ValidationResult {
  if (action.type !== 'discard') {
    return {
      valid: false,
      message: validation?.hintMessage || 'Please discard a tile to continue.',
    }
  }

  // If no specific validation, any discard is valid
  if (!validation || validation.anyTile) {
    return { valid: true, message: validation?.successMessage }
  }

  // Find the tile being discarded
  const player = gameState.players[0]
  const tile = player.hand.tiles.find((t) => t.id === action.tileId)

  if (!tile) {
    return { valid: false, message: 'Tile not found.' }
  }

  // Check tile type requirement
  if (validation.requiredTileType && tile.type !== validation.requiredTileType) {
    return {
      valid: false,
      message: validation.failureMessage || `Please discard a ${validation.requiredTileType} tile.`,
    }
  }

  // Check tile value requirement
  if (validation.requiredTileValue !== undefined) {
    const valueMatches =
      typeof validation.requiredTileValue === 'number'
        ? tile.value === validation.requiredTileValue
        : String(tile.value) === validation.requiredTileValue

    if (!valueMatches) {
      return {
        valid: false,
        message: validation.failureMessage || 'Please discard the indicated tile.',
      }
    }
  }

  return { valid: true, message: validation.successMessage }
}

/**
 * Validates a discard action allowing any tile
 */
function validateDiscardAny(
  action: GameAction,
  validation?: TutorialActionValidation
): ValidationResult {
  if (action.type !== 'discard') {
    return {
      valid: false,
      message: validation?.hintMessage || 'Please discard a tile to continue.',
    }
  }

  return { valid: true, message: validation?.successMessage }
}

/**
 * Validates a chi call action
 */
function validateChi(action: GameAction, validation?: TutorialActionValidation): ValidationResult {
  if (action.type !== 'chi') {
    return {
      valid: false,
      message: validation?.hintMessage || 'Please call Chi to continue.',
    }
  }

  return { valid: true, message: validation?.successMessage }
}

/**
 * Validates a pon call action
 */
function validatePon(action: GameAction, validation?: TutorialActionValidation): ValidationResult {
  if (action.type !== 'pon') {
    return {
      valid: false,
      message: validation?.hintMessage || 'Please call Pon to continue.',
    }
  }

  return { valid: true, message: validation?.successMessage }
}

/**
 * Validates a ron call action
 */
function validateRon(action: GameAction, validation?: TutorialActionValidation): ValidationResult {
  if (action.type !== 'ron') {
    return {
      valid: false,
      message: validation?.hintMessage || 'Please call Ron to win.',
    }
  }

  return { valid: true, message: validation?.successMessage }
}

/**
 * Validates a tsumo call action
 */
function validateTsumo(
  action: GameAction,
  validation?: TutorialActionValidation
): ValidationResult {
  if (action.type !== 'tsumo') {
    return {
      valid: false,
      message: validation?.hintMessage || 'Please call Tsumo to win.',
    }
  }

  return { valid: true, message: validation?.successMessage }
}

/**
 * Validates a skip call action
 */
function validateSkip(action: GameAction, validation?: TutorialActionValidation): ValidationResult {
  if (action.type !== 'skip_call') {
    return {
      valid: false,
      message: validation?.hintMessage || 'Please skip this call.',
    }
  }

  return { valid: true, message: validation?.successMessage }
}

/**
 * Checks if a step requires validation before allowing the action
 */
export function stepRequiresValidation(step: TutorialStep): boolean {
  if (!step.actionType) return false
  return step.actionType !== 'next' && step.actionType !== 'acknowledge'
}

/**
 * Gets the appropriate hint message for a step
 */
export function getStepHint(step: TutorialStep): string | undefined {
  if (!stepRequiresValidation(step)) return undefined

  if (step.actionValidation?.hintMessage) {
    return step.actionValidation.hintMessage
  }

  // Default hints based on action type
  switch (step.actionType) {
    case 'discard':
    case 'discard_any':
      return 'Click a tile to select it, then click again to discard.'
    case 'call_chi':
      return 'Click the Chi button when it appears.'
    case 'call_pon':
      return 'Click the Pon button when it appears.'
    case 'call_ron':
      return 'Click the Ron button to win.'
    case 'call_tsumo':
      return 'Click the Tsumo button to win.'
    case 'skip_call':
      return 'Click Skip to pass on this call.'
    default:
      return undefined
  }
}

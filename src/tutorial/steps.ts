/**
 * Tutorial Steps Data
 * Defines the content and flow of the tutorial system
 */

import type { TileDefinition } from '@/types/tiles'

// Action types that can be validated during tutorial
export type TutorialActionType =
  | 'next' // Just click next (default)
  | 'discard' // Must discard a tile
  | 'discard_any' // Discard any tile
  | 'call_chi' // Must call chi when available
  | 'call_pon' // Must call pon when available
  | 'call_ron' // Must call ron when available
  | 'call_tsumo' // Must call tsumo when available
  | 'skip_call' // Must skip a call
  | 'acknowledge' // Just acknowledge (for quiz results)

// Validation configuration for interactive steps
export interface TutorialActionValidation {
  // For discard actions
  requiredTileType?: string // 'man' | 'pin' | 'sou' | 'wind' | 'dragon'
  requiredTileValue?: string | number
  anyTile?: boolean

  // Feedback messages
  successMessage?: string
  failureMessage?: string
  hintMessage?: string
}

// Example tiles to display in tutorial content
export interface TileExample {
  tiles: TileDefinition[]
  label?: string
}

export interface TutorialStep {
  id: string
  title: string
  content: string
  chapterId: string // Groups steps into chapters
  highlight?: string | string[] // CSS selector or element identifier
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  actionType?: TutorialActionType // Required user action (default: 'next')
  actionValidation?: TutorialActionValidation
  tileExample?: TileExample // Show example tiles
  setupScenario?: string // Reference to scenario ID for practice steps
}

// Chapter 1: Basics
const BASICS_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    chapterId: 'basics',
    title: 'Welcome to Riichi Mahjong!',
    content:
      'This tutorial will teach you Japanese Riichi Mahjong from the ground up. ' +
      "Whether you're completely new or want to deepen your understanding, we'll cover everything step by step.\n\n" +
      "Let's begin your journey to becoming a Mahjong player!",
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'goal',
    chapterId: 'basics',
    title: 'The Goal',
    content:
      'Your goal is to form a complete hand of 14 tiles before anyone else.\n\n' +
      'A standard winning hand consists of:\n' +
      '• 4 sets (groups of 3 tiles)\n' +
      '• 1 pair (2 identical tiles)\n\n' +
      'There are also special hand forms we\'ll cover later.',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'tile-types-suits',
    chapterId: 'basics',
    title: 'Tile Types: Suits',
    content:
      'There are 3 numbered suits, each with tiles 1-9:\n\n' +
      '• Characters (Manzu/Man) - Chinese characters\n' +
      '• Circles (Pinzu/Pin) - Circle patterns\n' +
      '• Bamboo (Souzu/Sou) - Bamboo sticks\n\n' +
      'Each tile exists 4 times in the set (136 tiles total).',
    position: 'center',
    actionType: 'next',
    tileExample: {
      tiles: [
        { type: 'man', value: 1 },
        { type: 'man', value: 5 },
        { type: 'man', value: 9 },
        { type: 'pin', value: 1 },
        { type: 'pin', value: 5 },
        { type: 'sou', value: 1 },
        { type: 'sou', value: 5 },
      ],
      label: 'Example suit tiles',
    },
  },
  {
    id: 'tile-types-honors',
    chapterId: 'basics',
    title: 'Tile Types: Honors',
    content:
      'Honor tiles cannot form sequences - only triplets:\n\n' +
      'Winds (4 types):\n' +
      '• East, South, West, North\n\n' +
      'Dragons (3 types):\n' +
      '• White (blank), Green, Red',
    position: 'center',
    actionType: 'next',
    tileExample: {
      tiles: [
        { type: 'wind', value: 'east' },
        { type: 'wind', value: 'south' },
        { type: 'wind', value: 'west' },
        { type: 'wind', value: 'north' },
        { type: 'dragon', value: 'white' },
        { type: 'dragon', value: 'green' },
        { type: 'dragon', value: 'red' },
      ],
      label: 'Honor tiles',
    },
  },
  {
    id: 'sets-sequence',
    chapterId: 'basics',
    title: 'Sets: Sequences (Chi)',
    content:
      'A sequence is 3 consecutive tiles of the SAME suit.\n\n' +
      'Examples:\n' +
      '• 1-2-3 of Circles\n' +
      '• 4-5-6 of Bamboo\n' +
      '• 7-8-9 of Characters\n\n' +
      'Honor tiles CANNOT form sequences!',
    position: 'center',
    actionType: 'next',
    tileExample: {
      tiles: [
        { type: 'pin', value: 1 },
        { type: 'pin', value: 2 },
        { type: 'pin', value: 3 },
      ],
      label: '1-2-3 sequence',
    },
  },
  {
    id: 'sets-triplet',
    chapterId: 'basics',
    title: 'Sets: Triplets (Pon)',
    content:
      'A triplet is 3 identical tiles.\n\n' +
      'Examples:\n' +
      '• Three 5 of Bamboo\n' +
      '• Three East winds\n' +
      '• Three Red dragons\n\n' +
      'Any tile type can form triplets!',
    position: 'center',
    actionType: 'next',
    tileExample: {
      tiles: [
        { type: 'sou', value: 5 },
        { type: 'sou', value: 5 },
        { type: 'sou', value: 5 },
      ],
      label: 'Triplet of 5-sou',
    },
  },
  {
    id: 'hand-intro',
    chapterId: 'basics',
    title: 'Your Hand',
    content:
      'This is your hand at the bottom of the screen.\n\n' +
      '• You can see all your tiles\n' +
      '• Opponents\' hands are hidden (backs only)\n' +
      '• You start with 13 tiles\n' +
      '• After drawing, you have 14 tiles',
    highlight: 'player-hand',
    position: 'top',
    actionType: 'next',
  },
  {
    id: 'draw-discard',
    chapterId: 'basics',
    title: 'Draw and Discard',
    content:
      'Each turn follows this pattern:\n\n' +
      '1. Draw a tile from the wall\n' +
      '2. The drawn tile appears with a gap\n' +
      '3. Choose one tile to discard\n' +
      '4. You\'re back to 13 tiles\n\n' +
      'Repeat until someone wins or tiles run out!',
    highlight: 'player-hand',
    position: 'top',
    actionType: 'next',
  },
  {
    id: 'practice-discard',
    chapterId: 'basics',
    title: 'Try It: Discard a Tile',
    content:
      'Now try discarding a tile!\n\n' +
      '1. Click a tile to select it (it rises up)\n' +
      '2. Click it again OR press the Discard button\n\n' +
      'Discard any tile to continue.',
    highlight: 'player-hand',
    position: 'top',
    actionType: 'discard_any',
    actionValidation: {
      anyTile: true,
      successMessage: 'Well done! You discarded a tile.',
      hintMessage: 'Click a tile to select it, then click again to discard.',
    },
    setupScenario: 'practice-discard',
  },
]

// Chapter 2: Calls
const CALLS_STEPS: TutorialStep[] = [
  {
    id: 'discards-pool',
    chapterId: 'calls',
    title: 'Discard Pool',
    content:
      'Discarded tiles go to the center of the table.\n\n' +
      '• Each player\'s discards are visible\n' +
      '• Discards are arranged in rows of 6\n' +
      '• Watching discards helps you predict safe tiles\n\n' +
      'This information is crucial for strategy!',
    highlight: 'center-table',
    position: 'bottom',
    actionType: 'next',
  },
  {
    id: 'calling-intro',
    chapterId: 'calls',
    title: 'Calling Tiles',
    content:
      'When an opponent discards, you might be able to "call" their tile!\n\n' +
      'Calling lets you take their discard to complete a set.\n\n' +
      'But be careful - called sets become "open" (visible to all), ' +
      'and some scoring patterns require a "closed" hand.',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'calling-chi',
    chapterId: 'calls',
    title: 'Chi (Sequence Call)',
    content:
      'Chi lets you take a tile to complete a sequence.\n\n' +
      'Rules:\n' +
      '• Chi can ONLY be called from the player to your LEFT\n' +
      '• You must have 2 tiles that form a sequence with the discard\n' +
      '• The completed set is placed face-up\n\n' +
      'Example: You have 2-3 pin, left player discards 4 pin → Chi!',
    position: 'center',
    actionType: 'next',
    tileExample: {
      tiles: [
        { type: 'pin', value: 2 },
        { type: 'pin', value: 3 },
        { type: 'pin', value: 4 },
      ],
      label: 'Chi example',
    },
  },
  {
    id: 'calling-pon',
    chapterId: 'calls',
    title: 'Pon (Triplet Call)',
    content:
      'Pon lets you take a tile to complete a triplet.\n\n' +
      'Rules:\n' +
      '• Pon can be called from ANY player\n' +
      '• You must have 2 identical tiles in hand\n' +
      '• Pon has priority over Chi\n\n' +
      'Example: You have two 7 sou, any player discards 7 sou → Pon!',
    position: 'center',
    actionType: 'next',
    tileExample: {
      tiles: [
        { type: 'sou', value: 7 },
        { type: 'sou', value: 7 },
        { type: 'sou', value: 7 },
      ],
      label: 'Pon example',
    },
  },
  {
    id: 'open-closed',
    chapterId: 'calls',
    title: 'Open vs Closed Hands',
    content:
      'This is a crucial concept!\n\n' +
      'CLOSED hand: No calls made, all tiles hidden\n' +
      'OPEN hand: At least one Chi or Pon called\n\n' +
      'Some yaku (scoring patterns) require a closed hand:\n' +
      '• Riichi\n' +
      '• Pinfu\n' +
      '• Iipeikou\n\n' +
      'Think carefully before calling!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'call-priority',
    chapterId: 'calls',
    title: 'Call Priority',
    content:
      'When multiple players want the same discard:\n\n' +
      '1. Ron (win) - Highest priority\n' +
      '2. Pon/Kan - Second priority\n' +
      '3. Chi - Lowest priority\n\n' +
      'Ron always wins. Pon beats Chi.',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'skip-call',
    chapterId: 'calls',
    title: 'Skipping Calls',
    content:
      'You don\'t have to call even if you can!\n\n' +
      'Reasons to skip:\n' +
      '• Keep your hand closed for better yaku\n' +
      '• Don\'t want to reveal your strategy\n' +
      '• The call doesn\'t improve your hand much\n\n' +
      'Press "Skip" or let the timer expire to pass.',
    position: 'center',
    actionType: 'next',
  },
]

// Chapter 3: Winning
const WINNING_STEPS: TutorialStep[] = [
  {
    id: 'winning-intro',
    chapterId: 'winning',
    title: 'Winning the Hand',
    content:
      'There are two ways to win:\n\n' +
      '1. TSUMO - Draw your winning tile yourself\n' +
      '2. RON - Win on an opponent\'s discard\n\n' +
      'But wait! You need at least one YAKU (scoring pattern) to win. ' +
      'A complete hand without yaku is not a valid win!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'tenpai',
    chapterId: 'winning',
    title: 'Tenpai (Ready Hand)',
    content:
      '"Tenpai" means your hand is ONE tile away from winning.\n\n' +
      'When in tenpai:\n' +
      '• You\'re waiting for specific tile(s) to complete your hand\n' +
      '• You can declare Riichi (if closed)\n' +
      '• You can win by Tsumo or Ron\n\n' +
      'Getting to tenpai quickly is key to winning!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'tsumo-win',
    chapterId: 'winning',
    title: 'Tsumo (Self-Draw Win)',
    content:
      'Tsumo is winning by drawing your own winning tile.\n\n' +
      '• All other players pay you\n' +
      '• Dealer pays more, non-dealers pay less\n' +
      '• You get a bonus yaku: "Menzen Tsumo" (if hand is closed)\n\n' +
      'Tsumo is generally considered better than Ron!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'ron-win',
    chapterId: 'winning',
    title: 'Ron (Discard Win)',
    content:
      'Ron is winning on an opponent\'s discard.\n\n' +
      '• Only the player who discarded pays\n' +
      '• Must not be in "Furiten" (we\'ll explain soon)\n' +
      '• Click "Ron" when the winning tile is discarded\n\n' +
      'Ron is faster but only one person pays.',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'furiten-basic',
    chapterId: 'winning',
    title: 'Furiten Rule',
    content:
      'Furiten is a critical rule that restricts Ron:\n\n' +
      'You are in FURITEN if:\n' +
      '• You previously discarded a tile that would complete your hand\n\n' +
      'While in furiten:\n' +
      '• You CANNOT win by Ron\n' +
      '• You CAN still win by Tsumo\n\n' +
      'Always check your discards before waiting!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'furiten-types',
    chapterId: 'winning',
    title: 'Types of Furiten',
    content:
      'There are actually 3 types of furiten:\n\n' +
      '1. PERMANENT: You discarded a winning tile earlier\n\n' +
      '2. TEMPORARY: You passed on a Ron opportunity ' +
      '(clears when you draw next)\n\n' +
      '3. RIICHI FURITEN: In riichi and passed on Ron ' +
      '(stays until round ends)\n\n' +
      'Be very careful in riichi!',
    position: 'center',
    actionType: 'next',
  },
]

// Chapter 4: Basic Yaku
const BASIC_YAKU_STEPS: TutorialStep[] = [
  {
    id: 'yaku-intro',
    chapterId: 'yaku-basics',
    title: 'What is Yaku?',
    content:
      'Yaku are scoring patterns required to win.\n\n' +
      '• You MUST have at least 1 yaku to declare a win\n' +
      '• More yaku = higher score\n' +
      '• Each yaku is worth "han" (doubles)\n' +
      '• Some yaku require a closed hand\n\n' +
      'Let\'s learn the most common yaku!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'yaku-riichi',
    chapterId: 'yaku-basics',
    title: 'Riichi (1 han)',
    content:
      'The signature yaku of Japanese Mahjong!\n\n' +
      'Requirements:\n' +
      '• Hand must be CLOSED (no calls)\n' +
      '• Hand must be in TENPAI\n' +
      '• You must have 1000+ points\n\n' +
      'When you declare riichi:\n' +
      '• Bet 1000 points (winner takes them)\n' +
      '• Cannot change your hand anymore\n' +
      '• Gain access to bonus yaku (Ippatsu, Ura-dora)',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'yaku-tanyao',
    chapterId: 'yaku-basics',
    title: 'Tanyao - All Simples (1 han)',
    content:
      'One of the easiest yaku to get!\n\n' +
      'Requirement:\n' +
      '• Only tiles 2-8 (no 1s, 9s, or honors)\n\n' +
      'Tips:\n' +
      '• Can be open or closed\n' +
      '• Very flexible, easy to build toward\n' +
      '• Often combined with other yaku',
    position: 'center',
    actionType: 'next',
    tileExample: {
      tiles: [
        { type: 'man', value: 2 },
        { type: 'man', value: 3 },
        { type: 'man', value: 4 },
        { type: 'pin', value: 5 },
        { type: 'pin', value: 6 },
        { type: 'pin', value: 7 },
        { type: 'sou', value: 3 },
      ],
      label: 'All simples (2-8 only)',
    },
  },
  {
    id: 'yaku-yakuhai',
    chapterId: 'yaku-basics',
    title: 'Yakuhai - Value Tiles (1 han each)',
    content:
      'Triplets of certain honor tiles give yaku!\n\n' +
      'Value tiles:\n' +
      '• Dragons (White, Green, Red) - Always 1 han\n' +
      '• Your seat wind - 1 han\n' +
      '• Round wind - 1 han\n\n' +
      'If seat wind = round wind, it\'s worth 2 han!\n' +
      'Can be open (called) or closed.',
    position: 'center',
    actionType: 'next',
    tileExample: {
      tiles: [
        { type: 'dragon', value: 'red' },
        { type: 'dragon', value: 'red' },
        { type: 'dragon', value: 'red' },
      ],
      label: 'Dragon triplet = 1 han',
    },
  },
  {
    id: 'yaku-pinfu',
    chapterId: 'yaku-basics',
    title: 'Pinfu - No Points (1 han)',
    content:
      'A hand with no "fu" (minipoints) bonuses.\n\n' +
      'Requirements:\n' +
      '• CLOSED hand only\n' +
      '• All 4 sets must be SEQUENCES\n' +
      '• Pair cannot be dragons/winds (your seat/round wind)\n' +
      '• Must wait on BOTH sides of a sequence\n\n' +
      'Pinfu + Riichi is a common combo!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'yaku-iipeikou',
    chapterId: 'yaku-basics',
    title: 'Iipeikou - Pure Double Sequence (1 han)',
    content:
      'Two identical sequences in the same suit.\n\n' +
      'Example: 2-3-4 man + 2-3-4 man\n\n' +
      'Requirements:\n' +
      '• CLOSED hand only\n' +
      '• Exactly 2 identical sequences\n\n' +
      'If you have TWO pairs of sequences (4 total), ' +
      'that\'s "Ryanpeikou" (3 han)!',
    position: 'center',
    actionType: 'next',
    tileExample: {
      tiles: [
        { type: 'man', value: 2 },
        { type: 'man', value: 3 },
        { type: 'man', value: 4 },
        { type: 'man', value: 2 },
        { type: 'man', value: 3 },
        { type: 'man', value: 4 },
      ],
      label: 'Pure double sequence',
    },
  },
  {
    id: 'yaku-menzen-tsumo',
    chapterId: 'yaku-basics',
    title: 'Menzen Tsumo (1 han)',
    content:
      'Win by self-draw with a closed hand.\n\n' +
      'Requirements:\n' +
      '• CLOSED hand (no calls)\n' +
      '• Win by TSUMO (draw your winning tile)\n\n' +
      'This is automatic - no special hand shape needed!\n' +
      'Great reason to keep your hand closed.',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'yaku-summary',
    chapterId: 'yaku-basics',
    title: 'Basic Yaku Summary',
    content:
      'Most common yaku to aim for:\n\n' +
      '• Riichi (1 han) - Closed tenpai declaration\n' +
      '• Tanyao (1 han) - All simples, 2-8 only\n' +
      '• Yakuhai (1 han) - Dragon/wind triplet\n' +
      '• Pinfu (1 han) - All sequences, closed\n' +
      '• Iipeikou (1 han) - Identical sequences\n' +
      '• Menzen Tsumo (1 han) - Closed hand + self-draw\n\n' +
      'Combining these gives higher scores!',
    position: 'center',
    actionType: 'next',
  },
]

// Chapter 5: Advanced Yaku
const ADVANCED_YAKU_STEPS: TutorialStep[] = [
  {
    id: 'yaku-sanshoku',
    chapterId: 'yaku-advanced',
    title: 'Sanshoku - Mixed Triple Sequence (2 han)',
    content:
      'Same sequence in all 3 suits!\n\n' +
      'Example: 4-5-6 man + 4-5-6 pin + 4-5-6 sou\n\n' +
      '• Closed: 2 han\n' +
      '• Open: 1 han\n\n' +
      'Beautiful when you get it, but don\'t force it!',
    position: 'center',
    actionType: 'next',
    tileExample: {
      tiles: [
        { type: 'man', value: 4 },
        { type: 'man', value: 5 },
        { type: 'man', value: 6 },
        { type: 'pin', value: 4 },
        { type: 'pin', value: 5 },
        { type: 'pin', value: 6 },
        { type: 'sou', value: 4 },
        { type: 'sou', value: 5 },
        { type: 'sou', value: 6 },
      ],
      label: '4-5-6 in all suits',
    },
  },
  {
    id: 'yaku-ittsu',
    chapterId: 'yaku-advanced',
    title: 'Ittsu - Pure Straight (2 han)',
    content:
      '1-2-3, 4-5-6, 7-8-9 in the same suit!\n\n' +
      'Example: 1-9 straight in Circles\n\n' +
      '• Closed: 2 han\n' +
      '• Open: 1 han\n\n' +
      'Uses 9 tiles just for the straight - plan carefully!',
    position: 'center',
    actionType: 'next',
    tileExample: {
      tiles: [
        { type: 'sou', value: 1 },
        { type: 'sou', value: 2 },
        { type: 'sou', value: 3 },
        { type: 'sou', value: 4 },
        { type: 'sou', value: 5 },
        { type: 'sou', value: 6 },
        { type: 'sou', value: 7 },
        { type: 'sou', value: 8 },
        { type: 'sou', value: 9 },
      ],
      label: '1-9 in bamboo',
    },
  },
  {
    id: 'yaku-toitoi',
    chapterId: 'yaku-advanced',
    title: 'Toitoi - All Triplets (2 han)',
    content:
      'All 4 sets are triplets (no sequences).\n\n' +
      '• Can be open or closed\n' +
      '• Easy to build with Pon calls\n' +
      '• Often combined with Yakuhai\n\n' +
      'If all triplets are CLOSED (no calls), ' +
      'that\'s "Sanankou" (2 han) or even "Suuankou" (yakuman)!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'yaku-chiitoitsu',
    chapterId: 'yaku-advanced',
    title: 'Chiitoitsu - Seven Pairs (2 han)',
    content:
      'A special hand form: 7 different pairs!\n\n' +
      '• Not the normal 4 sets + 1 pair structure\n' +
      '• All 7 pairs must be DIFFERENT tiles\n' +
      '• MUST be closed (cannot call)\n' +
      '• Fixed at 25 fu for scoring\n\n' +
      'Very flexible! Can go for this when pairs keep coming.',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'yaku-honitsu',
    chapterId: 'yaku-advanced',
    title: 'Honitsu - Half Flush (3 han)',
    content:
      'One suit + honor tiles only.\n\n' +
      'Example: Only Circles and Winds/Dragons\n\n' +
      '• Closed: 3 han\n' +
      '• Open: 2 han\n\n' +
      'A strong yaku! Often combined with Yakuhai.',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'yaku-chinitsu',
    chapterId: 'yaku-advanced',
    title: 'Chinitsu - Full Flush (6 han)',
    content:
      'One suit only, no honors!\n\n' +
      '• Closed: 6 han\n' +
      '• Open: 5 han\n\n' +
      'Very powerful but hard to hide. ' +
      'Other players will know what you\'re doing!\n\n' +
      'Still worth it for the high score.',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'yaku-limit-intro',
    chapterId: 'yaku-advanced',
    title: 'Limit Hands',
    content:
      'High han values hit score limits:\n\n' +
      '• Mangan (5 han): 8,000 base\n' +
      '• Haneman (6-7 han): 12,000 base\n' +
      '• Baiman (8-10 han): 16,000 base\n' +
      '• Sanbaiman (11-12 han): 24,000 base\n' +
      '• Yakuman (13+ han): 32,000 base\n\n' +
      'Dealer wins 1.5x these amounts!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'yaku-yakuman',
    chapterId: 'yaku-advanced',
    title: 'Yakuman (Role Hands)',
    content:
      'Yakuman are rare, powerful hands worth 32,000+ points!\n\n' +
      'Examples:\n' +
      '• Kokushi Musou - 13 orphans (all terminals + honors)\n' +
      '• Suuankou - 4 closed triplets\n' +
      '• Daisangen - All 3 dragon triplets\n' +
      '• Shousuushii - 3 wind triplets + wind pair\n\n' +
      'Getting yakuman is a memorable achievement!',
    position: 'center',
    actionType: 'next',
  },
]

// Chapter 6: Scoring
const SCORING_STEPS: TutorialStep[] = [
  {
    id: 'scoring-intro',
    chapterId: 'scoring',
    title: 'How Scoring Works',
    content:
      'Score calculation has two components:\n\n' +
      '• HAN (翻) - Scoring doubles from yaku and dora\n' +
      '• FU (符) - Base points from hand composition\n\n' +
      'Basic formula:\n' +
      'Score = Base Points × Han Multiplier\n\n' +
      'Don\'t worry - the game calculates this for you!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'scoring-han',
    chapterId: 'scoring',
    title: 'Han (Doubles)',
    content:
      'Han comes from:\n\n' +
      '• Yaku - Each yaku has a han value\n' +
      '• Dora - Each dora tile = 1 han\n' +
      '• Ura-dora - Bonus dora (riichi only)\n' +
      '• Red fives - 1 han each (if using red dora)\n\n' +
      'Example: Riichi (1) + Tanyao (1) + 1 Dora = 3 han',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'scoring-dora',
    chapterId: 'scoring',
    title: 'Dora Bonus Tiles',
    content:
      'Dora are bonus tiles that add han (but aren\'t yaku).\n\n' +
      'The dora INDICATOR shows which tile is dora:\n' +
      '• The dora is the NEXT tile in sequence\n' +
      '• Indicator shows 3 pin → Dora is 4 pin\n' +
      '• North indicator → Dora is East (cycles)\n\n' +
      'Each dora in your hand = +1 han!',
    highlight: 'dora',
    position: 'left',
    actionType: 'next',
  },
  {
    id: 'scoring-fu',
    chapterId: 'scoring',
    title: 'Fu (Minipoints)',
    content:
      'Fu determines base points before han multiplier.\n\n' +
      'Base fu:\n' +
      '• Start with 20 fu\n' +
      '• Closed ron: +10 fu\n' +
      '• Tsumo: +2 fu (except for pinfu)\n\n' +
      'Most hands are 20-40 fu. Higher fu = higher score.',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'scoring-fu-melds',
    chapterId: 'scoring',
    title: 'Fu from Melds',
    content:
      'Triplets add fu based on:\n' +
      '• Open vs Closed\n' +
      '• Simple (2-8) vs Terminal/Honor (1,9,winds,dragons)\n\n' +
      'Open simple triplet: 2 fu\n' +
      'Closed simple triplet: 4 fu\n' +
      'Open terminal/honor triplet: 4 fu\n' +
      'Closed terminal/honor triplet: 8 fu\n\n' +
      'Kans are worth 4x these values!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'scoring-fu-waits',
    chapterId: 'scoring',
    title: 'Fu from Wait Type',
    content:
      'How you wait for your winning tile matters!\n\n' +
      'Ryanmen (two-sided): 0 fu\n' +
      '• Waiting on 3 or 6 with 4-5 in hand\n\n' +
      'Kanchan (middle): +2 fu\n' +
      '• Waiting on 5 with 4-6 in hand\n\n' +
      'Penchan (edge): +2 fu\n' +
      '• Waiting on 3 with 1-2 in hand\n\n' +
      'Tanki (pair wait): +2 fu',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'scoring-calculation',
    chapterId: 'scoring',
    title: 'Score Calculation',
    content:
      'The game calculates automatically, but here\'s the idea:\n\n' +
      '1. Calculate total fu (round up to nearest 10)\n' +
      '2. Count total han\n' +
      '3. Base points = fu × 2^(han+2)\n' +
      '4. Apply dealer/non-dealer multipliers\n\n' +
      'At 5+ han, use limit hand values instead!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'scoring-payments',
    chapterId: 'scoring',
    title: 'Payment Distribution',
    content:
      'Who pays depends on win type:\n\n' +
      'RON (discard win):\n' +
      '• Discarder pays the full amount\n\n' +
      'TSUMO (self-draw win):\n' +
      '• Non-dealer wins: Dealer pays 2x, others pay 1x\n' +
      '• Dealer wins: All pay 2x each\n\n' +
      'Dealer always pays/receives more!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'scoring-honba',
    chapterId: 'scoring',
    title: 'Honba (Repeat Counter)',
    content:
      'Honba adds bonus points to wins:\n\n' +
      'Honba increases when:\n' +
      '• Dealer wins (dealer keeps seat)\n' +
      '• Round ends in draw\n\n' +
      'Each honba:\n' +
      '• Ron: +300 points total\n' +
      '• Tsumo: +100 per player\n\n' +
      'Honba resets when non-dealer wins.',
    position: 'center',
    actionType: 'next',
  },
]

// Chapter 7: Advanced Mechanics
const ADVANCED_STEPS: TutorialStep[] = [
  {
    id: 'kan-intro',
    chapterId: 'advanced',
    title: 'Kan (Quad)',
    content:
      'Kan is a set of 4 identical tiles!\n\n' +
      'Benefits of kan:\n' +
      '• Draw a replacement tile from dead wall\n' +
      '• Reveals new dora indicator\n' +
      '• Can win with Rinshan (after kan draw)\n\n' +
      'There are 3 types of kan to learn.',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'kan-ankan',
    chapterId: 'advanced',
    title: 'Ankan (Closed Kan)',
    content:
      'Declare kan with 4 tiles already in your hand.\n\n' +
      '• Hand stays CLOSED\n' +
      '• Middle 2 tiles shown face-up, outer 2 face-down\n' +
      '• Can only declare on your turn\n' +
      '• Draw replacement from dead wall',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'kan-daiminkan',
    chapterId: 'advanced',
    title: 'Daiminkan (Open Kan)',
    content:
      'Call kan on an opponent\'s discard.\n\n' +
      '• Need 3 tiles in hand + their discard\n' +
      '• Hand becomes OPEN\n' +
      '• Similar to calling Pon but for 4\n' +
      '• Draw replacement from dead wall',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'kan-shouminkan',
    chapterId: 'advanced',
    title: 'Shouminkan (Added Kan)',
    content:
      'Upgrade an existing Pon to Kan.\n\n' +
      '• Must draw the 4th tile yourself\n' +
      '• Can only declare on your turn\n' +
      '• WARNING: Opponents can RON the added tile!\n' +
      '• This is called "Chankan" (robbing the kan)',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'yaku-rinshan',
    chapterId: 'advanced',
    title: 'Rinshan Kaihou (1 han)',
    content:
      'Win on the replacement tile after declaring kan!\n\n' +
      '• Must declare kan first\n' +
      '• Win on the dead wall draw\n' +
      '• Works with any kan type\n\n' +
      'A satisfying way to win!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'yaku-chankan',
    chapterId: 'advanced',
    title: 'Chankan (1 han)',
    content:
      '"Robbing the kan" - Ron when opponent adds to a pon!\n\n' +
      '• Only works on Shouminkan\n' +
      '• The added tile must complete your hand\n' +
      '• Very rare but dramatic!\n\n' +
      'Think twice before adding to your pon!',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'tenpai-shapes',
    chapterId: 'advanced',
    title: 'Tenpai Wait Shapes',
    content:
      'Common wait patterns:\n\n' +
      'RYANMEN (両面): Two-sided - Best!\n' +
      '• Have 4-5, waiting on 3 or 6\n\n' +
      'KANCHAN (嵌張): Middle wait\n' +
      '• Have 4-6, waiting on 5\n\n' +
      'PENCHAN (辺張): Edge wait\n' +
      '• Have 1-2, waiting on 3\n\n' +
      'TANKI (単騎): Pair wait\n' +
      '• Waiting on single tile for pair',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'dealer-rotation',
    chapterId: 'advanced',
    title: 'Dealer Rotation',
    content:
      'The dealer (East seat) rotates:\n\n' +
      'Dealer KEEPS seat if:\n' +
      '• Dealer wins the hand\n' +
      '• Dealer is in tenpai during draw\n\n' +
      'Dealer ROTATES if:\n' +
      '• Non-dealer wins\n' +
      '• Dealer is not in tenpai during draw\n\n' +
      'When dealer rotates, honba resets.',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'round-progression',
    chapterId: 'advanced',
    title: 'Round Progression',
    content:
      'A game progresses through rounds:\n\n' +
      'East Round (東場): East 1 → East 2 → East 3 → East 4\n' +
      'South Round (南場): South 1 → South 2 → South 3 → South 4\n\n' +
      'Standard game ends after South 4.\n' +
      'Each number = which player is dealer.',
    position: 'center',
    actionType: 'next',
  },
  {
    id: 'tutorial-complete',
    chapterId: 'advanced',
    title: 'Tutorial Complete!',
    content:
      'Congratulations! You\'ve learned Riichi Mahjong!\n\n' +
      'Key tips:\n' +
      '• Start with simple yaku (Riichi, Tanyao, Yakuhai)\n' +
      '• Watch your discards for furiten\n' +
      '• Keep hands closed when possible\n' +
      '• Pay attention to opponents\' discards\n\n' +
      'Good luck and have fun playing!',
    position: 'center',
    actionType: 'next',
  },
]

// Combine all steps
export const TUTORIAL_STEPS: TutorialStep[] = [
  ...BASICS_STEPS,
  ...CALLS_STEPS,
  ...WINNING_STEPS,
  ...BASIC_YAKU_STEPS,
  ...ADVANCED_YAKU_STEPS,
  ...SCORING_STEPS,
  ...ADVANCED_STEPS,
]

export const TOTAL_STEPS = TUTORIAL_STEPS.length

// Helper to get step by ID
export function getStepById(id: string): TutorialStep | undefined {
  return TUTORIAL_STEPS.find((step) => step.id === id)
}

// Helper to get steps by chapter
export function getStepsByChapter(chapterId: string): TutorialStep[] {
  return TUTORIAL_STEPS.filter((step) => step.chapterId === chapterId)
}

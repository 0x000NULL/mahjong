/**
 * Tutorial Chapter Definitions
 * Organizes tutorial steps into logical chapters
 */

import { TUTORIAL_STEPS, getStepsByChapter } from './steps'

export interface TutorialChapter {
  id: string
  title: string
  description: string
  stepIds: string[]
  isAdvanced?: boolean
}

export const TUTORIAL_CHAPTERS: TutorialChapter[] = [
  {
    id: 'basics',
    title: 'Getting Started',
    description: 'Learn the fundamentals of Riichi Mahjong',
    stepIds: getStepsByChapter('basics').map((s) => s.id),
  },
  {
    id: 'calls',
    title: 'Calling Tiles',
    description: 'Learn how to call tiles from opponents',
    stepIds: getStepsByChapter('calls').map((s) => s.id),
  },
  {
    id: 'winning',
    title: 'Winning the Game',
    description: 'Learn how to complete and win hands',
    stepIds: getStepsByChapter('winning').map((s) => s.id),
  },
  {
    id: 'yaku-basics',
    title: 'Basic Yaku',
    description: 'Learn common scoring patterns',
    stepIds: getStepsByChapter('yaku-basics').map((s) => s.id),
  },
  {
    id: 'yaku-advanced',
    title: 'Advanced Yaku',
    description: 'Learn more complex scoring patterns',
    stepIds: getStepsByChapter('yaku-advanced').map((s) => s.id),
    isAdvanced: true,
  },
  {
    id: 'scoring',
    title: 'Scoring System',
    description: 'Understand han, fu, and point calculation',
    stepIds: getStepsByChapter('scoring').map((s) => s.id),
    isAdvanced: true,
  },
  {
    id: 'advanced',
    title: 'Advanced Mechanics',
    description: 'Master advanced game concepts',
    stepIds: getStepsByChapter('advanced').map((s) => s.id),
    isAdvanced: true,
  },
]

export const TOTAL_CHAPTERS = TUTORIAL_CHAPTERS.length

// Get chapter by ID
export function getChapterById(chapterId: string): TutorialChapter | undefined {
  return TUTORIAL_CHAPTERS.find((chapter) => chapter.id === chapterId)
}

// Get chapter for a given step
export function getChapterForStep(stepId: string): TutorialChapter | undefined {
  const step = TUTORIAL_STEPS.find((s) => s.id === stepId)
  if (!step) return undefined
  return getChapterById(step.chapterId)
}

// Get step index within a chapter
export function getStepIndexInChapter(stepId: string): number {
  const chapter = getChapterForStep(stepId)
  if (!chapter) return -1
  return chapter.stepIds.indexOf(stepId)
}

// Get overall step index
export function getOverallStepIndex(stepId: string): number {
  return TUTORIAL_STEPS.findIndex((s) => s.id === stepId)
}

// Get first step of a chapter
export function getFirstStepOfChapter(chapterId: string): string | undefined {
  const chapter = getChapterById(chapterId)
  return chapter?.stepIds[0]
}

// Get chapter index
export function getChapterIndex(chapterId: string): number {
  return TUTORIAL_CHAPTERS.findIndex((c) => c.id === chapterId)
}

// Check if step is first in its chapter
export function isFirstStepInChapter(stepId: string): boolean {
  const chapter = getChapterForStep(stepId)
  return chapter?.stepIds[0] === stepId
}

// Check if step is last in its chapter
export function isLastStepInChapter(stepId: string): boolean {
  const chapter = getChapterForStep(stepId)
  if (!chapter) return false
  return chapter.stepIds[chapter.stepIds.length - 1] === stepId
}

// Get next chapter
export function getNextChapter(currentChapterId: string): TutorialChapter | undefined {
  const currentIndex = getChapterIndex(currentChapterId)
  if (currentIndex === -1 || currentIndex >= TUTORIAL_CHAPTERS.length - 1) {
    return undefined
  }
  return TUTORIAL_CHAPTERS[currentIndex + 1]
}

// Get previous chapter
export function getPreviousChapter(currentChapterId: string): TutorialChapter | undefined {
  const currentIndex = getChapterIndex(currentChapterId)
  if (currentIndex <= 0) {
    return undefined
  }
  return TUTORIAL_CHAPTERS[currentIndex - 1]
}

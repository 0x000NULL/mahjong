/**
 * Tutorial State Management
 * Tracks tutorial progress and provides controls
 */

import { create } from 'zustand'
import {
  TUTORIAL_STEPS,
  TOTAL_STEPS,
  type TutorialStep,
} from '@/tutorial/steps'
import {
  TUTORIAL_CHAPTERS,
  getChapterById,
  getChapterForStep,
  getChapterIndex,
  getFirstStepOfChapter,
  isLastStepInChapter,
  type TutorialChapter,
} from '@/tutorial/chapters'

const TUTORIAL_KEY = 'mahjong_tutorial_state'

interface TutorialState {
  isActive: boolean
  currentStepIndex: number
  hasCompleted: boolean
  // New state for chapters and feedback
  currentChapterId: string
  completedChapterIds: string[]
  completedStepIds: string[]
  feedback: string | null
  feedbackType: 'success' | 'error' | 'hint' | null
  isWaitingForAction: boolean
}

interface TutorialStore extends TutorialState {
  // Actions
  startTutorial: () => void
  nextStep: () => void
  prevStep: () => void
  skipTutorial: () => void
  resetTutorial: () => void

  // New actions for chapters
  startChapter: (chapterId: string) => void
  skipToChapter: (chapterId: string) => void
  onActionCompleted: (message?: string) => void
  setFeedback: (message: string | null, type?: 'success' | 'error' | 'hint') => void
  clearFeedback: () => void

  // Selectors
  getCurrentStep: () => TutorialStep | null
  getProgress: () => { current: number; total: number }

  // New selectors
  getCurrentChapter: () => TutorialChapter | null
  getChapterProgress: (chapterId: string) => { completed: number; total: number }
  isChapterCompleted: (chapterId: string) => boolean
  isChapterUnlocked: (chapterId: string) => boolean
  getCompletedStepsInChapter: (chapterId: string) => number
}

// Persisted state interface (subset that we save)
interface PersistedTutorialState {
  isActive: boolean
  currentStepIndex: number
  currentChapterId: string
  hasCompleted: boolean
  completedChapterIds: string[]
  completedStepIds: string[]
}

// Load persisted state
function loadTutorialState(): Partial<TutorialState> {
  try {
    const saved = localStorage.getItem(TUTORIAL_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<PersistedTutorialState>
      return {
        ...parsed,
        // Reset transient state
        feedback: null,
        feedbackType: null,
        isWaitingForAction: false,
      }
    }
  } catch {
    // Ignore parse errors
  }
  return {}
}

// Save state to localStorage
function saveTutorialState(state: TutorialState): void {
  try {
    const toSave: PersistedTutorialState = {
      isActive: state.isActive,
      currentStepIndex: state.currentStepIndex,
      currentChapterId: state.currentChapterId,
      hasCompleted: state.hasCompleted,
      completedChapterIds: state.completedChapterIds,
      completedStepIds: state.completedStepIds,
    }
    localStorage.setItem(TUTORIAL_KEY, JSON.stringify(toSave))
  } catch {
    // Ignore save errors
  }
}

const initialState = loadTutorialState()

export const useTutorialStore = create<TutorialStore>((set, get) => ({
  isActive: initialState.isActive ?? false,
  currentStepIndex: initialState.currentStepIndex ?? 0,
  hasCompleted: initialState.hasCompleted ?? false,
  currentChapterId: initialState.currentChapterId ?? 'basics',
  completedChapterIds: initialState.completedChapterIds ?? [],
  completedStepIds: initialState.completedStepIds ?? [],
  feedback: null,
  feedbackType: null,
  isWaitingForAction: false,

  startTutorial: () => {
    const newState: Partial<TutorialState> = {
      isActive: true,
      currentStepIndex: 0,
      currentChapterId: 'basics',
      hasCompleted: false,
      feedback: null,
      feedbackType: null,
      isWaitingForAction: false,
    }
    set(newState)
    saveTutorialState({ ...get(), ...newState } as TutorialState)
  },

  nextStep: () => {
    const state = get()
    const { currentStepIndex, completedStepIds } = state
    const currentStep = TUTORIAL_STEPS[currentStepIndex]
    const nextIndex = currentStepIndex + 1

    // Mark current step as completed
    const newCompletedStepIds = currentStep && !completedStepIds.includes(currentStep.id)
      ? [...completedStepIds, currentStep.id]
      : completedStepIds

    if (nextIndex >= TOTAL_STEPS) {
      // Tutorial complete
      const newState: Partial<TutorialState> = {
        isActive: false,
        currentStepIndex: 0,
        hasCompleted: true,
        completedStepIds: newCompletedStepIds,
        feedback: null,
        feedbackType: null,
        isWaitingForAction: false,
      }
      set(newState)
      saveTutorialState({ ...get(), ...newState } as TutorialState)
    } else {
      // Check if we're moving to a new chapter
      const nextStep = TUTORIAL_STEPS[nextIndex]
      let newCompletedChapterIds = state.completedChapterIds

      // If current step is last in chapter, mark chapter as completed
      if (currentStep && isLastStepInChapter(currentStep.id)) {
        const chapter = getChapterForStep(currentStep.id)
        if (chapter && !newCompletedChapterIds.includes(chapter.id)) {
          newCompletedChapterIds = [...newCompletedChapterIds, chapter.id]
        }
      }

      // Check if next step requires an action
      const requiresAction =
        nextStep.actionType && nextStep.actionType !== 'next' && nextStep.actionType !== 'acknowledge'

      const newState: Partial<TutorialState> = {
        currentStepIndex: nextIndex,
        currentChapterId: nextStep.chapterId,
        completedStepIds: newCompletedStepIds,
        completedChapterIds: newCompletedChapterIds,
        feedback: null,
        feedbackType: null,
        isWaitingForAction: requiresAction,
      }
      set(newState)
      saveTutorialState({ ...get(), ...newState } as TutorialState)
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get()
    if (currentStepIndex > 0) {
      const prevStep = TUTORIAL_STEPS[currentStepIndex - 1]
      const requiresAction =
        prevStep.actionType && prevStep.actionType !== 'next' && prevStep.actionType !== 'acknowledge'

      const newState: Partial<TutorialState> = {
        currentStepIndex: currentStepIndex - 1,
        currentChapterId: prevStep.chapterId,
        feedback: null,
        feedbackType: null,
        isWaitingForAction: requiresAction,
      }
      set(newState)
      saveTutorialState({ ...get(), ...newState } as TutorialState)
    }
  },

  skipTutorial: () => {
    const newState: Partial<TutorialState> = {
      isActive: false,
      currentStepIndex: 0,
      hasCompleted: true,
      feedback: null,
      feedbackType: null,
      isWaitingForAction: false,
    }
    set(newState)
    saveTutorialState({ ...get(), ...newState } as TutorialState)
  },

  resetTutorial: () => {
    const newState: TutorialState = {
      isActive: false,
      currentStepIndex: 0,
      hasCompleted: false,
      currentChapterId: 'basics',
      completedChapterIds: [],
      completedStepIds: [],
      feedback: null,
      feedbackType: null,
      isWaitingForAction: false,
    }
    set(newState)
    saveTutorialState(newState)
  },

  startChapter: (chapterId: string) => {
    const chapter = getChapterById(chapterId)
    if (!chapter) return

    const firstStepId = getFirstStepOfChapter(chapterId)
    if (!firstStepId) return

    const stepIndex = TUTORIAL_STEPS.findIndex((s) => s.id === firstStepId)
    if (stepIndex === -1) return

    const step = TUTORIAL_STEPS[stepIndex]
    const requiresAction =
      step.actionType && step.actionType !== 'next' && step.actionType !== 'acknowledge'

    const newState: Partial<TutorialState> = {
      isActive: true,
      currentStepIndex: stepIndex,
      currentChapterId: chapterId,
      feedback: null,
      feedbackType: null,
      isWaitingForAction: requiresAction,
    }
    set(newState)
    saveTutorialState({ ...get(), ...newState } as TutorialState)
  },

  skipToChapter: (chapterId: string) => {
    const state = get()
    const chapter = getChapterById(chapterId)
    if (!chapter) return

    // Check if chapter is unlocked
    const chapterIndex = getChapterIndex(chapterId)
    if (chapterIndex > 0) {
      const previousChapter = TUTORIAL_CHAPTERS[chapterIndex - 1]
      if (!state.completedChapterIds.includes(previousChapter.id)) {
        // Previous chapter not completed, can't skip to this one
        return
      }
    }

    const firstStepId = getFirstStepOfChapter(chapterId)
    if (!firstStepId) return

    const stepIndex = TUTORIAL_STEPS.findIndex((s) => s.id === firstStepId)
    if (stepIndex === -1) return

    const step = TUTORIAL_STEPS[stepIndex]
    const requiresAction =
      step.actionType && step.actionType !== 'next' && step.actionType !== 'acknowledge'

    const newState: Partial<TutorialState> = {
      currentStepIndex: stepIndex,
      currentChapterId: chapterId,
      feedback: null,
      feedbackType: null,
      isWaitingForAction: requiresAction,
    }
    set(newState)
    saveTutorialState({ ...get(), ...newState } as TutorialState)
  },

  onActionCompleted: (message?: string) => {
    const state = get()
    const currentStep = TUTORIAL_STEPS[state.currentStepIndex]

    // Mark step as completed
    const newCompletedStepIds = currentStep && !state.completedStepIds.includes(currentStep.id)
      ? [...state.completedStepIds, currentStep.id]
      : state.completedStepIds

    // Show success feedback
    const successMessage = message || currentStep?.actionValidation?.successMessage || 'Well done!'

    set({
      completedStepIds: newCompletedStepIds,
      isWaitingForAction: false,
      feedback: successMessage,
      feedbackType: 'success',
    })

    // Auto-advance after brief delay
    setTimeout(() => {
      get().nextStep()
    }, 1200)
  },

  setFeedback: (message: string | null, type: 'success' | 'error' | 'hint' = 'hint') => {
    set({ feedback: message, feedbackType: message ? type : null })
  },

  clearFeedback: () => {
    set({ feedback: null, feedbackType: null })
  },

  getCurrentStep: () => {
    const { isActive, currentStepIndex } = get()
    if (!isActive || currentStepIndex >= TOTAL_STEPS) {
      return null
    }
    return TUTORIAL_STEPS[currentStepIndex]
  },

  getProgress: () => {
    const { currentStepIndex } = get()
    return { current: currentStepIndex + 1, total: TOTAL_STEPS }
  },

  getCurrentChapter: () => {
    const { currentChapterId } = get()
    return getChapterById(currentChapterId) ?? null
  },

  getChapterProgress: (chapterId: string) => {
    const { completedStepIds } = get()
    const chapter = getChapterById(chapterId)
    if (!chapter) return { completed: 0, total: 0 }

    const completedInChapter = chapter.stepIds.filter((id) => completedStepIds.includes(id)).length
    return { completed: completedInChapter, total: chapter.stepIds.length }
  },

  isChapterCompleted: (chapterId: string) => {
    const { completedChapterIds } = get()
    return completedChapterIds.includes(chapterId)
  },

  isChapterUnlocked: (chapterId: string) => {
    const state = get()
    const chapterIndex = getChapterIndex(chapterId)

    // First chapter is always unlocked
    if (chapterIndex === 0) return true

    // Check if previous chapter is completed
    const previousChapter = TUTORIAL_CHAPTERS[chapterIndex - 1]
    return state.completedChapterIds.includes(previousChapter.id)
  },

  getCompletedStepsInChapter: (chapterId: string) => {
    const { completedStepIds } = get()
    const chapter = getChapterById(chapterId)
    if (!chapter) return 0

    return chapter.stepIds.filter((id) => completedStepIds.includes(id)).length
  },
}))

// Selector hooks
export const useTutorialActive = () => useTutorialStore((s) => s.isActive)
export const useTutorialCompleted = () => useTutorialStore((s) => s.hasCompleted)
export const useCurrentTutorialStep = () => useTutorialStore((s) => s.getCurrentStep())
export const useTutorialFeedback = () =>
  useTutorialStore((s) => ({ message: s.feedback, type: s.feedbackType }))
export const useIsWaitingForAction = () => useTutorialStore((s) => s.isWaitingForAction)
export const useCurrentChapter = () => useTutorialStore((s) => s.getCurrentChapter())

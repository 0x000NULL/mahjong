/**
 * TutorialOverlay Component
 * Displays tutorial steps with highlight effects, tile examples, and interactive features
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTutorialStore, useCurrentTutorialStep, useIsWaitingForAction } from '@/stores/tutorialStore'
import { TOTAL_STEPS, type TutorialStep } from '@/tutorial/steps'
import { TUTORIAL_CHAPTERS } from '@/tutorial/chapters'
import { TileExample } from './TileExample'
import { FeedbackToast } from './FeedbackToast'
import { ActionPrompt } from './ActionPrompt'
import { ChapterMenu } from './ChapterMenu'

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const tooltipVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.2 } },
}

interface TutorialTooltipProps {
  step: TutorialStep
  currentIndex: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  onToggleChapters: () => void
  isWaitingForAction: boolean
}

function TutorialTooltip({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onToggleChapters,
  isWaitingForAction,
}: TutorialTooltipProps) {
  // Position classes based on step position
  const positionClasses: Record<string, string> = {
    center: 'inset-0 flex items-center justify-center',
    top: 'top-4 left-1/2 -translate-x-1/2',
    bottom: 'bottom-32 left-1/2 -translate-x-1/2',
    left: 'left-4 top-1/2 -translate-y-1/2',
    right: 'right-4 top-1/2 -translate-y-1/2',
  }

  const position = step.position || 'center'
  const isCenter = position === 'center'

  // Get current chapter info
  const currentChapter = TUTORIAL_CHAPTERS.find((c) => c.id === step.chapterId)

  // Determine if next button should be disabled
  const nextDisabled = isWaitingForAction && step.actionType !== 'next' && step.actionType !== 'acknowledge'

  return (
    <motion.div
      className={`fixed z-50 ${positionClasses[position]}`}
      variants={tooltipVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div
        className={`
          bg-gray-900 border border-amber-500/50 rounded-xl shadow-2xl
          ${isCenter ? 'max-w-md w-full mx-4' : 'max-w-sm'}
          p-5
        `}
      >
        {/* Header with chapter indicator */}
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={onToggleChapters}
            className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
          >
            {currentChapter?.title || 'Tutorial'} ▾
          </button>
          <span className="text-xs text-gray-500">
            {currentIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-amber-400 mb-3">{step.title}</h3>

        {/* Content */}
        <p className="text-gray-300 text-sm whitespace-pre-line">{step.content}</p>

        {/* Tile example if present */}
        {step.tileExample && <TileExample example={step.tileExample} />}

        {/* Progress bar */}
        <div className="h-1 bg-gray-700 rounded-full mt-4 mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Action hint for interactive steps */}
        {isWaitingForAction && (
          <div className="text-xs text-amber-400/80 text-center mb-3 flex items-center justify-center gap-1">
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ●
            </motion.span>
            <span>Complete the action to continue</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Skip Tutorial
          </button>

          <div className="flex gap-2">
            {currentIndex > 0 && (
              <motion.button
                onClick={onPrev}
                className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-lg
                           hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
            )}

            <motion.button
              onClick={onNext}
              disabled={nextDisabled}
              className={`
                px-4 py-1.5 text-sm rounded-lg font-medium transition-colors
                ${nextDisabled
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-600 text-white hover:bg-amber-500'
                }
              `}
              whileHover={nextDisabled ? {} : { scale: 1.05 }}
              whileTap={nextDisabled ? {} : { scale: 0.95 }}
            >
              {currentIndex === totalSteps - 1 ? 'Finish' : 'Next'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function TutorialOverlay() {
  const [showChapterMenu, setShowChapterMenu] = useState(false)
  const step = useCurrentTutorialStep()
  const nextStep = useTutorialStore((s) => s.nextStep)
  const prevStep = useTutorialStore((s) => s.prevStep)
  const skipTutorial = useTutorialStore((s) => s.skipTutorial)
  const currentStepIndex = useTutorialStore((s) => s.currentStepIndex)
  const isWaitingForAction = useIsWaitingForAction()

  if (!step) return null

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/60 z-40"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Highlight element if specified */}
      {step.highlight && <HighlightSpotlight target={step.highlight} />}

      {/* Chapter menu */}
      <AnimatePresence>
        {showChapterMenu && (
          <ChapterMenu onClose={() => setShowChapterMenu(false)} />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <TutorialTooltip
        step={step}
        currentIndex={currentStepIndex}
        totalSteps={TOTAL_STEPS}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTutorial}
        onToggleChapters={() => setShowChapterMenu(!showChapterMenu)}
        isWaitingForAction={isWaitingForAction}
      />

      {/* Feedback toast for validation messages */}
      <FeedbackToast />

      {/* Action prompt when waiting for player input */}
      <ActionPrompt />
    </AnimatePresence>
  )
}

interface HighlightSpotlightProps {
  target: string | string[]
}

function HighlightSpotlight({ target }: HighlightSpotlightProps) {
  // Map logical names to visual indicators
  // These are hints rather than actual DOM selectors
  const highlightStyles: Record<string, { top: string; left: string; width: string; height: string }> = {
    'player-hand': { top: 'calc(100% - 180px)', left: '10%', width: '80%', height: '140px' },
    'center-table': { top: '30%', left: '30%', width: '40%', height: '40%' },
    'dora': { top: '80px', left: 'calc(100% - 150px)', width: '120px', height: '60px' },
  }

  // Handle single target or array of targets
  const targets = Array.isArray(target) ? target : [target]

  return (
    <>
      {targets.map((t) => {
        const style = highlightStyles[t]
        if (!style) return null

        return (
          <motion.div
            key={t}
            className="fixed z-[45] pointer-events-none rounded-lg"
            style={style}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              boxShadow: [
                '0 0 0 4px rgba(245, 158, 11, 0.5)',
                '0 0 20px 8px rgba(245, 158, 11, 0.3)',
                '0 0 0 4px rgba(245, 158, 11, 0.5)',
              ],
            }}
            transition={{
              opacity: { duration: 0.3 },
              boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
        )
      })}
    </>
  )
}

export default TutorialOverlay

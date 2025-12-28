/**
 * ActionPrompt Component
 * Shows a pulsing indicator when waiting for player action
 */

import { motion } from 'framer-motion'
import { useIsWaitingForAction, useCurrentTutorialStep } from '@/stores/tutorialStore'
import { getStepHint } from '@/tutorial/validation'

export function ActionPrompt() {
  const isWaiting = useIsWaitingForAction()
  const currentStep = useCurrentTutorialStep()

  if (!isWaiting || !currentStep) {
    return null
  }

  const hint = getStepHint(currentStep)

  return (
    <motion.div
      className="fixed bottom-36 left-1/2 z-[55] -translate-x-1/2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <motion.div
        className="flex items-center gap-2 px-4 py-2 bg-amber-600/90 rounded-full shadow-lg"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(245, 158, 11, 0.4)',
            '0 0 0 10px rgba(245, 158, 11, 0)',
            '0 0 0 0 rgba(245, 158, 11, 0)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.div
          className="w-2 h-2 bg-white rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <span className="text-sm font-medium text-white">{hint || 'Your turn!'}</span>
      </motion.div>
    </motion.div>
  )
}

export default ActionPrompt

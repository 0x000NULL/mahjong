/**
 * FeedbackToast Component
 * Shows success/error feedback during tutorial interactions
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useTutorialFeedback, useTutorialStore } from '@/stores/tutorialStore'
import { useEffect } from 'react'

const toastVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
  },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } },
}

export function FeedbackToast() {
  const { message, type } = useTutorialFeedback()
  const clearFeedback = useTutorialStore((s) => s.clearFeedback)

  // Auto-clear feedback after delay (except for hints)
  useEffect(() => {
    if (message && type !== 'hint') {
      const timer = setTimeout(() => {
        clearFeedback()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [message, type, clearFeedback])

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-500 text-green-100'
      case 'error':
        return 'bg-red-900/90 border-red-500 text-red-100'
      case 'hint':
        return 'bg-amber-900/90 border-amber-500 text-amber-100'
      default:
        return 'bg-gray-900/90 border-gray-500 text-gray-100'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✗'
      case 'hint':
        return '?'
      default:
        return ''
    }
  }

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed bottom-48 left-1/2 z-[60] -translate-x-1/2"
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border-2 shadow-lg
              ${getStyles()}
            `}
          >
            <span className="text-lg font-bold">{getIcon()}</span>
            <span className="text-sm font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FeedbackToast

import { useState, useEffect } from 'react'

interface TypewriterOptions {
  enabled?: boolean;
  charsPerTick?: number;
  tickMs?: number;
}

/**
 * Progressively reveals text for a typewriter effect.
 * @param {string} text - Full text to reveal
 * @param {object} options - { enabled: boolean, charsPerTick?: number, tickMs?: number }
 * @returns {string} - The currently revealed portion of text
 */
export function useTypewriter(text: string, options: TypewriterOptions = {}) {
  const { enabled = true, charsPerTick = 30, tickMs = 10 } = options
  const [displayedLength, setDisplayedLength] = useState(0)
  const [prevText, setPrevText] = useState(text)

  // If text changes, reset displayed length immediately during the render phase.
  // This avoids cascading renders caused by sync setState in useEffect.
  if (text !== prevText) {
    setPrevText(text)
    setDisplayedLength(0)
  }

  // Also handle disabled or empty state during the render phase.
  if (!enabled || !text) {
    if (displayedLength !== (text?.length ?? 0)) {
      setDisplayedLength(text?.length ?? 0)
    }
  }

  useEffect(() => {
    if (!enabled || !text) return

    if (displayedLength >= text.length) return

    const timer = setInterval(() => {
      setDisplayedLength((prev) => Math.min(prev + charsPerTick, text.length))
    }, tickMs)

    return () => clearInterval(timer)
  }, [enabled, text, displayedLength, charsPerTick, tickMs])

  if (!enabled || !text) return text ?? ''
  return text.slice(0, displayedLength)
}

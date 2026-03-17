import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import * as Popover from '@radix-ui/react-popover'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MaterialIcon from './MaterialIcon'

interface SelectionPopupProps {
  rect: { left: number; top: number } | null;
  open: boolean;
  selectedText: string;
  onExplain: (selectedText: string) => void;
  onAsk: (selectedText: string, question: string) => void;
  onClose: () => void;
  onApplyHighlight: () => void;
  explainMode?: {
    explanation: string | null;
    loading: boolean;
    selectedText: string;
  } | null;
  onExplainClose?: () => void;
  onAskFollowUp?: (selectedText: string, question: string) => void;
}

function SelectionPopup({
  rect,
  open,
  selectedText,
  onExplain,
  onAsk,
  onClose,
  onApplyHighlight,
  explainMode = null,
  onExplainClose,
  onAskFollowUp,
}: SelectionPopupProps) {
  const [askValue, setAskValue] = useState('')
  const askInputRef = useRef<HTMLInputElement>(null)
  const isExplainView = explainMode != null
  const popoverOpen = open && (rect != null)

  useEffect(() => {
    if (popoverOpen && !isExplainView) {
      const id = requestAnimationFrame(() => {
        setAskValue('')
        onApplyHighlight?.()
        askInputRef.current?.focus()
      })
      return () => cancelAnimationFrame(id)
    }
  }, [popoverOpen, isExplainView, onApplyHighlight])

  useEffect(() => {
    if (isExplainView && popoverOpen) {
      const id = requestAnimationFrame(() => {
        askInputRef.current?.focus()
      })
      return () => cancelAnimationFrame(id)
    }
  }, [isExplainView, popoverOpen])

  useEffect(() => {
    if (!popoverOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isExplainView) onExplainClose?.()
        else onClose?.()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [popoverOpen, isExplainView, onClose, onExplainClose])

  const handleExplainMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onExplain(selectedText)
  }

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const question = askValue.trim()
    if (question) {
      if (isExplainView) {
        onAskFollowUp?.(explainMode.selectedText, question)
        setAskValue('')
      } else {
        onAsk(selectedText, question)
      }
    }
  }

  const handleSendMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const question = askValue.trim()
    if (question) {
      if (isExplainView) {
        onAskFollowUp?.(explainMode.selectedText, question)
        setAskValue('')
      } else {
        onAsk(selectedText, question)
      }
    }
  }

  const handlePopoverOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      if (isExplainView) onExplainClose?.()
      else onClose?.()
    }
  }

  if (!rect || !popoverOpen) return null

  const content = isExplainView ? (
    <div
      data-selection-popup
      data-explain-popover
      className="flex flex-col min-w-[320px] max-w-105 max-h-[70vh] bg-white dark:bg-black rounded-lg overflow-hidden"
    >
      <div className="overflow-y-auto flex-1 min-h-0 p-3 text-black dark:text-white prose dark:prose-invert max-w-none explain-popover-content">
        {explainMode.loading ? (
          <p className="text-black/50 dark:text-white/50">Explaining…</p>
        ) : explainMode.explanation ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{explainMode.explanation}</ReactMarkdown>
        ) : null}
      </div>
      <div className="shrink-0 border-t border-black/10 dark:border-white/20 bg-white dark:bg-black">
        <form onSubmit={handleAskSubmit} className="relative w-full flex items-center">
          <input
            ref={askInputRef}
            type="text"
            value={askValue}
            onChange={(e) => setAskValue(e.target.value)}
            placeholder="Ask a follow up"
            className="w-full px-3 pr-14 py-2 text-base rounded-md border-0 bg-transparent text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-0"
          />
          {askValue.trim() ? (
            <button
              type="button"
              onMouseDown={handleSendMouseDown}
              className="absolute right-1 size-7 flex items-center justify-center rounded-full bg-black dark:bg-white/20 text-white font-medium hover:bg-black/80 dark:hover:bg-white/30 transition-colors"
              aria-label="Send"
            >
              <MaterialIcon name="north" className="text-sm" />
            </button>
          ) : null}
        </form>
      </div>
    </div>
  ) : (
    <div
      data-selection-popup
      className="flex items-center gap-2 min-w-[320px] bg-white dark:bg-black rounded-lg overflow-hidden"
    >
      <button
        type="button"
        onMouseDown={handleExplainMouseDown}
        className="px-3 py-2 text-base font-medium text-black/70 dark:text-white/80 rounded-l-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
      >
        Explain
      </button>
      <div className="w-px h-6 bg-black/10 dark:bg-white/20" aria-hidden />
      <form onSubmit={handleAskSubmit} className="relative w-full flex items-center">
        <input
          ref={askInputRef}
          type="text"
          value={askValue}
          onChange={(e) => setAskValue(e.target.value)}
          placeholder="Ask..."
          className="w-full px-3 pr-14 py-2 text-base rounded-md border-0 bg-transparent text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-0"
        />
        {askValue.trim() ? (
          <button
            type="button"
            onMouseDown={handleSendMouseDown}
            className="absolute right-1 size-7 flex items-center justify-center rounded-full bg-black dark:bg-white/20 text-white font-medium hover:bg-black/80 dark:hover:bg-white/30 transition-colors"
            aria-label="Send"
          >
            <MaterialIcon name="north" className="text-sm" />
          </button>
        ) : null}
      </form>
    </div>
  )

  return createPortal(
    <Popover.Root open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
      <Popover.Anchor asChild>
        <div
          className="w-px h-px"
          style={{ position: 'fixed', left: rect.left, top: rect.top + 12 }}
          aria-hidden
        />
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          sideOffset={4}
          align="start"
          alignOffset={0}
          className="z-9999 rounded-lg bg-white dark:bg-black shadow-lg border border-black/10 dark:border-white/20"
        >
          {content}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>,
    document.body
  )
}

export default SelectionPopup

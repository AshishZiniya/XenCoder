import React, { useState, useCallback } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import MaterialIcon from '../MaterialIcon'

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  content?: string;
  errorCode?: string;
}

interface UserMessageProps {
  msg: Message;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onStartEdit: (msg: Message) => void;
  onSave: (trimmed: string) => void;
  onCancel: () => void;
  editInputRef: React.RefObject<HTMLTextAreaElement>;
  showEditButton: boolean;
  className: string;
  selectedTextAbove?: string | null;
  selectionHighlightColor?: string | null;
}

const TRUNCATE_QUESTION_LENGTH = 350

function truncateAtWord(text: string, maxLen: number) {
  if (text.length <= maxLen) return { truncated: false, display: text }
  const slice = text.slice(0, maxLen)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > 0 ? lastSpace : maxLen
  return { truncated: true, display: text.slice(0, cut).trim() + '…' }
}

export default function UserMessage({
  msg,
  isEditing,
  editValue,
  onEditChange,
  onStartEdit,
  onSave,
  onCancel,
  editInputRef,
  showEditButton,
  className,
  selectedTextAbove = null,
  selectionHighlightColor = null,
}: UserMessageProps) {
  const isLong = (msg.text || '').length > TRUNCATE_QUESTION_LENGTH
  const { display: truncatedDisplay } = truncateAtWord(msg.text || '', TRUNCATE_QUESTION_LENGTH)
  const [expanded, setExpanded] = useState(false)
  const showTruncated = isLong && !expanded

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const trimmed = editValue.trim()
        if (trimmed) onSave(trimmed)
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    },
    [editValue, onSave, onCancel]
  )

  if (isEditing) {
    return (
      <div className={className}>
        <textarea
          ref={editInputRef}
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={Math.min(8, Math.max(2, editValue.split('\n').length))}
          className="nodrag w-full min-w-0 px-3 py-2 rounded-xl bg-black/4 dark:bg-white/10 ml-4 mr-0 text-black dark:text-white leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50"
          spellCheck={false}
          autoComplete="off"
          aria-label="Edit message"
        />
        <div className="flex items-center gap-1 mt-2 ml-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded-lg text-black/50 hover:text-black hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 text-sm"
          >
            Cancel
          </button>
          {editValue.trim() && (
            <button
              type="button"
              onClick={() => onSave(editValue.trim())}
              className="px-3 py-2 rounded-lg bg-black dark:bg-white/20 text-white text-sm font-medium hover:bg-black/80 dark:hover:bg-white/30"
            >
              Save
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        className="px-3 py-2 rounded-xl bg-black/4 dark:bg-white/10 ml-4 mr-0 text-black dark:text-white leading-relaxed cursor-text"
        data-message-body={msg.id}
        onDoubleClick={showEditButton ? () => onStartEdit(msg) : undefined}
      >
        {selectedTextAbove && (
          <p className="text-base font-medium text-black dark:text-white">
            {selectionHighlightColor ? (
              <span className="selection-highlight rounded px-0.5" style={{ backgroundColor: selectionHighlightColor }}>{selectedTextAbove}</span>
            ) : (
              selectedTextAbove
            )}
          </p>
        )}
        <span className="leading-relaxed">
          {showTruncated ? truncatedDisplay : msg.text}
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="ml-1.5 cursor-pointer text-sm font-medium text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 rounded"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </span>
      </div>
      {showEditButton && (
        <Tooltip.Root delayDuration={300}>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => onStartEdit(msg)}
              className="self-start ml-4 aspect-square size-10 flex items-center justify-center rounded-lg text-black/50 hover:text-black hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 mt-1"
              aria-label="Edit message"
            >
              <MaterialIcon name="edit" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="top" sideOffset={6} className="z-9999 rounded-md bg-black dark:bg-black/90 px-2.5 py-1.5 text-xs text-white shadow-lg">
              Edit message
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      )}
    </div>
  )
}

import { memo, useCallback, useEffect, useRef, useState, CSSProperties } from 'react'

interface EditableTitleProps {
  value: string;
  onSave: (newValue: string, isEmpty: boolean) => void;
  style?: CSSProperties;
}

function EditableTitle({ value, onSave, style: styleProp }: EditableTitleProps) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const commit = useCallback(
    (trimmed: string, isEmpty: boolean) => {
      onSave(isEmpty ? value : trimmed, isEmpty)
      setEditing(false)
    },
    [value, onSave]
  )

  useEffect(() => {
    if (!editing) return
    const input = inputRef.current
    if (input) {
      input.focus()
      input.select()
    }
  }, [editing])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = inputRef.current?.value?.trim() ?? ''
      commit(trimmed, trimmed === '')
    },
    [commit]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setEditing(false)
      }
    },
    []
  )

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="contents">
        <input
          ref={inputRef}
          type="text"
          name="title"
          defaultValue={value}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className="nodrag w-full min-w-0 p-0 text-lg font-semibold text-foreground bg-transparent border-0 outline-none focus:outline-none focus:ring-0 cursor-text"
          style={styleProp}
          spellCheck={false}
          autoComplete="off"
          aria-label="Edit title"
        />
      </form>
    )
  }

  return (
    <span
      className="block w-full text-sm font-medium text-foreground truncate min-w-0 cursor-default"
      style={styleProp}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setEditing(true)
      }}
    >
      {value}
    </span>
  )
}

export default memo(EditableTitle)

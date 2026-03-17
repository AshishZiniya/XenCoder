// Utility functions for class name management and styling

export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// Button class utilities
export const getButtonClass = (variant: 'primary' | 'secondary' | 'ghost' = 'primary', size: 'sm' | 'md' | 'lg' = 'md'): string => {
  const base = 'btn'
  const variantClass = `btn-${variant}`
  const sizeClass = size !== 'md' ? `btn-${size}` : ''
  return classNames(base, variantClass, sizeClass)
}

// Card class utilities
export const getCardClass = (withHover: boolean = true): string => {
  return classNames('card', withHover ? 'hover:shadow-md' : '')
}

// Input class utilities
export const getInputClass = (disabled: boolean = false): string => {
  return classNames('input', disabled ? 'opacity-50 cursor-not-allowed' : '')
}

// Badge class utilities
export const getBadgeClass = (type: 'primary' | 'success' | 'warning' | 'error' = 'primary'): string => {
  return classNames('badge', `badge-${type}`)
}

// Alert class utilities
export const getAlertClass = (type: 'primary' | 'success' | 'warning' | 'error' = 'primary'): string => {
  return classNames('alert', `alert-${type}`)
}

// Spinner class utilities
export const getSpinnerClass = (): string => {
  return 'spinner'
}

// Message bubble class utilities
export const getMessageBubbleClass = (isUser: boolean, isEditing: boolean = false): string => {
  return classNames(
    'px-4 py-3 rounded-lg line-clamp-3',
    isUser
      ? 'bg-blue-500 text-white rounded-br-none'
      : 'bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-bl-none',
    isEditing ? 'ring-2 ring-blue-400' : ''
  )
}

// Chat input class utilities
export const getChatInputClass = (): string => {
  return classNames(
    'w-full min-h-12 max-h-48 p-3 rounded-lg border border-black/10 dark:border-white/20',
    'bg-white dark:bg-black text-black dark:text-white',
    'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent',
    'resize-none font-sans text-sm leading-relaxed'
  )
}

// Markdown content class utilities
export const getMarkdownClass = (): string => {
  return 'markdown-content'
}

// Code block class utilities
export const getCodeBlockClass = (): string => {
  return classNames(
    'markdown-code-block-wrapper',
    'relative rounded-lg overflow-hidden border border-black/10 dark:border-white/20',
    'bg-white dark:bg-black shadow-sm'
  )
}

// Tooltip class utilities
export const getTooltipClass = (position: 'top' | 'bottom' | 'left' | 'right' = 'top'): string => {
  return `tooltip tooltip-${position}`
}

// Selection popup class utilities
export const getSelectionPopupClass = (): string => {
  return classNames(
    'absolute z-50 bg-white dark:bg-black rounded-lg shadow-lg',
    'border border-black/10 dark:border-white/20 p-2',
    'flex flex-col gap-1'
  )
}

// Action button (small, icon-only) class utilities
export const getActionButtonClass = (hovered: boolean = false): string => {
  return classNames(
    'inline-flex items-center justify-center w-8 h-8 rounded-md',
    'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white',
    'hover:bg-black/5 dark:hover:bg-white/10 transition-colors',
    hovered ? 'bg-black/5 dark:bg-white/10' : ''
  )
}

// Focus ring class utilities
export const getFocusRingClass = (): string => {
  return 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0'
}

// Responsive grid class utilities
export const getGridClass = (columns: 1 | 2 | 3 | 4 = 2): string => {
  const colMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }
  return classNames('grid gap-4', colMap[columns])
}

// Divider class utilities
export const getDividerClass = (vertical: boolean = false): string => {
  return vertical
    ? 'w-px bg-black/10 dark:bg-white/20'
    : 'h-px bg-black/10 dark:bg-white/20'
}

// Flex center class utilities
export const getFlexCenterClass = (): string => {
  return 'flex items-center justify-center'
}

// Flex between class utilities
export const getFlexBetweenClass = (): string => {
  return 'flex items-center justify-between'
}

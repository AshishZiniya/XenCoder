// Component styling configuration - VS Code inspired

export const componentStyles = {
  // Base button styles
  button: {
    base: 'inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border rounded transition-all duration-150 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    primary: 'bg-[#0066cc] text-white border-transparent hover:bg-[#0052a3] dark:bg-[#569cd6] dark:hover:bg-[#649fdb]',
    secondary: 'bg-transparent text-black border border-black/20 hover:bg-black/5 dark:text-white dark:border-white/20 dark:hover:bg-white/10',
    ghost: 'bg-transparent text-black/60 border-transparent hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10',
    sm: 'px-2 py-1 text-xs',
    lg: 'px-4 py-3 text-base',
  },

  // Base card styles
  card: {
    base: 'bg-white/5 dark:bg-black border border-black/20 dark:border-white/20 rounded-md p-4 shadow-sm transition-all duration-150',
    hover: 'hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500',
  },

  // Input field styles
  input: {
    base: 'w-full px-3 py-2 text-sm bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-black/20 transition-all duration-150',
    disabled: 'opacity-50 cursor-not-allowed',
  },

  // Badge styles
  badge: {
    base: 'inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
  },

  // Message bubble styles
  messageBubble: {
    user: 'bg-blue-500 text-white rounded-lg rounded-br-none px-4 py-3 max-w-xs',
    assistant: 'bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-lg rounded-bl-none px-4 py-3',
  },

  // Chat input styles
  chatInput: 'w-full min-h-12 max-h-48 p-3 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black/10 resize-none text-sm leading-relaxed font-sans',

  // Action button (icon-only) styles
  actionButton: 'inline-flex items-center justify-center w-8 h-8 rounded-md text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-black/10',

  // Selection popup styles
  selectionPopup: 'absolute z-50 bg-white dark:bg-black rounded-md shadow-lg border border-black/10 dark:border-white/20 p-2 flex flex-col gap-1',

  // Code block styles
  codeBlock: {
    wrapper: 'relative rounded-md overflow-hidden border border-black/10 dark:border-white/20 bg-black/5 dark:bg-black shadow-sm margin-y-4',
    lang: 'inline-block px-3 py-1.5 text-xs font-bold text-black/60 dark:text-white/60 bg-black/5 dark:bg-black border-b border-black/10 dark:border-white/20',
    copyBtn: 'absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-md bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60 hover:bg-black hover:text-white border border-black/10 dark:border-white/20 cursor-pointer transition-all duration-150',
  },

  // Modal/Dialog styles
  modal: {
    overlay: 'fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50',
    content: 'bg-white dark:bg-black rounded-lg shadow-xl border border-black/10 dark:border-white/20 max-w-md w-full mx-4',
    header: 'px-6 py-4 border-b border-black/10 dark:border-white/20',
    body: 'px-6 py-4',
    footer: 'px-6 py-4 border-t border-black/10 dark:border-white/20 flex justify-end gap-2',
  },

  // Tooltip styles
  tooltip: {
    content: 'bg-black dark:bg-black text-white px-2 py-1 rounded-md text-xs whitespace-nowrap',
  },

  // Scrollbar styles
  scrollbar: {
    track: 'bg-black/5 dark:bg-white/5',
    thumb: 'bg-black/20 dark:bg-white/20 hover:bg-black/30 dark:hover:bg-white/30',
  },

  // Divider styles
  divider: 'border-t border-black/10 dark:border-white/20',

  // Alert styles
  alert: {
    base: 'rounded-md p-4 border-l-4 flex gap-3',
    primary: 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-700 dark:text-blue-300',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-400 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 text-yellow-700 dark:text-yellow-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-300',
  },

  // Loading spinner styles
  spinner: 'inline-block w-4 h-4 border-2 border-black/10 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin',

  // Breadcrumb styles
  breadcrumb: 'flex items-center gap-2 text-sm',
  breadcrumbItem: 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white',
  breadcrumbSeparator: 'text-black/30 dark:text-white/30',

  // Tab styles
  tab: {
    base: 'px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:border-black/20 dark:hover:border-white/20 transition-colors duration-150',
    active: 'text-black dark:text-white border-black dark:border-white',
    inactive: 'text-black/60 dark:text-white/60',
  },

  // Menu styles
  menu: {
    item: 'px-3 py-2 text-sm rounded-md transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer',
  },
}

// Color palette
export const colors = {
  primary: '#0066cc',
  primaryHover: '#0052a3',
  primaryLight: '#e8f0fe',
  secondary: '#0098ff',
  success: '#13a538',
  warning: '#d29922',
  error: '#e81e1e',
  border: '#d3d3d3',
  borderDark: '#3e3e42',
  text: '#333333',
  textSecondary: '#666666',
  background: '#ffffff',
  backgroundSecondary: '#f3f3f3',
}

// Spacing scale
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
}

// Border radius
export const borderRadius = {
  sm: '3px',
  md: '5px',
  lg: '8px',
  xl: '12px',
}

// Font sizes
export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
}

// Z-index scale
export const zIndex = {
  hide: '-1',
  auto: 'auto',
  base: '0',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
}

// Animation duration
export const animation = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
}

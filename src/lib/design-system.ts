// NomadWay Design System - Tailwind Config
// Add these to your tailwind.config.js or use directly in components

// Primary Colors
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Main purple
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  }
};

// Status Colors (for badges, chips)
export const statusColors = {
  new: { bg: 'bg-neutral-100', text: 'text-neutral-700', dot: 'bg-neutral-400' },
  pending: { bg: 'bg-warning-100', text: 'text-warning-700', dot: 'bg-warning-400' },
  documentation: { bg: 'bg-primary-100', text: 'text-primary-700', dot: 'bg-primary-400' },
  analysis: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-400' },
  submission: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' },
  approved: { bg: 'bg-success-100', text: 'text-success-700', dot: 'bg-success-400' },
  rejected: { bg: 'bg-danger-100', text: 'text-danger-700', dot: 'bg-danger-400' },
};

// Temperature Colors
export const temperatureColors = {
  hot: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '🔥' },
  warm: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '🌡️' },
  cold: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '❄️' },
};

// Spacing
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
};

// Typography
export const typography = {
  h1: 'text-3xl font-bold text-gray-900',
  h2: 'text-2xl font-semibold text-gray-900',
  h3: 'text-xl font-semibold text-gray-900',
  h4: 'text-lg font-medium text-gray-900',
  body: 'text-base text-gray-600',
  caption: 'text-sm text-gray-500',
  label: 'text-sm font-medium text-gray-700',
};

// Shadows
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  card: 'shadow-sm hover:shadow-md transition-shadow',
  active: 'shadow-lg shadow-primary-500/25',
};

// Border Radius
export const radius = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

// Component Classes
export const components = {
  // Cards
  card: 'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden',
  cardHover: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer',
  cardActive: 'bg-white rounded-xl border-2 border-primary-500 shadow-lg shadow-primary-500/25',
  
  // Buttons
  buttonPrimary: 'px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all',
  buttonSecondary: 'px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all',
  buttonGhost: 'px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-all',
  buttonDanger: 'px-4 py-2 bg-danger-500 text-white font-medium rounded-lg hover:bg-danger-600 transition-all',
  
  // Inputs
  input: 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
  inputError: 'w-full px-4 py-2.5 bg-red-50 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
  
  // Badges
  badge: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
  badgeSuccess: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700',
  badgeWarning: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-700',
  badgeDanger: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-danger-100 text-danger-700',
  badgeInfo: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700',
  
  // Tables
  table: 'w-full text-left',
  tableHeader: 'bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider',
  tableRow: 'hover:bg-gray-50 transition-colors',
  tableCell: 'px-4 py-3 text-sm',
  
  // Stats Cards
  statCard: 'bg-white rounded-xl border border-gray-200 p-4',
  statValue: 'text-3xl font-bold text-gray-900',
  statLabel: 'text-sm text-gray-500',
  statChange: 'text-xs font-medium',
  
  // Sidebar Nav Item
  navItem: 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
  navItemActive: 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-accent-500/25',
  navItemInactive: 'text-gray-600 hover:bg-gray-50',
  
  // Modal
  modalOverlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
  modalContent: 'bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6',
  
  // Dropdown
  dropdown: 'absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50',
  dropdownItem: 'px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors',
  
  // Empty State
  empty: 'flex flex-col items-center justify-center py-12 text-center',
  emptyIcon: 'w-16 h-16 text-gray-300 mb-4',
  emptyTitle: 'text-lg font-medium text-gray-900 mb-1',
  emptyText: 'text-sm text-gray-500',
};
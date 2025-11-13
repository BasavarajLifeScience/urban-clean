/**
 * Premium Color System for Urban Clean
 *
 * A sophisticated color palette designed for a premium service booking experience.
 * All colors are centralized here for easy theme customization.
 */

export const colors = {
  // Primary Brand Colors - Deep Emerald Green (Trust, Growth, Sustainability)
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#10B981',  // Main primary color
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // Secondary Colors - Sophisticated Navy Blue (Professionalism, Security)
  secondary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1E40AF',
    800: '#1E3A8A',
    900: '#1E293B',
  },

  // Accent Colors - Warm Amber (Energy, Action)
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Neutral Grays - Premium Slate Tones
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    1000: '#000000',
  },

  // Semantic Colors
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#059669',
    darker: '#047857',
  },

  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#D97706',
    darker: '#B45309',
  },

  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#DC2626',
    darker: '#B91C1C',
  },

  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#2563EB',
    darker: '#1D4ED8',
  },

  // Status Colors for Bookings
  status: {
    pending: '#F59E0B',      // Amber
    assigned: '#3B82F6',     // Blue
    inProgress: '#8B5CF6',   // Purple
    completed: '#10B981',    // Green
    cancelled: '#EF4444',    // Red
    refunded: '#6B7280',     // Gray
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    dark: '#0F172A',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text Colors
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#94A3B8',
    disabled: '#CBD5E1',
    inverse: '#FFFFFF',
    link: '#2563EB',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
  },

  // Border Colors
  border: {
    light: '#E2E8F0',
    main: '#CBD5E1',
    dark: '#94A3B8',
    focus: '#10B981',
  },

  // Shadow Colors
  shadow: {
    sm: 'rgba(0, 0, 0, 0.05)',
    md: 'rgba(0, 0, 0, 0.1)',
    lg: 'rgba(0, 0, 0, 0.15)',
    xl: 'rgba(0, 0, 0, 0.2)',
  },

  // Gradient Colors
  gradients: {
    primary: ['#10B981', '#0D9488'],
    secondary: ['#3B82F6', '#2563EB'],
    sunset: ['#F59E0B', '#EF4444'],
    ocean: ['#06B6D4', '#3B82F6'],
    forest: ['#10B981', '#059669'],
  },

  // Role-specific Colors
  roles: {
    resident: {
      main: '#3B82F6',
      light: '#DBEAFE',
      dark: '#1E40AF',
    },
    sevak: {
      main: '#10B981',
      light: '#D1FAE5',
      dark: '#059669',
    },
    vendor: {
      main: '#F59E0B',
      light: '#FEF3C7',
      dark: '#D97706',
    },
  },

  // Rating Colors
  rating: {
    star: '#F59E0B',
    starEmpty: '#E2E8F0',
    excellent: '#10B981',  // 4.5+
    good: '#3B82F6',       // 3.5-4.4
    average: '#F59E0B',    // 2.5-3.4
    poor: '#EF4444',       // < 2.5
  },
} as const;

// Type exports for TypeScript
export type ColorKey = keyof typeof colors;
export type PrimaryShade = keyof typeof colors.primary;
export type NeutralShade = keyof typeof colors.neutral;

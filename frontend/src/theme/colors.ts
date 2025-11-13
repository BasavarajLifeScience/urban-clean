/**
 * Premium Color System for Urban Clean
 *
 * Inspired by premium service platforms with sophisticated color palette.
 * Deep purples, elegant teals, and warm accents for a luxurious feel.
 */

export const colors = {
  // Primary Brand Colors - Deep Purple (Premium, Trust, Sophistication)
  primary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',  // Main primary color
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Secondary Colors - Elegant Teal (Calm, Professional, Fresh)
  secondary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // Accent Colors - Sunset Orange (Warmth, Energy, Action)
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // Neutral Grays - Sophisticated Slate with Blue undertones
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
    light: '#E0F2FE',
    main: '#0EA5E9',
    dark: '#0284C7',
    darker: '#0369A1',
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
    overlay: 'rgba(15, 23, 42, 0.6)',
    gradient: {
      start: '#8B5CF6',
      middle: '#7C3AED',
      end: '#6D28D9',
    },
  },

  // Text Colors
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#94A3B8',
    disabled: '#CBD5E1',
    inverse: '#FFFFFF',
    link: '#7C3AED',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
  },

  // Border Colors
  border: {
    light: '#E2E8F0',
    main: '#CBD5E1',
    dark: '#94A3B8',
    focus: '#8B5CF6',
  },

  // Shadow Colors
  shadow: {
    sm: 'rgba(139, 92, 246, 0.1)',
    md: 'rgba(139, 92, 246, 0.15)',
    lg: 'rgba(139, 92, 246, 0.2)',
    xl: 'rgba(139, 92, 246, 0.25)',
  },

  // Gradient Colors
  gradients: {
    primary: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    secondary: ['#14B8A6', '#0D9488', '#0F766E'],
    sunset: ['#F97316', '#EA580C', '#C2410C'],
    ocean: ['#0EA5E9', '#0284C7', '#0369A1'],
    royal: ['#7C3AED', '#8B5CF6', '#A78BFA'],
    premium: ['#6D28D9', '#8B5CF6', '#14B8A6'],
  },

  // Role-specific Colors - Premium variations
  roles: {
    resident: {
      main: '#8B5CF6',       // Purple - Premium, sophisticated
      light: '#EDE9FE',
      dark: '#6D28D9',
      gradient: ['#8B5CF6', '#7C3AED'],
    },
    sevak: {
      main: '#14B8A6',       // Teal - Professional, trustworthy
      light: '#CCFBF1',
      dark: '#0F766E',
      gradient: ['#14B8A6', '#0D9488'],
    },
    vendor: {
      main: '#F97316',       // Orange - Energetic, business-focused
      light: '#FFEDD5',
      dark: '#C2410C',
      gradient: ['#F97316', '#EA580C'],
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

  // Premium UI Elements
  premium: {
    gold: '#EAB308',
    silver: '#94A3B8',
    bronze: '#D97706',
    platinum: '#E5E7EB',
  },
} as const;

// Type exports for TypeScript
export type ColorKey = keyof typeof colors;
export type PrimaryShade = keyof typeof colors.primary;
export type NeutralShade = keyof typeof colors.neutral;

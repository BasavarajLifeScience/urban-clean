import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Modern balanced theme - between dark and light
export const modernTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#06b6d4', // Cyan
    primaryContainer: '#0891b2', // Darker Cyan
    secondary: '#8b5cf6', // Purple
    secondaryContainer: '#7c3aed', // Darker Purple
    tertiary: '#ec4899', // Pink
    tertiaryContainer: '#db2777', // Darker Pink
    error: '#ef4444',
    errorContainer: '#dc2626',
    background: '#1e293b', // Dark slate
    surface: '#ffffff', // White cards
    surfaceVariant: '#f8fafc', // Light surface
    outline: '#334155',
    outlineVariant: '#475569',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onTertiary: '#ffffff',
    onBackground: '#f8fafc',
    onSurface: '#0f172a',
    onSurfaceVariant: '#64748b',
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#f8fafc',
      level3: '#f1f5f9',
      level4: '#e2e8f0',
      level5: '#cbd5e1',
    },
  },
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#06b6d4',
    secondary: '#8b5cf6',
    tertiary: '#ec4899',
    error: '#ef4444',
    background: '#f8fafc',
    surface: '#FFFFFF',
    onSurface: '#0f172a',
    onBackground: '#1e293b',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#06b6d4',
    secondary: '#8b5cf6',
    tertiary: '#ec4899',
    error: '#ef4444',
    background: '#0f172a',
    surface: '#1e293b',
  },
};

export const colors = {
  // Primary palette
  primary: '#06b6d4',
  primaryDark: '#0891b2',
  primaryLight: '#22d3ee',

  // Secondary palette
  secondary: '#8b5cf6',
  secondaryDark: '#7c3aed',
  secondaryLight: '#a78bfa',

  // Accent palette
  accent: '#ec4899',
  accentDark: '#db2777',
  accentLight: '#f472b6',

  // Status colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',

  // Background colors
  backgroundDark: '#0f172a',
  backgroundMedium: '#1e293b',
  backgroundLight: '#f8fafc',

  // Gray scale
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Gradients
  gradients: {
    primary: ['#06b6d4', '#0891b2'],
    secondary: ['#8b5cf6', '#7c3aed'],
    accent: ['#ec4899', '#db2777'],
    sunset: ['#f59e0b', '#ef4444'],
    ocean: ['#3b82f6', '#06b6d4'],
    purple: ['#a855f7', '#ec4899'],
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 34,
    fontWeight: '800' as const,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  subtitle1: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 26,
  },
  subtitle2: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  overline: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
};

export const borderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 12,
  },
  colored: {
    primary: {
      shadowColor: '#06b6d4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    secondary: {
      shadowColor: '#8b5cf6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    accent: {
      shadowColor: '#ec4899',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

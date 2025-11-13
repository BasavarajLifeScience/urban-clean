/**
 * Theme System - Central Export
 *
 * Combines React Native Paper theme with custom premium theme system
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';

// React Native Paper themes for use with PaperProvider
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary[600],
    secondary: colors.secondary[600],
    tertiary: colors.accent[600],
    error: colors.error.main,
    background: colors.background.secondary,
    surface: colors.background.primary,
    onSurface: colors.text.primary,
    onBackground: colors.text.primary,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary[500],
    secondary: colors.secondary[500],
    tertiary: colors.accent[500],
    error: colors.error.main,
  },
};

// Premium theme system - use this for custom styling
export const theme = {
  colors,
  typography,
  spacing,
  shadows,

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },

  // Layout
  layout: {
    containerPadding: 16,
    screenPadding: 20,
    cardPadding: 16,
    sectionGap: 24,
  },

  // Z-Index
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    toast: 50,
  },

  // Transitions
  transitions: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
} as const;

// Export individual modules for granular imports
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { shadows } from './shadows';

// Type exports
export type Theme = typeof theme;
export default theme;

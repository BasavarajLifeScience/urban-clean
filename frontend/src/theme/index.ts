/**
 * Theme System - Central Export
 *
 * Import this file to access all theme values
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';

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

/**
 * Gurumaa App Theme
 * Optimized for elderly users with larger fonts, better contrast, and improved readability
 */

// Primary Colors - High contrast for visibility
export const colors = {
  // Primary - Maroon (HEADER_BG from Reader)
  primary: '#3D0000',
  primaryDark: '#2D0000',
  primaryLight: '#6B0000',

  // Secondary - Saffron and Gold
  secondary: '#FF9933',
  secondaryDark: '#E67300',
  secondaryLight: '#D4AF37',

  // Backgrounds - Spiritual Cream
  background: '#FFF8EE',
  backgroundSecondary: '#FFF3DC',
  backgroundCard: '#FFFFFF',
  backgroundWarm: '#FFF8EE',
  backgroundCream: '#FFF8EE',

  // Text Colors
  textPrimary: '#3D0000',
  textSecondary: '#6B0000',
  textTertiary: '#E67300',
  textOnPrimary: '#FFFFFF',
  textLink: '#E67300',

  // UI Elements
  border: '#D4AF37',
  borderLight: '#F5E7A0',

  // Status Colors
  success: '#059669',
  error: '#DC2626',
  warning: '#D4AF37',
  info: '#4A0072',

  // Tab Bar
  tabActive: '#FF9933',
  tabInactive: '#6B0000',
  tabBackground: '#FFF8EE',

  // Header
  headerBackground: '#3D0000',
  headerTint: '#F5E7A0',
};

// Spacing - Larger for better touch targets and readability
export const spacing = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  xxl: 48,
};

// Typography - Significantly larger sizes for elderly users
export const typography = {
  // Headings - Much larger for visibility
  h1: 36,        // Was 32
  h2: 30,        // Was 26
  h3: 26,        // Was 22
  h4: 22,        // New - was part of body

  // Body text - Larger for readability
  body: 18,      // Was 16 - significantly larger
  bodyLarge: 20, // Extra large body text
  bodySmall: 16, // Was 14

  // UI Elements
  button: 18,    // Larger button text
  input: 18,     // Larger input text
  label: 16,     // Form labels

  // Small text - Still readable for elderly
  small: 15,     // Was 14
  caption: 14,   // Was 12 - larger caption
};

// Border radius - Slightly more rounded for modern look
export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  round: 9999,
};

// Touch targets - Minimum 48px for elderly accessibility
export const touchTargets = {
  minimum: 48,
  comfortable: 56,
  large: 64,
};

// Shadows - Subtle but visible
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

export default colors;

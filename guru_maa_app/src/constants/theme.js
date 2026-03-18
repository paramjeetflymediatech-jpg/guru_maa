/**
 * Gurumaa App Theme
 * Optimized for elderly users with larger fonts, better contrast, and improved readability
 */

// Primary Colors - High contrast for visibility
export const colors = {
  // Primary - Deep Purple (more saturated for better visibility)
  primary: '#6200ee',
  primaryDark: '#3700b3',
  primaryLight: '#bb86fc',

  // Secondary - Warm Saffron Accent (more vibrant)
  secondary: '#ff6f00',
  secondaryDark: '#e65100',
  secondaryLight: '#ffb74d',

  // Backgrounds - Soft warm tones to reduce eye strain
  background: '#ffffff',
  backgroundSecondary: '#F9FAFB',
  backgroundCard: '#ffffff',
  backgroundWarm: '#FFF9F0', // Warm background for content
  backgroundCream: '#FFFDF7', // Reader background

  // Text Colors - High contrast for readability
  textPrimary: '#1a1a1a',    // Near black for maximum contrast
  textSecondary: '#4B5563',  // Darker gray for better readability
  textTertiary: '#6B7280',  // Lighter but still readable
  textOnPrimary: '#ffffff',
  textLink: '#2563EB',       // More visible link color

  // UI Elements
  border: '#D1D5DB',         // Slightly darker borders
  borderLight: '#E5E7EB',

  // Status Colors - More vibrant for visibility
  success: '#059669',        // Darker green
  error: '#DC2626',          // Darker red
  warning: '#D97706',        // Darker amber
  info: '#2563EB',            // Darker blue

  // Tab Bar
  tabActive: '#6200ee',
  tabInactive: '#6B7280',    // Darker inactive color
  tabBackground: '#ffffff',

  // Header
  headerBackground: '#ffffff',
  headerTint: '#6200ee',
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

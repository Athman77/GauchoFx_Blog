export const COLORS = {
  primary: '#3366FF',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E6EEFF',
  onPrimaryContainer: '#1030A6',

  secondary: '#6C63FF',
  onSecondary: '#FFFFFF',

  background: '#F8FAFB',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F7FA',
  onSurface: '#1A202C',
  onSurfaceMuted: '#718096',
  surfaceVariant: '#F3F4F6',

  outline: '#E2E8F0',
  outlineStrong: '#A0AEC0',

  success: '#16A34A',
  error: '#EF4444',

  transparentBlack: 'rgba(0,0,0,0.4)',
  deepTransparentBlack: 'rgba(0,0,0,0.6)',
  lightOverlay: 'rgba(0,0,0,0.2)',
};

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const SHADOW = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const TYPOGRAPHY = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700' as const,
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700' as const,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
};

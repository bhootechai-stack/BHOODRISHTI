/**
 * Central Design Tokens
 * Extracted from Google Stitch Reference Design System (BhooTech AI)
 * Pure Visual Styling Tokens
 */

export const PALETTE = {
  // Main background (soft cream / mint off-white)
  background: '#f6fbf5',

  // Surfaces & Containers
  surface: '#f6fbf5',
  surfaceLowest: '#ffffff',       // Main card & panel background
  surfaceContainerLow: '#f0f5f0', // Inner cards, stat badges, sub-rows
  surfaceContainer: '#ebefea',    // Neutral chips, inactive tabs, pill bases
  surfaceContainerHigh: '#e5e9e4',// Subtle borders, hover states, gauge track
  surfaceContainerHighest: '#dfe4df', // Separators, boundary lines
  inverseSurface: '#2c322e',
  inverseOnSurface: '#edf2ed',

  // Primary Accent (Deep Forest Green)
  primary: '#183b1e',             // Headings, brand logo, strong accents
  primaryContainer: '#2f5233',    // Primary CTA buttons, active tabs, gauge active arc
  onPrimary: '#ffffff',           // White text on primary buttons
  primaryFixed: '#c4edc3',        // Soft pastel green status badge background
  primaryFixedDim: '#a9d1a8',
  onPrimaryFixed: '#002108',      // Deep forest green text on status badge
  onPrimaryContainer: '#9dc49d',
  primaryHover: '#1e4224',

  // Secondary / Amber Warning Colors
  secondary: '#8f4e00',           // Warm amber status text & map pins
  secondaryContainer: '#fea047',  // Amber warning card badge & left accent stripe
  onSecondaryContainer: '#6d3a00',// Deep amber-brown text
  secondaryFixed: '#ffdcc2',      // Light peach-amber badge
  secondaryFixedDim: '#ffb77a',
  onSecondaryFixed: '#2e1500',

  // Error / Urgent Alert Colors (Muted Red)
  error: '#ba1a1a',               // Muted red for urgent disease alert & logout
  errorContainer: '#ffdad6',      // Light red tint for urgent alert cards & logout card
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  // Typography & Text
  onSurface: '#181d1a',           // Primary text (headings, titles, numbers)
  onSurfaceVariant: '#424841',    // Secondary text (subtitles, descriptions, captions)
  outline: '#727970',             // Muted outline / placeholder / inactive icons
  outlineVariant: '#c2c8be',      // Soft border dividers

  // Radius Tokens
  radiusCard: '12px',             // 0.75rem (rounded-xl)
  radiusButton: '12px',           // 0.75rem (rounded-xl) or 8px (rounded-lg)
  radiusInner: '8px',             // 0.5rem (rounded-lg)
  radiusFull: '9999px',           // (rounded-full)

  // Shadows
  shadowSm: '0 1px 3px rgba(0, 0, 0, 0.04)',
  shadowMd: '0 2px 8px rgba(0, 0, 0, 0.06)',
  shadowHeader: '0 1px 8px rgba(0, 0, 0, 0.04)',
  shadowBottomNav: '0 -1px 8px rgba(0, 0, 0, 0.04)',

  // Backward compatibility aliases
  surfaceAlt: '#ffffff',
  surfaceHover: '#f0f5f0',
  border: '#e5e9e4',
  borderInput: '#c2c8be',
  borderDark: '#727970',
  primaryAccent: '#2f5233',
  primaryAccentHover: '#183b1e',
  primaryAccentLight: '#c4edc3',
  accentContrastText: '#ffffff',
  textHeading: '#181d1a',
  textPrimary: '#181d1a',
  textBody: '#424841',
  textSecondary: '#727970',
  textPlaceholder: '#727970',
  textMuted: '#727970',
  tabActiveBg: '#2f5233',
  tabActiveText: '#ffffff',
  tabInactiveBg: '#ebefea',
  tabInactiveText: '#424841',
  alertRed: '#ba1a1a',
  alertRedBg: '#ffdad6',
  alertRedBorder: '#ba1a1a',
  alertDanger: '#ba1a1a',
  danger: '#ba1a1a',
  alertAmber: '#8f4e00',
  alertAmberBg: '#ffdcc2',
  alertAmberBorder: '#fea047',
  gaugeTrack: '#e5e9e4',
  gaugeFill: '#2f5233',
  chartPrimary: '#2f5233',
  chartSecondary: '#727970',
  chartNeutral: '#e5e9e4',
  chartBorder: '#c2c8be',
  chartRed: '#ba1a1a',
  chartAmber: '#fea047',
  shadowCard: '0 1px 3px rgba(0, 0, 0, 0.04)',
  elevated: '#ffffff',
  glassBg: '#ffffff',
  glassBgHover: '#f0f5f0',
  glassBorder: '#e5e9e4',
  glassBorderCSS: '1px solid #e5e9e4',
  glassBlur: 'none',
  glassShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  btnPrimaryGlassBg: '#2f5233',
  drawerActiveTint: '#c4edc3',
};

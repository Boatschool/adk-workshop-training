/**
 * Admin Design Tokens
 * TypeScript interface for design system tokens with type safety
 * Professional admin interface theme
 */

export interface AdminColorTokens {
  // Neutral Colors
  white: string;
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Brand Colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Semantic Colors
  success: string;
  successLight: string;
  successDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  error: string;
  errorLight: string;
  errorDark: string;
  info: string;
  infoLight: string;
  infoDark: string;

  // Admin-Specific
  adminPrimary: string;
  adminSecondary: string;
  adminAccent: string;
  adminMuted: string;

  // Background Colors
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };

  // Text Colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };

  // Border Colors
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
  };
}

export interface AdminSpacingTokens {
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
}

export interface AdminTypographyTokens {
  size: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  weight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface AdminComponentTokens {
  card: {
    background: string;
    border: string;
    shadow: string;
    padding: string;
    radius: string;
  };

  button: {
    height: string;
    primary: {
      bg: string;
      text: string;
      hover: string;
    };
    secondary: {
      bg: string;
      text: string;
      border: string;
      hover: string;
    };
  };

  input: {
    height: string;
    bg: string;
    border: string;
    borderFocus: string;
    text: string;
    placeholder: string;
  };

  nav: {
    background: string;
    border: string;
    text: string;
    active: string;
    hover: string;
  };

  table: {
    headerBg: string;
    border: string;
    hover: string;
    stripe: string;
  };

  status: {
    active: string;
    pending: string;
    inactive: string;
    error: string;
  };
}

export interface AdminDesignTokens {
  colors: AdminColorTokens;
  spacing: AdminSpacingTokens;
  typography: AdminTypographyTokens;
  components: AdminComponentTokens;
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
  zIndex: {
    dropdown: number;
    modal: number;
    tooltip: number;
    notification: number;
  };
  transitions: {
    fast: string;
    base: string;
    slow: string;
  };
}

// Design Token Values
export const adminDesignTokens: AdminDesignTokens = {
  colors: {
    white: 'var(--gms-white, #FFFFFF)',
    gray: {
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
    },

    primary: '#8b5cf6',
    primaryLight: '#a78bfa',
    primaryDark: '#7c3aed',

    success: 'var(--gms-success, #10B981)',
    successLight: '#34d399',
    successDark: 'var(--gms-success, #10B981)',

    warning: 'var(--gms-warning, #F59E0B)',
    warningLight: '#fbbf24',
    warningDark: 'var(--gms-warning, #F59E0B)',

    error: 'var(--gms-error, #EF4444)',
    errorLight: '#f87171',
    errorDark: 'var(--gms-error, #EF4444)',

    info: 'var(--gms-bright-blue, #00AAE7)',
    infoLight: '#60a5fa',
    infoDark: 'var(--gms-bright-blue, #00AAE7)',

    adminPrimary: '#8b5cf6',
    adminSecondary: '#71717a',
    adminAccent: '#f97316',
    adminMuted: '#a1a1aa',

    bg: {
      primary: 'var(--gms-white, #FFFFFF)',
      secondary: '#fafafa',
      tertiary: '#f4f4f5',
      elevated: 'var(--gms-white, #FFFFFF)',
    },

    text: {
      primary: '#18181b',
      secondary: '#52525b',
      tertiary: '#71717a',
      inverse: 'var(--gms-white, #FFFFFF)',
    },

    border: {
      primary: '#e4e4e7',
      secondary: '#d4d4d8',
      focus: '#8b5cf6',
      error: 'var(--gms-error, #EF4444)',
    },
  },

  spacing: {
    xs: '8px',
    sm: '12px',
    base: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
  },

  typography: {
    size: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '24px',
      '2xl': '32px',
      '3xl': '48px',
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  components: {
    card: {
      background: 'var(--gms-white, #FFFFFF)',
      border: '#e4e4e7',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      radius: '12px',
    },

    button: {
      height: '40px',
      primary: {
        bg: '#8b5cf6',
        text: 'var(--gms-white, #FFFFFF)',
        hover: '#7c3aed',
      },
      secondary: {
        bg: 'var(--gms-white, #FFFFFF)',
        text: '#3f3f46',
        border: '#d4d4d8',
        hover: '#fafafa',
      },
    },

    input: {
      height: '40px',
      bg: 'var(--gms-white, #FFFFFF)',
      border: '#d4d4d8',
      borderFocus: '#8b5cf6',
      text: '#18181b',
      placeholder: '#71717a',
    },

    nav: {
      background: 'var(--gms-white, #FFFFFF)',
      border: '#e4e4e7',
      text: '#3f3f46',
      active: '#8b5cf6',
      hover: '#f4f4f5',
    },

    table: {
      headerBg: '#fafafa',
      border: '#e4e4e7',
      hover: '#fafafa',
      stripe: '#fafafa',
    },

    status: {
      active: 'var(--gms-success, #10B981)',
      pending: 'var(--gms-warning, #F59E0B)',
      inactive: '#a1a1aa',
      error: 'var(--gms-error, #EF4444)',
    },
  },

  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1400px',
  },

  zIndex: {
    dropdown: 1000,
    modal: 1050,
    tooltip: 1100,
    notification: 1200,
  },

  transitions: {
    fast: '0.15s ease',
    base: '0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
    slow: '0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
};

// Utility functions for design tokens
export const getAdminColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = adminDesignTokens.colors;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Admin color token not found: ${path}`);
      return '#000000'; // Fallback color
    }
  }

  return value;
};

export const getAdminSpacing = (size: keyof AdminSpacingTokens): string => {
  return adminDesignTokens.spacing[size];
};

export const getAdminFontSize = (size: keyof AdminTypographyTokens['size']): string => {
  return adminDesignTokens.typography.size[size];
};

export const createAdminStyles = (styles: Record<string, any>): Record<string, any> => {
  return styles;
};

// CSS-in-JS utility for React components
export const adminTheme = {
  colors: adminDesignTokens.colors,
  spacing: adminDesignTokens.spacing,
  typography: adminDesignTokens.typography,
  components: adminDesignTokens.components,
  breakpoints: adminDesignTokens.breakpoints,
  zIndex: adminDesignTokens.zIndex,
  transitions: adminDesignTokens.transitions,
};

export default adminDesignTokens;

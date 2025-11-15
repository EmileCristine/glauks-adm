export interface FontTheme {
    family: {
      primary: string;
      secondary: string;
    };
    weight: {
      thin: number;
      light: number;
      regular: number;
      medium: number;
      semiBold: number;
      bold: number;
      extraBold: number;
      black: number;
    };
    size: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  }
  
  export const FONTS: FontTheme = {
    family: {
      primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      secondary: "'Arial', Helvetica, sans-serif"
    },
    weight: {
      thin: 100,
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
      extraBold: 800,
      black: 900
    },
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  };
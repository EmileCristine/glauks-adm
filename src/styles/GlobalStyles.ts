// src/styles/GlobalStyles.ts
import { createGlobalStyle } from 'styled-components';
import { FONTS } from '../constants/fonts';

export const GlobalStyles = createGlobalStyle`
  /* Remova a linha @import e use link no index.html em vez disso */

  :root {
    /* Font Families */
    --font-primary: ${FONTS.family.primary};
    --font-secondary: ${FONTS.family.secondary};
    
    /* Font Weights */
    --font-weight-thin: ${FONTS.weight.thin};
    --font-weight-light: ${FONTS.weight.light};
    --font-weight-regular: ${FONTS.weight.regular};
    --font-weight-medium: ${FONTS.weight.medium};
    --font-weight-bold: ${FONTS.weight.bold};
    
    /* Font Sizes */
    --font-size-xs: ${FONTS.size.xs};
    --font-size-sm: ${FONTS.size.sm};
    --font-size-base: ${FONTS.size.base};
    --font-size-lg: ${FONTS.size.lg};
    --font-size-xl: ${FONTS.size.xl};
    --font-size-2xl: ${FONTS.size['2xl']};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${FONTS.family.primary};
    font-weight: ${FONTS.weight.regular};
    font-size: ${FONTS.size.base};
    line-height: ${FONTS.lineHeight.normal};
    color: #333;
    background-color: #f5f5f5;
  }

  body {
    font-family: ${FONTS.family.primary};
    font-weight: ${FONTS.weight.regular};
    font-size: ${FONTS.size.base};
    line-height: ${FONTS.lineHeight.normal};
    color: #333;
    background-color: #f5f5f5;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${FONTS.family.primary};
    font-weight: ${FONTS.weight.bold};
    line-height: ${FONTS.lineHeight.tight};
    margin-bottom: 0.5rem;
  }

  h1 { font-size: ${FONTS.size['3xl']}; }
  h2 { font-size: ${FONTS.size['2xl']}; }
  h3 { font-size: ${FONTS.size.xl}; }
  h4 { font-size: ${FONTS.size.lg}; }

  p {
    line-height: ${FONTS.lineHeight.relaxed};
    margin-bottom: 1rem;
  }

  input, button, textarea, select {
    font-family: ${FONTS.family.primary};
    font-size: ${FONTS.size.base};
  }

  button {
    font-weight: ${FONTS.weight.medium};
  }
`;
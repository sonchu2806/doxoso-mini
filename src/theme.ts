import { createTheme } from '@shopify/restyle';

const theme = createTheme({
  colors: {
    transparent: 'transparent',
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F7F7FA',
    bgTonal: '#EEF5FF',
    borderDefault: '#E5E7EB',
    borderBrand: '#2D7FF9',
    textPrimary: '#303233',
    textHint: '#8A8F98',
    textDisable: '#B2B7C0',
    textBrand: '#2D7FF9',
    textError: '#D64545',
    textOnDark: '#FFFFFF',
    overlayDark95: 'rgba(0,0,0,0.95)',
    overlayWhite10: 'rgba(255,255,255,0.10)',
    accentKeno: '#F5943A',
    accentKenoSoftStrong: '#FFF3E8',
    accentMega: '#8875FF',
    accentMegaSoft: '#F2EEFF',
    accentMegaBorder: '#DCCFFF',
    accentPower: '#5AA4F4',
    accentMax3D: '#35E89E',
    accentMax3DPro: '#20C784',
    accentLotto535: '#F5C840',
  },
  spacing: { none: 0, xs: 4, s: 8, m: 12, l: 16, xl: 24 },
  borderRadii: { s: 8, m: 12, l: 16, full: 9999 },
  textVariants: {},
  breakpoints: { phone: 0, tablet: 768 },
});

export type Theme = typeof theme;
export default theme;

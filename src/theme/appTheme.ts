import { DefaultTheme, type Theme } from '@react-navigation/native';

export const appTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#5B3DF2',
    background: '#F5F6FA',
    card: '#FFFFFF',
    text: '#14142B',
    border: '#E4E6EF',
    notification: '#5B3DF2',
  },
};


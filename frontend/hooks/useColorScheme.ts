import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * React Native's `useColorScheme` can return `'unspecified'`, which is not a key
 * of `Colors`. Collapse it to a usable theme name so call sites can index directly.
 */
export function useColorScheme(): 'light' | 'dark' {
  return useRNColorScheme() === 'dark' ? 'dark' : 'light';
}

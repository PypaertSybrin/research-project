/**
 * Since SDK 57, expo-router ships its own vendored copies of the bottom-tabs navigator
 * and its supporting elements, so everything the tab bar touches has to be taken from
 * there rather than from `@react-navigation/*`:
 *
 * - `<Tabs>` publishes the tab bar height into *expo-router's* React context, so
 *   `@react-navigation/bottom-tabs`' `useBottomTabBarHeight` reads a different context
 *   and throws "Couldn't find the bottom tab bar height" at runtime.
 * - expo-router's `PlatformPressable` types `pressColor` as `ColorValue`, where
 *   `@react-navigation/elements`' types it as `string`, so mixing the two fails to
 *   typecheck when tab bar button props are spread onto the component.
 */
export { useBottomTabBarHeight } from 'expo-router/build/react-navigation/bottom-tabs';
export type { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs';
export { PlatformPressable } from 'expo-router/build/react-navigation/elements';

import type { PropsWithChildren, ReactElement } from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { IconSymbol } from './ui/IconSymbol';
import { useRouter } from 'expo-router';

const HEADER_HEIGHT = 300;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({ children, headerImage, headerBackgroundColor }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  function handleBackButton() {
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16} scrollIndicatorInsets={{ bottom }} contentContainerStyle={{ paddingBottom: bottom }}>
        <Animated.View style={[styles.header, { backgroundColor: headerBackgroundColor[colorScheme] }, headerAnimatedStyle]}>{headerImage}</Animated.View>
        <Pressable onPress={handleBackButton} style={{ ...styles.icons, left: 32 }}>
          <IconSymbol name="back" size={32} color={'#000'} />
        </Pressable>
        <Pressable onPress={() => console.log('back')} style={{ ...styles.icons, right: 32 }}>
          <IconSymbol name="like" size={32} color={'#000'} />
        </Pressable>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
  icons: {
    position: 'absolute',
    top: 32,
    zIndex: 1,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
});

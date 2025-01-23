import React from 'react';
import { StyleSheet, View, Animated, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export function RecipeSmallSkeletonList({ count }: { count: number }) {
  const colorScheme = useColorScheme();

  // Create an array of animations for each skeleton
  const fadeAnims = React.useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;

  // Start the fade-in animations for all skeletons simultaneously
  React.useEffect(() => {
    Animated.parallel(
      fadeAnims.map((fadeAnim) =>
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [fadeAnims]);

  return (
    <View style={styles.container}>
      {fadeAnims.map((fadeAnim, index) => (
        <Animated.View
          key={index}
          style={[styles.shadowWrapper, { opacity: fadeAnim }]}
        >
          <View
            style={{
              ...styles.skeletonContainer,
              backgroundColor: Colors[colorScheme ?? 'light'].card,
            }}
          >
            <View style={styles.imageContainer}>
              <View style={styles.skeletonImage} />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.skeletonText} />
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  shadowWrapper: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
    margin: 8,
  },
  skeletonContainer: {
    flexDirection: 'column',
    gap: 8,
    padding: 8,
    borderRadius: 12,
    width: 100, // Adjust to fit your layout
  },
  imageContainer: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: Colors.light.greyBackground,
  },
  skeletonImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: Colors.light.greyBackground,
  },
  textContainer: {
    marginTop: 8,
  },
  skeletonText: {
    height: 16,
    backgroundColor: Colors.light.greyBackground,
    borderRadius: 4,
  },
});

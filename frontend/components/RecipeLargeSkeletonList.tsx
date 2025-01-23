import { StyleSheet, View, Animated, useColorScheme } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import React from 'react';

export function RecipeLargeSkeletonList({ count }: { count: number }) {
  const colorScheme = useColorScheme();

  // Create an array of animations for each skeleton element
  const fadeAnims = React.useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;

  // Start the fade-in animations for all skeletons simultaneously
  React.useEffect(() => {
    Animated.parallel(
      fadeAnims.map((fadeAnim) =>
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [fadeAnims]);

  return (
    <View>
      {fadeAnims.map((fadeAnim, index) => (
        <Animated.View
          key={index}
          style={[styles.shadowWrapper, { opacity: fadeAnim }]}
        >
          <View
            style={{
              ...styles.container,
              backgroundColor: Colors[colorScheme ?? 'light'].card,
            }}
          >
            {/* Image Skeleton */}
            <View style={styles.imageContainer}>
              <View style={styles.skeletonImage}></View>
            </View>

            {/* Text Skeleton */}
            <View style={styles.recipeContainer}>
              <ThemedText style={styles.skeletonText}></ThemedText>

              <View style={styles.infoRow}>
                <ThemedText
                  style={{
                    ...styles.skeletonText,
                    height: 32,
                    width: 60,
                    borderRadius: 16,
                  }}
                ></ThemedText>
                <ThemedText
                  style={{ ...styles.skeletonText, width: 60 }}
                ></ThemedText>
              </View>

              <View
                style={{
                  flex: 1,
                  gap: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                <ThemedText
                  style={{ ...styles.skeletonText, width: 100 }}
                ></ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
    margin: 8,
  },
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  skeletonImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: Colors.light.greyBackground,
  },
  recipeContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  skeletonText: {
    height: 16,
    backgroundColor: Colors.light.greyBackground,
    marginBottom: 6,
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },
});

import { StyleSheet, View, Animated, useColorScheme } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import React from 'react';

export function RecipeLargeSkeleton() {
  const colorScheme = useColorScheme();
  const fadeAnim = new Animated.Value(0);  // Initial opacity value

  // Start the fade-in animation
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.shadowWrapper, { opacity: fadeAnim }]}>
      <View style={{ ...styles.container, backgroundColor: Colors[colorScheme ?? 'light'].card }}>
        {/* Image Skeleton */}
        <View style={styles.imageContainer}>
          <View style={styles.skeletonImage}></View>
        </View>

        {/* Text Skeleton */}
        <View style={styles.recipeContainer}>
          <ThemedText style={styles.skeletonText}></ThemedText>

          <View style={styles.infoRow}>
            <ThemedText style={{ ...styles.skeletonText, height: 24, width: 48, borderRadius: 16 }}></ThemedText>
            <ThemedText style={{ ...styles.skeletonText, width: 60 }}></ThemedText>
          </View>

          <View style={{ flex: 1, gap: 4, flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            {/* <MaterialIcons name="chef-hat" size={16} color={Colors[colorScheme ?? 'light'].primary} /> */}
            <ThemedText style={{...styles.skeletonText, width: 100}}></ThemedText>
          </View>
        </View>
      </View>
    </Animated.View>
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

import { Recipe } from '@/constants/Recipe';
import { ThemedView } from './ThemedView';
import { Image } from 'expo-image';
import { StyleSheet, useColorScheme, View, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';
import { Link } from 'expo-router';

export function RecipeSmall({ recipe }: { recipe: Recipe }) {
  const colorScheme = useColorScheme();
  const [imageError, setImageError] = useState(false);
  return (
    <Link
      href={{
        pathname: '/recipedetail',
        params: { recipe: JSON.stringify(recipe) },
      }}
      asChild
    >
      <Pressable>
        <ThemedView style={styles.shadowWrapper}>
          <ThemedView style={{ ...styles.container, backgroundColor: Colors[colorScheme ?? 'light'].white }}>
            <View style={styles.imageContainer}>
              {imageError ? (
                <View style={styles.fallbackBox}>
                  <ThemedText style={styles.fallbackText}>No Image Found</ThemedText>
                </View>
              ) : (
                <Image style={styles.image} source={{ uri: recipe.ImageUrl }} onError={() => setImageError(true)} />
              )}
            </View>
            <ThemedText style={styles.recipeName} numberOfLines={1}>
              {recipe.Name}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </Pressable>
    </Link>
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
    flexDirection: 'column',
    gap: 4,
    padding: 8,
    borderRadius: 12,
  },
  imageContainer: {
    width: 85,
    height: 85,
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  fallbackBox: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 85,
  },
});

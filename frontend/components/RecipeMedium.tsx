import { Recipe } from '@/constants/Recipe';
import { ThemedView } from './ThemedView';
import { Image } from 'expo-image';
import { StyleSheet, useColorScheme, View, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Link } from 'expo-router';

export function RecipeMedium({ recipe }: { recipe: Recipe }) {
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
          <ThemedView style={{ ...styles.container, backgroundColor: Colors[colorScheme ?? 'light'].card }}>
            <View style={styles.imageContainer}>
              {imageError ? (
                <View style={{...styles.fallbackBox, backgroundColor: Colors[colorScheme ?? 'light'].greyBackground}}>
                  <ThemedText style={{...styles.fallbackText, color: Colors[colorScheme ?? 'light'].greyText}}>No Image Found</ThemedText>
                </View>
              ) : (
                <Image style={styles.image} source={{ uri: recipe.ImageUrl }} onError={() => setImageError(true)} />
              )}
            </View>
            <View style={styles.recipeInfoContainer}>
              <ThemedText style={styles.recipeName} numberOfLines={2}>
                {recipe.Name}
              </ThemedText>
              <View style={{ gap: 4, flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <MaterialCommunityIcons name="chef-hat" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                <ThemedText style={styles.recipeCreator} numberOfLines={1}>
                  {recipe.Author}
                </ThemedText>
              </View>
            </View>
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
    flex: 1, // Ensure it fills available space
    minHeight: 210, // Set a minimum height to make sure all recipes have the same height
  },
  imageContainer: {
    width: '100%',
    height: 110,
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  fallbackBox: {
    width: "100%",
    height: 110,
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
  recipeInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipeCreator: {
    fontSize: 14,
  },
});


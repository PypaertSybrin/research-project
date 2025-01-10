import { Recipe } from '@/constants/Recipe';
import { ThemedView } from './ThemedView';
import { Image } from 'expo-image';
import { StyleSheet, useColorScheme, View, TouchableOpacity, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from './ui/IconSymbol';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';

export function RecipeLarge({ recipe }: { recipe: Recipe }) {
  const colorScheme = useColorScheme();
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  function convertMinToReadableFormat(min: number) {
    let hours = Math.floor(min / 60);
    let minutes = min % 60;
    return `${hours}h ${minutes}m`;
  }

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
              <View style={styles.imageOverlay}>
                <IconSymbol name="like" size={24} color={'#000'} />
              </View>
            </View>
            <View style={styles.recipeContainer}>
              <ThemedText style={styles.recipeName} numberOfLines={1}>
                {recipe.Name}
              </ThemedText>
              <View style={styles.infoRow}>
                <ThemedText
                  style={{
                    ...styles.recipeInfo,
                    backgroundColor: Colors[colorScheme ?? 'light'].primary,
                  }}
                  numberOfLines={1}
                >
                  {recipe.Difficulty}
                </ThemedText>
                <View style={styles.timerContainer}>
                  <IconSymbol name="timer" size={16} color={'#aaa'} />
                  <ThemedText style={styles.timerText} numberOfLines={1}>
                    {convertMinToReadableFormat(parseInt(recipe.Time))}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.recipeCreator} numberOfLines={1}>
                By {recipe.Author}
              </ThemedText>
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
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 4,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 12,
  },
  fallbackBox: {
    width: 110,
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
  recipeContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },
  recipeInfo: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 50,
    fontSize: 14,
    overflow: 'hidden',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
  },
  recipeCreator: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
});

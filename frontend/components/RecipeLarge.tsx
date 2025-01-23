import { Recipe } from '@/constants/Recipe';
import { ThemedView } from './ThemedView';
import { Image } from 'expo-image';
import { StyleSheet, useColorScheme, View, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Link } from 'expo-router';

export function RecipeLarge({ recipe }: { recipe: Recipe }) {
  const colorScheme = useColorScheme();
  const [imageError, setImageError] = useState(false);

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
                  <MaterialIcons name="timer" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                  <ThemedText style={styles.timerText} numberOfLines={1}>
                    {convertMinToReadableFormat(parseInt(recipe.Time))}
                  </ThemedText>
                </View>
              </View>
              <View style={{ flex: 1, gap: 4, flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
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
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  imageContainer: {
    position: 'relative',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 14,
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
  },
  recipeCreator: {
    fontSize: 14,
  },
});

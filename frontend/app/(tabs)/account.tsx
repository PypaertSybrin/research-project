import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '@/constants/Recipe';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme, View, StyleSheet, FlatList } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useFocusEffect } from 'expo-router';
import React from 'react';
import { RecipeSmall } from '@/components/RecipeSmall';

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  useFocusEffect(
    React.useCallback(() => {
      const fetchLikedRecipes = async () => {
        try {
          const likedRecipes = await AsyncStorage.getItem('likedRecipes');
          if (likedRecipes && likedRecipes !== '[]') {
            const parsedLikedRecipes = JSON.parse(likedRecipes);
            const response = await fetch(`${backendUrl}:8000/get-recipes-by-ids`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ recipeIds: parsedLikedRecipes }),
            });

            if (!response.ok) {
              throw new Error('Failed to fetch response from the server.');
            }
            const data = await response.json();

            if (data.recipes) {
              setLikedRecipes(data.recipes);
            }
          } else{
            setLikedRecipes([]);
          }
        } catch (error) {
          console.error('Error fetching liked recipes:', error);
        }
      };
      fetchLikedRecipes();
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 8 }}>
        Account
      </ThemedText>
      <View style={styles.shadowWrapper}>
        <View style={styles.accountContainer}>
          <ThemedView
            style={{
              backgroundColor: Colors[colorScheme ?? 'light'].primary,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 50,
              position: 'relative',
            }}
          >
            <ThemedText>SP</ThemedText>
          </ThemedView>
          <ThemedText>Sybrin Pypaert</ThemedText>
        </View>
      </View>
      <ThemedView style={styles.favoriteContainer}>
        <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginHorizontal: 8 }}>Favorites</ThemedText>
        {likedRecipes.length > 0 ? (
          <FlatList
            data={likedRecipes}
            renderItem={({ item }) => (
              <View style={styles.recipeItem}>
                <RecipeSmall recipe={item} />
              </View>
            )}
            keyExtractor={(item) => item.Id.toString()}
            numColumns={2}  // Display 2 items per row
            contentContainerStyle={styles.recipeListContainer}
          />
        ) : (
          <ThemedText>No liked recipes</ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  shadowWrapper: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
    margin: 8,
    shadowColor: '#000',
  },
  accountContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteContainer: {
    flex: 1,
    marginVertical: 16,
  },
  recipeListContainer: {
    paddingBottom: 16,
  },
  recipeItem: {
    flexBasis: '50%', // Make sure the items are displayed in 2 columns
  },
});

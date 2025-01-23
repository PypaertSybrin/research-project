import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '@/constants/Recipe';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme, View, StyleSheet, FlatList } from 'react-native';
import { Colors } from '@/constants/Colors';
import { router, useFocusEffect } from 'expo-router';
import React from 'react';
import { RecipeMedium } from '@/components/RecipeMedium';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const getUserName = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        if (!username) {
          router.replace('/login');
        }
        setUserName(username);
      } catch (error) {
        console.error('Error fetching username:', error);
        setIsLoading(false); // Ensure loading is set to false even on error
      } finally {
        setIsLoading(false); // Ensure loading is set to false even on error
      }
    };
    getUserName();
  }, []);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.map((n) => n[0]).join('');
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 8 }}>
        Account
      </ThemedText>
      <View style={styles.shadowWrapper}>
        <View style={{ ...styles.accountContainer, backgroundColor: Colors[colorScheme ?? 'light'].card }}>
          <ThemedView
            style={{
              backgroundColor: Colors[colorScheme ?? 'light'].primary,
              borderRadius: 50,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ThemedText>{isLoading ? '' : getInitials(userName as string)}</ThemedText>
          </ThemedView>
          <ThemedText>{isLoading ? '' : userName}</ThemedText>
        </View>
      </View>
      <ThemedView style={{ ...styles.favoriteContainer, marginBottom: bottomTabBarHeight * 2 }}>
        <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginHorizontal: 8 }}>Favorites</ThemedText>
        {likedRecipes.length > 0 ? (
          <FlatList
            data={likedRecipes}
            renderItem={({ item }) => (
              <View style={styles.recipeItem}>
                <RecipeMedium recipe={item} />
              </View>
            )}
            keyExtractor={(item) => item.Id.toString()}
            numColumns={2}  // Display 2 items per row
            contentContainerStyle={{...styles.recipeListContainer, paddingBottom: bottomTabBarHeight}}
          />
        ) : (
          <ThemedText style={{marginHorizontal: 8}}>No liked recipes</ThemedText>
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
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteContainer: {
    marginTop: 16,
  },
  recipeListContainer: {
    
  },
  recipeItem: {
    flexBasis: '50%',
  },
});

import { RecipeLarge } from '@/components/RecipeLarge';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Recipe } from '@/constants/Recipe';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, useColorScheme, VirtualizedList } from 'react-native';

export default function RecipeListScreen() {
  const tabBarHeight = Platform.OS === 'ios' ? useBottomTabBarHeight() : 0;
  const params = useLocalSearchParams();
  const title = params.title;
  const type = params.type;
  const categoryName = params.categoryName as string;
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [recipeList, setRecipeList] = useState<Recipe[]>([]);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const getPopularRecipes = async (n_results: number) => {
      try {
        const response = await fetch(`${backendUrl}:8000/get-popular-recipes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ n_results: n_results }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch response from the server.');
        }
        const data = await response.json();
        if (data.recipes) {
          setRecipeList(data.recipes);
        }
      } catch (error) {
        console.error('Error fetching popular recipes:', error);
      }
    };
    const fetchRecommendedRecipes = async (n_results: number) => {
      try {
        const likedRecipes = await AsyncStorage.getItem('likedRecipes');
        if (likedRecipes && likedRecipes !== '[]') {
          const parsedLikedRecipes = JSON.parse(likedRecipes);
          const response = await fetch(`${backendUrl}:8000/get-recommended-recipes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ likedRecipeIds: parsedLikedRecipes, n_results: n_results }),
          });
          if (!response.ok) {
            throw new Error('Failed to fetch response from the server.');
          }
          const data = await response.json();
          if (data.recipes) {
            setRecipeList(data.recipes);
          }
        } else {
          getPopularRecipes(6);
        }
      } catch (error) {
        console.error('Error fetching liked recipes:', error);
      }
    };
    const fetchCategoryRecipes = async (categoryName: string, n_results: number) => {
      try {
        const response = await fetch(`${backendUrl}:8000/get-recipes-by-category`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ category: categoryName, n_results: n_results }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch response from the server.');
        }
        const data = await response.json();
        if (data.recipes) {
          setRecipeList(data.recipes);
        }
      } catch (error) {
        console.error('Error fetching category recipes:', error);
      }
    };
    if (type === 'popular') {
      getPopularRecipes(10);
    } else if (type === 'recommended') {
      fetchRecommendedRecipes(10);
    } else if (typeof categoryName === 'string') {
      console.log('Fetching category recipes for:', categoryName);
      fetchCategoryRecipes(categoryName, 10);
    }
  }, [type]);

  const handleBackButton = () => {
    router.back();
  };

  const getItem = (data: any, index: any) => data[index];
  const getItemCount = (data: any) => data.length;

  return (
    <ThemedView style={{ ...styles.container, paddingBottom: tabBarHeight }}>
      <ThemedView style={styles.header}>
        <Pressable onPress={handleBackButton} style={styles.icon}>
          <MaterialIcons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].iconSecondary} />
        </Pressable>
        <ThemedText style={{fontSize: 24, fontWeight: 'bold', lineHeight: 32}}>{title}</ThemedText>
      </ThemedView>
      {recipeList.length > 0 && <VirtualizedList data={recipeList} keyExtractor={(item) => item.Id.toString()} getItem={getItem} getItemCount={getItemCount} renderItem={({ item }) => <RecipeLarge recipe={item} />} showsVerticalScrollIndicator={false} />}
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
  header: {
    position: 'relative', // Enables positioning within the header
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
    marginHorizontal: 8,
  },
  icon: {
    position: 'absolute', // Ensures the arrow stays on the left
    left: 0,
  },
});

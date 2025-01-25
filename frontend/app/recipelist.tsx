import React, { useState, useEffect, useRef, memo } from 'react';
import { VirtualizedList, Pressable, StyleSheet, Platform, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { RecipeLarge } from '@/components/RecipeLarge';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Recipe } from '@/constants/Recipe';
import { RecipeLargeSkeleton } from '@/components/RecipeLargeSkeleton';

export default function RecipeListScreen() {
  const params = useLocalSearchParams();
  const title = params.title;
  const type = params.type;
  const categoryName = params.categoryName as string;
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [recipeList, setRecipeList] = useState([]);
  const colorScheme = useColorScheme();
  const [isVisible, setIsVisible] = useState(false);
  const listRef = useRef<VirtualizedList<Recipe>>(null);
  const MemoizedRecipeLarge = memo(RecipeLarge);

  useEffect(() => {
    const getPopularRecipes = async () => {
      try {
        const response = await fetch(`${backendUrl}:8000/get-popular-recipes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ onHomePage: false }),
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
    const fetchRecommendedRecipes = async () => {
      try {
        const likedRecipes = await AsyncStorage.getItem('likedRecipes');
        if (likedRecipes && likedRecipes !== '[]') {
          const parsedLikedRecipes = JSON.parse(likedRecipes);
          const response = await fetch(`${backendUrl}:8000/get-recommended-recipes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ likedRecipeIds: parsedLikedRecipes, onHomePage: false }),
          });
          if (!response.ok) {
            throw new Error('Failed to fetch response from the server.');
          }
          const data = await response.json();
          if (data.recipes) {
            setRecipeList(data.recipes);
          }
        } else {
          getPopularRecipes();
        }
      } catch (error) {
        console.error('Error fetching liked recipes:', error);
      }
    };
    const fetchCategoryRecipes = async (categoryName: string) => {
      try {
        const response = await fetch(`${backendUrl}:8000/get-recipes-by-category`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ category: categoryName }),
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
      getPopularRecipes();
    } else if (type === 'recommended') {
      fetchRecommendedRecipes();
    } else if (typeof categoryName === 'string') {
      fetchCategoryRecipes(categoryName);
    }
  }, [type]);

  const handleBackButton = () => {
    console.log('Back button pressed');
    router.back();
  };

  const handleScroll = (event: any) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    setIsVisible(contentOffsetY > 100);
  };

  const handleScrollToTop = () => {
    if (listRef.current) {
      listRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  };

  const getItem = (data: any, index: any) => data[index];
  const getItemCount = (data: any) => data.length;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable onPress={handleBackButton} style={styles.icon}>
          <MaterialIcons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].iconSecondary} />
        </Pressable>
        <ThemedText style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>{title}</ThemedText>
      </ThemedView>

      {recipeList.length === 0 ? (
        // Show skeleton cards while loading
        <VirtualizedList
          data={new Array(10)} // Create 10 skeleton cards
          keyExtractor={(item, index) => index.toString()}
          getItem={getItem}
          getItemCount={getItemCount}
          renderItem={() => <RecipeLargeSkeleton />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <VirtualizedList
          ref={listRef}
          data={recipeList}
          keyExtractor={(item) => item.Id.toString()}
          getItem={getItem}
          getItemCount={getItemCount}
          renderItem={({ item }) => <MemoizedRecipeLarge recipe={item} />}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
        />
      )}

      {/* Scroll to top button */}
      {isVisible && (
        <Pressable onPress={handleScrollToTop} style={{ ...styles.scrollToTopButton, backgroundColor: Colors[colorScheme ?? 'light'].primary }}>
          <MaterialIcons name="arrow-upward" size={24} color={Colors[colorScheme ?? 'light'].iconSecondary} />
        </Pressable>
      )}
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
    position: 'relative',
    marginBottom: 16,
    width: '100%',
  },
  icon: {
    position: 'absolute',
    left: 8,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    opacity: 0.8,
    borderRadius: 30,
    padding: 10,
  },
});

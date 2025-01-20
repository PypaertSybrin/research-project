import { StyleSheet, ScrollView, useColorScheme, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CategoryCard } from '@/components/CategoryCard';
import { Colors } from '@/constants/Colors';
import { useEffect, useState } from 'react';
import { Recipe } from '@/constants/Recipe';
import { RecipeSmall } from '@/components/RecipeSmall';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecipeLarge } from '@/components/RecipeLarge';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  useEffect(() => {
    const getPopularRecipes = async (forRecommended: boolean) => {
      try {
        const response = await fetch(`${backendUrl}:8000/get-popular-recipes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ onHomePage: true }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch response from the server.');
        }
        const data = await response.json();
        if (data.recipes) {
          if (forRecommended) {
            const recipesToShow = data.recipes.slice(0, 3);
            setRecommendedRecipes(recipesToShow);
          } else {
            setPopularRecipes(data.recipes);
          }
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
            body: JSON.stringify({ likedRecipeIds: parsedLikedRecipes, onHomePage: true }),
          });
          if (!response.ok) {
            throw new Error('Failed to fetch response from the server.');
          }
          const data = await response.json();
          if (data.recipes) {
            setRecommendedRecipes(data.recipes);
          }
        } else {
          getPopularRecipes(true);
        }
      } catch (error) {
        console.error('Error fetching liked recipes:', error);
      }
    };
    getPopularRecipes(false);
    fetchRecommendedRecipes();
  }, []);

  const SubTitle = ({ title, type }: { title: string; type: string }) => {
    const colorScheme = useColorScheme();
    return (
      <ThemedView style={styles.subTitleContainer}>
        <ThemedText style={styles.subTitle}>{title}</ThemedText>
        <Link
          href={{
            pathname: '/recipelist',
            params: { title: title, type: type },
          }}
          asChild
        >
          <Pressable>
            <ThemedText style={{ color: Colors[colorScheme ?? 'light'].primary, fontWeight: 'bold' }}>View All</ThemedText>
          </Pressable>
        </Link>
      </ThemedView>
    );
  };

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={{ marginHorizontal: 8, textAlign: 'left', marginBottom: 8 }}>
          Hi, Sybrin
        </ThemedText>
        <ThemedView style={styles.scrollViewWrapper}>
          <ScrollView style={styles.scrollView} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            <CategoryCard title="Baking recipes" info="Recipes which require baking" image={require('@/assets/images/baking-recipe.svg')} categoryName="baking" />
            <CategoryCard title="All recipes" info="All sorts of recipes to choose from" image={require('@/assets/images/all-recipe.svg')} categoryName="recipes" />
            <CategoryCard title="Healthy recipes" info="Recipes which are good for your health" image={require('@/assets/images/healthy-recipe.svg')} categoryName="health" />
            <CategoryCard title="Cheap recipes" info="Recipes that are cheap to make" image={require('@/assets/images/cheap-recipe.svg')} categoryName="budget" />
            <CategoryCard title="Inspiration recipes" info="Recipes to get inspiration from" image={require('@/assets/images/inspiration-recipe.svg')} categoryName="inspiration" />
          </ScrollView>
        </ThemedView>
        <ThemedView style={{marginTop: 8, marginBottom: 8}}> 
          <SubTitle title="Popular" type="popular" />
          {popularRecipes.length > 0 && (
            <ThemedView style={styles.popularRecipesContainer}>
              {popularRecipes.map((recipe) => (
                <RecipeSmall key={recipe.Id} recipe={recipe} />
              ))}
            </ThemedView>
          )}
        </ThemedView>
        <ThemedView style={{marginTop: 8}}>
          <SubTitle title="Recommended" type="recommended" />
          {recommendedRecipes.length > 0 && (
            <ThemedView>
              {recommendedRecipes.map((recipe) => (
                <RecipeLarge key={recipe.Id} recipe={recipe} />
              ))}
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  scrollViewWrapper: {
    marginBottom: 16,
  },
  scrollView: {
    marginHorizontal: 8,
  },
  scrollContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  subTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 8,
  },
  subTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  popularRecipesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

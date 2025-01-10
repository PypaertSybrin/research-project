import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Recipe } from '@/constants/Recipe';
import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet } from 'react-native';

export default function RecipeDetailScreen() {
  const recipeParams = useLocalSearchParams();
  const recipe = JSON.parse(recipeParams.recipe as string) as Recipe;
  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerImage={<Image source={{ uri: recipe.ImageUrl }} style={styles.reactLogo} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{recipe.Name}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Ingredients</ThemedText>
        <ThemedText>{recipe.Ingredients}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Instructions</ThemedText>
        <ThemedText>{recipe.Description}</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  stepContainer: {
    padding: 20,
  },
  reactLogo: {
    width: 'auto',
    height: '100%',
    position: 'relative',
  },
});

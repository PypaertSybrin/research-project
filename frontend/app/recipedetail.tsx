import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Recipe } from '@/constants/Recipe';
import { useLocalSearchParams } from 'expo-router';
import { Image, Pressable, StyleSheet, View, Animated, Easing, useColorScheme } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecipeDetailScreen() {
  const recipeParams = useLocalSearchParams();
  const recipe = JSON.parse(recipeParams.recipe as string) as Recipe;

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'Ingredients' | 'Instructions'>('Ingredients');
  const translateX = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();

  const [checkedIngredients, setCheckedIngredients] = useState(
    recipe.Ingredients.map(() => false) // Initialize an array with `false` for each ingredient
  );

  const handleCheckboxChange = async (index: number) => {
    try {
      // Retrieve the stored recipes and parse them
      const storedRecipes = await AsyncStorage.getItem('checkedIngredients');
      const storedRecipesParsed = storedRecipes ? JSON.parse(storedRecipes) : {};

      // Ensure the recipe ID is in the stored recipes object
      if (!storedRecipesParsed[recipe.Id]) {
        storedRecipesParsed[recipe.Id] = [];
      }

      // Handle the checkbox state
      const currentRecipe = storedRecipesParsed[recipe.Id];

      if (!checkedIngredients[index]) {
        // If not checked, add the index to the recipe's list of ingredients
        if (!currentRecipe.includes(index)) {
          currentRecipe.push(index);
        }
      } else {
        // If checked, remove the index from the recipe's list of ingredients
        const indexToRemove = currentRecipe.indexOf(index);
        if (indexToRemove !== -1) {
          currentRecipe.splice(indexToRemove, 1);
        }
      }

      // If the currentRecipe array is empty, remove the recipe ID
      if (currentRecipe.length === 0) {
        delete storedRecipesParsed[recipe.Id];
      }

      // Save the updated recipes back to AsyncStorage
      await AsyncStorage.setItem('checkedIngredients', JSON.stringify(storedRecipesParsed));
      console.log(await AsyncStorage.getItem('checkedIngredients'));

      // Update the local state for checkbox checked/unchecked
      setCheckedIngredients((prev) => {
        const updated = [...prev];
        updated[index] = !updated[index]; // Toggle the checkbox state
        return updated;
      });
    } catch (error) {
      console.error('Error storing checked ingredients:', error);
    }
  };

  useEffect(() => {
    const toValue = activeTab === 'Ingredients' ? 0 : 1;
    Animated.timing(translateX, {
      toValue,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  useEffect(() => {
    const fetchCheckedIngredients = async () => {
      try {
        const storedRecipes = await AsyncStorage.getItem('checkedIngredients');
        const storedRecipesParsed = storedRecipes ? JSON.parse(storedRecipes) : {};

        if (storedRecipesParsed[recipe.Id]) {
          const checkedIndices = storedRecipesParsed[recipe.Id];
          const updatedCheckedIngredients = recipe.Ingredients.map((_, index) => checkedIndices.includes(index));
          setCheckedIngredients(updatedCheckedIngredients);
        }
      } catch (error) {
        console.error('Error fetching checked ingredients:', error);
      }
    };
    fetchCheckedIngredients();
  }, []); // Re-fetch if recipe.Id changes

  const renderDescription = () => (
    <View>
      <ThemedText style={{ color: '#AAAAAA' }} numberOfLines={isDescriptionExpanded ? undefined : 2}>
        {recipe.Description}
      </ThemedText>
      <Pressable onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
        <ThemedText style={styles.link}>{isDescriptionExpanded ? 'Show less' : 'Read more'}</ThemedText>
      </Pressable>
    </View>
  );

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerImage={<Image source={{ uri: recipe.ImageUrl }} style={styles.image} />} recipe={recipe}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText style={styles.recipeName}>{recipe.Name}</ThemedText>
        {renderDescription()}
      </ThemedView>
      <ThemedView style={{ flexDirection: 'column', marginBottom: 8 }}>
        <ThemedView style={{ flexDirection: 'row', marginBottom: 8, gap: 8, flex: 1 }}>
          <RecipeInfo icon="chef-hat" community={true} info={recipe.Author} type="chef" />
          <RecipeInfo icon="restaurant-menu" community={false} info={recipe.Difficulty} type="difficulty" />
        </ThemedView>
        <ThemedView style={{ flexDirection: 'row', marginBottom: 8, gap: 8, flex: 1 }}>
          <RecipeInfo icon="timer" community={false} info={recipe.Time} type="timer" />
          <RecipeInfo icon="restaurant" community={false} info={recipe.Servings} type="servings" />
        </ThemedView>
      </ThemedView>

      {/* Toggle Switch */}
      <ThemedView style={styles.toggleContainer}>
        <Animated.View
          style={[
            styles.activeBackground,
            {
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-50%', '50%'],
                  }),
                },
              ],
            },
          ]}
        />
        <Pressable onPress={() => setActiveTab('Ingredients')} style={styles.toggleButton}>
          <ThemedText style={[styles.toggleButtonText, activeTab === 'Ingredients' && styles.activeButtonText]}>Ingredients</ThemedText>
        </Pressable>
        <Pressable onPress={() => setActiveTab('Instructions')} style={styles.toggleButton}>
          <ThemedText style={[styles.toggleButtonText, activeTab === 'Instructions' && styles.activeButtonText]}>Instructions</ThemedText>
        </Pressable>
      </ThemedView>

      {/* Content based on active tab */}
      <ThemedView style={styles.contentContainer}>
        {activeTab === 'Ingredients' && (
          <ThemedView>
            <ThemedText style={{ fontWeight: 'bold', fontSize: 24 }}>Ingredients</ThemedText>
            <ThemedText style={{ color: '#ccc' }}>{recipe.Ingredients.length} items</ThemedText>
            {recipe.Ingredients.map((ingredient, index) => (
              <Pressable
                key={index}
                onPress={() => handleCheckboxChange(index)} // Toggle checkbox when ThemedView is pressed
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 16,
                  borderBottomColor: Colors[colorScheme ?? 'light'].primary,
                  borderBottomWidth: 1,
                }}
              >
                <Checkbox
                  value={checkedIngredients[index]} // Checkbox state
                  onValueChange={() => handleCheckboxChange(index)} // Toggle checkbox directly
                  color={checkedIngredients[index] ? '#FF0000' : undefined}
                />
                <ThemedText style={{ flex: 1 }}>{ingredient}</ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        )}
        {activeTab === 'Instructions' && (
          <ThemedView>
            <ThemedText style={{ fontWeight: 'bold', fontSize: 24 }}>Instructions</ThemedText>
            {recipe.Instructions.map((instruction, index) => (
              <ThemedView style={{ borderBottomColor: Colors[colorScheme ?? 'light'].primary, borderBottomWidth: 1, paddingVertical: 8, flexDirection: 'row', gap: 8 }} key={index}>
                <ThemedText style={{ backgroundColor: Colors[colorScheme ?? 'light'].primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 50, alignSelf: 'flex-start' }}>{index}</ThemedText>
                <ThemedText style={{ flex: 1 }}>{instruction}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

export function RecipeInfo({ icon, community, info, type }: { icon: string; community: boolean; info: string; type: 'chef' | 'difficulty' | 'timer' | 'servings' }) {
  const colorScheme = useColorScheme();
  return (
    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
      {community ? <MaterialCommunityIcons name={icon} size={24} color={Colors[colorScheme ?? 'light'].secondary} style={styles.icons} /> : <MaterialIcons name={icon} size={24} color={Colors[colorScheme ?? 'light'].secondary} style={styles.icons} />}
      <ThemedText style={{ flex: 1 }} numberOfLines={1}>
        {type === 'timer' ? convertMinToReadableFormat(Number(info)) : type === 'servings' ? (info == '1' ? info + ' serving' : info + ' servings') : info}
      </ThemedText>
    </ThemedView>
  );
}

function convertMinToReadableFormat(min: number) {
  let hours = Math.floor(min / 60);
  let minutes = min % 60;
  return `${hours}h ${minutes}m`;
}

const styles = StyleSheet.create({
  image: {
    width: 'auto',
    height: '100%',
  },
  titleContainer: {
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  icons: {
    backgroundColor: '#ccc',
    padding: 8,
    borderRadius: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#ccc',
    padding: 4,
    borderRadius: 8,
    position: 'relative',
    marginBottom: 8,
  },
  activeBackground: {
    position: 'absolute',
    height: '100%',
    width: '50%',
    backgroundColor: '#000',
    borderRadius: 8,
    marginTop: 4,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#555',
    fontSize: 16,
  },
  activeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contentContainer: {},
  link: {
    fontWeight: 'bold',
  },
});

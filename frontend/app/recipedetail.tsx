import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Recipe } from '@/constants/Recipe';
import { useLocalSearchParams } from 'expo-router';
import { Image, Pressable, StyleSheet, View, Animated, Easing, useColorScheme } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Colors } from '@/constants/Colors';

export default function RecipeDetailScreen() {
  const recipeParams = useLocalSearchParams();
  const recipe = JSON.parse(recipeParams.recipe as string) as Recipe;

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'Ingredients' | 'Instructions'>('Ingredients');
  const translateX = useRef(new Animated.Value(0)).current;

  const colorScheme = useColorScheme();

  useEffect(() => {
    const toValue = activeTab === 'Ingredients' ? 0 : 1;
    Animated.timing(translateX, {
      toValue,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

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
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerImage={<Image source={{ uri: recipe.ImageUrl }} style={styles.image} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText style={styles.recipeName}>{recipe.Name}</ThemedText>
        {renderDescription()}
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
              <ThemedText style={{borderBottomColor: Colors[colorScheme ?? 'light'].primary, borderBottomWidth: 1, paddingVertical: 8}} key={index}>{ingredient}</ThemedText>
            ))}
          </ThemedView>
        )}
        {/* {activeTab === 'Ingredients' && recipe.Ingredients.map((ingredient, index) => <ThemedText key={index}>{ingredient}</ThemedText>)} */}
        {activeTab === 'Instructions' && (
            <ThemedView>
                <ThemedText style={{ fontWeight: 'bold', fontSize: 24 }}>Instructions</ThemedText>
                {recipe.Instructions.map((instruction, index) => (
                <ThemedText style={{borderBottomColor: Colors[colorScheme ?? 'light'].primary, borderBottomWidth: 1, paddingVertical: 8}} key={index}>{instruction}</ThemedText>
                ))}
            </ThemedView>
            )}
      </ThemedView>
    </ParallaxScrollView>
  );
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

import { PropsWithChildren, ReactElement, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, useColorScheme } from 'react-native';
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Recipe } from '@/constants/Recipe';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HEADER_HEIGHT = 350;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  recipe: Recipe;
}>;

export default function ParallaxScrollView({ children, headerImage, headerBackgroundColor, recipe }: Props) {
  const tabBarHeight = Platform.OS === 'ios' ? useBottomTabBarHeight() : 0;
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchLikedRecipes = async () => {
      try {
        const likedRecipes = await AsyncStorage.getItem('likedRecipes');
        if (likedRecipes) {
          const parsedLikedRecipes = JSON.parse(likedRecipes);
          setIsLiked(parsedLikedRecipes.includes(recipe.Id));
        }
      } catch (error) {
        console.error('Error fetching liked recipes:', error);
      }
    };
    fetchLikedRecipes();
  }, []);

  const handleBackButton = () => {
    router.back();
  };

  const handleLikeButton = async (recipe: Recipe) => {
    console.log('Like button pressed');
    
    try {
      const likedRecipes = await AsyncStorage.getItem('likedRecipes');
      const parsedLikedRecipes = likedRecipes ? JSON.parse(likedRecipes) : [];
      
      if (!isLiked) {
        console.log('Adding recipe to liked recipes');
        // Add the recipe to the liked recipes
        const updatedLikedRecipes = [...parsedLikedRecipes, recipe.Id];
        await AsyncStorage.setItem('likedRecipes', JSON.stringify(updatedLikedRecipes));
      } else {
        console.log('Removing recipe from liked recipes');
        // Remove the recipe from the liked recipes
        const updatedLikedRecipes = parsedLikedRecipes.filter(
          (id: string) => id !== recipe.Id
        );
        await AsyncStorage.setItem('likedRecipes', JSON.stringify(updatedLikedRecipes));
      }
      setIsLiked(!isLiked);
      console.log(await AsyncStorage.getItem('likedRecipes'));
    } catch (error) {
      console.error('Error handling liked recipes:', error);
    }
  };

  return (
    <ThemedView style={{ ...styles.container, paddingBottom: tabBarHeight }}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16} scrollIndicatorInsets={{ bottom }} contentContainerStyle={{ paddingBottom: bottom }}>
        <Animated.View style={[styles.header, { backgroundColor: headerBackgroundColor[colorScheme] }, headerAnimatedStyle]}>
          {/* Wrap the image and the gradient inside a container */}
          <ThemedView style={styles.imageContainer}>
            {headerImage}
            {/* Apply the gradient over the image with a transition halfway down */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.1)']} // Transition from white to transparent
              locations={[0, 0.6, 1]} // Define where the gradient changes
              style={styles.gradient}
            />
          </ThemedView>
        </Animated.View>
        <Pressable onPress={handleBackButton} style={{ ...styles.icons, left: 24 }}>
          <MaterialIcons name="arrow-back" size={32} color={'#000'} />
        </Pressable>
        <Pressable onPress={() => {handleLikeButton(recipe)}} style={{ ...styles.icons, right: 24 }}>
          <MaterialIcons name={isLiked ? 'favorite' : 'favorite-border'} size={32} color={isLiked ? '#e63946' : '#000'} />
        </Pressable>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    position: 'relative', // Ensure the header content (image, gradient) is positioned within this area
    overflow: 'hidden', // Clip any content that overflows the header
  },
  imageContainer: {
    position: 'relative', // Allows the gradient to be positioned over the image
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12, // Make sure the gradient fits the rounded corners if necessary
  },
  icons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 32,
    zIndex: 1,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'white',
    opacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  content: {
    height: '100%',
    padding: 24,
    gap: 8,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -50, // Overlapping the header
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
});

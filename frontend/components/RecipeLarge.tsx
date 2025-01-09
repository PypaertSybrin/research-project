import { Recipe } from '@/constants/Recipe';
import { ThemedView } from './ThemedView';
import { Image } from 'expo-image';
import { StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';

export function RecipeLarge({ recipe }: { recipe: Recipe }) {
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.shadowWrapper}>
      <ThemedView style={{ ...styles.container, backgroundColor: Colors[colorScheme ?? 'light'].white }}>
        <Image style={styles.image} source={{ uri: recipe.ImageUrl }} />
        <ThemedText style={styles.title} numberOfLines={2}>
          {recipe.Name}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6, // Ensure it's high enough for Android
    borderRadius: 12, // Matches the container radius for smooth shadows
    backgroundColor: 'transparent',
    shadowColor: '#000',
    margin: 8,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    overflow: 'hidden', // Keeps content within rounded corners
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
    flex: 1,
  },
});

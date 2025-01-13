import { StyleSheet, useColorScheme, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Recipe } from './shoppinglist';
import RecipeSmall from '@/components/RecipeSmall';

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 8 }}>
        Account
      </ThemedText>
      <View style={styles.shadowWrapper}>
        <View style={styles.accountContainer}>
          <ThemedView style={{ backgroundColor: Colors[colorScheme ?? 'light'].primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 50, position: 'relative' }}>
            <ThemedText>SP</ThemedText>
          </ThemedView>
          <ThemedText>Sybrin Pypaert</ThemedText>
        </View>
      </View>
      <ThemedView style={styles.favoriteContainer}>
        <ThemedText style={{fontSize: 24, fontWeight: 'bold'}}>Favorites</ThemedText>
        {/* <RecipeSmall recipe={new Recipe('1', 'https://via.placeholder.com/150', 'Test Recipe', 'Test Author', 'Test Description', 1, 1, 1, 1)} /> */}
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
    marginHorizontal: 8,
    marginVertical: 16,
  },
});

import { StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CategoryCard } from '@/components/CategoryCard';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginHorizontal: 8, textAlign: 'left' }}>
        Hi, Sybrin
      </ThemedText>
      <ThemedView style={styles.scrollViewWrapper}>
        <ScrollView style={styles.scrollView} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          <CategoryCard title="Baking recipes" info="Recipes which require baking" image={require('@/assets/images/baking-recipe.svg')} />
          <CategoryCard title="All recipes" info="All sorts of recipes to choose from" image={require('@/assets/images/all-recipe.svg')} />
          <CategoryCard title="Healthy recipes" info="Recipes which are good for your health" image={require('@/assets/images/healthy-recipe.svg')} />
          <CategoryCard title="Cheap recipes" info="Recipes that are cheap to make" image={require('@/assets/images/cheap-recipe.svg')} />
          <CategoryCard title="Inspiration recipes" info="Recipes to get inspiration from" image={require('@/assets/images/inspiration-recipe.svg')} />
        </ScrollView>
      </ThemedView>
      <SubTitle title="Popular" />
      
    </ThemedView>
  );
}

export function SubTitle({ title }: { title: string }) {
  const colorScheme = useColorScheme();
  return (
    <ThemedView style={styles.subTitleContainer}>
      <ThemedText type="title" style={styles.subTitle}>
        {title}
      </ThemedText>
      <ThemedText style={{ color: Colors[colorScheme ?? 'light'].primary, fontWeight: 'bold' }}>
        View All
      </ThemedText>
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
  scrollViewWrapper: {
    marginVertical: 16,
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
    textAlign: 'left',
  },
});

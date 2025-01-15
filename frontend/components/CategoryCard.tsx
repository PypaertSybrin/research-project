import { Pressable, View, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { Image } from 'expo-image';
import { ThemedText } from './ThemedText';
import { Link } from 'expo-router';

export function CategoryCard({ title, info, image, categoryName }: { title: string; info: string; image: string, categoryName: string }) {
  const onPress = () => {
    console.log('Pressed');
  };
  return (
    <Link href={{
      pathname: '/recipelist',
      params: { title: title, type: 'category', categoryName: categoryName },
    }} asChild>
    <Pressable onPress={onPress}>
      <ThemedView style={styles.cardContainer}>
        <Image source={require('@/assets/images/background-card.svg')} style={styles.card} />
        <View style={styles.cardText}>
          <ThemedText style={styles.cardTextTitle} numberOfLines={2}>
            {title}
          </ThemedText>
          <ThemedText style={styles.cardTextInfo}>{info}</ThemedText>
        </View>
        <Image source={image} style={styles.recipeOnCard} />
      </ThemedView>
    </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 250,
    height: 170,
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    position: 'relative',
  },
  cardText: {
    position: 'absolute',
    top: 24,
    left: 16,
    width: 110,
  },
  cardTextTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardTextInfo: {
    fontSize: 14,
    lineHeight: 20,
  },
  recipeOnCard: {
    position: 'absolute',
    top: -50,
    right: -90,
    width: 250,
    height: 250,
  },
});

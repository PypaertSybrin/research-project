import { Recipe } from "@/constants/Recipe";
import { StyleSheet, View, Image, Text } from 'react-native';

export default function RecipeSmall({ recipe }: { recipe: Recipe }) {
    return (
        <View style={styles.container}>
        <Image source={{ uri: recipe.ImageUrl }} style={styles.image} />
        <Text style={styles.title}>{recipe.Name}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 150,
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
        margin: 8,
    },
    image: {
        width: '100%',
        height: 150,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        margin: 8,
    },
});
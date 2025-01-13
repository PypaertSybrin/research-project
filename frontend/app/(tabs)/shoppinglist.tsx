import { useState } from 'react';
import { StyleSheet, TextInput, Button, Text, ActivityIndicator, Image, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export class Recipe {
  ID: string;
  Name: string;
  ImageUrl: string;

  constructor(
    ID: string,
    Name: string,
    ImageUrl: string,
  ) {
    this.ID = ID;
    this.Name = Name;
    this.ImageUrl = ImageUrl;
  }
}


export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [responseRecipes, setResposeRecipes] = useState([] as Recipe[]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  
  const handleSubmit = async () => {
    if (!inputText) return; // Prevent empty submissions
    setLoading(true);
    setError(''); // Clear previous response
    setResposeRecipes([]); // Clear previous response
    
    console.log(backendUrl);

    try {
      const response = await fetch(`${backendUrl}:8000/query_recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from the server.');
      }

      const data = await response.json();
      for (const recipe of data.recipes) {
        console.log(recipe);
        setResposeRecipes((prev) => [...prev, recipe]);
      }
    } catch (error: any) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Chat with FastAPI</ThemedText>
      <TextInput style={styles.input} placeholder="Type your message here..." value={inputText} onChangeText={setInputText} />
      <Button title="Send" onPress={handleSubmit} />
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.response}>{error}</Text>
          {responseRecipes.map((recipe) => (
            <ThemedView key={recipe.ID}>
              <Text style={styles.response}>{recipe.Name}</Text>
              <Image
                source={{ uri: recipe.ImageUrl }}
                style={styles.image}
              />
            </ThemedView>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  response: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start', // Ensure content starts at the top
    paddingBottom: 20, // Add some padding at the bottom of the ScrollView
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
    alignSelf: 'center', // Center the image
  },
});

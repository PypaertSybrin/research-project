import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, Text, ActivityIndicator, Image, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [responseRecipes, setResposeRecipes] = useState([{ Title: '', ImageUrl: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!inputText) return; // Prevent empty submissions
    setLoading(true);
    setError(''); // Clear previous response
    setResposeRecipes([]); // Clear previous response

    try {
      console.log('aaaaaaaaaaaaaa');
      const response = await fetch('http://192.168.0.201:8000/query_recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });
      console.log('bbbbbbbbbbbbbbb');

      if (!response.ok) {
        throw new Error('Failed to fetch response from the server.');
      }

      const data = await response.json();
      for (const recipe of data.recipes) {
        console.log(recipe);
        setResposeRecipes((prev) => [...prev, recipe]);
      }
      console.log('ddddddddddddddddddddddddddd');
      console.log(responseRecipes);
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
            <ThemedView key={recipe.Title}>
              <Text style={styles.response}>{recipe.Title}</Text>
              <Image
                source={{ uri: 'http://192.168.0.201:8080/' + recipe.ImageUrl + '.jpg' }} // Make sure this path is correct
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

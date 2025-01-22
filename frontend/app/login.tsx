import { View, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';

export default function LoginScreen() {
  const [usernameInput, setUsernameInput] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (usernameInput.trim()) {
      try {
        await AsyncStorage.setItem('username', usernameInput);
        router.replace('/'); // Redirect to the main app
      } catch (error) {
        console.error('Error saving username:', error);
      }
    } else {
      alert('Please enter a username');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={usernameInput}
        onChangeText={setUsernameInput}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { height: 50, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10 },
});

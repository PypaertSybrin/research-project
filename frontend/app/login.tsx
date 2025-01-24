import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';

export default function LoginScreen() {
  const [usernameInput, setUsernameInput] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();

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
    <ThemedView style={styles.container}>
      <ThemedView>
        <Image
          source={require('@/assets/images/logo.svg')}
          style={styles.logo}
          contentFit="contain"
        />
      </ThemedView>

      <ThemedText style={styles.welcomeText}>Welcome to FlavorMap!</ThemedText>
      <ThemedText style={{...styles.subtitle, color: Colors[colorScheme ?? 'light'].greyText}}>
        Your gateway to awesome experiences
      </ThemedText>

      <TextInput
        style={{...styles.input, backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].greyBackground, color: colorScheme === 'light' ? Colors.light.secondary : 'white'}}
        placeholder="Enter a username"
        placeholderTextColor={Colors[colorScheme ?? 'light'].greyText}
        value={usernameInput}
        onChangeText={setUsernameInput}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: Colors[colorScheme ?? 'light'].primary },
        ]}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 64,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    marginHorizontal: 16,
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
  },
  button: {
    width: '100%',
    paddingVertical: 15, // Add more padding here
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

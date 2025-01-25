import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [username, setUsername] = useState<string | null>(null); // null indicates loading state
  const [isCheckingUsername, setIsCheckingUsername] = useState(true);

  const checkUsername = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername as string);
      }
    } catch (error) {
      console.error('Error fetching username:', error);
    } finally {
      setIsCheckingUsername(false); // Mark username check as complete
    }
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      checkUsername();
    }
  }, [loaded]);

  if (!loaded || isCheckingUsername) {
    return null; // Show nothing until fonts and username check are complete
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        {username ? <Stack.Screen name="(tabs)" /> : <Stack.Screen name="login" />}
        <Stack.Screen name="recipelist" />
        <Stack.Screen name="recipedetail" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

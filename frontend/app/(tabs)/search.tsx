import { useEffect, useRef, useState } from 'react';
import { StyleSheet, ActivityIndicator, TouchableOpacity, useColorScheme, Animated, VirtualizedList, View, Button } from 'react-native';
import { Audio } from 'expo-av';
import { transcribeSpeech } from '@/functions/transcribeSpeech';
import { recordSpeech } from '@/functions/recordSpeech';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';
import { RecipeLarge } from '@/components/RecipeLarge';
import { Recipe } from '@/constants/Recipe';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const audioRecordingRef = useRef(new Audio.Recording());
  const [responseRecipes, setResponseRecipes] = useState<Recipe[]>([]);
  const [permission, setPermission] = useState({ status: 'undetermined' });
  const [animations, setAnimations] = useState<Animated.Value[]>([]);
  const [userInput, setUserInput] = useState('');
  const colorScheme = useColorScheme();

  useEffect(() => {
    const requestOrGetPermissions = async () => {
      setPermission(await Audio.getPermissionsAsync());
      if (permission.status === 'undetermined') {
        setPermission(await Audio.requestPermissionsAsync());
      }
    };
    requestOrGetPermissions();
  }, []);

  const startRecording = async () => {
    if (permission.status === 'granted') {
      setIsRecording(true);
      await recordSpeech(audioRecordingRef, setIsRecording);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    setResponseRecipes([]);
    setUserInput('...');
    try {
      const data = await transcribeSpeech(audioRecordingRef);
      if(data.recipes.length === 0) {
        setUserInput('No recipes found');
        speak('I am sorry, I could not find any recipes related to your request');
        return;
      }
      speak('Here are some recipes I found for you');
      const newRecipes = data.recipes;
      const userInput = data.input;
      setResponseRecipes(newRecipes);
      setUserInput(userInput);

      const newAnimations = newRecipes.map(() => new Animated.Value(0));
      setAnimations(newAnimations);

      newAnimations.forEach((anim: any, index: any) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecording(false);
    }
  };

  const getItem = (data: any, index: any) => data[index];
  const getItemCount = (data: any) => data.length;

  const speak = (textToSay: string) => {
    Speech.speak(textToSay, {language: 'en-GB'});
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.mainContainer}>
        <ThemedText type="title" style={{ marginBottom: 8 }}>
          Recipes
        </ThemedText>

        {userInput != '' ? (
          <ThemedView style={styles.shadowWrapper}>
            <ThemedView style={styles.chat}>
              <MaterialIcons style={{ alignSelf: 'flex-start' }} name="person" size={24} color={Colors[colorScheme ?? 'light'].iconSecondary} />
              <ThemedText style={{ flex: 1 }}>{userInput.charAt(0).toUpperCase() + userInput.slice(1).toLowerCase()}</ThemedText>
            </ThemedView>
          </ThemedView>
        ) : (
          <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
            Let AI help you find the best recipes for you!
          </ThemedText>
        )}
        {responseRecipes.length > 0 ? (
          <VirtualizedList
            data={responseRecipes}
            keyExtractor={(item) => item.Id.toString()}
            getItem={getItem}
            getItemCount={getItemCount}
            renderItem={({ item, index }) => (
              <Animated.View
                style={{
                  opacity: animations[index] || 0,
                  transform: [
                    {
                      translateY: animations[index]
                        ? animations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0],
                          })
                        : -20,
                    },
                  ],
                }}
              >
                <RecipeLarge recipe={item} />
              </Animated.View>
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <ThemedView style={styles.backgroundImageContainer}>
            <Image source={require('@/assets/images/recipe.svg')} style={styles.backgroundImage} />
          </ThemedView>
        )}
      </ThemedView>
      <ThemedView style={{ backgroundColor: Colors[colorScheme ?? 'light'].background }}>
        <TouchableOpacity
          style={{
            ...styles.microphoneButton,
            opacity: isRecording || permission.status !== 'granted' ? 0.5 : 1,
            backgroundColor: Colors[colorScheme ?? 'light'].secondary,
          }}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={isRecording || permission.status !== 'granted'}
        >
          {isRecording ? <ActivityIndicator size="large" color="white" /> : <MaterialIcons name="mic" size={32} color="white" />}
        </TouchableOpacity>
        <ThemedText type="subtitle" style={{ textAlign: 'center', marginTop: 4 }}>
          Press and hold to record
        </ThemedText>
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
  mainContainer: {
    flex: 1,
  },
  shadowWrapper: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
    margin: 8,
  },
  chat: {
    backgroundColor: Colors.light.card,
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backgroundImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    width: 300,
    height: 300,
  },
  microphoneButton: {
    width: 75,
    height: 75,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
  },
});

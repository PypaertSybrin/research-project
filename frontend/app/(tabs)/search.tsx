import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, ScrollView, ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native';
import { Audio } from 'expo-av';
import { transcribeSpeech } from '@/functions/transcribeSpeech';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { recordSpeech } from '@/functions/recordSpeech';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';
import { RecipeLarge } from '@/components/RecipeLarge';
import { Recipe } from '@/constants/Recipe';

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const audioRecordingRef = useRef(new Audio.Recording());
  const [responseRecipes, setResposeRecipes] = useState([] as Recipe[]);
  const [permission, setPermission] = useState({ status: 'undetermined' });
  const colorScheme = useColorScheme();

  useEffect(() => {
    const requestOrGetPermissions = async () => {
      {
        setPermission(await Audio.getPermissionsAsync());
        if (permission.status === 'undetermined') {
          setPermission(await Audio.requestPermissionsAsync());
        }
      }
    };
    requestOrGetPermissions();
  }, []);

  const startRecording = async () => {
    // get permission
    if (permission.status === 'granted') {
      console.log('Permission granted');
      setIsRecording(true);
      await recordSpeech(audioRecordingRef, setIsRecording);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    setResposeRecipes([]);
    try {
      const data = await transcribeSpeech(audioRecordingRef);
      for (const recipe of data.recipes) {
        console.log(recipe);
        setResposeRecipes((prev) => [...prev, recipe]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.mainContainer}>
        <ThemedText type="title" style={{ marginBottom: 8 }}>
          Recipes
        </ThemedText>
        <ThemedText type="subtitle" style={{ marginBottom: 32 }}>
          Let AI help you find the best recipes for you!
        </ThemedText>
        {responseRecipes.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
            {responseRecipes.map((recipe) => (
              <RecipeLarge key={recipe.Id} recipe={recipe} />
            ))}
          </ScrollView>
        ) : null}
        {responseRecipes.length === 0 ? (
          <ThemedView style={styles.backgroundImageContainer}>
            <Image source={require('@/assets/images/recipe.svg')} style={styles.backgroundImage} />
          </ThemedView>
        ) : null}
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
          {isRecording ? <ActivityIndicator size="large" color="white" /> : <FontAwesome name="microphone" size={40} color="white" />}
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
    paddingBottom: 32,
    paddingHorizontal: 8,
  },
  mainContainer: {
    flex: 1,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 32,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
    alignSelf: 'center',
  },
});

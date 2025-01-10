import { useEffect, useRef, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, useColorScheme, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { transcribeSpeech } from '@/functions/transcribeSpeech';
import { recordSpeech } from '@/functions/recordSpeech';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';
import { RecipeLarge } from '@/components/RecipeLarge';
import { Recipe } from '@/constants/Recipe';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const audioRecordingRef = useRef(new Audio.Recording());
  const [responseRecipes, setResponseRecipes] = useState<Recipe[]>([]);
  const [permission, setPermission] = useState({ status: 'undetermined' });
  const [animations, setAnimations] = useState<Animated.Value[]>([]);
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
      console.log('Permission granted');
      setIsRecording(true);
      await recordSpeech(audioRecordingRef, setIsRecording);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    setResponseRecipes([]);
    try {
      const data = await transcribeSpeech(audioRecordingRef);
      const newRecipes = data.recipes;
      setResponseRecipes(newRecipes);

      // Create animation values for each recipe
      const newAnimations = newRecipes.map(() => new Animated.Value(0));
      setAnimations(newAnimations);

      // Start the fall-down animation
      newAnimations.forEach((anim: any, index: any) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * 100, // Add a delay for each recipe
          useNativeDriver: true,
        }).start();
      });
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
        <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
          Let AI help you find the best recipes for you!
        </ThemedText>
        {responseRecipes.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
            {responseRecipes.map((recipe, index) => (
              <Animated.View
                key={recipe.Id}
                style={{
                  opacity: animations[index] || 0,
                  transform: [
                    {
                      translateY: animations[index]
                        ? animations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0], // Start 50px above and move down
                          })
                        : -20,
                    },
                  ],
                }}
              >
                <RecipeLarge recipe={recipe} />
              </Animated.View>
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
          {isRecording ? <ActivityIndicator size="large" color="white" /> : <IconSymbol name="mic" size={32} color="white" />}
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

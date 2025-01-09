import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, SafeAreaView, ScrollView, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { transcribeSpeech } from '@/functions/transcribeSpeech';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { recordSpeech } from '@/functions/recordSpeech';
import useWebFocus from '@/hooks/useWebFocus';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';

export class Recipe {
  ID: string;
  Name: string;
  ImageUrl: string;

  constructor(ID: string, Name: string, ImageUrl: string) {
    this.ID = ID;
    this.Name = Name;
    this.ImageUrl = ImageUrl;
  }
}

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const isWebFocused = useWebFocus();
  const audioRecordingRef = useRef(new Audio.Recording());
  const webAudioPermissionsRef = useRef<MediaStream | null>(null);
  const [responseRecipes, setResposeRecipes] = useState([] as Recipe[]);

  useEffect(() => {
    if (isWebFocused) {
      const getMicAccess = async () => {
        const permissions = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        webAudioPermissionsRef.current = permissions;
      };
      if (!webAudioPermissionsRef.current) getMicAccess();
    } else {
      if (webAudioPermissionsRef.current) {
        webAudioPermissionsRef.current.getTracks().forEach((track) => track.stop());
        webAudioPermissionsRef.current = null;
      }
    }
  }, [isWebFocused]);

  const startRecording = async () => {
    setIsRecording(true);
    await recordSpeech(audioRecordingRef, setIsRecording, !!webAudioPermissionsRef.current);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      const data = await transcribeSpeech(audioRecordingRef);
      for (const recipe of data.recipes) {
        console.log(recipe);
        setResposeRecipes((prev) => [...prev, recipe]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView style={styles.mainScrollContainer}>
        <View style={styles.mainInnerContainer}>
          <Text style={styles.title}>Welcome to the Speech-to-Text App</Text>
          {responseRecipes.map((recipe) => (
            <ThemedView key={recipe.ID}>
              <Text style={styles.response}>{recipe.Name}</Text>
              <Image source={{ uri: recipe.ImageUrl }} style={styles.image} />
            </ThemedView>
          ))}
          <TouchableOpacity
            style={{
              ...styles.microphoneButton,
              opacity: isRecording || isTranscribing ? 0.5 : 1,
            }}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={isRecording || isTranscribing}
          >
            {isRecording ? <ActivityIndicator size="small" color="white" /> : <FontAwesome name="microphone" size={40} color="white" />}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainScrollContainer: {
    padding: 20,
    height: '100%',
    width: '100%',
  },
  mainInnerContainer: {
    gap: 75,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 35,
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  transcriptionContainer: {
    backgroundColor: 'rgb(220,220,220)',
    width: '100%',
    height: 300,
    padding: 20,
    marginBottom: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  transcribedText: {
    fontSize: 20,
    padding: 5,
    color: '#000',
    textAlign: 'left',
    width: '100%',
  },
  microphoneButton: {
    backgroundColor: 'red',
    width: 75,
    height: 75,
    marginTop: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  response: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
    alignSelf: 'center',
  },
});

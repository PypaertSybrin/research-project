import { Audio } from 'expo-av';
import { MutableRefObject } from 'react';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export const transcribeSpeech = async (audioRecordingRef: MutableRefObject<Audio.Recording>) => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
    });
    const isPrepared = audioRecordingRef?.current?._canRecord;
    if (isPrepared) {
      await audioRecordingRef?.current?.stopAndUnloadAsync();

      const recordingUri = audioRecordingRef?.current?.getURI() || '';
      let base64Uri = '';

      base64Uri = await FileSystem.readAsStringAsync(recordingUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const dataUrl = base64Uri;

      audioRecordingRef.current = new Audio.Recording();

      const audioConfig = {
        encoding: Platform.OS === 'android' ? 'AMR_WB' : 'LINEAR16',
        sampleRateHertz: Platform.OS === 'android' ? 16000 : 41000,
        languageCode: 'en-GB',
      };

      if (recordingUri && dataUrl) {
        const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}:8000/get-recipes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audioUrl: dataUrl, audioConfig: audioConfig }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch response from the server.');
        }
        return await response.json();
      }
    } else {
      return undefined;
    }
  } catch (e) {
    return undefined;
  }
};

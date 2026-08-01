import { AudioRecorder, setAudioModeAsync } from 'expo-audio';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

export const transcribeSpeech = async (audioRecorder: AudioRecorder) => {
  try {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: false,
    });
    const isPrepared = audioRecorder.getStatus().canRecord;
    if (isPrepared) {
      await audioRecorder.stop();

      const recordingUri = audioRecorder.uri || '';
      let base64Uri = '';

      base64Uri = await new File(recordingUri).base64();

      const dataUrl = base64Uri;

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

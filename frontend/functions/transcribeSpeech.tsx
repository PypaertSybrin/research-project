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
      console.log('Recording stopped and unloaded');
      const recordingUri = audioRecordingRef?.current?.getURI() || '';
      let base64Uri = '';

      console.log('Recording URI:', recordingUri);

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
        console.log('Transcribing speech...');
        console.log('dataUrl:', dataUrl);
        console.log('audioConfig:', audioConfig.encoding, audioConfig.sampleRateHertz, audioConfig.languageCode);
        // const rootOrigin = Platform.OS === 'android' ? '10.0.2.2' : Device.isDevice ? process.env.LOCAL_DEV_IP || 'localhost' : 'localhost';
        // const serverUrl = `http://${rootOrigin}:8000`;
        const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
        // if android, this url, else, other url
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

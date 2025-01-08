import { Audio } from 'expo-av';
import { MutableRefObject } from 'react';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

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
        languageCode: 'en-US',
      };

      if (recordingUri && dataUrl) {
        const rootOrigin = Platform.OS === 'android' ? '10.0.2.2' : Device.isDevice ? process.env.LOCAL_DEV_IP || 'localhost' : 'localhost';
        // const serverUrl = `http://${rootOrigin}:8000`;
        // const serverResponse = await fetch(`${serverUrl}/speech-to-text`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ audioUrl: dataUrl, config: audioConfig }),
        // })
        //   .then((res) => res.json())
        //   .catch((e: Error) => console.error(e));
        const serverResponse = {
          results: [
            {
              alternatives: [
                {
                  transcript: 'Hello, world!',
                },
              ],
            },
          ],
        };

        const results = serverResponse?.results;
        if (results) {
          const transcript = results?.[0].alternatives?.[0].transcript;
          if (!transcript) return undefined;
          return transcript;
        } else {
          console.error('No transcript found');
          return undefined;
        }
      }
    } else {
      console.error('Recording must be prepared prior to unloading');
      return undefined;
    }
  } catch (e) {
    console.error('Failed to transcribe speech!', e);
    return undefined;
  }
};

import { Dispatch, SetStateAction } from 'react';
import { AudioRecorder, setAudioModeAsync } from 'expo-audio';

export const recordSpeech = async (audioRecorder: AudioRecorder, setIsRecording: Dispatch<SetStateAction<boolean>>) => {
  try {
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    // A recorder that has been stopped needs preparing again before it can record.
    if (!audioRecorder.getStatus().canRecord) {
      await audioRecorder.prepareToRecordAsync();
      console.log('✅ Prepared recording instance');
    }

    audioRecorder.record();
  } catch (err) {
    setIsRecording(false);
    console.error('Failed to start recording', err);
    return;
  }
};

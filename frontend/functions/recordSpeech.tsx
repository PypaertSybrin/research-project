import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { Audio } from 'expo-av';

export const recordSpeech = async (audioRecordingRef: MutableRefObject<Audio.Recording>, setIsRecording: Dispatch<SetStateAction<boolean>>) => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const doneRecording = audioRecordingRef?.current?._isDoneRecording;
    if (doneRecording) audioRecordingRef.current = new Audio.Recording();

    const recordingStatus = await audioRecordingRef?.current?.getStatusAsync();
    if (!recordingStatus?.canRecord) {
      audioRecordingRef.current = new Audio.Recording();

      const recordingOptions = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.amr',
          outputFormat: Audio.AndroidOutputFormat.AMR_WB,
          audioEncoder: Audio.AndroidAudioEncoder.AMR_WB,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      await audioRecordingRef?.current
        ?.prepareToRecordAsync(recordingOptions)
        .then(() => console.log('✅ Prepared recording instance'))
        .catch((e) => {
          console.error('Failed to prepare recording', e);
        });
    }
    await audioRecordingRef?.current?.startAsync();
  } catch (err) {
    setIsRecording(false);
    console.error('Failed to start recording', err);
    return;
  }
};

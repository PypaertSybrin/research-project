import { AudioQuality, IOSOutputFormat, RecordingOptions, RecordingPresets } from 'expo-audio';

// Matches what the backend expects in transcribeSpeech: AMR_WB @ 16kHz on Android,
// linear PCM (LINEAR16) @ 44.1kHz on iOS.
export const RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  android: {
    extension: '.amr',
    outputFormat: 'amrwb',
    audioEncoder: 'amr_wb',
    sampleRate: 16000,
  },
  ios: {
    extension: '.wav',
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.HIGH,
    sampleRate: 44100,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  numberOfChannels: 1,
  bitRate: 128000,
};

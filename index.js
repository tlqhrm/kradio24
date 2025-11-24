import 'expo-router/entry';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './services/PlaybackService';

// TrackPlayer 서비스 등록
TrackPlayer.registerPlaybackService(() => PlaybackService);

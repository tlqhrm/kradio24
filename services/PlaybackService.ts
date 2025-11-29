import TrackPlayer, { Event } from 'react-native-track-player';

export async function PlaybackService() {
  // 기본 재생 컨트롤만 처리 (Play/Pause/Stop)
  // Next/Previous는 AudioContext에서 처리

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });

  // RemoteNext/RemotePrevious는 AudioContext에서 처리됨
  // (playlist 관리가 AudioContext에 있기 때문)
}

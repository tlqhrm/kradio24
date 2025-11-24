import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import TrackPlayer, {
  Event,
  State,
  Capability,
  Track,
  TrackType
} from "react-native-track-player";
import { RadioStation } from "@/types/radio";
import { PlaybackState } from "@/types/radio";

interface AudioContextType {
  currentStation: RadioStation | null;
  playbackState: PlaybackState;
  play: (station: RadioStation) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  togglePlayPause: (station: RadioStation) => Promise<void>;
  isPlaying: boolean;
  // 플레이리스트 관련
  playlist: RadioStation[];
  setPlaylist: (stations: RadioStation[]) => void;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  hasNext: boolean;
  hasPrevious: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.IDLE);
  const [playlist, setPlaylist] = useState<RadioStation[]>([]);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // ============================================
  // Refs: 이벤트 리스너와 동기화
  // ============================================
  const currentStationRef = useRef<RadioStation | null>(null);
  const isLoadingNewStationRef = useRef(false); // 새 방송국 로딩 중
  const userPausedRef = useRef(false); // 사용자가 명시적으로 일시정지 누름

  const currentIndex = currentStation
    ? playlist.findIndex(s => s.id === currentStation.id)
    : -1;

  // ============================================
  // TrackPlayer 초기화 & 미디어 컨트롤 설정
  // ============================================
  useEffect(() => {
    console.log("🔧 [AudioContext] TrackPlayer 초기화 시작");

    const setupPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();

        // 미디어 컨트롤 버튼 설정
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
          ],
        )}

        setIsPlayerReady(true);
        console.log("✅ [AudioContext] TrackPlayer 초기화 완료");
      } catch (error) {
        console.error("❌ [AudioContext] TrackPlayer 초기화 실패:", error);
      }
    };

    setupPlayer();

    return () => {
      console.log("🔌 [AudioContext] TrackPlayer 정리");
      TrackPlayer.reset();
    };
  }, []);

  // ============================================
  // currentStation 동기화
  // ============================================
  useEffect(() => {
    currentStationRef.current = currentStation;
  }, [currentStation]);

  // ============================================
  // TrackPlayer 이벤트 리스너
  // ============================================
  useEffect(() => {
    console.log("🎧 [AudioContext] 이벤트 리스너 등록");

    const errorSubscription = TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
      console.error("❌ [Event] PlaybackError:", JSON.stringify(error, null, 2));
    });

    const stateSubscription = TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {
      console.log(`[Event] PlaybackState: ${state}`);

      // 방송국 없음 → IDLE
      if (!currentStationRef.current) {
        if (playbackState !== PlaybackState.IDLE) {
          setPlaybackState(PlaybackState.IDLE);
        }
        return;
      }

      // ============================================
      // 로딩 중: 준비 완료 시 자동 재생
      // ============================================
      if (isLoadingNewStationRef.current) {
        if (state === State.Ready) {
          await TrackPlayer.play();
          isLoadingNewStationRef.current = false;
          setPlaybackState(PlaybackState.PLAYING);
        } else if (state === State.Buffering || state === State.Loading) {
          // 버퍼링 중에는 LOADING 상태 유지
          setPlaybackState(PlaybackState.LOADING);
        } else if (state === State.Error) {
          setPlaybackState(PlaybackState.ERROR);
          isLoadingNewStationRef.current = false;
        }
        return;
      }

      // ============================================
      // 일반 상태: 플레이어 이벤트 반영
      // ============================================
      if (state === State.Playing) {
        if (userPausedRef.current) return; // 사용자 일시정지 중
        if (playbackState !== PlaybackState.PLAYING) {
          setPlaybackState(PlaybackState.PLAYING);
        }
      } else if (state === State.Paused) {
        if (playbackState !== PlaybackState.PAUSED) {
          setPlaybackState(PlaybackState.PAUSED);
        }
        userPausedRef.current = false;
      } else if (state === State.Stopped) {
        if (playbackState !== PlaybackState.IDLE) {
          setPlaybackState(PlaybackState.IDLE);
        }
      } else if (state === State.Buffering) {
        if (playbackState !== PlaybackState.LOADING) {
          setPlaybackState(PlaybackState.LOADING);
        }
      } else if (state === State.Error) {
        setPlaybackState(PlaybackState.ERROR);
      }
    });

    return () => {
      console.log("🔌 [AudioContext] 이벤트 리스너 해제");
      errorSubscription.remove();
      stateSubscription.remove();
    };
  }, [playbackState]);

  // ============================================
  // 재생 함수
  // ============================================
  const play = async (station: RadioStation) => {
    try {
      if (!isPlayerReady) {
        console.warn("⚠️ [Action] TrackPlayer가 아직 준비되지 않음");
        return;
      }

      console.log("🎵 [Action] 재생:", station.name);

      // 1. 즉시 플래그와 상태 초기화
      isLoadingNewStationRef.current = true;
      userPausedRef.current = false;
      setPlaybackState(PlaybackState.LOADING);
      setCurrentStation(station);

      // 2. 기존 트랙 모두 제거
      await TrackPlayer.reset();

      // 3. URL 해석
      let finalUrl = station.streamUrl;
      try {
        console.log("🔍 [Action] URL 해석 중...");
        const response = await fetch(station.streamUrl, {
          method: 'HEAD',
          redirect: 'follow',
        });
        finalUrl = response.url;
        console.log("✅ [Action] URL 해석 완료:", finalUrl);
      } catch (fetchError) {
        console.warn("⚠️ [Action] URL 해석 실패, 원본 사용");
      }

      // 4. 새 트랙 추가
      const track: Track = {
        url: finalUrl,
        title: station.name,
        artist: 'Live Radio',
        isLiveStream: true,
        type: TrackType.HLS,
        contentType: 'application/x-mpegURL',
      };

      await TrackPlayer.add(track);
      console.log("✅ [Action] 트랙 추가 완료, 재생 대기 중");

      // 재생은 이벤트 리스너에서 Ready 상태일 때 자동 실행
    } catch (error) {
      console.error("❌ [Action] 재생 오류:", error);
      setPlaybackState(PlaybackState.ERROR);
      isLoadingNewStationRef.current = false;
    }
  };

  // ============================================
  // 일시정지 함수
  // ============================================
  const pause = async () => {
    try {
      console.log("⏸️ [Action] 일시정지");

      // 1. 사용자 일시정지 플래그 설정 (PLAYING 이벤트 차단)
      userPausedRef.current = true;

      // 2. 로딩 플래그 해제
      isLoadingNewStationRef.current = false;

      // 3. 즉시 PAUSED 상태로 설정 (UI 즉시 업데이트)
      setPlaybackState(PlaybackState.PAUSED);

      // 4. 플레이어 일시정지
      await TrackPlayer.pause();
    } catch (error) {
      console.error("❌ [Action] 일시정지 오류:", error);
    }
  };

  // ============================================
  // 재개 함수
  // ============================================
  const resume = async () => {
    try {
      console.log("▶️ [Action] 재개");

      // 1. 사용자 일시정지 플래그 해제 (PLAYING 이벤트 허용)
      userPausedRef.current = false;

      // 2. 플레이어 재생 (상태는 이벤트 리스너가 PLAYING으로 업데이트)
      await TrackPlayer.play();
    } catch (error) {
      console.error("❌ [Action] 재개 오류:", error);
    }
  };

  // ============================================
  // 정지 함수
  // ============================================
  const stop = async () => {
    try {
      console.log("⏹️ [Action] 정지");

      // 1. 모든 플래그 리셋
      userPausedRef.current = false;
      isLoadingNewStationRef.current = false;

      // 2. 플레이어 정지 및 트랙 제거
      await TrackPlayer.stop();
      await TrackPlayer.reset();

      // 3. 상태 리셋
      setCurrentStation(null);
      setPlaybackState(PlaybackState.IDLE);
    } catch (error) {
      console.error("❌ [Action] 정지 오류:", error);
    }
  };

  // ============================================
  // 토글 함수
  // ============================================
  const togglePlayPause = async (station: RadioStation) => {
    // 같은 방송국이면 재생/일시정지 토글
    if (currentStation?.id === station.id) {
      if (playbackState === PlaybackState.PLAYING) {
        pause();
      } else if (playbackState === PlaybackState.PAUSED) {
        resume();
      }
      return;
    }

    // 다른 방송국이면 새로 재생
    await play(station);
  };

  // ============================================
  // 플레이리스트 네비게이션
  // ============================================
  const playNext = async () => {
    if (currentIndex >= 0 && currentIndex < playlist.length - 1) {
      await play(playlist[currentIndex + 1]);
    }
  };

  const playPrevious = async () => {
    if (currentIndex > 0) {
      await play(playlist[currentIndex - 1]);
    }
  };

  const hasNext = currentIndex >= 0 && currentIndex < playlist.length - 1;
  const hasPrevious = currentIndex > 0;
  const isPlaying = playbackState === PlaybackState.PLAYING;

  return (
    <AudioContext.Provider
      value={{
        currentStation,
        playbackState,
        play,
        pause,
        resume,
        stop,
        togglePlayPause,
        isPlaying,
        playlist,
        setPlaylist,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}

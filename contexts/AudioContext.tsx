import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import TrackPlayer, {
  Event,
  State,
  Capability,
  Track,
  TrackType,
  AppKilledPlaybackBehavior
} from "react-native-track-player";
import { RadioStation } from "@/types/radio";
import { PlaybackState } from "@/types/radio";
import { useRouter } from "expo-router";
import { AppState } from "react-native";

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
  const router = useRouter();
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
        // 앱 강제종료 후 재시작 시 기존 플레이어 상태 정리
        try {
          await TrackPlayer.reset();
          console.log("🧹 [AudioContext] 기존 플레이어 상태 정리 완료");
        } catch (resetError) {
          console.log("ℹ️ [AudioContext] 정리할 플레이어 없음 (정상)");
        }

        // TrackPlayer 초기화 (이미 초기화되어 있으면 에러 무시)
        try {
          await TrackPlayer.setupPlayer({
            autoHandleInterruptions: true,
            autoUpdateMetadata: true,
          });
          console.log("✅ [AudioContext] TrackPlayer 신규 초기화 완료");
        } catch (setupError: any) {
          // 이미 설정되어 있는 경우 (앱이 완전히 종료되지 않았을 때)
          if (setupError?.message?.includes('already') || setupError?.code === 'player_already_initialized') {
            console.log("ℹ️ [AudioContext] TrackPlayer 이미 초기화됨");
          } else {
            throw setupError; // 다른 에러는 상위로 전파
          }
        }

        // 미디어 컨트롤 버튼 설정 (Android & iOS)
        await TrackPlayer.updateOptions({
          // 공통 설정 (iOS & Android 모두 적용)
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
          // 알림 탭 시 플레이어 화면 열기
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
          // Android 전용 설정
          android: {
            // 앱 종료해도 재생 계속됨
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
            // 알림 채널 설정
            alwaysPauseOnInterruption: true,
          },
          // iOS는 app.json의 UIBackgroundModes로 설정됨
        });

        setIsPlayerReady(true);
        console.log("✅ [AudioContext] TrackPlayer 설정 완료");
      } catch (error) {
        console.error("❌ [AudioContext] TrackPlayer 초기화 실패:", error);
        // 초기화 실패해도 앱은 계속 실행되도록 함
        setIsPlayerReady(false);
      }
    };

    setupPlayer();

    return () => {
      console.log("🔌 [AudioContext] TrackPlayer 정리");
      // 컴포넌트 언마운트 시에만 정리 (앱 강제종료 시에는 실행 안됨)
      TrackPlayer.reset().catch(e => console.log("정리 중 에러:", e));
    };
  }, []);

  // ============================================
  // currentStation 동기화
  // ============================================
  useEffect(() => {
    currentStationRef.current = currentStation;
  }, [currentStation]);

  // ============================================
  // 알림 탭 이벤트 리스너 (플레이어 화면으로 이동)
  // ============================================
  useEffect(() => {
    const notificationTapListener = TrackPlayer.addEventListener(
      Event.RemoteDuck,
      async (event) => {
        console.log("🔔 [Event] RemoteDuck:", event);
      }
    );

    // 앱이 백그라운드에서 포그라운드로 올 때
    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && currentStationRef.current) {
        // 재생 중인 방송이 있으면 플레이어 화면으로 이동
        console.log("📱 [AppState] 앱이 활성화됨, 플레이어 화면으로 이동");
        try {
          router.push('/player');
        } catch (error) {
          console.warn("⚠️ [AppState] 라우팅 실패:", error);
        }
      }
    });

    return () => {
      notificationTapListener.remove();
      appStateListener.remove();
    };
  }, [router]);

  // ============================================
  // 미디어 컨트롤 버튼 이벤트 리스너 (다음/이전)
  // ============================================
  useEffect(() => {
    console.log("🎮 [AudioContext] 미디어 컨트롤 버튼 리스너 등록");

    const nextSubscription = TrackPlayer.addEventListener(Event.RemoteNext, async () => {
      console.log("⏭️ [Event] RemoteNext - 다음 방송국");
      if (currentIndex >= 0 && currentIndex < playlist.length - 1) {
        await play(playlist[currentIndex + 1]);
      } else {
        console.log("⚠️ [Event] 다음 방송국 없음");
      }
    });

    const previousSubscription = TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
      console.log("⏮️ [Event] RemotePrevious - 이전 방송국");
      if (currentIndex > 0) {
        await play(playlist[currentIndex - 1]);
      } else {
        console.log("⚠️ [Event] 이전 방송국 없음");
      }
    });

    return () => {
      nextSubscription.remove();
      previousSubscription.remove();
    };
  }, [currentIndex, playlist]);

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
      const wasPlaying = playbackState === PlaybackState.PLAYING;

      // 상태를 LOADING으로 설정하되, 미디어 컨트롤은 유지
      setPlaybackState(PlaybackState.LOADING);
      setCurrentStation(station);

      // 2. URL 해석 (먼저 해서 준비)
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

      // 3. 새 트랙 생성
      const track: Track = {
        url: finalUrl,
        title: station.name,
        artist: 'Live Radio',
        isLiveStream: true,
        type: TrackType.HLS,
        contentType: 'application/x-mpegURL',
      };

      // 4. 부드러운 트랙 전환
      try {
        // 먼저 메타데이터 업데이트 (미디어 컨트롤에 새 방송국 이름 표시)
        try {
          await TrackPlayer.updateMetadataForTrack(0, {
            title: station.name,
            artist: 'Live Radio',
          });
        } catch (metaError) {
          console.log("ℹ️ [Action] 메타데이터 업데이트 건너뜀 (트랙 없음)");
        }

        // 일시정지 후 부드럽게 전환
        if (wasPlaying) {
          await TrackPlayer.pause();
        }

        // 기존 트랙 제거
        await TrackPlayer.reset();

        // 새 트랙 추가
        await TrackPlayer.add(track);
        console.log("✅ [Action] 트랙 전환 완료, 재생 대기 중");
      } catch (resetError) {
        console.warn("⚠️ [Action] 트랙 전환 실패, 강제 복구:", resetError);
        // 에러 시 강제 복구
        try {
          await TrackPlayer.stop();
          await TrackPlayer.reset();
          await TrackPlayer.add(track);
        } catch (e) {
          console.error("❌ [Action] 플레이어 복구 실패:", e);
          setPlaybackState(PlaybackState.ERROR);
          isLoadingNewStationRef.current = false;
          return;
        }
      }

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

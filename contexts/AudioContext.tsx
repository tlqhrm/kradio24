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
import {router, useRouter} from "expo-router";
import { AppState, Platform, ToastAndroid, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  setCurrentStation: (station: RadioStation | null) => void;
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
  const [isLoadingNewStation, setIsLoadingNewStation] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const setupPromiseRef = useRef<Promise<void> | null>(null); // 초기화 Promise
  const maxRetries = 0; // 최대 재시도 횟수

  const currentIndex = currentStation
    ? playlist.findIndex(s => s.id === currentStation.id)
    : -1;

  // ============================================
  // 토스트 메시지 표시
  // ============================================
  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // iOS는 Alert로 간단히 표시
      Alert.alert('', message, [{ text: '확인' }]);
    }
  };

  // ============================================
  // AsyncStorage: 재생 상태 저장/불러오기
  // ============================================
  const STORAGE_KEYS = {
    CURRENT_STATION: '@audio_current_station',
    PLAYLIST: '@audio_playlist',
  };

  // 현재 방송국 저장
  const saveCurrentStation = async (station: RadioStation | null) => {
    try {
      if (station) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STATION, JSON.stringify(station));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_STATION);
      }
    } catch (error) {
      console.error('❌ [Storage] 현재 방송국 저장 실패:', error);
    }
  };

  // 플레이리스트 저장
  const savePlaylist = async (stations: RadioStation[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLIST, JSON.stringify(stations));
    } catch (error) {
      console.error('❌ [Storage] 플레이리스트 저장 실패:', error);
    }
  };

  // 저장된 재생 상태 불러오기
  const loadPlaybackState = async () => {
    try {
      const [savedStation, savedPlaylist] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_STATION),
        AsyncStorage.getItem(STORAGE_KEYS.PLAYLIST),
      ]);

      if (savedStation) {
        const station: RadioStation = JSON.parse(savedStation);
        setCurrentStation(station);
        const track: Track = {
          url: station.streamUrl,  // 원본 URL 직접 사용 - 빠른 재생!
          title: station.name,
          artist: station.artist || 'Live Radio',  // 방송국별 아티스트 이름
          artwork: station.artwork,  // 썸네일 이미지
          isLiveStream: true,
          type: TrackType.HLS,
          contentType: 'application/x-mpegURL',
        };
        await TrackPlayer.add(track)
        await TrackPlayer.pause(); // 일시정지 상태로 로드
      }

      if (savedPlaylist) {
        const stations: RadioStation[] = JSON.parse(savedPlaylist);
        setPlaylist(stations);
        setPlaybackState(PlaybackState.PAUSED);
      }
    } catch (error) {
      console.error('❌ [Storage] 재생 상태 불러오기 실패:', error);
    } finally {
    }
  };

  // ============================================
  // TrackPlayer 초기화 & 미디어 컨트롤 설정
  // ============================================
  useEffect(() => {

    const setupPlayer = async () => {
      try {
        // TrackPlayer 초기화 (이미 초기화되어 있으면 에러 무시)
        try {
          await TrackPlayer.setupPlayer({
            autoHandleInterruptions: true,
            autoUpdateMetadata: true,
          });
        } catch (setupError: any) {
          // 이미 설정되어 있는 경우 (앱이 완전히 종료되지 않았을 때)
          if (setupError?.message?.includes('already') || setupError?.code === 'player_already_initialized') {
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
      } catch (error) {
        console.error("❌ [AudioContext] TrackPlayer 초기화 실패:", error);
        setIsPlayerReady(false);
      }
    };

    // Promise 저장 (초기화 대기용)
    setupPromiseRef.current = setupPlayer();

    return () => {
      // 컴포넌트 언마운트 시에만 정리 (앱 강제종료 시에는 실행 안됨)
      TrackPlayer.reset().catch(() => {});
    };
  }, []);

  // ============================================
  // 앱 시작 시 저장된 재생 상태 불러오기
  // ============================================
  useEffect(() => {
    loadPlaybackState();
  }, []);

  // ============================================
  // 재생 상태 자동 저장
  // ============================================
  // currentStation 변경 시 저장
  useEffect(() => {
    if (currentStation) {
      saveCurrentStation(currentStation);
    }
  }, [currentStation]);

  // playlist 변경 시 저장
  useEffect(() => {
    if (playlist.length > 0) {
      savePlaylist(playlist);
    }
  }, [playlist]);

  // ============================================
  // 알림 탭 이벤트 리스너 (플레이어 화면으로 이동)
  // ============================================
  useEffect(() => {
    const notificationTapListener = TrackPlayer.addEventListener(
      Event.RemoteDuck,
      async (event) => {
      }
    );



    return () => {
      notificationTapListener.remove();
    };
  }, [router, currentStation]);

  // ============================================
  // 미디어 컨트롤 버튼 이벤트 리스너 (다음/이전)
  // ============================================
  useEffect(() => {

    const nextSubscription = TrackPlayer.addEventListener(Event.RemoteNext, async () => {
      if (playlist.length === 0) return;
      const nextIndex = currentIndex >= playlist.length - 1 ? 0 : currentIndex + 1;
      await play(playlist[nextIndex]);
    });

    const previousSubscription = TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
      if (playlist.length === 0) return;
      const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
      await play(playlist[prevIndex]);
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

    const errorSubscription = TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
      console.error("❌ [Event] PlaybackError:", JSON.stringify(error, null, 2));
    });

    const stateSubscription = TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {

      // 방송국 없음 → IDLE
      if (!currentStation) {
        if (playbackState !== PlaybackState.IDLE) {
          setPlaybackState(PlaybackState.IDLE);
        }
        return;
      }

      // ============================================
      // 로딩 중: 준비 완료 시 자동 재생
      // ============================================
      if (isLoadingNewStation) {
        if (state === State.Ready) {
          await TrackPlayer.play();
          setIsLoadingNewStation(false);
          setRetryCount(0); // 재시도 횟수 초기화
          setPlaybackState(PlaybackState.PLAYING);
        } else if (state === State.Buffering || state === State.Loading) {
          // 버퍼링 중에는 LOADING 상태 유지
          setPlaybackState(PlaybackState.LOADING);
        } else if (state === State.Error) {
          console.error("❌ [Event] 재생 오류 발생, 재시도 횟수:", retryCount);

          // 재시도 실패 → 토스트 + 다음 트랙
          setIsLoadingNewStation(false);
          setRetryCount(0); // 재시도 횟수 초기화

          // 토스트 메시지
          const stationName = currentStation?.name || '방송국';
          showToast(`${stationName} 재생 불가능 - 다음 곡으로 이동합니다`);

          // 즉시 다음 트랙으로 스무스하게 이동
          const currentPlaylist = playlist;
          const currentSt = currentStation;

          if (currentPlaylist.length > 0) {
            // 현재 인덱스 계산
            const currentIdx = currentSt
              ? currentPlaylist.findIndex(s => s.id === currentSt.id)
              : -1;

            // 다음 인덱스 계산 (무한 순회)
            const nextIndex = currentIdx >= currentPlaylist.length - 1 ? 0 : currentIdx + 1;
            const nextStation = currentPlaylist[nextIndex];


            // 다음 트랙을 큐에 추가하고 skip (미디어 컨트롤 유지)
            const nextTrack: Track = {
              url: nextStation.streamUrl,
              title: nextStation.name,
              artist: nextStation.artist || 'Live Radio',
              artwork: nextStation.artwork,
              isLiveStream: true,
              type: TrackType.HLS,
              contentType: 'application/x-mpegURL',
            };

              await TrackPlayer.add(nextTrack);
              await TrackPlayer.skip(1);
              await TrackPlayer.remove(0);
            //     // 다음 방송국으로 상태 업데이트
                setCurrentStation(nextStation);
                setPlaybackState(PlaybackState.LOADING);
                setIsLoadingNewStation(true);

          } else {
            setPlaybackState(PlaybackState.ERROR);
          }
        }

        return;
      }

      // ============================================
      // 일반 상태: 플레이어 이벤트 반영
      // ============================================
      if (state === State.Playing) {
        if (userPaused) return; // 사용자 일시정지 중
        if (playbackState !== PlaybackState.PLAYING) {
          setPlaybackState(PlaybackState.PLAYING);
        }
      } else if (state === State.Paused) {
        if (playbackState !== PlaybackState.PAUSED) {
          setPlaybackState(PlaybackState.PAUSED);
        }
        setUserPaused(false);
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
      errorSubscription.remove();
      stateSubscription.remove();
    };
  }, [currentStation, playbackState, playlist, isLoadingNewStation, userPaused, retryCount]);

  // ============================================
  // 재생 함수
  // ============================================
  const play = async (station: RadioStation, isRetry: boolean = false) => {
    try {
      // 초기화 대기
      if (!isPlayerReady && setupPromiseRef.current) {
        await setupPromiseRef.current;
      }

      // 재생 시작

      // 1. 즉시 플래그와 상태 초기화
      setIsLoadingNewStation(true);
      setUserPaused(false);

      // 새로운 방송국이면 재시도 횟수 초기화 (재시도가 아닐 때만)
      if (!isRetry && currentStation?.id !== station.id) {
        setRetryCount(0);
      }


      // 상태를 LOADING으로 설정하되, 미디어 컨트롤은 유지
      setPlaybackState(PlaybackState.LOADING);
      setCurrentStation(station);

      // 2. 트랙 즉시 생성 (URL 해석 생략으로 성능 개선)
      const track: Track = {
        url: station.streamUrl,  // 원본 URL 직접 사용 - 빠른 재생!
        title: station.name,
        artist: station.artist || 'Live Radio',  // 방송국별 아티스트 이름
        artwork: station.artwork,  // 썸네일 이미지
        isLiveStream: true,
        type: TrackType.HLS,
        contentType: 'application/x-mpegURL',
      };

      // 3. 부드러운 트랙 전환 (미디어 컨트롤 유지)
      try {
        const queue = await TrackPlayer.getQueue();

        if (queue.length > 0) {
          // 기존 트랙이 있으면: 새 트랙을 끝에 추가 → 새 트랙으로 이동 → 이전 트랙 제거
          await TrackPlayer.add(track); // 인덱스 1에 추가
          await TrackPlayer.skip(1); // 새 트랙으로 이동 (미디어 컨트롤 유지됨)
          await TrackPlayer.remove(0); // 이전 트랙 제거
        } else {
          // 첫 재생: 트랙 추가만
          await TrackPlayer.add(track);
        }

      } catch (resetError) {
        console.warn("[Action] 트랙 전환 실패, 강제 복구:", resetError);
        // 에러 시 강제 복구
        try {
          await TrackPlayer.stop();
          await TrackPlayer.reset();
          await TrackPlayer.add(track);
        } catch (e) {
          console.error("[Action] 플레이어 복구 실패:", e);
          setPlaybackState(PlaybackState.ERROR);
          setIsLoadingNewStation(false);
          return;
        }
      }

      // 재생은 이벤트 리스너에서 Ready 상태일 때 자동 실행
    } catch (error) {
      console.error("❌ [Action] 재생 오류:", error);
      setPlaybackState(PlaybackState.ERROR);
      setIsLoadingNewStation(false);
    }
  };

  // ============================================
  // 일시정지 함수
  // ============================================
  const pause = async () => {
    try {

      // 1. 사용자 일시정지 플래그 설정 (PLAYING 이벤트 차단)
      setUserPaused(true);

      // 2. 로딩 플래그 해제
      setIsLoadingNewStation(false);

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

      // 1. 사용자 일시정지 플래그 해제 (PLAYING 이벤트 허용)
      setUserPaused(false);

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

      // 1. 모든 플래그 리셋
      setUserPaused(false);
      setIsLoadingNewStation(false);

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
  // 플레이리스트 네비게이션 (무한 순회)
  // ============================================
  const playNext = async () => {
    if (playlist.length === 0) return;
    // 무한 순회: 마지막이면 처음으로
    const nextIndex = currentIndex >= playlist.length - 1 ? 0 : currentIndex + 1;
    await play(playlist[nextIndex]);
  };

  const playPrevious = async () => {
    if (playlist.length === 0) return;
    // 무한 순회: 처음이면 마지막으로
    const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
    await play(playlist[prevIndex]);
  };

  // 무한 순회이므로 플레이리스트가 있으면 항상 이동 가능
  const hasNext = playlist.length > 0;
  const hasPrevious = playlist.length > 0;
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
        setCurrentStation,
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

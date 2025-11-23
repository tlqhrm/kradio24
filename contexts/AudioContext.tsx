import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { RadioStation } from "@/types/radio";
import { PlaybackState } from "@/types/radio";
import { Audio } from "expo-av";

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
  const player = useAudioPlayer(null);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.IDLE);
  const [playlist, setPlaylist] = useState<RadioStation[]>([]);

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
  // Audio Mode 설정 & 미디어 컨트롤 활성화
  // ============================================
  useEffect(() => {
    console.log("🔧 [AudioContext] 초기화 시작");

    const setupAudioMode = async () => {
      try {
        // expo-audio 모드 설정
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionModeAndroid: "doNotMix",
        });

        // expo-av 오디오 활성화 (미디어 컨트롤용)
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });

        console.log("✅ [AudioContext] Audio Mode 및 미디어 컨트롤 설정 완료");
      } catch (error) {
        console.error("❌ [AudioContext] Audio Mode 설정 실패:", error);
      }
    };

    setupAudioMode();
  }, []);

  // ============================================
  // currentStation 동기화
  // ============================================
  useEffect(() => {
    currentStationRef.current = currentStation;
  }, [currentStation]);

  // ============================================
  // 플레이어 이벤트 리스너 (한 번만 등록)
  // ============================================
  useEffect(() => {
    console.log("🎧 [AudioContext] 이벤트 리스너 등록");

    const listener = player.addListener("playbackStatusUpdate", (status) => {
      // 방송국 없음 → IDLE
      if (!currentStationRef.current) {
        if (playbackState !== PlaybackState.IDLE) {
          setPlaybackState(PlaybackState.IDLE);
        }
        return;
      }

      // ============================================
      // 로딩 중: 자동 재생 트리거만 처리, 나머지 무시
      // ============================================
      if (isLoadingNewStationRef.current) {
        // 준비 완료 → 자동 재생
        if (status.playbackState === "ready" || status.playbackState === "readyToPlay") {
          player.play();
          isLoadingNewStationRef.current = false;
        }
        // 로딩 중에는 다른 모든 이벤트 무시 (UI 깜빡임 방지)
        return;
      }

      // ============================================
      // 일반 상태: 플레이어 이벤트 반영
      // ============================================

      // PLAYING 상태
      if (
        status.playbackState === "playing" ||
        (status.playbackState === "ready" && status.currentTime > 0) ||
        (status.playbackState === "readyToPlay" && status.currentTime > 0)
      ) {
        if (userPausedRef.current) return; // 사용자 일시정지 중
        if (playbackState !== PlaybackState.PLAYING) {
          setPlaybackState(PlaybackState.PLAYING);
        }
        return;
      }

      // PAUSED 상태
      if (status.playbackState === "paused") {
        if (playbackState !== PlaybackState.PAUSED) {
          setPlaybackState(PlaybackState.PAUSED);
        }
        userPausedRef.current = false;
        return;
      }

      // ERROR 상태
      if (status.playbackState === "error") {
        setPlaybackState(PlaybackState.ERROR);
        isLoadingNewStationRef.current = false;
        return;
      }
    });

    return () => {
      console.log("🔌 [AudioContext] 이벤트 리스너 해제");
      listener.remove();
    };
  }, [player]);

  // ============================================
  // 재생 함수
  // ============================================
  const play = async (station: RadioStation) => {
    try {
      console.log("🎵 [Action] 재생:", station.name);

      // 1. 즉시 플래그와 상태 초기화 (이후 모든 이벤트를 로딩 중으로 처리)
      isLoadingNewStationRef.current = true;
      userPausedRef.current = false;
      setPlaybackState(PlaybackState.LOADING);
      setCurrentStation(station);

      // 2. 현재 재생 중인 것 완전 정지 (소스 제거)
      player.pause();
      player.remove();

      // 2. 프록시 URL → 실제 스트림 URL 해석
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

      // 3. 소스 변경 (자동 재생은 이벤트 리스너에서 처리)
      console.log("🔄 [Action] 소스 변경 시작");
      player.replace(finalUrl);

    } catch (error) {
      console.error("❌ [Action] 재생 오류:", error);
      setPlaybackState(PlaybackState.ERROR);
      isLoadingNewStationRef.current = false;
    }
  };

  // ============================================
  // 일시정지 함수
  // ============================================
  const pause = () => {
    try {
      console.log("⏸️ [Action] 일시정지");

      // 1. 사용자 일시정지 플래그 설정 (PLAYING 이벤트 차단)
      userPausedRef.current = true;

      // 2. 로딩 플래그 해제
      isLoadingNewStationRef.current = false;

      // 3. 즉시 PAUSED 상태로 설정 (UI 즉시 업데이트)
      setPlaybackState(PlaybackState.PAUSED);

      // 4. 플레이어 일시정지
      player.pause();
    } catch (error) {
      console.error("❌ [Action] 일시정지 오류:", error);
    }
  };

  // ============================================
  // 재개 함수
  // ============================================
  const resume = () => {
    try {
      console.log("▶️ [Action] 재개");

      // 1. 사용자 일시정지 플래그 해제 (PLAYING 이벤트 허용)
      userPausedRef.current = false;

      // 2. 플레이어 재생 (상태는 이벤트 리스너가 PLAYING으로 업데이트)
      player.play();
    } catch (error) {
      console.error("❌ [Action] 재개 오류:", error);
    }
  };

  // ============================================
  // 정지 함수
  // ============================================
  const stop = () => {
    try {
      console.log("⏹️ [Action] 정지");

      // 1. 모든 플래그 리셋
      userPausedRef.current = false;
      isLoadingNewStationRef.current = false;

      // 2. 플레이어 정지 및 소스 제거
      player.pause();
      player.remove();

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
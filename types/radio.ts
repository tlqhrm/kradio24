/**
 * 라디오 스테이션 인터페이스
 */
export interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  genre?: string;
  category?: string; // KBS, MBC, SBS, etc.
  artist?: string; // 아티스트/방송사 이름
  artwork?: string; // 썸네일 이미지 URL
  isFavorite: boolean;
  addedAt: Date;
  lastPlayedAt?: Date;
}

/**
 * M3U 파일에서 파싱된 스테이션 엔트리
 */
export interface M3UEntry {
  title: string;
  url: string;
  duration: number; // -1 for live streams
}

/**
 * 재생 상태
 */
export enum PlaybackState {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ERROR = 'error',
}

/**
 * 플레이어 상태
 */
export interface PlayerState {
  currentStation: RadioStation | null;
  playbackState: PlaybackState;
  volume: number; // 0-1
  error?: string;
}
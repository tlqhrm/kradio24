/**
 * 방송국별 메타데이터 (썸네일, 설명 등)
 */

export interface StationMetadata {
  name: string;
  artwork?: string;
  description?: string;
  website?: string;
}

/**
 * 방송국 이름으로 메타데이터 매핑
 *
 * 사용 방법:
 * 1. 로컬 이미지: require('@/assets/logos/kbs.png')
 * 2. 온라인 이미지: 'https://example.com/logo.png'
 */
export const STATION_METADATA: Record<string, StationMetadata> = {
  // KBS
  'KBS 1라디오': {
    name: 'KBS 1라디오',
    artwork: 'https://via.placeholder.com/300x300/FF0000/FFFFFF?text=KBS+1',
    description: 'KBS 제1라디오',
  },
  'KBS 2라디오': {
    name: 'KBS 2라디오',
    artwork: 'https://via.placeholder.com/300x300/0066CC/FFFFFF?text=KBS+2',
    description: 'KBS 제2라디오 - 행복한 오후',
  },
  'KBS 3라디오': {
    name: 'KBS 3라디오',
    artwork: 'https://via.placeholder.com/300x300/00AA00/FFFFFF?text=KBS+3',
    description: 'KBS 제3라디오 - 라디오 한민족',
  },
  'KBS 1FM': {
    name: 'KBS 1FM',
    artwork: 'https://via.placeholder.com/300x300/FF6600/FFFFFF?text=KBS+1FM',
    description: 'KBS 클래식 FM',
  },
  'KBS 2FM': {
    name: 'KBS 2FM',
    artwork: 'https://via.placeholder.com/300x300/9933FF/FFFFFF?text=KBS+2FM',
    description: 'KBS 쿨FM - 음악이 있는 오후',
  },

  // MBC
  'MBC 표준FM': {
    name: 'MBC 표준FM',
    artwork: 'https://via.placeholder.com/300x300/0099FF/FFFFFF?text=MBC+FM',
    description: 'MBC 표준FM',
  },
  'MBC FM4U': {
    name: 'MBC FM4U',
    artwork: 'https://via.placeholder.com/300x300/FF3366/FFFFFF?text=FM4U',
    description: 'MBC FM4U',
  },

  // SBS
  'SBS 러브FM': {
    name: 'SBS 러브FM',
    artwork: 'https://via.placeholder.com/300x300/FF1493/FFFFFF?text=LOVE+FM',
    description: 'SBS 러브FM',
  },
  'SBS 파워FM': {
    name: 'SBS 파워FM',
    artwork: 'https://via.placeholder.com/300x300/FFD700/000000?text=POWER+FM',
    description: 'SBS 파워FM',
  },

  // 기타
  'EBS FM': {
    name: 'EBS FM',
    artwork: 'https://via.placeholder.com/300x300/00AAFF/FFFFFF?text=EBS+FM',
    description: 'EBS FM - 교육방송',
  },
  'YTN 라디오': {
    name: 'YTN 라디오',
    artwork: 'https://via.placeholder.com/300x300/CC0000/FFFFFF?text=YTN',
    description: 'YTN 라디오 - 뉴스 & 정보',
  },

  // 기본값 - 나머지 방송국용
};

/**
 * 방송국 이름으로 메타데이터 가져오기
 */
export function getStationMetadata(stationName: string): StationMetadata | undefined {
  return STATION_METADATA[stationName];
}

/**
 * 기본 썸네일 URL
 */
export const DEFAULT_ARTWORK = 'https://via.placeholder.com/300x300/666666/FFFFFF?text=Radio';

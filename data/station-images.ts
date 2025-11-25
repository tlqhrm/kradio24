/**
 * 방송국 이미지 매핑
 *
 * 사용법:
 * 1. assets/images/stations/ 폴더에 이미지 파일 저장
 * 2. 아래 STATION_IMAGES 객체에 이미지 매핑 추가
 * 3. stations.ts에서 STATION_IMAGES.kbs1 형태로 사용
 *
 * 주의:
 * - require()는 빌드 시점에 이미지를 번들에 포함시킴
 * - 이미지 경로는 상대 경로로 작성
 * - TypeScript: require() 반환값은 number 타입 (이미지 리소스 ID)
 */

// ===== KBS =====
// 이미지를 추가하려면 주석을 해제하고 실제 파일 경로로 수정하세요
export const STATION_IMAGES = {
  kbs1: require('@/assets/images/stations/kbs1(1).png'),
  kbs2: require('@/assets/images/stations/kbs2.png'),
  kbs3: require('@/assets/images/stations/kbs3.png'),
  kbs1fm: require('@/assets/images/stations/kbs-1fm.png'),
  kbs2fm: require('@/assets/images/stations/kbs-2fm.png'),
  kbs: require('@/assets/images/stations/kbs.png'),

  // ===== MBC =====
  mbc1: require('@/assets/images/stations/mbc1.png'),
  mbcFm4u: require('@/assets/images/stations/mbc-fm4u.png'),
  mbcAtm: require('@/assets/images/stations/mbc-atm.png'),

  // ===== SBS =====
  sbsLovefm: require('@/assets/images/stations/sbs-lovefm.png'),
  sbsPowerfm: require('@/assets/images/stations/sbs-powerfm.png'),

  // 기타 방송국...
} as const;

/**
 * 기본 플레이스홀더 이미지
 * 실제 이미지가 없을 때 사용
 */
export function getPlaceholderImage(color: string = '666666', text: string = 'Radio'): string {
  return `https://via.placeholder.com/300x300/${color}/FFFFFF?text=${encodeURIComponent(text)}`;
}

// ===== 사용 예제 =====
/*
// stations.ts 파일에서:

import { STATION_IMAGES, getPlaceholderImage } from './station-images';

const STATION_CONFIGS: StationConfig[] = [
  {
    name: 'KBS 1라디오',
    streamUrl: 'https://...',
    category: CATEGORIES.KBS,
    artist: 'KBS',
    // 로컬 이미지 사용 (이미지 파일이 있을 때)
    artwork: STATION_IMAGES.kbs1,

    // 또는 플레이스홀더 사용 (이미지 파일이 없을 때)
    // artwork: getPlaceholderImage('FF0000', 'KBS 1'),
  },
  {
    name: 'MBC FM',
    streamUrl: 'https://...',
    category: CATEGORIES.MBC,
    artist: 'MBC',
    // 조건부 사용
    artwork: STATION_IMAGES.mbcSfm || getPlaceholderImage('0099FF', 'MBC FM'),
  },
];
*/

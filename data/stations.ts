import { RadioStation } from '@/types/radio';
import {STATION_IMAGES} from "@/data/station-images";

/**
 * 카테고리 상수
 * 여기서 모든 카테고리를 미리 정의
 */
export const CATEGORIES = {
  KBS: 'KBS',
  MBC: 'MBC',
  SBS: 'SBS',
  CBS: 'CBS',
  EBS: '교육방송',
  YTN: '뉴스',
  TRAFFIC: '교통방송',
  REGION: '지역방송',
  RELIGION: '종교방송',
  SPECIAL: '특수방송',
  FOREIGN: '외국방송',
} as const;

/**
 * 라디오 방송국 설정
 * 여기서 모든 정보(URL, 이름, 썸네일)를 한 번에 관리
 */
interface StationConfig {
  name: string;
  streamUrl: string;
  category: string;
  artist?: string;        // 아티스트 이름 (미디어 컨트롤에 표시)
  artwork?: string;
  description?: string;
}

/**
 * 방송국 목록
 * 여기서 URL, 이름, 썸네일 모두 설정
 */
const STATION_CONFIGS: StationConfig[] = [
  // ===== KBS =====
  {
    name: 'KBS 제1라디오 - FM 97.3',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=kbs&ch=1radio',
    category: CATEGORIES.KBS,
    artist: 'KBS',
    artwork: STATION_IMAGES.kbs1,
    description: 'KBS 제1라디오2',
  },
  {
    name: 'KBS 해피 FM - FM 106.1',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=kbs&ch=2radio',
    category: CATEGORIES.KBS,
    artist: 'KBS',
    artwork: STATION_IMAGES.kbs2,
    description: 'KBS 제2라디오 - 행복한 오후',
  },
  {
    name: 'KBS 제3라디오 - FM 104.9',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=kbs&ch=3radio',
    category: CATEGORIES.KBS,
    artist: 'KBS',
    artwork: STATION_IMAGES.kbs3,
    description: 'KBS 제3라디오 - 라디오 한민족',
  },
  {
    name: 'KBS 클래식 FM - FM 93.1',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=kbs&ch=1fm',
    category: CATEGORIES.KBS,
    artist: 'KBS',
    artwork: STATION_IMAGES.kbs1fm,
    description: 'KBS 클래식 FM',
  },
  {
    name: 'KBS 쿨 FM - FM 89.1',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=kbs&ch=2fm',
    category: CATEGORIES.KBS,
    artist: 'KBS',
    artwork: STATION_IMAGES.kbs2fm,
    description: 'KBS 쿨FM - 음악이 있는 오후',
  },
  {
    name: 'KBS 한민족방송',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=kbs&ch=hanminjok',
    category: CATEGORIES.KBS,
    artist: 'KBS',
    artwork: STATION_IMAGES.kbs,
  },

  // ===== MBC =====
  {
    name: 'MBC 표준FM - FM 95.9',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=mbc&ch=sfm',
    category: CATEGORIES.MBC,
    artist: 'MBC',
    artwork: STATION_IMAGES.mbc1,
    description: 'MBC 표준FM',
  },
  {
    name: 'MBC FM4U - FM 91.9',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=mbc&ch=fm4u',
    category: CATEGORIES.MBC,
    artist: 'MBC',
    artwork: STATION_IMAGES.mbcFm4u,
    description: 'MBC FM4U',
  },
  {
    name: 'MBC mini 올댓뮤직',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=mbc&ch=chm',
    category: CATEGORIES.MBC,
    artist: 'MBC',
    artwork: STATION_IMAGES.mbcAtm,
  },

  // ===== SBS =====
  {
    name: 'SBS 러브FM - FM 103.5',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=sbs&ch=lovefm',
    category: CATEGORIES.SBS,
    artist: 'SBS',
    artwork: STATION_IMAGES.sbsLovefm,
    description: 'SBS 러브FM',
  },
  {
    name: 'SBS 파워FM - FM 107.7',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=sbs&ch=powerfm',
    category: CATEGORIES.SBS,
    artist: 'SBS',
    artwork: STATION_IMAGES.sbsPowerfm,
    description: 'SBS 파워FM',
  },
  {
    name: 'SBS 고릴라디오M',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=sbs&ch=dmb',
    category: CATEGORIES.SBS,
    artist: 'SBS',
    artwork: STATION_IMAGES.sbsGorila,
  },

  // ===== 기타 =====
  {
    name: 'EBS FM',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=ebs',
    category: CATEGORIES.EBS,
    artist: 'EBS',
    artwork: STATION_IMAGES.ebs,
    description: 'EBS FM - 교육방송',
  },
  {
    name: 'OBS 라디오',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=obs',
    category: CATEGORIES.REGION,
    artist: 'OBS',
    artwork: STATION_IMAGES.obs,
  },
  {
    name: 'iFM 경인방송',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=ifm',
    category: CATEGORIES.REGION,
    artist: 'iFM',
    artwork: STATION_IMAGES.ifm,
  },
  {
    name: 'YTN 라디오',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=ytn',
    category: CATEGORIES.YTN,
    artist: 'YTN',
    artwork: STATION_IMAGES.ytn,
    description: 'YTN 라디오 - 뉴스 & 정보',
  },
  {
    name: 'TBS FM',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=tbs&ch=fm',
    category: CATEGORIES.REGION,
    artist: 'TBS',
    artwork: STATION_IMAGES.tbsFm,
  },
  {
    name: 'TBS eFM',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=tbs&ch=efm',
    category: CATEGORIES.REGION,
    artist: 'TBS',
    artwork: STATION_IMAGES.tbsEFm,
  },
  {
    name: 'TBN 경인교통방송',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=tbn',
    category: CATEGORIES.TRAFFIC,
    artist: 'TBN',
    artwork: '',
  },

  // ===== CBS =====
  {
    name: 'CBS 표준FM',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=cbs&ch=sfm',
    category: CATEGORIES.CBS,
    artist: 'CBS',
    artwork: 'https://via.placeholder.com/300x300/0066FF/FFFFFF?text=CBS+FM',
  },
  {
    name: 'CBS 음악FM',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=cbs&ch=mfm',
    category: CATEGORIES.CBS,
    artist: 'CBS',
    artwork: 'https://via.placeholder.com/300x300/9933CC/FFFFFF?text=CBS+음악FM',
  },
  {
    name: 'CBS JOY4U',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=cbs&ch=joy4u',
    category: CATEGORIES.CBS,
    artist: 'CBS',
    artwork: 'https://via.placeholder.com/300x300/FF33CC/FFFFFF?text=JOY4U',
  },

  // ===== 종교방송 =====
  {
    name: 'FEBC 서울극동방송',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=febc',
    category: CATEGORIES.RELIGION,
    artist: 'FEBC',
    artwork: 'https://via.placeholder.com/300x300/6633FF/FFFFFF?text=FEBC',
  },
  {
    name: 'BBS 서울불교방송',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=bbs',
    category: CATEGORIES.RELIGION,
    artist: 'BBS',
    artwork: 'https://via.placeholder.com/300x300/FF9900/FFFFFF?text=BBS',
  },
  {
    name: 'CPBC 가톨릭평화방송',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=cpbc',
    category: CATEGORIES.RELIGION,
    artist: 'CPBC',
    artwork: 'https://via.placeholder.com/300x300/9966FF/FFFFFF?text=CPBC',
  },
  {
    name: 'WBS 서울원음방송',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=wbs',
    category: CATEGORIES.RELIGION,
    artist: 'WBS',
    artwork: 'https://via.placeholder.com/300x300/FF6699/FFFFFF?text=WBS',
  },

  // ===== 특수방송 =====
  {
    name: '국방FM',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=kookbang',
    category: CATEGORIES.SPECIAL,
    artist: '국방FM',
    artwork: 'https://via.placeholder.com/300x300/006600/FFFFFF?text=국방FM',
  },
  {
    name: '국악방송',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=kugak',
    category: CATEGORIES.SPECIAL,
    artist: '국악방송',
    artwork: 'https://via.placeholder.com/300x300/CC6600/FFFFFF?text=국악',
  },
  {
    name: 'AFN FM Humphreys',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=afn&city=humphreys',
    category: CATEGORIES.FOREIGN,
    artist: 'AFN',
    artwork: 'https://via.placeholder.com/300x300/000099/FFFFFF?text=AFN',
  },

  // ===== 커뮤니티 FM =====
  // {
  //   name: '관악FM',
  //   streamUrl: 'https://radio.bsod.kr/stream/?stn=community&ch=gwanakfm',
  //   category: CATEGORIES.COMMUNITY,
  //   artist: '관악FM',
  //   artwork: 'https://via.placeholder.com/300x300/669999/FFFFFF?text=관악FM',
  // },
  // {
  //   name: '마포FM',
  //   streamUrl: 'https://radio.bsod.kr/stream/?stn=community&ch=mapofm',
  //   category: CATEGORIES.COMMUNITY,
  //   artist: '마포FM',
  //   artwork: 'https://via.placeholder.com/300x300/996699/FFFFFF?text=마포FM',
  // },
  // {
  //   name: '성남FM',
  //   streamUrl: 'https://radio.bsod.kr/stream/?stn=community&ch=seongnamfm',
  //   category: CATEGORIES.COMMUNITY,
  //   artist: '성남FM',
  //   artwork: 'https://via.placeholder.com/300x300/669966/FFFFFF?text=성남FM',
  // },
  // {
  //   name: '서대문FM',
  //   streamUrl: 'https://radio.bsod.kr/stream/?stn=community&ch=sdmfm',
  //   category: CATEGORIES.COMMUNITY,
  //   artist: '서대문FM',
  //   artwork: 'https://via.placeholder.com/300x300/999966/FFFFFF?text=서대문FM',
  // },
  // {
  //   name: '수원FM',
  //   streamUrl: 'https://radio.bsod.kr/stream/?stn=community&ch=sonefm',
  //   category: CATEGORIES.COMMUNITY,
  //   artist: '수원FM',
  //   artwork: 'https://via.placeholder.com/300x300/996666/FFFFFF?text=수원FM',
  // },
  // {
  //   name: 'GO구리FM',
  //   streamUrl: 'https://radio.bsod.kr/stream/?stn=community&ch=gurifm',
  //   category: CATEGORIES.COMMUNITY,
  //   artist: 'GO구리FM',
  //   artwork: 'https://via.placeholder.com/300x300/666699/FFFFFF?text=구리FM',
  // },
  // {
  //   name: '단원FM',
  //   streamUrl: 'https://radio.bsod.kr/stream/?stn=community&ch=dwfm',
  //   category: CATEGORIES.COMMUNITY,
  //   artist: '단원FM',
  //   artwork: 'https://via.placeholder.com/300x300/669966/FFFFFF?text=단원FM',
  // },
];

/**
 * 설정을 RadioStation 타입으로 변환
 */
export const STATIONS: RadioStation[] = STATION_CONFIGS.map((config, index) => ({
  id: `station-${index}`,
  name: config.name,
  streamUrl: config.streamUrl,
  category: config.category,
  artist: config.artist || 'Live Radio',  // 기본값: Live Radio
  artwork: config.artwork || 'https://via.placeholder.com/300x300/666666/FFFFFF?text=Radio',
  isFavorite: false,
  addedAt: new Date(),
}));

/**
 * 카테고리별 방송국 가져오기
 */
export function getStationsByCategory(category: string): RadioStation[] {
  return STATIONS.filter(station => station.category === category);
}

/**
 * 모든 카테고리 목록 (CATEGORIES 상수에서 가져옴)
 */
export function getAllCategories(): string[] {
  return Object.values(CATEGORIES);
}

# 이미지 사용 예제

## 📋 단계별 가이드

### 1️⃣ 이미지 파일 준비

```bash
assets/images/stations/
  ├── kbs1.png          # 300x300px PNG
  ├── kbs2.png
  └── mbc-fm.png
```

### 2️⃣ station-images.ts 파일 수정

```typescript
// data/station-images.ts
export const STATION_IMAGES = {
  // 주석 해제하고 실제 이미지 추가
  kbs1: require('@/assets/images/stations/kbs1.png'),
  kbs2: require('@/assets/images/stations/kbs2.png'),
  mbcFm: require('@/assets/images/stations/mbc-fm.png'),
} as const;
```

### 3️⃣ stations.ts에서 사용

#### 방법 1: 직접 import (권장)

```typescript
// data/stations.ts
import { STATION_IMAGES, getPlaceholderImage } from './station-images';

const STATION_CONFIGS: StationConfig[] = [
  {
    name: 'KBS 1라디오',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=kbs&ch=1radio',
    category: CATEGORIES.KBS,
    artist: 'KBS',
    // 로컬 이미지 사용
    artwork: STATION_IMAGES.kbs1,
    description: 'KBS 제1라디오',
  },
  {
    name: 'KBS 2라디오',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=kbs&ch=2radio',
    category: CATEGORIES.KBS,
    artist: 'KBS',
    // 이미지가 없으면 플레이스홀더 사용
    artwork: STATION_IMAGES.kbs2 || getPlaceholderImage('0066CC', 'KBS 2'),
    description: 'KBS 제2라디오',
  },
];
```

#### 방법 2: 타입 변경 (require 반환값 사용)

현재 `RadioStation` 타입:
```typescript
// types/radio.ts
export interface RadioStation {
  // ...
  artwork?: string;  // 현재: URL 문자열만
}
```

수정 후:
```typescript
// types/radio.ts
export interface RadioStation {
  // ...
  artwork?: string | number;  // string (URL) 또는 number (require 반환값)
}
```

### 4️⃣ 실제 적용 예제

```typescript
// data/stations.ts
import { STATION_IMAGES, getPlaceholderImage } from './station-images';
import { RadioStation } from '@/types/radio';
import { CATEGORIES } from './stations';

const STATION_CONFIGS = [
  // ===== 로컬 이미지 사용 =====
  {
    name: 'KBS 1라디오',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=kbs&ch=1radio',
    category: CATEGORIES.KBS,
    artist: 'KBS',
    artwork: STATION_IMAGES.kbs1,  // 이미지 파일 사용
  },

  // ===== 플레이스홀더 사용 (이미지 없을 때) =====
  {
    name: 'MBC FM',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=mbc&ch=sfm',
    category: CATEGORIES.MBC,
    artist: 'MBC',
    artwork: getPlaceholderImage('0099FF', 'MBC FM'),  // URL 사용
  },

  // ===== 조건부 사용 (fallback) =====
  {
    name: 'SBS FM',
    streamUrl: 'https://radio.bsod.kr/stream/?stn=sbs&ch=lovefm',
    category: CATEGORIES.SBS,
    artist: 'SBS',
    // 이미지 있으면 사용, 없으면 플레이스홀더
    artwork: STATION_IMAGES.sbsLovefm || getPlaceholderImage('FF1493', 'SBS FM'),
  },
];
```

## 🎨 Image 컴포넌트에서 사용

React Native의 `Image` 컴포넌트는 자동으로 처리:

```typescript
import { Image } from 'react-native';

// URL (string)
<Image source={{ uri: 'https://...' }} />

// 로컬 이미지 (number)
<Image source={require('./image.png')} />
<Image source={STATION_IMAGES.kbs1} />

// 조건부 (둘 다 지원)
<Image
  source={
    typeof artwork === 'string'
      ? { uri: artwork }    // URL
      : artwork             // require()
  }
/>
```

## ⚠️ 주의사항

1. **require()는 빌드 타임에 실행됨**
   - 동적 경로 불가: `require(변수)` ❌
   - 정적 경로만 가능: `require('./image.png')` ✅

2. **TypeScript 타입**
   - `require()` 반환값: `number` (리소스 ID)
   - `artwork` 필드: `string | number` 타입 필요

3. **파일 크기 주의**
   - 이미지는 앱 번들에 포함됨
   - 최적화된 PNG/WebP 사용 권장
   - 너무 많은 이미지는 앱 크기 증가

## 🔍 디버깅

```typescript
// 이미지 로딩 확인
console.log('Artwork type:', typeof station.artwork);
console.log('Artwork value:', station.artwork);

// require() 반환값 확인
console.log('Image resource:', STATION_IMAGES.kbs1);  // 숫자 출력 (예: 123)
```

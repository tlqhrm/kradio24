# 방송국 이미지 가이드

## 📁 폴더 구조

```
assets/images/stations/
  ├── kbs1.png          # KBS 1라디오
  ├── kbs2.png          # KBS 2라디오
  ├── kbs3.png          # KBS 3라디오
  ├── kbs-1fm.png       # KBS 1FM
  ├── kbs-2fm.png       # KBS 2FM
  ├── mbc-sfm.png       # MBC 표준FM
  ├── mbc-fm4u.png      # MBC FM4U
  ├── sbs-lovefm.png    # SBS 러브FM
  ├── sbs-powerfm.png   # SBS 파워FM
  └── ...
```

## 📐 이미지 규격

- **권장 크기**: 300x300px (정사각형)
- **최소 크기**: 200x200px
- **포맷**: PNG (투명 배경 권장)
- **파일명**: 소문자, 하이픈(-) 사용

## 💡 사용 방법

1. 이 폴더에 방송국 로고 이미지 저장
2. `data/station-images.ts` 파일에서 이미지 매핑
3. `data/stations.ts` 파일에서 사용

예:
```typescript
// station-images.ts에서 정의
export const STATION_IMAGES = {
  kbs1: require('./kbs1.png'),
  kbs2: require('./kbs2.png'),
};

// stations.ts에서 사용
{
  name: 'KBS 1라디오',
  artwork: STATION_IMAGES.kbs1,
}
```

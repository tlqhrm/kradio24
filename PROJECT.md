# KRadio24 - 라디오 스트리밍 앱

## 📻 프로젝트 개요

라디오 재생 URL을 모아서 플레이리스트로 관리하고 재생하는 모바일 라디오 앱

## 🎯 핵심 목표

- 다양한 라디오 스트리밍 URL 수집 및 관리
- 사용자 정의 플레이리스트 기능
- 크로스 플랫폼 지원 (iOS, Android, Web)
- 직관적인 UI/UX

## 🛠 기술 스택

### Frontend Framework
- **React Native** 0.81.5
- **Expo SDK** 54.0.x
- **Expo Router** 6.0.x (파일 기반 라우팅)

### Styling
- **NativeWind** 4.2.1 (Tailwind CSS for React Native)
- **TailwindCSS** 3.4.18

### State & Animation
- **React Native Reanimated** 4.1.5
- **React Native Safe Area Context** 5.6.2

### Additional Dependencies
- expo-constants
- expo-linking
- react-native-screens
- react-native-worklets

## 📋 현재 진행 상황

### ✅ 완료된 작업

1. **프로젝트 초기 설정**
   - Expo Router 템플릿 설치
   - TypeScript 설정

2. **NativeWind 설정**
   - TailwindCSS 통합 완료
   - Metro config 설정
   - Global CSS 설정

3. **개발 환경 최적화**
   - Expo SDK 54 호환성 확인 (17/17 checks passed)
   - 필수 peer dependencies 설치
   - 버전 불일치 해결

4. **기본 레이아웃 구성**
   - `app/_layout.tsx` - 루트 레이아웃
   - `app/index.tsx` - 홈 화면 (테스트용)

### 🔄 진행 중

- 프로젝트 문서화

### 📝 앞으로 구현할 기능

#### Phase 1: 기본 재생 기능
- [ ] 오디오 스트리밍 라이브러리 통합
  - react-native-track-player 또는 expo-av 검토
- [ ] 기본 재생/일시정지/정지 컨트롤
- [ ] 볼륨 조절
- [ ] 재생 상태 표시

#### Phase 2: 라디오 스테이션 관리
- [ ] 라디오 스테이션 데이터 모델
- [ ] 스테이션 목록 UI
- [ ] 스테이션 추가/수정/삭제 기능
- [ ] 스테이션 검색 기능

#### Phase 3: 플레이리스트
- [ ] 플레이리스트 생성/관리
- [ ] 즐겨찾기 기능
- [ ] 최근 재생 기록
- [ ] 플레이리스트 정렬/필터링

#### Phase 4: UI/UX 개선
- [ ] 재생 컨트롤 하단 미니 플레이어
- [ ] 전체 화면 재생 UI
- [ ] 다크모드 지원
- [ ] 애니메이션 효과

#### Phase 5: 고급 기능
- [ ] 백그라운드 재생
- [ ] 알림/락스크린 컨트롤
- [ ] 슬립 타이머
- [ ] 라디오 메타데이터 표시 (현재 방송 정보)
- [ ] 공유 기능

#### Phase 6: 데이터 관리
- [ ] 로컬 스토리지 (AsyncStorage)
- [ ] 클라우드 동기화 (선택사항)
- [ ] 설정 페이지

## 📂 프로젝트 구조

```
kradio24/
├── app/                    # Expo Router 페이지
│   ├── _layout.tsx        # 루트 레이아웃
│   └── index.tsx          # 홈 화면
├── components/            # 재사용 가능한 컴포넌트
├── hooks/                 # 커스텀 훅
├── services/             # API, 오디오 플레이어 등
├── types/                # TypeScript 타입 정의
├── utils/                # 유틸리티 함수
├── global.css            # 전역 스타일
├── tailwind.config.js    # Tailwind 설정
├── metro.config.js       # Metro bundler 설정
└── app.json              # Expo 설정
```

## 🚀 개발 명령어

```bash
# 개발 서버 시작
npm start

# iOS 실행
npm run ios

# Android 실행
npm run android

# Web 실행
npm run web

# 캐시 삭제 후 시작
npx expo start -c

# 프로젝트 상태 확인
npx expo-doctor
```

## 📝 개발 노트

### 주요 결정사항

1. **Expo Router 선택 이유**
   - 파일 기반 라우팅으로 직관적인 네비게이션
   - React Navigation 내장
   - 웹/모바일 동시 지원

2. **NativeWind 선택 이유**
   - Tailwind CSS 문법 사용 가능
   - 빠른 스타일링
   - 일관된 디자인 시스템

3. **오디오 라이브러리 검토 중**
   - `react-native-track-player`: 백그라운드 재생, 풍부한 기능
   - `expo-av`: Expo 네이티브 통합, 간단한 사용

### 해결한 문제들

1. **NativeWind 설정 오류**
   - Metro config에서 NativeWind 통합
   - babel.config.js는 기본 설정 유지
   - SafeAreaProvider 중복 제거 (expo-router 내장)

2. **버전 호환성**
   - Expo SDK 54에 맞춰 모든 패키지 버전 조정
   - react-native 0.81.5로 업데이트

3. **Boolean props 타입 에러**
   - Stack 컴포넌트 props 단순화
   - TypeScript 설정 최적화

## 🎨 디자인 가이드

### 컬러 팔레트 (예정)
- Primary: 라디오 브랜드 컬러
- Secondary: 액센트 컬러
- Background: 다크/라이트 모드 지원

### 타이포그래피
- TailwindCSS 기본 폰트 스케일 사용
- 필요시 커스텀 폰트 추가

## 📌 참고 자료

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [React Native Track Player](https://react-native-track-player.js.org/)
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)

---

**Last Updated:** 2025-11-20
**Version:** 0.1.0 (Development)
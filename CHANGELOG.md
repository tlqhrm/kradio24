# KRadio24 개발 일지

## 2025-11-20

### ✅ 완료
- **프로젝트 초기 설정**
  - Expo Router 템플릿으로 프로젝트 생성
  - TypeScript 설정

- **NativeWind 통합**
  - TailwindCSS 3.4.18 설치
  - NativeWind 4.2.1 설치
  - `tailwind.config.js` 설정
  - `metro.config.js`에 NativeWind 통합
  - `global.css` 생성
  - `nativewind-env.d.ts` TypeScript 타입 정의

- **개발 환경 최적화**
  - Expo SDK 54 호환성 점검
  - 필수 peer dependencies 설치:
    - expo-constants
    - expo-linking
    - react-native-screens
    - react-native-worklets
  - react-native 0.81.4 → 0.81.5 업데이트
  - expo-doctor 17/17 checks 통과

- **프로젝트 구조 설정**
  - `app/_layout.tsx` 루트 레이아웃 생성
  - `app/index.tsx` 홈 화면 기본 구성
  - `app.json`에 userInterfaceStyle 설정

- **프로젝트 문서화**
  - `PROJECT.md` - 프로젝트 개요, 기술 스택, 로드맵
  - `FEATURES.md` - 상세 기능 명세서
  - `CHANGELOG.md` - 개발 일지 (현재 문서)

- **M3U 파서 구현**
  - `types/radio.ts` - RadioStation, M3UEntry, PlaybackState 타입 정의
  - `utils/m3uParser.ts` - M3U 파일 파싱 유틸리티 함수
    - parseM3U(): M3U 파일 내용을 파싱
    - m3uEntryToStation(): M3UEntry를 RadioStation으로 변환
    - parseM3UToStations(): M3U → RadioStation[] 변환
    - stationsToM3U(): RadioStation[] → M3U 내보내기

- **샘플 라디오 데이터**
  - `data/korean-radio.m3u` - 한국 라디오 방송국 37개 (KBS, MBC, SBS 등)
  - `data/sampleStations.ts` - 샘플 스테이션 데이터 및 헬퍼 함수
    - SAMPLE_STATIONS: 37개 한국 라디오 방송국
    - getStationsByCategory(), getStationsByGenre() 필터 함수
    - getAllCategories(), getAllGenres() 목록 함수

- **TypeScript Path Alias 설정**
  - `tsconfig.json`에 `@/*` path alias 추가
  - `babel-plugin-module-resolver` 설치 및 설정
  - 런타임 import alias 지원 (`@/types/radio`, `@/utils/m3uParser` 등)

- **홈 화면 UI 구현**
  - 37개 한국 라디오 방송국 목록 표시
  - 카테고리 필터 (KBS, MBC, SBS, EBS 등)
  - 스테이션 카드 (이름, 카테고리, 장르 표시)
  - SafeAreaView로 안전 영역 처리

- **NativeWind v4 설정 완료 (공식 문서 기반)**
  - `babel.config.js`에 `jsxImportSource: "nativewind"` 추가
  - `babel.config.js`에 `nativewind/babel` preset 추가
  - `app.json`에 `web.bundler: "metro"` 설정
  - className prop으로 Tailwind CSS 사용 가능

- **개발 가이드 문서 작성**
  - `SETUP-GUIDE.md` - 프로젝트 설정 구조 및 코드 작성 방법
    - 각 설정 파일의 역할과 작동 원리
    - Tailwind CSS 사용법 및 주의사항
    - 파일 구조 규칙 및 개발 워크플로우
  - `SIMULATOR-TIPS.md` - iOS/Android 시뮬레이터 꿀팁
    - Xcode Simulator 필수 단축키
    - Android Emulator 필수 단축키
    - ADB 명령어 모음
    - 생산성 향상 팁

### 🐛 해결한 문제
1. **NativeWind boolean props 타입 에러**
   - 원인: babel 설정 충돌
   - 해결: Metro config로만 NativeWind 처리, babel.config.js는 기본 설정 유지

2. **SafeAreaProvider 중복**
   - 원인: expo-router가 이미 내장
   - 해결: 수동 추가한 SafeAreaProvider 제거

3. **버전 불일치**
   - 원인: react-native 0.81.4, Expo SDK 54는 0.81.5 요구
   - 해결: npx expo install --fix로 자동 업데이트

4. **NativeWind className이 작동하지 않는 문제**
   - 원인: babel.config.js에 `jsxImportSource: "nativewind"` 누락
   - 원인: babel.config.js에 `nativewind/babel` preset 누락
   - 원인: app.json에 `web.bundler: "metro"` 설정 누락
   - 해결: NativeWind 공식 문서 기반으로 완전 재설정
   - 결과: Tailwind CSS className이 모든 플랫폼에서 정상 작동

### 📚 학습 내용
- NativeWind v4는 babel preset과 Metro config를 **동시에** 사용해야 함
  - babel: `jsxImportSource: "nativewind"` + `nativewind/babel` preset
  - metro: `withNativeWind(config, { input: "./global.css" })`
  - app.json: `web.bundler: "metro"` (웹에서도 Metro 사용)
- Expo Router는 react-navigation 기반으로 SafeAreaProvider 내장
- expo-doctor로 프로젝트 상태 점검 가능
- M3U 파일 형식: `#EXTM3U` 헤더 + `#EXTINF:duration,title` + URL 패턴
- TypeScript path alias는 tsconfig.json + babel-plugin-module-resolver 모두 필요
- react-native의 SafeAreaView는 deprecated, react-native-safe-area-context 사용
- NativeWind 설정은 공식 문서를 반드시 참고해야 함 (블로그 글은 버전이 다를 수 있음)

### 🎯 다음 단계
1. 오디오 재생 기능 구현
   - expo-av 또는 react-native-track-player 통합
   - 기본 재생/일시정지/정지 컨트롤
2. 미니 플레이어 컴포넌트
3. 전체 화면 재생 UI
4. 즐겨찾기 기능 (AsyncStorage)

---

## 템플릿 (다음 일지 작성 시 사용)

```markdown
## YYYY-MM-DD

### ✅ 완료
-

### 🚧 진행 중
-

### 🐛 해결한 문제
1. **문제명**
   - 원인:
   - 해결:

### 📚 학습 내용
-

### 🎯 다음 단계
1.

---
```
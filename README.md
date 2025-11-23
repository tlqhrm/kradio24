# 📻 KRadio24

라디오 스트리밍 URL을 모아서 플레이리스트로 관리하고 재생하는 크로스 플랫폼 라디오 앱

## 🎯 프로젝트 목표

- 다양한 라디오 스트리밍 URL 수집 및 관리
- 사용자 정의 플레이리스트 기능
- 크로스 플랫폼 지원 (iOS, Android, Web)
- 직관적이고 아름다운 UI/UX

## 🛠 기술 스택

- **Framework**: React Native + Expo SDK 54
- **Routing**: Expo Router 6.0 (파일 기반)
- **Styling**: NativeWind 4.2 (Tailwind CSS)
- **Language**: TypeScript

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn
- Expo Go 앱 (모바일 테스트용)

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# iOS에서 실행
npm run ios

# Android에서 실행
npm run android

# 웹에서 실행
npm run web
```

### 유용한 명령어

```bash
# 캐시 삭제 후 시작
npx expo start -c

# 프로젝트 상태 확인
npx expo-doctor

# TypeScript 타입 체크
npx tsc --noEmit
```

## 📂 프로젝트 구조

```
kradio24/
├── app/                    # Expo Router 페이지
│   ├── _layout.tsx        # 루트 레이아웃
│   └── index.tsx          # 홈 화면
├── components/            # 재사용 가능한 컴포넌트
├── global.css            # 전역 스타일 (Tailwind)
├── tailwind.config.js    # Tailwind 설정
├── metro.config.js       # Metro bundler 설정
└── app.json              # Expo 설정
```

## 📋 개발 상황

현재 **Phase 1: 프로젝트 설정** 단계입니다.

- ✅ Expo + Expo Router 설정
- ✅ NativeWind (Tailwind CSS) 통합
- ✅ TypeScript 설정
- ✅ 개발 환경 최적화
- 🚧 오디오 재생 기능 (예정)
- 🚧 스테이션 관리 (예정)

자세한 내용은 다음 문서를 참고하세요:
- [PROJECT.md](./PROJECT.md) - 전체 개요 및 로드맵
- [FEATURES.md](./FEATURES.md) - 상세 기능 명세
- [CHANGELOG.md](./CHANGELOG.md) - 개발 일지

## 🎨 스타일링

이 프로젝트는 NativeWind를 사용하여 Tailwind CSS 문법으로 스타일링합니다.

```tsx
// 예시
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-2xl font-bold text-blue-600">
    Hello Radio!
  </Text>
</View>
```

## 📝 라이선스

개인 프로젝트 (Private)

---

**Version:** 0.1.0 (Development)
**Last Updated:** 2025-11-20

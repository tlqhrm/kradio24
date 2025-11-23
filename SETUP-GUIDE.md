# KRadio24 설정 가이드

## 🎯 프로젝트 구조 핵심

### 기술 스택
- **Expo SDK 54** + **Expo Router 6.0** (파일 기반 라우팅)
- **React Native 0.81.5**
- **NativeWind 4.2.1** (Tailwind CSS for React Native)
- **TypeScript**

---

## 📁 핵심 설정 파일들

### 1. `tailwind.config.js` - Tailwind 설정
```javascript
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",      // app 폴더의 모든 파일
    "./components/**/*.{js,jsx,ts,tsx}" // components 폴더
  ],
  presets: [require("nativewind/preset")], // ← 필수!
  theme: { extend: {} },
  plugins: [],
};
```

**역할**: Tailwind가 어떤 파일에서 className을 찾을지 지정

---

### 2. `metro.config.js` - Metro Bundler 설정
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",  // CSS 파일 위치
});
```

**역할**: NativeWind가 Metro bundler를 통해 CSS를 처리하도록 설정

---

### 3. `babel.config.js` - Babel 설정
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }], // ← 핵심!
      "nativewind/babel",  // ← 핵심!
    ],
    plugins: [
      ["module-resolver", { alias: { "@": "./" } }],
      "react-native-reanimated/plugin",
    ],
  };
};
```

**역할**:
- `jsxImportSource: "nativewind"` → JSX를 NativeWind와 함께 사용
- `nativewind/babel` → className을 React Native 스타일로 변환

---

### 4. `app.json` - Expo 설정
```json
{
  "expo": {
    "plugins": ["expo-router"],
    "userInterfaceStyle": "automatic",
    "web": {
      "bundler": "metro"  // ← 웹에서도 Metro 사용 (중요!)
    }
  }
}
```

**역할**: 웹 플랫폼에서도 Metro bundler 사용 (NativeWind 작동에 필수)

---

### 5. `global.css` - Tailwind Directives
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**역할**: Tailwind CSS의 모든 스타일 정의

---

### 6. `app/_layout.tsx` - 루트 레이아웃
```tsx
import "../global.css";  // ← 맨 위에서 CSS import (필수!)
import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
```

**역할**: 앱 전체에 CSS 적용

---

## ✍️ 코드 작성 방법

### ✅ Tailwind CSS 사용법

#### 기본 스타일링
```tsx
import { View, Text } from "react-native";

export default function MyPage() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-500">
      <Text className="text-2xl font-bold text-white">
        Hello World
      </Text>
    </View>
  );
}
```

#### 조건부 스타일
```tsx
<View className={`p-4 ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}>
  <Text className="text-white">Active State</Text>
</View>
```

#### 템플릿 리터럴 사용
```tsx
const buttonClass = `
  px-6 py-3 rounded-lg
  ${disabled ? 'bg-gray-400' : 'bg-blue-600'}
  ${disabled ? 'text-gray-600' : 'text-white'}
`;

<TouchableOpacity className={buttonClass}>
  <Text>Button</Text>
</TouchableOpacity>
```

---

### 🚫 주의사항

#### ❌ 하지 말아야 할 것
```tsx
// ❌ StyleSheet와 className 혼용 금지
<View style={styles.container} className="flex-1">  // 안 됨!

// ❌ inline style과 className 혼용
<View style={{ flex: 1 }} className="bg-blue-500">  // 피할 것
```

#### ✅ 올바른 방법
```tsx
// ✅ className만 사용
<View className="flex-1 bg-blue-500">

// ✅ 또는 StyleSheet만 사용
<View style={styles.container}>
```

---

### 📂 파일 구조 규칙

#### Expo Router 라우팅
```
app/
├── _layout.tsx        # 루트 레이아웃
├── index.tsx          # 홈 화면 (/)
├── stations.tsx       # /stations
├── player.tsx         # /player
└── settings/
    ├── _layout.tsx    # 중첩 레이아웃
    └── index.tsx      # /settings
```

#### 컴포넌트 구조
```
components/
├── StationCard.tsx
├── MiniPlayer.tsx
└── PlayerControls.tsx
```

---

## 🔧 개발 워크플로우

### 1. 개발 서버 시작
```bash
npm start           # Expo 개발 서버 시작
npm run ios         # iOS 시뮬레이터
npm run android     # Android 에뮬레이터
npm run web         # 웹 브라우저
```

### 2. 캐시 문제 해결
```bash
# 스타일이 안 보이거나 변경사항이 반영 안 될 때
npx expo start -c   # 캐시 삭제 후 시작

# 완전 초기화
rm -rf .expo node_modules/.cache
npx expo start -c
```

### 3. 타입 체크
```bash
npx tsc --noEmit    # TypeScript 타입 에러 확인
```

---

## 🎨 Tailwind 주요 클래스 치트시트

### 레이아웃
```
flex-1           # flex: 1
flex-row         # flexDirection: 'row'
items-center     # alignItems: 'center'
justify-center   # justifyContent: 'center'
absolute         # position: 'absolute'
```

### 간격
```
p-4              # padding: 16
px-4             # paddingHorizontal: 16
py-4             # paddingVertical: 16
m-4              # margin: 16
mt-4             # marginTop: 16
gap-4            # gap: 16
```

### 색상
```
bg-blue-500      # backgroundColor
text-white       # color
border-gray-200  # borderColor
```

### 텍스트
```
text-xl          # fontSize: 20
font-bold        # fontWeight: 'bold'
text-center      # textAlign: 'center'
```

### Border & Radius
```
rounded-lg       # borderRadius: 8
rounded-full     # borderRadius: 9999
border           # borderWidth: 1
border-2         # borderWidth: 2
```

---

## 📱 Path Alias 사용

### Import 예시
```tsx
// ✅ @ alias 사용 (권장)
import { RadioStation } from "@/types/radio";
import { parseM3U } from "@/utils/m3uParser";
import { SAMPLE_STATIONS } from "@/data/sampleStations";

// ❌ 상대 경로 (가독성 떨어짐)
import { RadioStation } from "../../types/radio";
```

---

## 🔄 상태 관리

### useState 사용
```tsx
import { useState } from "react";

export default function MyComponent() {
  const [count, setCount] = useState(0);

  return (
    <TouchableOpacity onPress={() => setCount(count + 1)}>
      <Text>{count}</Text>
    </TouchableOpacity>
  );
}
```

---

## 🐛 문제 해결

### 스타일이 적용 안 될 때
1. `npx expo start -c` 실행
2. `global.css`가 `app/_layout.tsx`에서 import 되는지 확인
3. `babel.config.js`에 `jsxImportSource: "nativewind"` 있는지 확인
4. `app.json`에 `"web": { "bundler": "metro" }` 있는지 확인

### TypeScript 에러
1. `nativewind-env.d.ts` 파일 존재 확인
2. `tsconfig.json`에 파일 포함 확인

### Import 에러
1. 캐시 삭제: `rm -rf .expo node_modules/.cache`
2. 서버 재시작: `npx expo start -c`

---

## 📌 핵심 요약

### 설정이 작동하는 원리
1. **global.css** → Tailwind directives 포함
2. **metro.config.js** → NativeWind가 CSS 처리
3. **babel.config.js** → className을 React Native 스타일로 변환
4. **app/_layout.tsx** → CSS를 앱에 주입
5. **결과** → `className`으로 스타일링 가능!

### 변경 시 영향도
- `tailwind.config.js` 수정 → 서버 재시작 필요
- `babel.config.js` 수정 → 캐시 삭제 + 재시작 필수
- `metro.config.js` 수정 → 캐시 삭제 + 재시작 필수
- `global.css` 수정 → 자동 반영 (hot reload)
- 컴포넌트 코드 수정 → 자동 반영 (fast refresh)
# iOS 시뮬레이터 & Android 에뮬레이터 꿀팁

## 📱 iOS Simulator (Xcode)

### 필수 단축키

#### 시뮬레이터 제어
| 단축키 | 기능 |
|--------|------|
| `⌘ + R` | 앱 새로고침 (Reload) |
| `⌘ + Ctrl + Z` | Shake Gesture (개발자 메뉴 열기) |
| `⌘ + K` | 키보드 토글 |
| `⌘ + Shift + H` | 홈 버튼 |
| `⌘ + Shift + H` (두 번) | 앱 스위처 |
| `⌘ + L` | Lock Screen |

#### 회전 & 크기
| 단축키 | 기능 |
|--------|------|
| `⌘ + ←` | 왼쪽으로 회전 |
| `⌘ + →` | 오른쪽으로 회전 |
| `⌘ + 1` | 100% 크기 |
| `⌘ + 2` | 75% 크기 |
| `⌘ + 3` | 50% 크기 |
| `⌘ + 4` | 33% 크기 |
| `⌘ + 5` | 25% 크기 |

#### 디버깅
| 단축키 | 기능 |
|--------|------|
| `⌘ + D` | React Native 개발자 메뉴 |
| `⌘ + M` | React Native 개발자 메뉴 (Android와 동일) |
| `⌘ + Ctrl + Z` | Shake - 개발자 메뉴 |
| `⌘ + I` | Inspector 토글 |

#### 스크린샷 & 녹화
| 단축키 | 기능 |
|--------|------|
| `⌘ + S` | 스크린샷 저장 (Desktop에 저장됨) |
| `⌘ + R` | 화면 녹화 시작/중지 |

---

### 🔥 iOS 시뮬레이터 꿀팁

#### 1. 빠른 시뮬레이터 선택
```bash
# 사용 가능한 시뮬레이터 목록
xcrun simctl list devices

# 특정 시뮬레이터로 실행
npx expo run:ios --device "iPhone 15 Pro"
```

#### 2. 시뮬레이터 리셋 (완전 초기화)
```bash
# 특정 앱 데이터만 삭제
xcrun simctl uninstall booted com.your.bundleid

# 시뮬레이터 완전 리셋
Device → Erase All Content and Settings...
```

#### 3. 여러 시뮬레이터 동시 실행
```bash
# 다른 기기로 추가 실행
open -a Simulator
# Hardware → Device → iOS 17.0 → iPhone 14
```

#### 4. 다크모드 빠른 전환
- **Settings → Developer → Dark Appearance** 토글
- 또는 `⌘ + Shift + A` (일부 Xcode 버전)

#### 5. 시뮬레이터 속도 향상
```bash
# 애니메이션 속도 조절
Debug → Slow Animations (⌘ + T)
```

#### 6. 로그 보기
```bash
# 시뮬레이터 로그 실시간 확인
xcrun simctl spawn booted log stream --predicate 'processImagePath endswith "Expo"'
```

#### 7. 파일 시스템 접근
```bash
# 앱 데이터 디렉토리 열기
# Simulator → 실행 중인 앱 우클릭 → Show in Finder
```

#### 8. 클립보드 공유
- Mac의 클립보드가 시뮬레이터와 자동 동기화됨
- `⌘ + C` / `⌘ + V` 그대로 사용 가능

#### 9. 위치 시뮬레이션
- **Features → Location → Custom Location...**
- 또는 미리 정의된 위치 선택 (Apple, London, Tokyo 등)

#### 10. Deep Link 테스트
```bash
# URL Scheme 테스트
xcrun simctl openurl booted "exp://192.168.1.100:8081"
```

---

## 🤖 Android Emulator (Android Studio)

### 필수 단축키

#### 에뮬레이터 제어
| 단축키 | 기능 |
|--------|------|
| `Ctrl + M` (Mac: `⌘ + M`) | React Native 개발자 메뉴 |
| `R + R` | 앱 새로고침 (빠르게 R 두 번) |
| `Ctrl + Shift + R` | 완전 새로고침 |
| `Power 버튼` | 화면 잠금 |
| `Volume Up/Down` | 볼륨 조절 |

#### 회전 & 네비게이션
| 단축키 | 기능 |
|--------|------|
| `Ctrl + ←/→` | 화면 회전 |
| `Esc` | 뒤로 가기 |
| `Home` | 홈 버튼 |
| `Alt + Enter` | 전체화면 토글 |
| `Ctrl + K` | 가상 키보드 표시 |

#### 스크린샷 & 녹화
| 단축키 | 기능 |
|--------|------|
| `Ctrl + S` | 스크린샷 |
| 화면 녹화 버튼 | 에뮬레이터 툴바에서 선택 |

---

### 🔥 Android 에뮬레이터 꿀팁

#### 1. 빠른 에뮬레이터 시작
```bash
# 사용 가능한 AVD 목록
emulator -list-avds

# 특정 AVD로 실행
emulator -avd Pixel_5_API_33

# 백그라운드로 실행
emulator -avd Pixel_5_API_33 -no-audio &
```

#### 2. 에뮬레이터 성능 최적화
```bash
# Cold boot 대신 Quick boot 사용 (기본값)
# AVD Manager → 해당 AVD → Edit → Boot option → Quick Boot

# GPU 가속 활성화
Tools → AVD Manager → Edit → Emulated Performance → Graphics: Hardware
```

#### 3. 하드웨어 가속 (중요!)
```bash
# Mac에서 HAXM 설치 (Intel Mac)
# Android Studio → SDK Manager → SDK Tools → Intel x86 Emulator Accelerator

# Apple Silicon Mac
# 기본적으로 ARM 이미지 사용 (훨씬 빠름)
```

#### 4. ADB 명령어 (필수)
```bash
# 연결된 디바이스 확인
adb devices

# 앱 재시작
adb shell am force-stop com.kradio24
adb shell am start com.kradio24/.MainActivity

# 로그 실시간 보기
adb logcat | grep "ReactNative"

# 앱 데이터 삭제
adb shell pm clear com.kradio24

# APK 설치
adb install app-release.apk

# 파일 복사
adb push local-file.txt /sdcard/
adb pull /sdcard/remote-file.txt ./
```

#### 5. React Native 개발자 메뉴
```bash
# 개발자 메뉴 열기
adb shell input keyevent 82

# 자동 새로고침 활성화
개발자 메뉴 → Enable Fast Refresh
```

#### 6. 네트워크 속도 조절
```bash
# 에뮬레이터에서
Settings → Network → Data saver
# 또는
Extended controls (... 버튼) → Cellular → Network type 변경
```

#### 7. 위치 시뮬레이션
```bash
# Extended controls (... 버튼) → Location
# 또는 ADB로 직접 설정
adb shell "setprop debug.location.gps 37.7749,-122.4194"
```

#### 8. 클립보드 공유
- Android 10+ (API 29+)에서 자동 동기화
- **Extended controls → Settings → Send keyboard input to device** 활성화

#### 9. 다크모드 빠른 전환
```bash
# 다크모드 켜기
adb shell "cmd uimode night yes"

# 다크모드 끄기
adb shell "cmd uimode night no"
```

#### 10. 에뮬레이터 스냅샷
```bash
# AVD Manager에서 스냅샷 저장/복원 가능
# 특정 상태를 저장해두고 빠르게 복원
```

#### 11. 멀티터치 시뮬레이션
```bash
# Extended controls → Virtual sensors → Additional sensors
# 또는 Ctrl + 마우스 드래그
```

#### 12. 화면 녹화 (ADB)
```bash
# 녹화 시작 (최대 3분)
adb shell screenrecord /sdcard/demo.mp4

# Ctrl+C로 중지 후 파일 가져오기
adb pull /sdcard/demo.mp4 ./
```

---

## 🚀 Expo 특화 팁

### React Native 개발자 메뉴 옵션

#### iOS Simulator
1. **⌘ + D** 또는 **⌘ + Ctrl + Z** → 개발자 메뉴
2. **Reload** - 앱 새로고침
3. **Debug Remote JS** - 크롬에서 디버깅
4. **Enable Fast Refresh** - 자동 새로고침 (필수!)
5. **Show Inspector** - 엘리먼트 검사

#### Android Emulator
1. **⌘ + M** (Mac) 또는 **Ctrl + M** (Windows/Linux)
2. 또는 **RR** (빠르게 R 두 번)
3. 동일한 개발자 메뉴 옵션

---

### Metro Bundler 단축키 (터미널)

실행 중인 Metro bundler 터미널에서:

```
r - 앱 새로고침 (reload)
d - 개발자 메뉴 열기
i - iOS 시뮬레이터 실행
a - Android 에뮬레이터 실행
w - 웹 브라우저 열기
j - Hermes debugger 열기
c - 로그 지우기
```

---

## 🎯 생산성 최고 조합

### iOS 개발 워크플로우
```bash
1. npx expo start
2. 터미널에서 'i' → iOS 시뮬레이터 자동 실행
3. ⌘ + D → Fast Refresh 활성화
4. ⌘ + 3 → 시뮬레이터 50% 크기로 조절
5. 코드 수정 → 자동 반영!
```

### Android 개발 워크플로우
```bash
1. npx expo start
2. 터미널에서 'a' → Android 에뮬레이터 자동 실행
3. ⌘ + M → Fast Refresh 활성화
4. 코드 수정 → 자동 반영!
```

### 동시 테스트
```bash
1. npx expo start
2. 터미널에서 'i' → iOS
3. 터미널에서 'a' → Android
4. 터미널에서 'w' → Web
5. 3개 플랫폼 동시 테스트!
```

---

## 🐛 문제 해결 팁

### iOS 시뮬레이터가 느릴 때
```bash
# 1. 시뮬레이터 재시작
Device → Restart

# 2. Mac 재부팅
# 3. Xcode에서 Derived Data 삭제
Xcode → Preferences → Locations → Derived Data → 화살표 → 삭제
```

### Android 에뮬레이터가 느릴 때
```bash
# 1. AVD에 더 많은 RAM/CPU 할당
AVD Manager → Edit → Advanced Settings
- RAM: 4096MB
- CPU cores: 4

# 2. Cold Boot 한 번 실행
AVD Manager → Cold Boot Now

# 3. wipe data
AVD Manager → Wipe Data
```

### 앱이 설치되지 않을 때
```bash
# iOS
xcrun simctl uninstall booted host.exp.exponent

# Android
adb shell pm clear host.exp.exponent
adb shell pm uninstall host.exp.exponent
```

---

## 💡 마지막 꿀팁

1. **Fast Refresh는 항상 켜두기** - 코드 저장 시 자동 반영
2. **Console 활용** - `console.log()`는 Metro bundler 터미널에 출력
3. **Element Inspector** - UI 디버깅 시 엘리먼트 클릭해서 스타일 확인
4. **Network Inspect** - React Native Debugger 사용 권장
5. **Hot Reload vs Live Reload** - Fast Refresh가 가장 빠름!

---

## 📚 참고 자료

- [Xcode Simulator 공식 문서](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device)
- [Android Emulator 공식 문서](https://developer.android.com/studio/run/emulator)
- [Expo 디버깅 가이드](https://docs.expo.dev/debugging/tools/)
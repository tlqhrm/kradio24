import { getLocales } from "expo-localization";

// 시스템 언어 가져오기
const deviceLocale = getLocales()[0]?.languageCode || "en";

// 언어별 앱 이름
export const APP_NAME = deviceLocale === "ko" ? "한국라디오24" : "KRadio24";

// 다른 다국어 문자열도 여기에 추가 가능
export const i18n = {
  appName: APP_NAME,
  // 필요시 추가
};
import "../global.css";
import {router, Stack, useRouter, useSegments} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AudioProvider } from "@/contexts/AudioContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { StationOrderProvider } from "@/contexts/StationOrderContext";
import {useEffect} from "react";
import {AppState, Linking, BackHandler, Platform, ToastAndroid} from "react-native";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let lastPress = 0;
    const backAction = () => {
      try {
        // If navigation can go back (modal open or inner stack), let router handle it
        if (router && typeof router.canGoBack === 'function' && router.canGoBack()) {
          router.back();
          return true;
        }
      } catch (e) {
        // ignore and fallthrough
      }

      const now = Date.now();
      // If pressed twice within 2000ms, exit app
      if (now - lastPress <= 2000) {
        BackHandler.exitApp();
        return true;
      }

      // Otherwise send app to background (home) and show toast
      try {
        Linking.openURL('intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.HOME;end');
        ToastAndroid.show('앱을 종료하려면 뒤로가기를 한 번 더 누르세요', ToastAndroid.SHORT);
      } catch (e) {
        BackHandler.exitApp();
      }

      lastPress = now;
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StationOrderProvider>
        <FavoritesProvider>
          <AudioProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="player"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                }}
              />
            </Stack>

          </AudioProvider>
        </FavoritesProvider>
      </StationOrderProvider>
    </GestureHandlerRootView>
  );
}

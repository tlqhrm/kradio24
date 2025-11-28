import "../global.css";
import {router, Stack, useRouter, useSegments} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AudioProvider } from "@/contexts/AudioContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { StationOrderProvider } from "@/contexts/StationOrderContext";
import {useEffect} from "react";
import {AppState, Linking} from "react-native";

export default function RootLayout() {
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

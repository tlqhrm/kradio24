import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AudioProvider } from "@/contexts/AudioContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

export default function RootLayout() {
  return (
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
  );
}
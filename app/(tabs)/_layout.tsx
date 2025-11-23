import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MiniPlayer from "@/components/MiniPlayer";
import { useAudio } from "@/contexts/AudioContext";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // 웹에서는 최소 높이 보장
  const bottomInset = Math.max(insets.bottom, 0);
  const tabBarHeight = 60 + bottomInset;

  return (
    <View className="flex-1 bg-black">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#00D9A5",
          tabBarInactiveTintColor: "#8E8E93",
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#1C1C1E",
            borderTopWidth: 1,
            borderTopColor: "#2C2C2E",
            borderBottomWidth: 1,
            borderBottomColor: "#2C2C2E",
            paddingTop: 8,
            paddingBottom: bottomInset + 8,
            height: tabBarHeight,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "홈",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "radio" : "radio-outline"} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "즐겨찾기",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "heart" : "heart-outline"} size={24} color={color} />
            ),
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}
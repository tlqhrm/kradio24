import { useState, useCallback } from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MiniPlayer from "@/components/MiniPlayer";
import AdBanner from "@/components/AdBanner";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [adBannerHeight, setAdBannerHeight] = useState(50);

  // 웹에서는 최소 높이 보장
  const bottomInset = Math.max(insets.bottom, 0);
  const tabBarHeight = 60 + bottomInset;

  const handleAdHeightChange = useCallback((height: number) => {
    setAdBannerHeight(height);
  }, []);

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
            // borderTopWidth: 1,
            // borderTopColor: "#3A3A3C",
            paddingTop: 4,
            paddingBottom: bottomInset > 0 ? bottomInset : 8,
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

      {/* 광고 배너 - 탭바 바로 위에 고정 */}
      <View
        style={{
          position: 'absolute',
          bottom: tabBarHeight,
          left: 0,
          right: 0,
        }}
      >
        <AdBanner onHeightChange={handleAdHeightChange} />
      </View>

      {/* 미니플레이어 - 광고 배너 위에 떠있음 */}
      <MiniPlayer adBannerHeight={adBannerHeight} />
    </View>
  );
}

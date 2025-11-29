import { View, Text, TouchableOpacity, Animated, ActivityIndicator, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {useRouter, useSegments} from "expo-router";
import { useAudio } from "@/contexts/AudioContext";
import { PlaybackState } from "@/types/radio";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentStation, playbackState, pause, resume, stop, isPlaying} = useAudio();
  const slideAnim = useRef(new Animated.Value(200)).current;

  // 재생 중일 때 미니플레이어 올라오기
  useEffect(() => {
    if (currentStation && playbackState !== PlaybackState.IDLE) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStation, playbackState]);

  if (!currentStation || playbackState === PlaybackState.IDLE) {
    return null;
  }

  const tabBarHeight = 60 + insets.bottom;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        bottom: tabBarHeight,
      }}
      className="absolute left-0 right-0 bg-zinc-800 border-t border-zinc-700"
    >
      <View className="flex-row items-center px-4 py-3">
        {/* 앨범 커버 + 방송국 정보 (클릭 시 전체 화면) */}
        <TouchableOpacity
          onPress={() => {router.push("/player")}}
          className="flex-1 flex-row items-center"
          activeOpacity={0.7}
        >
          {/* 앨범 커버 */}
          <View className="w-12 h-12 bg-zinc-700 rounded items-center justify-center mr-3 overflow-hidden">
            {currentStation.artwork ? (
              <Image
                source={typeof currentStation.artwork === 'number' ? currentStation.artwork : { uri: currentStation.artwork }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="radio" size={24} color="white" />
            )}
          </View>

          {/* 방송국 정보 */}
          <View className="flex-1">
            <Text className="text-white font-semibold" numberOfLines={1}>
              {currentStation.name}
            </Text>
            <Text className="text-zinc-300 text-xs" numberOfLines={1}>
              {playbackState === PlaybackState.LOADING
                ? "로딩 중..."
                : playbackState === PlaybackState.PLAYING
                ? "재생 중"
                : "일시정지"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 컨트롤 버튼 */}
        <View className="flex-row items-center gap-3">
          {/* 재생/일시정지 버튼 */}
          <TouchableOpacity
            onPress={isPlaying ? pause : resume}
            disabled={playbackState === PlaybackState.LOADING}
            className="w-10 h-10 items-center justify-center"
          >
            {playbackState === PlaybackState.LOADING ? (
              <ActivityIndicator size="small" color="white" />
            ) : isPlaying ? (
              <Ionicons name="pause" size={24} color="white" />
            ) : (
              <Ionicons name="play" size={24} color="white" />
            )}
          </TouchableOpacity>

          {/* 정지 버튼 */}
          <TouchableOpacity
            onPress={stop}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="stop" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

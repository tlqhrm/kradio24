import { View, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAudio } from "@/contexts/AudioContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { PlaybackState } from "@/types/radio";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function PlayerScreen() {
  const router = useRouter();
  const { currentStation, playbackState, pause, resume, stop, isPlaying, playNext, playPrevious, hasNext, hasPrevious } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();
  const hasNavigatedBack = useRef(false);

  // currentStation이 없으면 뒤로 가기 (한 번만)
  useEffect(() => {
    if (!currentStation && !hasNavigatedBack.current && router.canGoBack()) {
      hasNavigatedBack.current = true;
      // 약간의 지연을 두고 네비게이션 실행
      setTimeout(() => {
        router.back();
      }, 100);
    }
  }, [currentStation, router]);

  if (!currentStation) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* 헤더 - 닫기 버튼 & 즐겨찾기 */}
      <View className="px-5 py-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-zinc-400 text-sm font-semibold">지금 재생 중</Text>
        <TouchableOpacity onPress={() => toggleFavorite(currentStation)} className="p-2">
          <Ionicons
            name={isFavorite(currentStation.id) ? "heart" : "heart-outline"}
            size={28}
            color="#ef4444"
          />
        </TouchableOpacity>
      </View>

      {/* 앨범 커버 */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-72 h-72 bg-zinc-800 rounded-3xl items-center justify-center shadow-2xl overflow-hidden">
          {currentStation.artwork ? (
            <Image
              source={typeof currentStation.artwork === 'number' ? currentStation.artwork : { uri: currentStation.artwork }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="radio" size={120} color="white" />
          )}
        </View>

        {/* 방송국 정보 */}
        <View className="mt-12 w-full">
          <Text className="text-white text-3xl font-bold text-center mb-2">
            {currentStation.name}
          </Text>
          <Text className="text-zinc-400 text-lg text-center">
            {currentStation.category}
            {currentStation.genre && ` • ${currentStation.genre}`}
          </Text>

          {/* 재생 상태 */}
          <View className="mt-6 items-center">
            <View className={`px-4 py-2 rounded-full ${playbackState === PlaybackState.ERROR ? 'bg-red-600' : 'bg-zinc-800'} flex-row items-center gap-2`}>
              {playbackState === PlaybackState.PLAYING && (
                <Ionicons name="ellipse" size={10} color="#ef4444" />
              )}
              {playbackState === PlaybackState.ERROR && (
                <Ionicons name="close-circle" size={16} color="white" />
              )}
              <Text className={`text-sm font-semibold ${playbackState === PlaybackState.ERROR ? 'text-white' : 'text-emerald-400'}`}>
                {playbackState === PlaybackState.LOADING
                  ? "로딩 중..."
                  : playbackState === PlaybackState.PLAYING
                  ? "LIVE"
                  : playbackState === PlaybackState.ERROR
                  ? "방송 불가 (송출 중단)"
                  : "일시정지"}
              </Text>
            </View>
            {playbackState === PlaybackState.ERROR && (
              <Text className="text-zinc-400 text-xs text-center mt-3 px-6">
                이 방송국은 현재 송출 중이 아닙니다.{"\n"}
                {hasNext ? "다음 방송국으로 자동 이동합니다..." : "다른 방송국을 선택해주세요."}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* 컨트롤 */}
      <View className="px-8 pb-12">
        {/* 재생 컨트롤 버튼 */}
        <View className="flex-row items-center justify-center gap-4">
          {/* 이전 곡 */}
          <TouchableOpacity
            onPress={playPrevious}
            disabled={!hasPrevious}
            className="w-14 h-14 items-center justify-center"
          >
            <Ionicons
              name="play-skip-back"
              size={36}
              color={hasPrevious ? "white" : "#52525b"}
            />
          </TouchableOpacity>

          {/* 재생/일시정지 */}
          <TouchableOpacity
            onPress={isPlaying ? pause : resume}
            disabled={playbackState === PlaybackState.LOADING}
            className="w-20 h-20 bg-emerald-500 rounded-full items-center justify-center shadow-lg"
          >
            {playbackState === PlaybackState.LOADING ? (
              <ActivityIndicator size="large" color="white" />
            ) : isPlaying ? (
              <Ionicons name="pause" size={40} color="white" />
            ) : (
              <Ionicons name="play" size={40} color="white" />
            )}
          </TouchableOpacity>

          {/* 다음 곡 */}
          <TouchableOpacity
            onPress={playNext}
            disabled={!hasNext}
            className="w-14 h-14 items-center justify-center"
          >
            <Ionicons
              name="play-skip-forward"
              size={36}
              color={hasNext ? "white" : "#52525b"}
            />
          </TouchableOpacity>
        </View>

        {/* 정지 버튼 */}
        <View className="mt-4 items-center">
          <TouchableOpacity
            onPress={stop}
            className="px-6 py-2 bg-zinc-800 rounded-full"
          >
            <Text className="text-white text-sm font-semibold">정지</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
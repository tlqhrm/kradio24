import { View, Text } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAudio } from "@/contexts/AudioContext";
import { useStationOrder } from "@/contexts/StationOrderContext";
import { RadioStation } from "@/types/radio";
import { Ionicons } from "@expo/vector-icons";
import StationContextMenu from "@/components/StationContextMenu";
import DraggableStationList from "@/components/DraggableStationList";
import { APP_NAME } from "@/constants/i18n";

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { currentStation, setPlaylist, togglePlayPause, playbackState } = useAudio();
  const { getOrderedStations, updateStationOrder } = useStationOrder();
  const [data, setData] = useState<RadioStation[]>([]);

  // 즐겨찾기 순서 적용
  useEffect(() => {
    const ordered = getOrderedStations(favorites);
    console.log("즐겨찾기 로드 및 정렬:", ordered.map(s => s.name));
    setData(ordered);
  }, [favorites, getOrderedStations]);

  // 하단 여백 계산 - 탭바와 분리된 느낌
  const tabBarHeight = 60 + insets.bottom;
  const miniPlayerHeight = currentStation ? 64 : 0;


  const handleSetPlaylist = useCallback(() => {
    setPlaylist(data);
  }, [setPlaylist, data]);

  const handleDragEnd = useCallback((newData: RadioStation[]) => {
    setData(newData);
    updateStationOrder(newData);

    if (currentStation) {
      setPlaylist(newData);
    }
  }, [currentStation, setPlaylist, updateStationOrder]);

  if (favorites.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950">
        {/* 헤더 */}
        <View className="px-5 py-4">
          <Text className="text-3xl font-bold text-white">즐겨찾기</Text>
        </View>

        {/* 빈 상태 */}
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="heart-outline" size={72} color="#ef4444" style={{ marginBottom: 16 }} />
          <Text className="text-white text-xl font-semibold mb-2">
            즐겨찾기가 비어있습니다
          </Text>
          <Text className="text-zinc-300 text-center">
            좋아하는 방송국을 추가해보세요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      {/* 헤더 */}
      <View className="px-5 py-4">
        <Text className="text-3xl font-bold text-white">즐겨찾기</Text>
        <Text className="text-zinc-300 text-sm mt-1">
          {favorites.length}개의 방송국
        </Text>
      </View>

      {/* 즐겨찾기 리스트 */}
      <View style={{ flex: 1, marginBottom: tabBarHeight + miniPlayerHeight, backgroundColor: '#09090b' }}>
        <DraggableStationList
          data={data}
          onDragEnd={handleDragEnd}
          bottomPadding={32}
          currentStation={currentStation}
          playbackState={playbackState}
          onSetPlaylist={handleSetPlaylist}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          togglePlayPause={togglePlayPause}
        />
      </View>

    </SafeAreaView>
  );
}

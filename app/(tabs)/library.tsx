import { View, Text } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAudio } from "@/contexts/AudioContext";
import { useStationOrder } from "@/contexts/StationOrderContext";
import { RadioStation } from "@/types/radio";
import { Ionicons } from "@expo/vector-icons";
import StationContextMenu from "@/components/StationContextMenu";
import DraggableStationList from "@/components/DraggableStationList";

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { currentStation, setPlaylist, togglePlayPause, playbackState } = useAudio();
  const { getOrderedStations, updateStationOrder } = useStationOrder();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [data, setData] = useState<RadioStation[]>([]);
  const dataRef = useRef<RadioStation[]>(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  // 즐겨찾기 순서 적용
  useEffect(() => {
    const ordered = getOrderedStations(favorites);
    setData(ordered);
  }, [favorites, getOrderedStations]);

  // 하단 여백 계산
  const tabBarHeight = 60 + insets.bottom;
  const miniPlayerHeight = currentStation ? 64 : 0;
  const bottomPadding = tabBarHeight + miniPlayerHeight + 16;

  const handleLongPress = useCallback((station: RadioStation) => {
    setSelectedStation(station);
    setMenuVisible(true);
  }, []);

  const handlePlay = useCallback(() => {
    if (selectedStation) {
      setPlaylist(data);
      togglePlayPause(selectedStation);
    }
  }, [selectedStation, data, setPlaylist, togglePlayPause]);

  const handleToggleFavorite = useCallback(() => {
    if (selectedStation) {
      toggleFavorite(selectedStation);
    }
  }, [selectedStation, toggleFavorite]);

  const handleSetPlaylist = useCallback(() => {
    setPlaylist(dataRef.current);
  }, [setPlaylist]);

  const handleDragEnd = useCallback((newData: RadioStation[]) => {
    setData(newData);
    dataRef.current = newData;

    // 플레이리스트 업데이트
    if (currentStation) {
      setPlaylist(newData);
    }

    // 순서 저장
    updateStationOrder(newData, true);
  }, [currentStation, setPlaylist, updateStationOrder]);

  if (favorites.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black">
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
          <Text className="text-zinc-400 text-center">
            좋아하는 방송국을 추가해보세요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* 헤더 */}
      <View className="px-5 py-4">
        <Text className="text-3xl font-bold text-white">즐겨찾기</Text>
        <Text className="text-zinc-400 text-sm mt-1">
          {favorites.length}개의 방송국
        </Text>
      </View>

      {/* 즐겨찾기 리스트 */}
      <DraggableStationList
        data={data}
        onDragEnd={handleDragEnd}
        bottomPadding={bottomPadding}
        currentStation={currentStation}
        playbackState={playbackState}
        onSetPlaylist={handleSetPlaylist}
        onLongPress={handleLongPress}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        togglePlayPause={togglePlayPause}
      />

      {/* 컨텍스트 메뉴 */}
      <StationContextMenu
        visible={menuVisible}
        station={selectedStation}
        isFavorite={selectedStation ? isFavorite(selectedStation.id) : false}
        onClose={() => setMenuVisible(false)}
        onPlay={handlePlay}
        onToggleFavorite={handleToggleFavorite}
      />
    </SafeAreaView>
  );
}
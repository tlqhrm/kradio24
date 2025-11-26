import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback } from "react";
import { STATIONS, getAllCategories } from "@/data/stations";
import { RadioStation } from "@/types/radio";
import { useAudio } from "@/contexts/AudioContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useStationOrder } from "@/contexts/StationOrderContext";
import StationContextMenu from "@/components/StationContextMenu";
import DraggableStationList from "@/components/DraggableStationList";

const CATEGORY_TAB_WIDTH = 88; // 고정 너비
const CATEGORY_TAB_HEIGHT = 36; // 고정 높이

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { currentStation, setPlaylist, togglePlayPause, playbackState } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getOrderedStations, updateStationOrder } = useStationOrder();
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [data, setData] = useState<RadioStation[]>([]);
  const dataRef = useRef<RadioStation[]>(data);
  useEffect(() => { dataRef.current = data; }, [data]);
  const categories = ["전체", ...getAllCategories()];

  // 카테고리 필터링 및 순서 적용
  useEffect(() => {
    const filtered = selectedCategory === "전체"
      ? STATIONS
      : STATIONS.filter(station => station.category === selectedCategory);

    const ordered = getOrderedStations(filtered);
    setData(ordered);
  }, [selectedCategory, getOrderedStations]);

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

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* 헤더 */}
      <View className="px-5 py-4">
        <Text className="text-3xl font-bold text-white">KRadio24</Text>
      </View>

      {/* 카테고리 탭 */}
      <View style={{ height: CATEGORY_TAB_HEIGHT }} className="mb-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5"
          contentContainerStyle={{ alignItems: 'center' }}
        >
          <View className="flex-row gap-2">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={{ width: CATEGORY_TAB_WIDTH, height: CATEGORY_TAB_HEIGHT }}
                className={`rounded-lg items-center justify-center ${
                  selectedCategory === category
                    ? "bg-emerald-500"
                    : "bg-zinc-800/50"
                }`}
              >
                <Text
                  className={`font-medium text-sm ${
                    selectedCategory === category
                      ? "text-white"
                      : "text-zinc-400"
                  }`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 방송국 리스트 */}
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

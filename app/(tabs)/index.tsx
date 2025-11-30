import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { STATIONS, getAllCategories } from "@/data/stations";
import { RadioStation } from "@/types/radio";
import { useAudio } from "@/contexts/AudioContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useStationOrder } from "@/contexts/StationOrderContext";
import DraggableStationList from "@/components/DraggableStationList";
import { APP_NAME } from "@/constants/i18n";

const CATEGORY_TAB_WIDTH = 88; // 고정 너비
const CATEGORY_TAB_HEIGHT = 36; // 고정 높이

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { currentStation, setPlaylist, togglePlayPause, playbackState } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getOrderedStations, updateStationOrder, isLoading } = useStationOrder();
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [data, setData] = useState<RadioStation[]>([]);
  const categories = ["전체", ...getAllCategories()];

  // 카테고리 필터링 및 순서 적용
  useEffect(() => {
    // StationOrderContext 로딩 완료 후에만 실행
    if (isLoading) return;

    const filtered = selectedCategory === "전체"
      ? STATIONS
      : STATIONS.filter(station => station.category === selectedCategory);

    const ordered = getOrderedStations(filtered);
    setData(ordered);

    // 플레이리스트도 함께 업데이트
    setPlaylist(ordered);
  }, [selectedCategory, getOrderedStations, setPlaylist, isLoading]);

  // 하단 여백 계산 - 탭바, 미니플레이어, 광고 영역
  const tabBarHeight = 60 + insets.bottom;
  const miniPlayerHeight = currentStation ? 64 : 0;
  const adBannerHeight = 60; // 배너 광고 예상 높이

  const handleDragEnd = useCallback((newData: RadioStation[]) => {
    setData(newData);
    updateStationOrder(newData); // 백그라운드에서 저장 - UI 블로킹 방지
    setPlaylist(newData); // 드래그 순서 변경 시 항상 플레이리스트 업데이트
  }, [setPlaylist, updateStationOrder]);

  return (
    <SafeAreaView className="flex-1 bg-zinc-950 ">
      {/* 헤더 */}
      <View className="px-5 py-4">
        <Text className="text-3xl font-bold text-white">{APP_NAME}</Text>
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
                    : "bg-zinc-700/60"
                }`}
              >
                <Text
                  className={`font-medium text-sm ${
                    selectedCategory === category
                      ? "text-white"
                      : "text-zinc-300"
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
      <View style={{ flex: 1, marginBottom: tabBarHeight + miniPlayerHeight + adBannerHeight }}>
        <DraggableStationList
          data={data}
          onDragEnd={handleDragEnd}
          bottomPadding={32}
          currentStation={currentStation}
          playbackState={playbackState}
          setPlaylist={setPlaylist}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          togglePlayPause={togglePlayPause}
        />
      </View>

    </SafeAreaView>
  );
}

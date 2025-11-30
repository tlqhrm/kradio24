import { View, Text } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAudio } from "@/contexts/AudioContext";
import { useStationOrder } from "@/contexts/StationOrderContext";
import { RadioStation } from "@/types/radio";
import { Ionicons } from "@expo/vector-icons";
import DraggableStationList from "@/components/DraggableStationList";

const EmptyFavorites = () => (
  <View className="flex-1 items-center justify-center px-8">
    <Ionicons name="heart-outline" size={72} color="#ef4444" style={{ marginBottom: 16 }} />
    <Text className="text-white text-xl font-semibold mb-2">
      즐겨찾기가 비어있습니다
    </Text>
    <Text className="text-zinc-300 text-center">
      좋아하는 방송국을 추가해보세요
    </Text>
  </View>
);

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { currentStation, setPlaylist, togglePlayPause, playbackState } = useAudio();
  const { updateStationOrder } = useStationOrder();

  // 하단 여백 계산 - 탭바, 미니플레이어, 광고 영역
  const tabBarHeight = 60 + insets.bottom;
  const miniPlayerHeight = currentStation ? 64 : 0;
  const adBannerHeight = 60;

  const handleDragEnd = useCallback((newData: RadioStation[]) => {
    updateStationOrder(newData);
    setPlaylist(newData);
  }, [setPlaylist, updateStationOrder]);

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="px-5 py-4">
        <Text className="text-3xl font-bold text-white">즐겨찾기</Text>
        {favorites.length > 0 && (
          <Text className="text-zinc-300 text-sm mt-1">
            {favorites.length}개의 방송국
          </Text>
        )}
      </View>

      <View style={{ flex: 1, marginBottom: tabBarHeight + miniPlayerHeight + adBannerHeight, backgroundColor: '#09090b' }}>
        <DraggableStationList
          data={favorites}
          onDragEnd={handleDragEnd}
          bottomPadding={32}
          currentStation={currentStation}
          playbackState={playbackState}
          setPlaylist={setPlaylist}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          togglePlayPause={togglePlayPause}
          showAd={favorites.length > 0}
          ListEmptyComponent={<EmptyFavorites />}
        />
      </View>
    </SafeAreaView>
  );
}

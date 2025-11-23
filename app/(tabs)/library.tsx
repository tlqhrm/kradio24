import { View, Text, FlatList, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAudio } from "@/contexts/AudioContext";
import { RadioStation } from "@/types/radio";
import { PlaybackState } from "@/types/radio";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import StationContextMenu from "@/components/StationContextMenu";

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - (CARD_PADDING * 2) - CARD_GAP) / 2;

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { currentStation, setPlaylist, togglePlayPause } = useAudio();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);

  // 하단 여백 계산
  const tabBarHeight = 60 + insets.bottom;
  const miniPlayerHeight = currentStation ? 64 : 0;
  const bottomPadding = tabBarHeight + miniPlayerHeight + 16;

  const handleLongPress = (station: RadioStation) => {
    setSelectedStation(station);
    setMenuVisible(true);
  };

  const handlePlay = () => {
    if (selectedStation) {
      setPlaylist(favorites);
      togglePlayPause(selectedStation);
    }
  };

  const handleToggleFavorite = () => {
    if (selectedStation) {
      toggleFavorite(selectedStation);
    }
  };

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

      {/* 즐겨찾기 그리드 */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPadding }}
        columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
        renderItem={({ item }) => (
          <StationCard
            station={item}
            playlist={favorites}
            onLongPress={handleLongPress}
          />
        )}
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

// 방송국 카드 컴포넌트
function StationCard({
  station,
  playlist,
  onLongPress,
}: {
  station: RadioStation;
  playlist: RadioStation[];
  onLongPress: (station: RadioStation) => void;
}) {
  const { togglePlayPause, currentStation, playbackState, setPlaylist } = useAudio();
  const isCurrentStation = currentStation?.id === station.id;
  const isLoading = isCurrentStation && playbackState === PlaybackState.LOADING;
  const isPlaying = isCurrentStation && playbackState === PlaybackState.PLAYING;
  const isPaused = isCurrentStation && playbackState === PlaybackState.PAUSED;
  const isError = isCurrentStation && playbackState === PlaybackState.ERROR;

  const handlePress = () => {
    // 플레이리스트 설정 (즐겨찾기)
    console.log("📚 즐겨찾기 플레이리스트 설정:", playlist.map(s => s.name));
    setPlaylist(playlist);
    togglePlayPause(station);
  };

  return (
    <TouchableOpacity
      style={{ width: CARD_WIDTH }}
      className="bg-zinc-900 rounded-lg overflow-hidden"
      onPress={handlePress}
      onLongPress={() => onLongPress(station)}
      activeOpacity={0.7}
    >
      {/* 앨범 커버 영역 */}
      <View className="aspect-square bg-emerald-600 items-center justify-center relative">
        <Ionicons name="radio" size={64} color="white" />

        {/* 재생 오버레이 */}
        {isCurrentStation && (
          <View className={`absolute inset-0 items-center justify-center ${isError ? 'bg-red-500/60' : 'bg-black/40'}`}>
            <View className={`w-16 h-16 rounded-full items-center justify-center ${isError ? 'bg-red-600' : 'bg-emerald-500'}`}>
              {isError ? (
                <Ionicons name="close-circle" size={32} color="white" />
              ) : isLoading ? (
                <ActivityIndicator size="large" color="white" />
              ) : isPlaying ? (
                <Ionicons name="pause" size={32} color="white" />
              ) : (
                <Ionicons name="play" size={32} color="white" />
              )}
            </View>
            {isError && (
              <Text className="text-white text-xs mt-2 font-semibold">송출 중단</Text>
            )}
          </View>
        )}
      </View>

      {/* 정보 영역 */}
      <View className="p-3">
        <Text
          className={`font-semibold text-sm mb-1 ${
            isError ? "text-red-400" : isCurrentStation ? "text-emerald-400" : "text-white"
          }`}
          numberOfLines={1}
        >
          {station.name}
        </Text>
        <Text className="text-zinc-500 text-xs" numberOfLines={1}>
          {isError
            ? "방송 불가"
            : isCurrentStation && isPlaying
            ? "재생 중"
            : isCurrentStation && isPaused
            ? "일시정지"
            : station.category}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
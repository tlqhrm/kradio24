import { View, Text, ScrollView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { STATIONS, getAllCategories } from "@/data/stations";
import { RadioStation } from "@/types/radio";
import { useAudio } from "@/contexts/AudioContext";
import { PlaybackState } from "@/types/radio";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "@/contexts/FavoritesContext";
import StationContextMenu from "@/components/StationContextMenu";

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - (CARD_PADDING * 2) - CARD_GAP) / 2;
const CATEGORY_TAB_WIDTH = 88; // 고정 너비
const CATEGORY_TAB_HEIGHT = 36; // 고정 높이

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { currentStation, setPlaylist, togglePlayPause } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const categories = ["전체", ...getAllCategories()];

  // 카테고리 필터링
  const filteredStations = selectedCategory === "전체"
    ? STATIONS
    : STATIONS.filter(station => station.category === selectedCategory);

  // 하단 여백 계산: 탭 바 + 미니플레이어 + SafeArea + 여유
  const tabBarHeight = 60 + insets.bottom;
  const miniPlayerHeight = currentStation ? 64 : 0;
  const bottomPadding = tabBarHeight + miniPlayerHeight + 16;

  const handleLongPress = (station: RadioStation) => {
    setSelectedStation(station);
    setMenuVisible(true);
  };

  const handlePlay = () => {
    if (selectedStation) {
      setPlaylist(filteredStations);
      togglePlayPause(selectedStation);
    }
  };

  const handleToggleFavorite = () => {
    if (selectedStation) {
      toggleFavorite(selectedStation);
    }
  };

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

      {/* 방송국 그리드 */}
      <FlatList
        data={filteredStations}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPadding }}
        columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
        renderItem={({ item }) => (
          <StationCard
            station={item}
            playlist={filteredStations}
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

  const handlePress = async () => {
    console.log("🎯 StationCard 클릭!");
    console.log("  - 클릭한 방송국:", station.name);
    console.log("  - 현재 재생 중:", currentStation?.name);
    console.log("  - 재생 상태:", playbackState);

    // 플레이리스트 설정
    console.log("🏠 홈 플레이리스트 설정:", playlist.map(s => s.name));
    setPlaylist(playlist);

    console.log("▶️ togglePlayPause 호출 시작");
    await togglePlayPause(station);
    console.log("✅ togglePlayPause 호출 완료");
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
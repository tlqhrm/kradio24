import { View, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback } from "react";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAudio } from "@/contexts/AudioContext";
import { useStationOrder } from "@/contexts/StationOrderContext";
import { RadioStation } from "@/types/radio";
import { PlaybackState } from "@/types/radio";
import { Ionicons } from "@expo/vector-icons";
import StationContextMenu from "@/components/StationContextMenu";

const THUMBNAIL_SIZE = 64; // 썸네일 크기

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { currentStation, setPlaylist, togglePlayPause } = useAudio();
  const { getOrderedStations, updateStationOrder } = useStationOrder();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [data, setData] = useState<RadioStation[]>([]);
  const isDraggingRef = useRef(false);

  // 즐겨찾기 순서 적용
  useEffect(() => {
    if (isDraggingRef.current) return;

    const ordered = getOrderedStations(favorites);
    setData(ordered);
  }, [favorites]); // getOrderedStations 제거 - 저장 시 리렌더링 방지

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

  const handleDragBegin = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleDragEnd = useCallback(({ data: newData }: { data: RadioStation[] }) => {
    // 라이브러리 공식 패턴: 애니메이션 완료 후 호출됨
    setData(newData);

    // 플레이리스트 업데이트
    if (currentStation) {
      setPlaylist(newData);
    }

    // 순서 저장
    updateStationOrder(newData);

    isDraggingRef.current = false;
  }, [currentStation, setPlaylist, updateStationOrder]);

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<RadioStation>) => (
    <ScaleDecorator>
      <StationCard
        station={item}
        playlist={data}
        onLongPress={handleLongPress}
        drag={drag}
        isActive={isActive}
      />
    </ScaleDecorator>
  ), [data, handleLongPress]);

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
      <DraggableFlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPadding }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        onDragBegin={handleDragBegin}
        onDragEnd={handleDragEnd}
        renderItem={renderItem}
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
  drag,
  isActive,
}: {
  station: RadioStation;
  playlist: RadioStation[];
  onLongPress: (station: RadioStation) => void;
  drag?: () => void;
  isActive?: boolean;
}) {
  const { togglePlayPause, currentStation, playbackState, setPlaylist } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isCurrentStation = currentStation?.id === station.id;
  const isLoading = isCurrentStation && playbackState === PlaybackState.LOADING;
  const isPlaying = isCurrentStation && playbackState === PlaybackState.PLAYING;
  const isPaused = isCurrentStation && playbackState === PlaybackState.PAUSED;
  const isError = isCurrentStation && playbackState === PlaybackState.ERROR;
  const favorite = isFavorite(station.id);

  const handlePress = () => {
    // 플레이리스트 설정 (즐겨찾기)
    console.log("📚 즐겨찾기 플레이리스트 설정:", playlist.map(s => s.name));
    setPlaylist(playlist);
    togglePlayPause(station);
  };

  return (
    <View
      className="bg-zinc-900 rounded-lg overflow-hidden flex-row"
      style={{ opacity: isActive ? 0.8 : 1 }}
    >
      {/* 썸네일 */}
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={() => onLongPress(station)}
        activeOpacity={0.7}
        style={{ flexDirection: 'row', flex: 1 }}
      >
        <View
          style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
          className="bg-zinc-800 items-center justify-center relative"
        >
          {station.artwork ? (
            <Image
              source={typeof station.artwork === 'number' ? station.artwork : { uri: station.artwork }}
              style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="radio" size={32} color="white" />
          )}

          {/* 재생 오버레이 */}
          {isCurrentStation && (
            <View className="absolute inset-0 items-center justify-center">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${isError ? 'bg-red-600' : 'bg-emerald-500'}`}>
                {isError ? (
                  <Ionicons name="close-circle" size={20} color="white" />
                ) : isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : isPlaying ? (
                  <Ionicons name="pause" size={20} color="white" />
                ) : (
                  <Ionicons name="play" size={20} color="white" />
                )}
              </View>
            </View>
          )}
        </View>

        {/* 정보 영역 */}
        <View className="flex-1 p-3 justify-center">
          <Text
            className={`font-semibold text-base mb-1 ${
              isError ? "text-red-400" : isCurrentStation ? "text-emerald-400" : "text-white"
            }`}
            numberOfLines={1}
          >
            {station.name}
          </Text>
          <Text className="text-zinc-500 text-sm" numberOfLines={1}>
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

      {/* 즐겨찾기 버튼 */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          toggleFavorite(station);
        }}
        className="w-12 items-center justify-center"
      >
        <Ionicons
          name={favorite ? "heart" : "heart-outline"}
          size={24}
          color="#ef4444"
        />
      </TouchableOpacity>

      {/* 드래그 핸들 */}
      <TouchableOpacity
        onLongPress={drag}
        delayLongPress={0}
        className="w-12 items-center justify-center"
      >
        <Ionicons name="menu" size={24} color="#71717a" />
      </TouchableOpacity>
    </View>
  );
}
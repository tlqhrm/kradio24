import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { STATIONS, getAllCategories } from "@/data/stations";
import { RadioStation } from "@/types/radio";
import { useAudio } from "@/contexts/AudioContext";
import { PlaybackState } from "@/types/radio";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useStationOrder } from "@/contexts/StationOrderContext";
import StationContextMenu from "@/components/StationContextMenu";


const CATEGORY_TAB_WIDTH = 88; // 고정 너비
const CATEGORY_TAB_HEIGHT = 36; // 고정 높이
const THUMBNAIL_SIZE = 64; // 썸네일 크기
const ITEM_HEIGHT = 64 + 8; // 카드 높이 + 간격

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
  const isDraggingRef = useRef(false);
  const categories = ["전체", ...getAllCategories()];

  // 카테고리 필터링 및 순서 적용
  useEffect(() => {
    if (isDraggingRef.current) return;

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

  const handleDragBegin = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleDragEnd = useCallback(({ data: newData }: { data: RadioStation[] }) => {
    // 공식 권장 패턴: 즉시 setData 호출 (애니메이션 완료 후 호출됨)
    setData(newData);
    dataRef.current = newData;
    isDraggingRef.current = false;

    // 플레이리스트 업데이트
    if (currentStation) {
      setPlaylist(newData);
    }

    // 순서 저장
    updateStationOrder(newData, true);
  }, [currentStation, setPlaylist, updateStationOrder]);

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<RadioStation>) => (
    <StationCard
      station={item}
      onSetPlaylist={handleSetPlaylist}
      onLongPress={handleLongPress}
      drag={drag}
      isActive={isActive}
      isCurrentStation={currentStation?.id === item.id}
      playbackState={playbackState}
      favorite={isFavorite(item.id)}
      toggleFavorite={toggleFavorite}
      togglePlayPause={togglePlayPause}
    />
  ), [handleSetPlaylist, handleLongPress, currentStation, playbackState, isFavorite, toggleFavorite, togglePlayPause]);

  const CellRendererComponent = useCallback(({ children, ...props }: any) => (
    <View {...props} shouldRasterizeIOS renderToHardwareTextureAndroid>
      {children}
    </View>
  ), []);

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
      <DraggableFlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPadding }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        onDragBegin={handleDragBegin}
        onDragEnd={handleDragEnd}
        renderItem={renderItem}
        CellRendererComponent={CellRendererComponent}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        windowSize={10}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={30}
        removeClippedSubviews={true}
        initialNumToRender={10}
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
const StationCard = memo(function StationCard({
  station,
  onSetPlaylist,
  onLongPress,
  drag,
  isActive,
  isCurrentStation,
  playbackState,
  favorite,
  toggleFavorite,
  togglePlayPause,
}: {
  station: RadioStation;
  onSetPlaylist?: () => void;
  onLongPress: (station: RadioStation) => void;
  drag?: () => void;
  isActive?: boolean;
  isCurrentStation?: boolean;
  playbackState?: PlaybackState;
  favorite?: boolean;
  toggleFavorite?: (s: RadioStation) => any;
  togglePlayPause?: (s: RadioStation) => Promise<void> | void;
}) {
  const isLoading = isCurrentStation && playbackState === PlaybackState.LOADING;
  const isPlaying = isCurrentStation && playbackState === PlaybackState.PLAYING;
  const isPaused = isCurrentStation && playbackState === PlaybackState.PAUSED;
  const isError = isCurrentStation && playbackState === PlaybackState.ERROR;

  const handlePress = async () => {
    onSetPlaylist && onSetPlaylist();
    await (togglePlayPause ? togglePlayPause(station) : Promise.resolve());
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
})

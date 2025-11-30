import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
} from "react-native";
import { RadioStation, PlaybackState } from "@/types/radio";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useCallback, memo, useRef, useLayoutEffect } from "react";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

interface DraggableStationListProps {
  data: RadioStation[];
  onDragEnd: (newData: RadioStation[]) => void;
  bottomPadding: number;
  currentStation: RadioStation | null;
  playbackState: PlaybackState;
  setPlaylist: (stations: RadioStation[]) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (station: RadioStation) => void;
  togglePlayPause: (station: RadioStation) => void;
}

// 아이템 고정 높이
const ITEM_HEIGHT = 80;

// Row 컴포넌트를 memo로 분리
interface StationRowProps {
  item: RadioStation;
  drag: () => void;
  isActive: boolean;
  isCurrentStation: boolean;
  isCurrentPlaying: boolean;
  isCurrentLoading: boolean;
  favorite: boolean;
  onPressStation: () => void;
  onPressFavorite: () => void;
}

const StationRow = memo<StationRowProps>(
  ({
    item,
    drag,
    isActive,
    isCurrentStation,
    isCurrentPlaying,
    isCurrentLoading,
    favorite,
    onPressStation,
    onPressFavorite,
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.parallel([

        Animated.timing(opacityAnim, {
          toValue: isActive ? 0.85 : 1,
          duration: isActive ? 200 : 150, // 종료 시 더 빠르게
          useNativeDriver: true,
        }),
      ]).start();
    }, [isActive, scaleAnim, opacityAnim]);
    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
      <ScaleDecorator>
        <View className="px-4 pb-1">
          <View
            className={`bg-zinc-800 rounded-xl px-4 py-3 flex-row items-center border ${
              isActive
                ? "bg-zinc-700 border-emerald-400"
                : isCurrentStation
                ? "border-emerald-400/40"
                : "border-zinc-700"
            }`}
            style={{ minHeight: ITEM_HEIGHT - 8 }}
          >
            {/* 앨범 커버 + 재생 상태 오버레이 */}
            <TouchableOpacity onPress={onPressStation} activeOpacity={0.7}>
              <View className="w-14 h-14 bg-zinc-700 rounded items-center justify-center mr-3 overflow-hidden relative">
                {item.artwork ? (
                  <Image
                    source={
                      typeof item.artwork === "number"
                        ? item.artwork
                        : { uri: item.artwork }
                    }
                    style={{ width: 56, height: 56 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="radio" size={28} color="white" />
                )}

                {/* 재생 상태 오버레이 */}
                {(isCurrentLoading || isCurrentPlaying) && (
                  <View className="absolute inset-0 bg-black/40 items-center justify-center">
                    {isCurrentLoading ? (
                      <ActivityIndicator size="small" color="#10b981" />
                    ) : (
                      <Ionicons name="volume-high" size={24} color="#10b981" />
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* 방송국 정보 */}
            <TouchableOpacity
              onPress={onPressStation}
              activeOpacity={0.7}
              className="flex-1"
            >
              <Text
                className={`font-semibold ${
                  isCurrentStation ? "text-emerald-500" : "text-white"
                }`}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text className="text-zinc-300 text-sm" numberOfLines={1}>
                {item.category}
                {item.genre && ` • ${item.genre}`}
              </Text>
            </TouchableOpacity>

            {/* 오른쪽 액션 버튼 */}
            <View className="flex-row items-center gap-3">
              {/* 즐겨찾기 */}
              <TouchableOpacity
                onPress={onPressFavorite}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons
                  name={favorite ? "heart" : "heart-outline"}
                  size={22}
                  color={favorite ? "#ef4444" : "#71717a"}
                />
              </TouchableOpacity>

              {/* 드래그 핸들 */}
              <TouchableOpacity
                onLongPress={drag}
                delayLongPress={100}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="reorder-three" size={24} color="#71717a" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScaleDecorator>
      </Animated.View>
    );
  },
  (prev, next) =>
    prev.item === next.item &&
    prev.isActive === next.isActive &&
    prev.isCurrentStation === next.isCurrentStation &&
    prev.isCurrentPlaying === next.isCurrentPlaying &&
    prev.isCurrentLoading === next.isCurrentLoading &&
    prev.favorite === next.favorite
);

StationRow.displayName = "StationRow";

export default function DraggableStationList({
  data,
  onDragEnd,
  bottomPadding,
  currentStation,
  playbackState,
  isFavorite,
  setPlaylist,
  toggleFavorite,
  togglePlayPause,
}: DraggableStationListProps) {
  // 항상 최신 data를 참조하기 위한 ref
  const dataRef = useRef<RadioStation[]>(data);

  // data가 변경될 때마다 ref 업데이트 (렌더링 전에)
  useLayoutEffect(() => {
    dataRef.current = data;
  }, [data]);

  // keyExtractor
  const keyExtractor = useCallback((item: RadioStation) => item.id, []);

  // ref를 사용하여 항상 최신 data 참조
  const handlePressStation = useCallback((item: RadioStation) => {
    setPlaylist(dataRef.current);  // ref를 통해 최신 data 사용
    togglePlayPause(item);
  }, [setPlaylist, togglePlayPause]);

  const handlePressFavorite = useCallback((item: RadioStation) => {
    toggleFavorite(item);
  }, [toggleFavorite]);

  // renderItem - DraggableFlatList API 사용
  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<RadioStation>) => {
      const isCurrentStation = currentStation?.id === item.id;
      const isCurrentPlaying =
        isCurrentStation && playbackState === PlaybackState.PLAYING;
      const isCurrentLoading =
        isCurrentStation && playbackState === PlaybackState.LOADING;
      const favorite = isFavorite(item.id);

      return (
        <StationRow
          item={item}
          drag={drag}
          isActive={isActive}
          isCurrentStation={isCurrentStation}
          isCurrentPlaying={isCurrentPlaying}
          isCurrentLoading={isCurrentLoading}
          favorite={favorite}
          onPressStation={() => handlePressStation(item)}
          onPressFavorite={() => handlePressFavorite(item)}
        />
      );
    },
    [currentStation, playbackState, isFavorite, handlePressStation, handlePressFavorite]
  );

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback(
    ({ data: newData }: { data: RadioStation[] }) => {
      onDragEnd(newData);
    },
    [onDragEnd]
  );

  return (
    <DraggableFlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onDragEnd={handleDragEnd}
      autoscrollThreshold={0.3}
      autoscrollSpeed={100}
      containerStyle={{ flex: 1 }}
      contentContainerStyle={{
        paddingBottom: bottomPadding,
      }}
      showsVerticalScrollIndicator={true}
    />
  );
}

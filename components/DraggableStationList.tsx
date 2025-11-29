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
import { useEffect, useCallback, memo, useState, useRef } from "react";
import DragList, { DragListRenderItemInfo } from "react-native-draglist";

interface DraggableStationListProps {
  data: RadioStation[];
  onDragEnd: (newData: RadioStation[]) => void;
  bottomPadding: number;
  currentStation: RadioStation | null;
  playbackState: PlaybackState;
  onSetPlaylist: () => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (station: RadioStation) => void;
  togglePlayPause: (station: RadioStation) => void;
}

// 아이템 고정 높이 (px-5 py-3 + 내용)
const ITEM_HEIGHT = 80;

// Row 컴포넌트를 memo로 분리 - 불필요한 리렌더 방지
interface StationRowProps {
  item: RadioStation;
  onDragStart: () => void;
  onDragEnd: () => void;
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
    onDragStart,
    onDragEnd,
    isActive,
    isCurrentStation,
    isCurrentPlaying,
    isCurrentLoading,
    favorite,
    onPressStation,
    onPressFavorite,
  }) => {
    // 부드러운 애니메이션을 위한 Animated Values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: isActive ? 1.05 : 1,
          useNativeDriver: true,
          friction: 7, // 드래그 종료 시 더 빠른 복귀 (5 → 7)
          tension: 50, // 좀 더 탄력있게 (40 → 50)
        }),
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
                onPressIn={onDragStart}
                onPressOut={onDragEnd}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="reorder-three" size={24} color="#71717a" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  },
  // 성능 최적화: item 객체와 상태값만 비교
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
  onSetPlaylist,
  toggleFavorite,
  togglePlayPause,
}: DraggableStationListProps) {
  const [containerHeight, setContainerHeight] = useState<number>(0);


  // 드래그 종료 핸들러 - 인덱스 기반 재정렬
  const handleReordered = useCallback(
    (fromIndex: number, toIndex: number) => {

      // 배열 재정렬
      const newData = [...data];
      const [movedItem] = newData.splice(fromIndex, 1);
      newData.splice(toIndex, 0, movedItem);

      // 부모에게 알림 (애니메이션이 완전히 끝난 후 - 300ms로 조정)
      setTimeout(() => {
        onDragEnd(newData);
      }, 300);
    },
    [data, onDragEnd]
  );

  // keyExtractor - 안정적인 key
  const keyExtractor = useCallback((item: RadioStation) => item.id, []);

  // renderItem을 useCallback으로 최적화
  const renderItem = useCallback(
    (info: DragListRenderItemInfo<RadioStation>) => {
      const { item, onDragStart, onDragEnd, isActive } = info;
      const isCurrentStation = currentStation?.id === item.id;
      const isCurrentPlaying =
        isCurrentStation && playbackState === PlaybackState.PLAYING;
      const isCurrentLoading =
        isCurrentStation && playbackState === PlaybackState.LOADING;
      const favorite = isFavorite(item.id);

      // 인라인 콜백 제거 - useCallback은 컴포넌트 레벨에서만 가능하므로
      // 여기서는 함수를 미리 생성
      const handlePressStation = () => {togglePlayPause(item); onSetPlaylist()};
      const handlePressFavorite = () => toggleFavorite(item);

      return (
        <StationRow
          item={item}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          isActive={isActive}
          isCurrentStation={isCurrentStation}
          isCurrentPlaying={isCurrentPlaying}
          isCurrentLoading={isCurrentLoading}
          favorite={favorite}
          onPressStation={handlePressStation}
          onPressFavorite={handlePressFavorite}
        />
      );
    },
    [currentStation, playbackState, isFavorite, togglePlayPause, toggleFavorite]
  );

  // 컨테이너 높이 측정
  const handleLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    setContainerHeight(height);
  }, []);


  return (
    <View style={{ flex: 1 }} onLayout={handleLayout}>
      <DragList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onReordered={handleReordered}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 0,
          paddingBottom: bottomPadding,
          minHeight: containerHeight,
        }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: 'transparent' }}
      />
    </View>
  );
}

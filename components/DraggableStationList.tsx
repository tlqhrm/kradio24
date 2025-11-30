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
import NativeAdCard from "./NativeAdCard";

const ITEM_HEIGHT = 80;

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
  showAd?: boolean;
  ListEmptyComponent?: React.ReactElement | null;
}

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
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.timing(opacityAnim, {
        toValue: isActive ? 0.85 : 1,
        duration: isActive ? 200 : 150,
        useNativeDriver: true,
      }).start();
    }, [isActive, opacityAnim]);

    return (
      <Animated.View style={{ opacity: opacityAnim }}>
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

              <View className="flex-row items-center gap-3">
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

// 최상단 고정 광고
const ListHeader = memo(() => (
  <NativeAdCard adIndex={0} />
));

ListHeader.displayName = "ListHeader";

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
  showAd = true,
  ListEmptyComponent,
}: DraggableStationListProps) {
  const dataRef = useRef<RadioStation[]>(data);

  useLayoutEffect(() => {
    dataRef.current = data;
  }, [data]);

  const keyExtractor = useCallback((item: RadioStation) => item.id, []);

  const handlePressStation = useCallback((item: RadioStation) => {
    setPlaylist(dataRef.current);
    togglePlayPause(item);
  }, [setPlaylist, togglePlayPause]);

  const handlePressFavorite = useCallback((item: RadioStation) => {
    toggleFavorite(item);
  }, [toggleFavorite]);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<RadioStation>) => {
      const isCurrentStation = currentStation?.id === item.id;
      const isCurrentPlaying = isCurrentStation && playbackState === PlaybackState.PLAYING;
      const isCurrentLoading = isCurrentStation && playbackState === PlaybackState.LOADING;
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

  const handleDragEnd = useCallback(
    ({ data: newData }: { data: RadioStation[] }) => {
      onDragEnd(newData);
    },
    [onDragEnd]
  );

  return (
    <DraggableFlatList
      data={data}
      extraData={[data.length, currentStation?.id, playbackState]}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onDragEnd={handleDragEnd}
      ListHeaderComponent={showAd ? ListHeader : null}
      ListEmptyComponent={ListEmptyComponent}
      autoscrollThreshold={0.3}
      autoscrollSpeed={100}
      containerStyle={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: bottomPadding, flexGrow: 1 }}
      showsVerticalScrollIndicator={true}
    />
  );
}

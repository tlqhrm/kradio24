import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RadioStation } from "@/types/radio";

interface StationContextMenuProps {
  visible: boolean;
  station: RadioStation | null;
  isFavorite: boolean;
  onClose: () => void;
  onPlay: () => void;
  onToggleFavorite: () => void;
}

export default function StationContextMenu({
  visible,
  station,
  isFavorite,
  onClose,
  onPlay,
  onToggleFavorite,
}: StationContextMenuProps) {
  if (!station) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 배경 오버레이 */}
      <Pressable
        className="flex-1 bg-black/60 justify-end"
        onPress={onClose}
      >
        {/* 메뉴 컨테이너 */}
        <Pressable className="bg-zinc-800 rounded-t-3xl" onPress={(e) => e.stopPropagation()}>
          {/* 핸들 */}
          <View className="items-center py-3">
            <View className="w-10 h-1 bg-zinc-600 rounded-full" />
          </View>

          {/* 방송국 정보 */}
          <View className="px-6 py-4 border-b border-zinc-700">
            <Text className="text-white text-lg font-bold" numberOfLines={1}>
              {station.name}
            </Text>
            <Text className="text-zinc-300 text-sm mt-1">
              {station.category}
              {station.genre && ` • ${station.genre}`}
            </Text>
          </View>

          {/* 메뉴 옵션 */}
          <View className="py-2">
            {/* 재생 */}
            <TouchableOpacity
              className="flex-row items-center px-6 py-4 active:bg-zinc-700"
              onPress={() => {
                onPlay();
                onClose();
              }}
            >
              <Ionicons name="play-circle" size={24} color="#10b981" />
              <Text className="text-white text-base ml-4 font-medium">재생</Text>
            </TouchableOpacity>

            {/* 즐겨찾기 추가/제거 */}
            <TouchableOpacity
              className="flex-row items-center px-6 py-4 active:bg-zinc-700"
              onPress={() => {
                onToggleFavorite();
                onClose();
              }}
            >
              <Ionicons
                name={isFavorite ? "heart-dislike" : "heart"}
                size={24}
                color="#ef4444"
              />
              <Text className="text-white text-base ml-4 font-medium">
                {isFavorite ? "즐겨찾기 제거" : "즐겨찾기 추가"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 하단 여백 (Safe Area) */}
          <View className="h-8" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

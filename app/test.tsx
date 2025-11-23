import { View, Text } from "react-native";

export default function TestPage() {
  return (
    <View className="flex-1 items-center justify-center bg-red-500">
      <Text className="text-4xl font-bold text-white">
        Tailwind Test
      </Text>
      <View className="mt-4 p-4 bg-blue-600 rounded-lg">
        <Text className="text-white">Blue Box</Text>
      </View>
    </View>
  );
}
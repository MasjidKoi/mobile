import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function TimesScreen() {
  return (
    <View className="flex-1 bg-slate-100">
      <StatusBar style="light" />

      <View className="bg-cyan-600 px-5 pb-4 pt-14">
        <Text className="text-2xl font-bold text-white">MasjidKoi</Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <Text className="text-3xl font-bold text-slate-800">Times</Text>
      </View>
    </View>
  );
}

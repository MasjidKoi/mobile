import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 bg-slate-100">
      <StatusBar style="light" />

      <View className="bg-cyan-600 px-5 pb-4 pt-14">
        <Text className="text-2xl font-bold text-white">Mashjid Koi</Text>
      </View>

      <View className="flex-1" />

      <View className="flex-row border-t border-slate-200 bg-white px-2 py-3">
        <View className="flex-1 items-center">
          <Text className="text-sm font-semibold text-slate-700">Now</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-sm font-semibold text-slate-700">Times</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-sm font-semibold text-slate-700">Mosque</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-sm font-semibold text-slate-700">Qibla</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-sm font-semibold text-slate-700">Settings</Text>
        </View>
      </View>
    </View>
  );
}

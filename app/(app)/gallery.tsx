import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Dimensions, FlatList, Pressable, ScrollView, Share, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components";
import { useCommunityPhotos } from "@/hooks/useCommunityPhotos";
import { useMasjid } from "@/hooks/useMasjid";
import { useFormat } from "@/lib/i18n/format";
import { orderAdminPhotos } from "@/lib/masjids/photos";

const { width: SCREEN_W } = Dimensions.get("window");
const THUMB = 54;
const OVERLAY = "rgba(255,255,255,0.18)";

/**
 * 23 Gallery Viewer — full-screen, swipeable photo viewer for either the admin
 * gallery (`source=admin`) or the visitor strip (`source=community`). Reads the
 * already-cached photo list, so it opens instantly from the profile.
 */
export default function GalleryScreen() {
  const { t } = useTranslation();
  const f = useFormat();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ masjidId: string; index?: string; source?: string; url?: string }>();
  const masjidId = params.masjidId ?? "";
  const source = params.source === "community" ? "community" : "admin";
  // Single-image mode (e.g. viewing one's own pending submission): show just the
  // passed URL, no thumbnail rail.
  const directUrl = typeof params.url === "string" && params.url.length > 0 ? params.url : null;

  const masjid = useMasjid(masjidId).data;
  const masjidPhotos = masjid?.photos;
  const communityData = useCommunityPhotos(masjidId).data;

  const onShare = () =>
    void Share.share({
      message: `${masjid?.name ?? ""}\nmasjidkoi://masjid/${masjidId}`.trim(),
    }).catch(() => undefined);

  const urls = useMemo(() => {
    if (directUrl) return [directUrl];
    if (source === "community") {
      return (communityData?.pages.flatMap((p) => p.items) ?? []).map((p) => p.url);
    }
    return orderAdminPhotos(masjidPhotos ?? []).map((p) => p.url);
  }, [directUrl, source, communityData, masjidPhotos]);

  // Requested entry point — derived from the param alone (NOT urls.length, which
  // can be 0 on the first render before the query data hydrates).
  const startIndex = Math.max(0, Math.floor(Number(params.index ?? 0)) || 0);
  const [index, setIndex] = useState(startIndex);
  const listRef = useRef<FlatList<string>>(null);

  const goTo = (i: number) => {
    setIndex(i);
    listRef.current?.scrollToIndex({ index: i, animated: true });
  };

  return (
    <View className="flex-1 bg-black">
      {/* Top bar */}
      <View
        className="flex-row items-center justify-between px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
          onPress={() => router.back()}
          hitSlop={8}
          style={{ backgroundColor: OVERLAY }}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Feather name="x" size={20} color="#FFFFFF" />
        </Pressable>
        {urls.length > 0 ? (
          <Text className="text-sm font-semibold text-white">
            {`${f.number(Math.min(index, urls.length - 1) + 1)} / ${f.number(urls.length)}`}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.share")}
          onPress={onShare}
          hitSlop={8}
          style={{ backgroundColor: OVERLAY }}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Feather name="share-2" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Main pager — FlatList so `initialScrollIndex` honors the requested photo
          on both platforms and after async data load (ScrollView `contentOffset`
          is iOS-only and fires before the data arrives). */}
      {urls.length > 0 ? (
        <FlatList
          ref={listRef}
          data={urls}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={Math.min(startIndex, urls.length - 1)}
          getItemLayout={(_, i) => ({ length: SCREEN_W, offset: SCREEN_W * i, index: i })}
          onScrollToIndexFailed={({ index: i }) =>
            listRef.current?.scrollToOffset({ offset: i * SCREEN_W, animated: false })
          }
          onMomentumScrollEnd={(e) =>
            setIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
          }
          keyExtractor={(uri, i) => `${uri}-${i}`}
          renderItem={({ item }) => (
            <View style={{ width: SCREEN_W }} className="flex-1 justify-center">
              <Image
                source={{ uri: item }}
                style={{ width: SCREEN_W, flex: 1 }}
                contentFit="contain"
                transition={120}
              />
            </View>
          )}
          className="flex-1"
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FFFFFF" />
        </View>
      )}

      {/* Caption + thumbnail rail */}
      <View style={{ paddingBottom: insets.bottom + 10 }} className="gap-2.5 px-4 pt-2">
        {!directUrl ? (
          <Text className="text-[12px] font-regular text-on-inverse-muted">
            {source === "community" ? t("masjid.profile.visitorPhotos") : t("masjid.gallery.adminGallery")}
          </Text>
        ) : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {urls.map((uri, i) => (
            <Pressable
              key={`thumb-${uri}-${i}`}
              accessibilityRole="imagebutton"
              onPress={() => goTo(i)}
              style={{ width: THUMB, height: THUMB, borderWidth: i === index ? 2 : 0, borderColor: "#FFFFFF" }}
              className="overflow-hidden rounded-md"
            >
              <Image source={{ uri }} style={{ width: THUMB, height: THUMB }} contentFit="cover" />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

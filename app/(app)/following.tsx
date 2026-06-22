import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Banner, Button, EmptyState, Text } from "@/components";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { ApiError, isOfflineQuery } from "@/lib/api/errors";
import { unfollowMasjid } from "@/lib/masjids/profile-api";
import type { FollowedMasjidPreference, NotificationPreferences } from "@/lib/notifications/preferences";
import { qk } from "@/lib/query/keys";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

/** 83 Masjids I Follow — the followed set (from notification prefs) with inline
 * unfollow. The per-masjid notification mode is managed in Settings → Notifications. */
export default function FollowingScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useLoginGate();
  const prefsKey = qk.notificationPrefs();

  const { prefs, query } = useNotificationPreferences({ enabled: isAuthenticated });
  const masjids = prefs?.masjids ?? [];
  const offline = isOfflineQuery(query);

  const unfollow = useMutation({
    mutationFn: async (id: string) => {
      try {
        await unfollowMasjid(id);
      } catch (e) {
        // Already unfollowed (404) — treat as success so the row clears.
        if (e instanceof ApiError && e.status === 404) return;
        throw e;
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: prefsKey });
      const previous = queryClient.getQueryData<NotificationPreferences>(prefsKey);
      if (previous) {
        queryClient.setQueryData<NotificationPreferences>(prefsKey, {
          ...previous,
          masjids: previous.masjids.filter((m) => m.masjid_id !== id),
        });
      }
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(prefsKey, ctx.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: prefsKey });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const back = <BackButton onPress={() => router.back()} />;

  const body = () => {
    // Guest (deep-link safety) — the followed list needs an account.
    if (!isAuthenticated) {
      return (
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="bookmark" size={28} color={c.primary} />}
            title={t("community.follow.guestTitle")}
            caption={t("community.follow.guestCaption")}
            action={
              <Button
                label={t("feed.guest.cta")}
                onPress={() => requireAuth(() => {}, "community")}
              />
            }
          />
        </View>
      );
    }

    return (
      <FlatList
        data={masjids}
        keyExtractor={(m) => m.masjid_id}
        contentContainerClassName="gap-2.5 px-4 py-3 pb-8"
        ListHeaderComponent={
          offline ? (
            <View className="pb-2">
              <Banner
                variant="warning"
                icon={<Feather name="wifi-off" size={15} color="#8A6A1F" />}
                message={t("community.follow.offline")}
              />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <FollowRow item={item} onUnfollow={() => unfollow.mutate(item.masjid_id)} />
        )}
        ListEmptyComponent={
          query.isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : offline ? null : (
            <View className="items-center px-6 py-12">
              <EmptyState
                icon={<Feather name="bookmark" size={26} color={c.primary} />}
                title={t("community.follow.emptyTitle")}
                caption={t("community.follow.emptyCaption")}
                action={
                  <Button
                    variant="text"
                    label={t("feed.empty.cta")}
                    onPress={() => router.push("/explore")}
                  />
                }
              />
            </View>
          )
        }
      />
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("community.follow.title")} left={back} />
      {body()}
    </SafeAreaView>
  );
}

function FollowRow({
  item,
  onUnfollow,
}: {
  item: FollowedMasjidPreference;
  onUnfollow: () => void;
}) {
  const { t } = useTranslation();
  const c = useColors();
  return (
    <View className="flex-row items-center gap-3 rounded-md border border-border bg-surface p-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-soft">
        <Feather name="home" size={18} color={c.primary} />
      </View>
      <Pressable
        accessibilityRole="button"
        className="flex-1"
        onPress={() => router.push({ pathname: "/masjid/[id]", params: { id: item.masjid_id } })}
      >
        <Text variant="body" className="font-semibold" numberOfLines={1}>
          {item.name || t("common.brand")}
        </Text>
        <Text variant="caption" className="text-content-muted">
          {t(`community.follow.mode.${item.notification_mode}`)}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("community.follow.unfollow")}
        onPress={onUnfollow}
        hitSlop={6}
        className="rounded-full border border-border bg-background px-3.5 py-1.5 active:bg-primary-soft"
      >
        <Text variant="caption" className="font-semibold text-content-secondary">
          {t("community.follow.unfollow")}
        </Text>
      </Pressable>
    </View>
  );
}

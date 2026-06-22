import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, ListItem, Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";
import { useAuth, type UserProfile } from "@/providers/AuthProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

function initialsFor(user: UserProfile | null): string {
  const source = user?.display_name?.trim() || user?.email || "";
  return source ? source.slice(0, 2).toUpperCase() : "🙂";
}

export default function ProfileTab() {
  const { t } = useTranslation();
  const c = useColors();
  const { status, user, logout } = useAuth();
  const { requireAuth } = useLoginGate();

  if (status === "loading") {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={c.primary} />
      </SafeAreaView>
    );
  }

  const tile = (icon: keyof typeof Feather.glyphMap, bg: string): ReactNode => (
    <View className="h-[30px] w-[30px] items-center justify-center rounded-lg" style={{ backgroundColor: bg }}>
      <Feather name={icon} size={17} color={c["on-inverse"]} />
    </View>
  );

  const chevron = <Feather name="chevron-right" size={20} color={c["text-muted"]} />;

  const soonBadge = (
    <View className="rounded-full bg-accent-gold-soft px-2.5 py-1">
      <Text variant="micro" className="font-semibold text-accent-gold">
        {t("profileTab.soon")}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-md px-4 py-2 pb-8">
        <View className="py-1">
          <Text variant="display" className="text-[24px]">
            {t("profileTab.title")}
          </Text>
        </View>

        {status === "authenticated" ? (
          <>
            {/* Account card */}
            <View className="flex-row items-center gap-3.5 rounded-md border border-border bg-surface p-4">
              <View className="h-14 w-14 items-center justify-center rounded-[28px] bg-primary-soft">
                <Text variant="heading" className="text-primary">
                  {initialsFor(user)}
                </Text>
              </View>
              <View className="flex-1 gap-0.5">
                <Text variant="heading" numberOfLines={1}>
                  {user?.display_name?.trim() || t("common.brand")}
                </Text>
                <Text variant="caption" numberOfLines={1} className="text-content-secondary">
                  {user?.email ?? ""}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("profileTab.editProfile")}
                onPress={() => router.push("/profile-setup")}
                className="h-9 w-9 items-center justify-center rounded-[18px] bg-background"
              >
                <Feather name="edit-2" size={16} color={c["text-secondary"]} />
              </Pressable>
            </View>

            {/* App + reserved-feature rows */}
            <Card>
              <ListItem title={t("profileTab.rows.settings")} leading={tile("settings", c["text-secondary"])} trailing={chevron} disabled />
              <ListItem title={t("profileTab.rows.help")} leading={tile("life-buoy", c["accent-gold"])} trailing={chevron} disabled />
              <ListItem
                title={t("profileTab.rows.donations")}
                leading={tile("heart", c.primary)}
                trailing={chevron}
                onPress={() => router.push("/donations")}
              />
              <ListItem title={t("profileTab.rows.journal")} leading={tile("moon", c["text-muted"])} trailing={soonBadge} disabled />
            </Card>

            <Card>
              <Pressable accessibilityRole="button" onPress={() => void logout()}>
                <View className="flex-row items-center gap-3 px-4 py-3.5">
                  <Feather name="log-out" size={20} color={c.error} />
                  <Text variant="body" className="font-medium text-error">
                    {t("profileTab.rows.signOut")}
                  </Text>
                </View>
              </Pressable>
            </Card>
          </>
        ) : (
          <>
            {/* Guest sign-in CTA */}
            <View className="items-center gap-2.5 rounded-md border border-border bg-surface p-6">
              <View className="h-14 w-14 items-center justify-center rounded-[28px] bg-primary-soft">
                <Feather name="user" size={26} color={c.primary} />
              </View>
              <Text variant="heading">{t("profileTab.guest.title")}</Text>
              <Text variant="caption" className="text-center text-content-secondary">
                {t("profileTab.guest.subtitle")}
              </Text>
              <Button
                label={t("profileTab.guest.cta")}
                className="mt-1 w-full"
                onPress={() => requireAuth(() => {}, "generic")}
              />
            </View>

            <Card>
              <ListItem title={t("profileTab.rows.settings")} leading={tile("settings", c["text-secondary"])} trailing={chevron} disabled />
              <ListItem title={t("profileTab.rows.help")} leading={tile("life-buoy", c["accent-gold"])} trailing={chevron} disabled />
              <ListItem title={t("profileTab.rows.about")} leading={tile("info", c["text-muted"])} trailing={chevron} disabled />
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

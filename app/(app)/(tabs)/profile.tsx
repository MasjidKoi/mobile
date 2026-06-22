import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, Dialog, SettingsRow, Text } from "@/components";
import { useDonationSummary } from "@/hooks/useDonations";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";
import { useAuth, type UserProfile } from "@/providers/AuthProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

const SUPPORT_URL = "mailto:support@masjidkoi.app";

function initialsFor(user: UserProfile | null): string {
  const source = user?.display_name?.trim() || user?.email || "";
  return source ? source.slice(0, 2).toUpperCase() : "🙂";
}

export default function ProfileTab() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { status, user, logout } = useAuth();
  const { requireAuth } = useLoginGate();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const authed = status === "authenticated";
  const summary = useDonationSummary({ enabled: authed });

  if (status === "loading") {
    return (
      <SafeAreaView
        edges={["top"]}
        className="flex-1 items-center justify-center bg-background"
      >
        <ActivityIndicator color={c.primary} />
      </SafeAreaView>
    );
  }

  const lifetime = Number(summary.data?.lifetime_total);
  const donationValue =
    Number.isFinite(lifetime) && lifetime > 0
      ? f.currency(lifetime)
      : undefined;

  const subtitle = user?.madhab
    ? t(`auth.madhab.${user.madhab}`)
    : (user?.email ?? "");

  const soonBadge = (
    <View className="rounded-full bg-accent-gold-soft px-2.5 py-1">
      <Text variant="micro" className="font-semibold text-accent-gold">
        {t("profileTab.soon")}
      </Text>
    </View>
  );

  const openSupport = () => {
    Linking.openURL(SUPPORT_URL).catch(() => {});
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-md px-4 py-2 pb-8">
        <View className="py-1">
          <Text variant="display" className="text-[24px]">
            {t("profileTab.title")}
          </Text>
        </View>

        {authed ? (
          <>
            {/* Account card */}
            <View className="flex-row items-center gap-3.5 rounded-md border border-border bg-surface p-4">
              {user?.profile_photo_url ? (
                <Image
                  source={{ uri: user.profile_photo_url }}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                  contentFit="cover"
                />
              ) : (
                <View className="h-14 w-14 items-center justify-center rounded-[28px] bg-primary-soft">
                  <Text variant="heading" className="text-primary">
                    {initialsFor(user)}
                  </Text>
                </View>
              )}
              <View className="flex-1 gap-0.5">
                <Text variant="heading" numberOfLines={1}>
                  {user?.display_name?.trim() || t("common.brand")}
                </Text>
                <Text
                  variant="caption"
                  numberOfLines={1}
                  className="text-content-secondary"
                >
                  {subtitle}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("profileTab.editProfile")}
                onPress={() => router.push("/edit-profile")}
                hitSlop={6}
                className="h-9 w-9 items-center justify-center rounded-[18px] bg-background"
              >
                <Feather name="edit-2" size={16} color={c["text-secondary"]} />
              </Pressable>
            </View>

            {/* Settings + help */}
            <Card>
              <SettingsRow
                icon="settings"
                tileColor={c["text-secondary"]}
                label={t("profileTab.rows.settings")}
                onPress={() => router.push("/settings")}
              />
              <SettingsRow
                icon="life-buoy"
                tileColor={c["accent-gold"]}
                label={t("profileTab.rows.help")}
                onPress={openSupport}
              />
            </Card>

            {/* Reserved feature rows (Donation history live; Journal pending PRD 08) */}
            <Card>
              <SettingsRow
                icon="heart"
                tileColor={c.primary}
                label={t("profileTab.rows.donations")}
                value={donationValue}
                onPress={() => router.push("/donations")}
              />
              <SettingsRow
                icon="moon"
                tileColor={c["text-muted"]}
                label={t("profileTab.rows.journal")}
                valueNode={soonBadge}
                showChevron={false}
                disabled
              />
            </Card>

            <Card>
              <SettingsRow
                icon="log-out"
                label={t("profileTab.rows.signOut")}
                tone="danger"
                onPress={() => setSignOutOpen(true)}
              />
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
              <Text
                variant="caption"
                className="text-center text-content-secondary"
              >
                {t("profileTab.guest.subtitle")}
              </Text>
              <Button
                label={t("profileTab.guest.cta")}
                className="mt-1 w-full"
                onPress={() => requireAuth(() => {}, "generic")}
              />
            </View>

            <Card>
              <SettingsRow
                icon="settings"
                tileColor={c["text-secondary"]}
                label={t("profileTab.rows.settings")}
                onPress={() => router.push("/settings")}
              />
              <SettingsRow
                icon="life-buoy"
                tileColor={c["accent-gold"]}
                label={t("profileTab.rows.help")}
                onPress={openSupport}
              />
              <SettingsRow
                icon="info"
                tileColor={c["text-muted"]}
                label={t("profileTab.rows.about")}
                onPress={() => router.push("/about")}
              />
            </Card>
          </>
        )}
      </ScrollView>

      <Dialog
        visible={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        title={t("profileTab.signOutConfirmTitle")}
        description={t("profileTab.signOutConfirmBody")}
      >
        <View className="flex-row justify-end gap-2 pt-1">
          <Button
            variant="text"
            label={t("common.cancel")}
            onPress={() => setSignOutOpen(false)}
          />
          <Button
            variant="text"
            label={t("profileTab.rows.signOut")}
            onPress={() => {
              setSignOutOpen(false);
              void logout();
            }}
          />
        </View>
      </Dialog>
    </SafeAreaView>
  );
}

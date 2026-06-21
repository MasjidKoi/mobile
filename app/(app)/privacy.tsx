import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppBar,
  BackButton,
  Card,
  ExportDialogs,
  Row,
  Switch,
  Text,
} from "@/components";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { useDataExport } from "@/hooks/useDataExport";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";

function SectionLabel({ title }: { title: string }) {
  return (
    <View className="px-0.5">
      <Text className="text-caption font-semibold text-content-muted">
        {title}
      </Text>
    </View>
  );
}

function PrivateRow({
  icon,
  title,
  sub,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  sub: string;
}) {
  const c = useColors();
  return (
    <View className="flex-row items-center gap-3 px-4 py-[13px]">
      <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-primary-soft">
        <Feather name={icon} size={17} color={c.primary} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-body font-semibold text-content-primary">
          {title}
        </Text>
        <Text className="text-caption font-regular text-content-muted">
          {sub}
        </Text>
      </View>
    </View>
  );
}

export default function PrivacyScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { status } = useAuth();
  const authed = status === "authenticated";
  const { prefs, setPref } = useNotificationPreferences({ enabled: authed });
  const exp = useDataExport();

  const chevron = (
    <Feather name="chevron-right" size={16} color={c["text-muted"]} />
  );

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: ReactNode;
  }) => (
    <View className="gap-2">
      <SectionLabel title={title} />
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("settings.privacy.title")} left={<BackButton />} />
      <ScrollView contentContainerClassName="gap-5 px-4 pb-6 pt-3">
        {/* Private by design */}
        <Section title={t("settings.privacy.designSection")}>
          <Card>
            <PrivateRow
              icon="eye-off"
              title={t("settings.privacy.checkinPrivate")}
              sub={t("settings.privacy.checkinPrivateSub")}
            />
            <PrivateRow
              icon="lock"
              title={t("settings.privacy.ibadahPrivate")}
              sub={t("settings.privacy.ibadahPrivateSub")}
            />
          </Card>
        </Section>

        {authed ? (
          <>
            {/* Donation anonymity default (PRD 05 slot, live since donations shipped) */}
            <Section title={t("settings.privacy.donationSection")}>
              <View className="flex-row items-center gap-3 rounded-md border border-border bg-surface px-4 py-3">
                <Feather name="user-x" size={18} color={c["text-secondary"]} />
                <View className="flex-1 gap-0.5">
                  <Text className="text-body font-regular text-content-primary">
                    {t("settings.privacy.anonByDefault")}
                  </Text>
                  <Text className="text-caption font-regular text-content-muted">
                    {t("settings.privacy.anonByDefaultSub")}
                  </Text>
                </View>
                <Switch
                  value={!!prefs?.donate_anonymously_by_default}
                  onValueChange={(v) =>
                    setPref({ donate_anonymously_by_default: v })
                  }
                />
              </View>
            </Section>

            {/* Your data */}
            <Section title={t("settings.privacy.dataSection")}>
              <Card>
                <Row
                  accessibilityRole="button"
                  icon={
                    <Feather
                      name="download"
                      size={18}
                      color={c["text-secondary"]}
                    />
                  }
                  title={t("settings.privacy.downloadData")}
                  value="JSON"
                  trailing={chevron}
                  onPress={() => void exp.run()}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/delete-account")}
                  className="flex-row items-center gap-3 px-4 py-[14px] active:bg-error-soft"
                >
                  <Feather name="trash-2" size={18} color={c.error} />
                  <Text className="flex-1 text-body font-medium text-error">
                    {t("settings.privacy.deleteAccount")}
                  </Text>
                  <Feather name="chevron-right" size={16} color={c.error} />
                </Pressable>
              </Card>
            </Section>
          </>
        ) : null}
      </ScrollView>

      <ExportDialogs
        state={exp.state}
        onCancel={exp.cancel}
        onRetry={() => void exp.run()}
      />
    </SafeAreaView>
  );
}

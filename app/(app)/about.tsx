import Constants from "expo-constants";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useTranslation } from "react-i18next";
import { Share, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Card, SettingsRow, Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

const TERMS_URL = "https://masjidkoi.app/terms";
const PRIVACY_URL = "https://masjidkoi.app/privacy";
const LICENSES_URL = "https://masjidkoi.app/licenses";
const STORE_URL = "https://masjidkoi.app";

export default function AboutScreen() {
  const { t } = useTranslation();
  const c = useColors();

  const version = Constants.expoConfig?.version ?? "1.0.0";
  const open = (url: string) =>
    WebBrowser.openBrowserAsync(url).catch(() => {});
  const share = () =>
    Share.share({
      message: `${t("settings.about.shareMessage")} ${STORE_URL}`,
    }).catch(() => {});

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("settings.about.title")} left={<BackButton />} />
      <ScrollView contentContainerClassName="grow gap-5 px-4 pb-6 pt-3">
        {/* Header */}
        <View className="items-center gap-2.5 py-2">
          <View className="h-[76px] w-[76px] overflow-hidden rounded-[20px] bg-primary">
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 76, height: 76 }}
              contentFit="cover"
            />
          </View>
          <Text variant="title" className="font-bold">
            {t("common.brand")}
          </Text>
          <View className="rounded-full border border-border bg-surface px-3 py-1">
            <Text className="text-caption font-regular text-content-secondary">
              {t("settings.about.version", { version })}
            </Text>
          </View>
        </View>

        {/* Legal */}
        <Card>
          <SettingsRow
            icon="file-text"
            tileColor={c["text-secondary"]}
            label={t("settings.about.terms")}
            onPress={() => open(TERMS_URL)}
          />
          <SettingsRow
            icon="shield"
            tileColor={c["surface-inverse"]}
            label={t("settings.about.privacyPolicy")}
            onPress={() => open(PRIVACY_URL)}
          />
          <SettingsRow
            icon="code"
            tileColor={c["text-muted"]}
            label={t("settings.about.licenses")}
            onPress={() => open(LICENSES_URL)}
          />
        </Card>

        {/* Engagement */}
        <Card>
          <SettingsRow
            icon="star"
            tileColor={c["accent-gold"]}
            label={t("settings.about.rate")}
            onPress={() => open(STORE_URL)}
          />
          <SettingsRow
            icon="share-2"
            tileColor={c.primary}
            label={t("settings.about.share")}
            onPress={share}
          />
        </Card>

        <View className="grow" />

        {/* Footer */}
        <View className="items-center gap-0.5">
          <Text className="text-micro font-regular text-content-muted">
            {t("settings.about.tagline1")}
          </Text>
          <Text className="text-micro font-regular text-content-muted">
            {t("settings.about.tagline2")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

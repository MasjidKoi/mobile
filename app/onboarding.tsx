import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components";
import {
  BrandLockup,
  IntroNextButton,
  IntroSlide,
  PageDots,
} from "@/components/onboarding";
import { INTRO_SLIDES } from "@/constants/onboarding";
import { setOnboardingComplete } from "@/lib/onboarding";

const CONTROLS_HEIGHT = 56;

export default function Onboarding() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === INTRO_SLIDES.length - 1;
  // Room beneath the body text for the fixed controls overlay + safe area.
  const slideBottomInset = insets.bottom + CONTROLS_HEIGHT + 36;

  const finish = useCallback(() => {
    // Persist the first-run flag, then go into the app. Replace so Back doesn't
    // return here. Navigation isn't blocked on the write — the redirect gate
    // re-reads the flag on next launch.
    setOnboardingComplete();
    router.replace("/home");
  }, []);

  const handleNext = useCallback(() => {
    if (isLast) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }, [isLast, index, finish]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      if (next !== index) setIndex(next);
    },
    [width, index],
  );

  return (
    <View className="flex-1 bg-[#06150F]">
      <StatusBar style="light" />

      <FlatList
        ref={listRef}
        data={INTRO_SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <IntroSlide
            slide={item}
            kicker={t(`onboarding.slides.${item.key}.kicker`)}
            title={t(`onboarding.slides.${item.key}.title`)}
            body={t(`onboarding.slides.${item.key}.body`)}
            width={width}
            bottomInset={slideBottomInset}
          />
        )}
      />

      {/* Fixed top bar — stays put while slides page beneath it. */}
      <View
        className="absolute inset-x-0 flex-row items-center justify-between px-lg"
        style={{ top: insets.top + 8 }}
        pointerEvents="box-none"
      >
        <BrandLockup />
        <Pressable accessibilityRole="button" onPress={finish} hitSlop={12}>
          <Text variant="caption" className="text-white/70">
            {t("onboarding.skip")}
          </Text>
        </Pressable>
      </View>

      {/* Fixed controls — dots track the live page; the arrow advances it. */}
      <View
        className="absolute inset-x-0 flex-row items-center justify-between px-[28px]"
        style={{ bottom: insets.bottom + 16 }}
        pointerEvents="box-none"
      >
        <PageDots count={INTRO_SLIDES.length} activeIndex={index} />
        <IntroNextButton isLast={isLast} onPress={handleNext} />
      </View>
    </View>
  );
}

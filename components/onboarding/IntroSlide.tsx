import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

import { INTRO_SCRIM, type IntroSlideMeta } from "@/constants/onboarding";
import { Text } from "../Text";

/**
 * One full-bleed intro slide: background photo, the top + bottom legibility
 * scrims, and the bottom-anchored kicker / title / body text block.
 *
 * Stays presentational: the carousel resolves localized copy (kicker/title/body
 * from i18n) and passes it in alongside the slide's photo. Chrome that stays put
 * while slides page (brand lockup, skip, dots, next button) is rendered by the
 * carousel as a fixed overlay. `width` is the page width so paging snaps
 * exactly; `bottomInset` reserves room beneath the body for that overlay + the
 * safe area.
 */
export type IntroSlideProps = {
  slide: IntroSlideMeta;
  /** Localized copy resolved by the carousel. */
  kicker: string;
  title: string;
  body: string;
  width: number;
  /** Space reserved below the body for the fixed controls + safe area. */
  bottomInset: number;
};

export function IntroSlide({ slide, kicker, title, body, width, bottomInset }: IntroSlideProps) {
  return (
    <View style={{ width }} className="flex-1 bg-[#06150F]">
      <Image
        source={slide.image}
        contentFit="cover"
        transition={200}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <LinearGradient
        colors={[...INTRO_SCRIM.topScrim.colors]}
        locations={[...INTRO_SCRIM.topScrim.locations]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 180 }}
      />
      <LinearGradient
        colors={[...INTRO_SCRIM.bottomScrim.colors]}
        locations={[...INTRO_SCRIM.bottomScrim.locations]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View
        className="absolute inset-x-0 bottom-0 gap-md px-[28px]"
        style={{ paddingBottom: bottomInset }}
      >
        <View className="h-[3px] w-7 rounded-[2px] bg-accent-gold" />
        <Text
          variant="caption"
          className="font-semibold tracking-[0.5px] text-accent-gold"
        >
          {kicker}
        </Text>
        {/* line-height is deliberately generous (~1.45×): Bengali stacks
            matras/reph above the glyph, and a tighter box clips the top of the
            first line on iOS. */}
        <Text variant="display" className="text-[30px] leading-[44px] text-white">
          {title}
        </Text>
        <Text variant="body" className="leading-[23px] text-white/70">
          {body}
        </Text>
      </View>
    </View>
  );
}

export default IntroSlide;

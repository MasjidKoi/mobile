import { View } from "react-native";

/**
 * Paging indicator for the intro carousel. The active page is a wide gold pill;
 * the rest are small translucent dots. Purely presentational — pass the live
 * `activeIndex` from the carousel.
 */
export type PageDotsProps = {
  count: number;
  activeIndex: number;
  className?: string;
};

export function PageDots({ count, activeIndex, className }: PageDotsProps) {
  return (
    <View className={`flex-row items-center gap-sm${className ? ` ${className}` : ""}`}>
      {Array.from({ length: count }).map((_, i) => {
        const active = i === activeIndex;
        return (
          <View
            key={i}
            className={`h-2 rounded-sm ${
              active ? "w-[22px] bg-accent-gold" : "w-2 bg-white/35"
            }`}
          />
        );
      })}
    </View>
  );
}

export default PageDots;

import { type ReactNode } from "react";
import { TextInput, type TextInputProps, View } from "react-native";

import { Colors } from "@/constants/theme";

/**
 * Pill search field from the Mobile Components kit. Generic over its icons and
 * forwards all TextInput props (value, onChangeText, placeholder, …).
 */
export type SearchBarProps = TextInputProps & {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Applied to the inner TextInput. */
  className?: string;
  /** Applied to the pill container. */
  containerClassName?: string;
};

export function SearchBar({
  leftIcon,
  rightIcon,
  className,
  containerClassName,
  ...props
}: SearchBarProps) {
  return (
    <View
      className={`h-[52px] flex-row items-center gap-3 rounded-[26px] border border-border bg-surface px-[18px]${
        containerClassName ? ` ${containerClassName}` : ""
      }`}
    >
      {leftIcon}
      <TextInput
        placeholderTextColor={Colors["text-muted"]}
        className={`flex-1 font-regular text-body text-content-primary${
          className ? ` ${className}` : ""
        }`}
        {...props}
      />
      {rightIcon}
    </View>
  );
}

export default SearchBar;

import { type ReactNode } from "react";
import { TextInput, type TextInputProps, View } from "react-native";

import { Colors } from "@/constants/theme";

import { Text } from "./Text";

/**
 * Labeled text field from the Style Guide. Optional `label` above the box and
 * an optional `leftIcon` node inside it. Forwards all TextInput props.
 */
export type InputProps = TextInputProps & {
  label?: string;
  leftIcon?: ReactNode;
  /** Applied to the inner TextInput. */
  className?: string;
  /** Applied to the bordered box wrapping the input. */
  containerClassName?: string;
};

export function Input({ label, leftIcon, className, containerClassName, ...props }: InputProps) {
  return (
    <View className="gap-sm">
      {label ? (
        <Text className="text-caption font-medium text-content-secondary">{label}</Text>
      ) : null}
      <View
        className={`flex-row items-center gap-[10px] rounded-md border border-border bg-surface px-4 py-[14px]${
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
      </View>
    </View>
  );
}

export default Input;

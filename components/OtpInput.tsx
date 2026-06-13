import { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Text } from "./Text";

/**
 * OTP entry from the Style Guide: a row of digit boxes backed by a single
 * hidden numeric input. Filled boxes and the next-to-fill box get the brand
 * border. Controlled via `value` / `onChangeText` (digits only).
 */
export type OtpInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  className?: string;
};

export function OtpInput({
  value,
  onChangeText,
  length = 6,
  autoFocus,
  className,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  const activeIndex = value.length;

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      className={`flex-row gap-[10px]${className ? ` ${className}` : ""}`}
    >
      {digits.map((digit, i) => {
        const highlighted = digit !== "" || (focused && i === activeIndex);
        return (
          <View
            key={i}
            className={`h-14 w-12 items-center justify-center rounded-md bg-surface ${
              highlighted ? "border-[1.5px] border-primary" : "border border-border"
            }`}
          >
            <Text variant="title" className="text-content-primary">
              {digit}
            </Text>
          </View>
        );
      })}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, "").slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        caretHidden
        className="absolute h-full w-full opacity-0"
      />
    </Pressable>
  );
}

export default OtpInput;

import { View } from "react-native";

import { Stepper } from "./Stepper";
import { Text } from "./Text";

/**
 * Qur'an logger row from the Ibadah & Gamification kit: a label beside a
 * Stepper. Generic — bound via `value` / `onChange`; `format` adds the unit.
 */
export type QuranStepperProps = {
  label: string;
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  className?: string;
};

export function QuranStepper({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  className,
}: QuranStepperProps) {
  return (
    <View
      className={`flex-row items-center gap-3 rounded-md border border-border bg-surface px-4 py-3${
        className ? ` ${className}` : ""
      }`}
    >
      <Text className="flex-1 text-body font-regular text-content-primary">{label}</Text>
      <Stepper value={value} onChange={onChange} min={min} max={max} step={step} format={format} />
    </View>
  );
}

export default QuranStepper;

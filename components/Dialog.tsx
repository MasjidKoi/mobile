import { type ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";

import { Text } from "./Text";

/**
 * Centered modal dialog from the Mobile Components kit. Generic: pass `title`
 * and `description`, then any actions/content as `children` (typically
 * <Button variant="text" /> in a justify-end row). Tapping the scrim closes.
 */
export type DialogProps = {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function Dialog({ visible, onClose, title, description, children, className }: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable onPress={onClose} className="flex-1 items-center justify-center bg-scrim px-6">
        {/* Inner press is swallowed so taps on the card don't dismiss. */}
        <Pressable
          className={`w-full max-w-[320px] gap-3.5 rounded-[24px] bg-surface p-6${
            className ? ` ${className}` : ""
          }`}
        >
          {title ? (
            <Text className="text-[19px] font-semibold text-content-primary">{title}</Text>
          ) : null}
          {description ? (
            <Text className="text-body font-regular text-content-secondary">{description}</Text>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default Dialog;

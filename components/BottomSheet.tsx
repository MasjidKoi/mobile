import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Bottom sheet from the Mobile Components kit: a rounded surface that slides up
 * from the bottom with a grab handle and a scrim, and is draggable down to
 * dismiss. Generic — pass the body as `children`.
 *
 * Drag-to-dismiss uses built-in Animated + PanResponder (no extra deps).
 */
export type BottomSheetProps = {
  visible: boolean;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
};

/** Drag past this many px, or flick faster than this, to dismiss. */
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.5;
const SPRING = { useNativeDriver: true, damping: 20, stiffness: 200, mass: 0.6 };

export function BottomSheet({ visible, onClose, children, className }: BottomSheetProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(height)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  // Keep the latest callback/height reachable from the once-created PanResponder.
  const heightRef = useRef(height);
  heightRef.current = height;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  // Latest `visible`, so the async slide-out callback can tell whether a reopen
  // raced in during the ~220ms close animation.
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  const slideOut = (done: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: heightRef.current,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) done();
    });
  };

  // Mount on open; on close, animate out then unmount.
  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else if (mounted) {
      // If `visible` flips back to true within the 220ms close animation, the
      // reopen (below) re-animates in; this callback must NOT unmount underneath
      // it, or the sheet gets stuck closed while `visible === true`.
      slideOut(() => {
        if (!visibleRef.current) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Animate in whenever the sheet is both mounted and visible — keyed on
  // `visible` too so a reopen mid-close (mounted already true) still re-animates.
  useEffect(() => {
    if (mounted && visible) {
      translateY.setValue(heightRef.current);
      backdrop.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, ...SPRING }),
        Animated.timing(backdrop, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, visible]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4 && g.dy > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_DISTANCE || g.vy > DISMISS_VELOCITY) {
          slideOut(() => {
            setMounted(false);
            onCloseRef.current?.();
          });
        } else {
          Animated.spring(translateY, { toValue: 0, ...SPRING }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={() => onClose?.()}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdrop }]}>
          <Pressable className="flex-1 bg-scrim" onPress={() => onClose?.()} />
        </Animated.View>

        <Animated.View style={{ transform: [{ translateY }] }} {...pan.panHandlers}>
          <View
            className={`gap-3.5 rounded-t-[20px] bg-surface px-5 pt-2.5${
              className ? ` ${className}` : ""
            }`}
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <View className="items-center">
              <View className="h-1 w-9 rounded-[2px] bg-border" />
            </View>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default BottomSheet;

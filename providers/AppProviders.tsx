import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useMemo, type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";

import i18n from "@/lib/i18n";
import { createQueryClient } from "@/lib/query/client";
import {
  asyncStoragePersister,
  PERSIST_BUSTER,
  PERSIST_MAX_AGE,
  shouldDehydrateQuery,
} from "@/lib/query/persister";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

/**
 * Single composition root for every cross-cutting provider. Order matters:
 * gesture-handler must be outermost (it hosts the gesture root view), then safe
 * area, the React Query cache (with AsyncStorage offline persistence), i18n, and
 * finally the theme engine which injects the active color-scheme variables +
 * navigation theme around the route tree.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: asyncStoragePersister,
            maxAge: PERSIST_MAX_AGE,
            buster: PERSIST_BUSTER,
            dehydrateOptions: { shouldDehydrateQuery },
          }}
        >
          <I18nextProvider i18n={i18n}>
            <ThemeProvider>{children}</ThemeProvider>
          </I18nextProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

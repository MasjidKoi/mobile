/**
 * One-time notification setup: the foreground display handler, Android channels,
 * and the tap→deep-link listener (a prayer reminder opens its masjid with the
 * prayer highlighted). Renders nothing; mounted once at the root.
 */
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";

import { configureNotificationHandler, ensureNotificationChannels } from "@/lib/notifications/channels";

export function NotificationsBootstrap() {
  useEffect(() => {
    configureNotificationHandler();
    void ensureNotificationChannels();

    const handle = (response: Notifications.NotificationResponse | null) => {
      const data = response?.notification.request.content.data as {
        masjidId?: string | null;
        prayer?: string;
      } | null;
      if (data?.masjidId) {
        router.push({
          pathname: "/masjid/[id]",
          params: { id: data.masjidId, prayer: data.prayer ?? "" },
        });
      }
    };

    // Handle a tap that cold-started the app (delivered before the listener mounts)…
    void Notifications.getLastNotificationResponseAsync().then(handle);
    // …and taps while the app is running.
    const sub = Notifications.addNotificationResponseReceivedListener(handle);
    return () => sub.remove();
  }, []);

  return null;
}

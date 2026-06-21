import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, SuccessCard, Text } from "@/components";
import { ConfirmingState } from "@/components/donation";
import { useDonation } from "@/hooks/useDonation";
import { useMasjid } from "@/hooks/useMasjid";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/** How long we keep polling a `pending` gift before offering recovery. */
const CONFIRM_TIMEOUT_MS = 30_000;

type Mode = "loading" | "confirming" | "success" | "failed" | "recovery";

/**
 * 40 Confirming → 41 Success / 42 Failed / 43 Recovery. `id` is the **donation**
 * id; `status` is the gateway outcome from `masjidkoi://donation/{id}?status=…`
 * (also the cold deep-link target after a backgrounded payment). We reconcile by
 * polling `GET /donations/{id}` until it resolves.
 */
export default function DonationStatusScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { id, status } = useLocalSearchParams<{ id: string; status?: string }>();

  // Poll on a successful/unknown gateway return; a fail/cancel still does one
  // fetch (the IPN backstop may have completed it) but won't loop.
  const shouldPoll = status === "success" || status == null;
  const q = useDonation(id, { poll: shouldPoll });
  const d = q.data;
  const masjid = useMasjid(d?.masjid_id);
  const masjidName = masjid.data?.name ?? t("common.brand");

  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (!shouldPoll) return;
    const timer = setTimeout(() => setTimedOut(true), CONFIRM_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [shouldPoll]);

  let mode: Mode;
  if (!d && q.isLoading) mode = "loading";
  else if (d?.status === "completed") mode = "success";
  else if (d?.status === "failed" || d?.status === "refunded") mode = "failed";
  else if (status === "fail") mode = "failed";
  else if (status === "cancel" || status === "dismiss") mode = "recovery";
  else if (q.isError && !d) mode = "recovery";
  else if (timedOut) mode = "recovery";
  else mode = "confirming";

  const retry = () => {
    if (d?.masjid_id) {
      router.replace({
        pathname: "/donate/[id]",
        params: { id: d.masjid_id, ...(d.campaign_id ? { campaignId: d.campaign_id } : {}) },
      });
    } else {
      router.back();
    }
  };

  const done = () => {
    if (d?.masjid_id) {
      router.replace({ pathname: "/masjid/[id]", params: { id: d.masjid_id } });
    } else {
      router.back();
    }
  };

  const Centered = ({ children }: { children: React.ReactNode }) => (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">{children}</View>
    </SafeAreaView>
  );

  if (mode === "loading") {
    return (
      <Centered>
        <ActivityIndicator color={c.primary} />
      </Centered>
    );
  }

  if (mode === "confirming") {
    return (
      <Centered>
        <ConfirmingState
          title={t("donation.confirming.title")}
          caption={t("donation.confirming.caption")}
        />
      </Centered>
    );
  }

  if (mode === "success") {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center gap-5 px-5">
          <View className="items-center gap-1">
            <Text variant="title" className="text-center text-primary">
              {t("donation.success.title")}
            </Text>
            <Text variant="body" className="text-center text-content-secondary">
              {t("donation.success.subtitle")}
            </Text>
          </View>
          <SuccessCard
            amount={f.currency(Number(d?.gross_amount ?? 0))}
            to={t("donation.amount.toMasjid", { masjid: masjidName })}
            icon={<Feather name="check" size={30} color={c.primary} />}
            actions={
              <Button
                label={t("donation.success.done")}
                className="flex-1"
                onPress={done}
              />
            }
          />
          {/* Recurring nudge (48) — offer to make this a regular gift */}
          {d ? (
            <Button
              variant="text"
              label={t("donation.success.recurringNudge")}
              leftIcon={<Feather name="repeat" size={16} color={c.primary} />}
              onPress={() =>
                router.push({
                  pathname: "/recurring-setup",
                  params: {
                    masjidId: d.masjid_id,
                    ...(d.campaign_id ? { campaignId: d.campaign_id } : {}),
                    amount: d.gross_amount,
                  },
                })
              }
            />
          ) : null}
          {d?.receipt_number ? (
            <Text variant="caption" className="text-content-secondary">
              {t("donation.success.txn", { id: d.receipt_number })}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  // failed | recovery — same skeleton, different copy/icon.
  const isFailed = mode === "failed";
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <View
          className="h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: isFailed ? `${c.error}1A` : c["primary-soft"] }}
        >
          <Feather
            name={isFailed ? "x-circle" : "alert-circle"}
            size={36}
            color={isFailed ? c.error : c.primary}
          />
        </View>
        <View className="items-center gap-1.5">
          <Text variant="title" className="text-center">
            {t(isFailed ? "donation.failed.title" : "donation.recovery.title")}
          </Text>
          <Text variant="body" className="text-center text-content-secondary">
            {t(isFailed ? "donation.failed.caption" : "donation.recovery.caption")}
          </Text>
        </View>
        {d ? (
          <View className="flex-row items-center gap-2 rounded-full bg-surface px-3.5 py-1.5">
            <Feather name="home" size={14} color={c["text-secondary"]} />
            <Text variant="caption" className="text-content-secondary">
              {`${f.currency(Number(d.gross_amount))} · ${masjidName}`}
            </Text>
          </View>
        ) : null}
      </View>
      <View className="gap-2 border-t border-border bg-surface px-4 pb-2 pt-3">
        <Button
          label={t(isFailed ? "donation.failed.retry" : "donation.recovery.retry")}
          leftIcon={<Feather name="refresh-cw" size={16} color={c["on-inverse"]} />}
          onPress={retry}
        />
        <Button
          variant="text"
          label={t(isFailed ? "donation.failed.dismiss" : "donation.recovery.checkStatus")}
          onPress={isFailed ? () => router.back() : () => void q.refetch()}
        />
      </View>
    </SafeAreaView>
  );
}

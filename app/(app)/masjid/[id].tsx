import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Banner, Button, DonateBar, EmptyState, MasjidTimesSection, SectionHeader, Stars, Text } from "@/components";
import {
  CampaignsSection,
  ContactSection,
  EventsSection,
  FacilitiesSection,
  ImamCard,
  NextPrayerCard,
  ProfileActions,
  ProfileCover,
  QnASection,
  ReviewsSlot,
  SuggestEditRow,
  VerifiedBadge,
  VisitorPhotoStrip,
} from "@/components/profile";
import { useAnsweredQuestions } from "@/hooks/useAnsweredQuestions";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCommunityPhotos } from "@/hooks/useCommunityPhotos";
import { useEvents } from "@/hooks/useEvents";
import { useFollow } from "@/hooks/useFollow";
import { useHijriDate } from "@/hooks/useHijriDate";
import { useJumah } from "@/hooks/useJumah";
import { useMasjid } from "@/hooks/useMasjid";
import { usePrayerClock } from "@/hooks/usePrayerClock";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useRecentMasjids } from "@/hooks/useRecentMasjids";
import { useReviewsSummary } from "@/hooks/useReviewsSummary";
import { ApiError } from "@/lib/api/errors";
import { useFormat } from "@/lib/i18n/format";
import { haversineMeters } from "@/lib/location/geo";
import { openDirections } from "@/lib/masjids/directions";
import { buildContactLinks } from "@/lib/masjids/profile/contactLinks";
import { presentMasjidFacilities } from "@/lib/masjids/profile/facilityPresenter";
import { azanTime } from "@/lib/prayer/clock";
import { formatClockString } from "@/lib/prayer/format";
import { useColors } from "@/lib/theme/useColors";
import { useLocation } from "@/providers/LocationProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

/**
 * 20 Masjid Profile — the convergence host. Single-scroll, prayer-times-first:
 * cover → name/verified/meta → Directions/Follow → next-prayer + times →
 * facilities/imam/contact → campaigns → visitor photos → Q&A → reviews slot →
 * suggest-edit, with a sticky Donate bar. Renders cached-first (offline-safe),
 * collapses sparse sections, and gates the contribution actions.
 */
export default function MasjidProfileScreen() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const masjidId = id ?? "";

  const { recordView } = useRecentMasjids();
  const { requireAuth } = useLoginGate();
  const { coords } = useLocation();

  const masjidQuery = useMasjid(masjidId);
  const masjid = masjidQuery.data;

  const timesQuery = usePrayerTimes(masjidId);
  const today = timesQuery.data?.dates?.[0] ?? null;
  const jumah = useJumah(masjidId).data ?? null;
  const hijri = useHijriDate();
  const clock = usePrayerClock(today);

  const campaigns = useCampaigns(masjidId).data?.items ?? [];
  const events = useEvents(masjidId).data?.items ?? [];
  const answered = useAnsweredQuestions(masjidId).data?.items ?? [];
  const reviews = useReviewsSummary(masjidId).data;
  const photosQuery = useCommunityPhotos(masjidId);
  const communityPhotos = photosQuery.data?.pages.flatMap((p) => p.items) ?? [];

  const follow = useFollow(masjidId, masjid?.name);

  // `recordView` is a fresh closure each render — call it through a ref so this
  // records once per masjid, not on every re-render.
  const recordViewRef = useRef(recordView);
  recordViewRef.current = recordView;
  useEffect(() => {
    if (masjidId) recordViewRef.current(masjidId);
  }, [masjidId]);

  // ---- Loading / hard-error (no cache) ----------------------------------
  if (masjidQuery.isLoading && !masjid) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  if (!masjid) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-lg" style={{ paddingTop: insets.top }}>
        <EmptyState
          icon={<Feather name="wifi-off" size={26} color={c.primary} />}
          title={t("masjid.profile.errorTitle")}
          caption={t("masjid.profile.errorCaption")}
          action={
            <View className="w-full gap-2 pt-1">
              <Button label={t("common.retry")} onPress={() => void masjidQuery.refetch()} />
              <Button variant="text" label={t("common.close")} onPress={() => router.back()} />
            </View>
          }
        />
      </View>
    );
  }

  const facilities = presentMasjidFacilities(masjid.facilities);
  const contactLinks = buildContactLinks(masjid.contact);
  const distanceM = coords ? haversineMeters(coords, { lat: masjid.latitude, lng: masjid.longitude }) : null;
  // Show the stale/offline banner only when the latest refetch failed with a
  // network/transport error — a 4xx (e.g. a since-deleted masjid) must not be
  // mislabeled "offline".
  const failure = masjidQuery.failureReason;
  const stale = failure instanceof ApiError && failure.isNetworkError;
  // Unclaimed proxy until Phase 8 surfaces a claimed flag (PRD-noted).
  const unclaimed = !masjid.verified;

  const goGated = (pathname: "/add-photo" | "/ask-question") =>
    requireAuth(() => router.push({ pathname, params: { masjidId } }), "community");

  // Donating is a gated action — request login first, then open the flow.
  const goDonate = (campaignId?: string) =>
    requireAuth(
      () =>
        router.push({
          pathname: "/donate/[id]",
          params: { id: masjidId, ...(campaignId ? { campaignId } : {}) },
        }),
      "donate",
    );

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCover
          photos={masjid.photos}
          onBack={() => router.back()}
          onAddPhoto={() => goGated("/add-photo")}
          onOpenGallery={(index) =>
            router.push({ pathname: "/gallery", params: { masjidId, index: String(index), source: "admin" } })
          }
        />

        <View className="gap-5 px-4 pb-2 pt-4">
          {/* Title block */}
          <View className="gap-1.5">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-[20px] font-bold text-content-primary">{masjid.name}</Text>
              <VerifiedBadge verified={masjid.verified} />
            </View>
            <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
              <View className="flex-row items-center gap-1">
                <Feather name="map-pin" size={13} color={c["text-muted"]} />
                <Text className="text-caption font-regular text-content-secondary">
                  {masjid.admin_region}
                </Text>
              </View>
              {distanceM != null ? (
                <Text className="text-caption font-regular text-content-muted">
                  · {f.distance(distanceM)}
                </Text>
              ) : null}
              {reviews?.average_rating != null && reviews.total > 0 ? (
                <View className="flex-row items-center gap-1">
                  <Stars rating={reviews.average_rating} size={13} />
                  <Text className="text-caption font-semibold text-content-primary">
                    {reviews.average_rating.toFixed(1)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <ProfileActions
            onDirections={() => void openDirections(masjid.latitude, masjid.longitude)}
            isFollowing={follow.isFollowing}
            onToggleFollow={() => requireAuth(() => follow.toggle(), "community")}
            followPending={follow.isPending}
          />

          {stale ? (
            <Banner
              variant="warning"
              icon={<Feather name="wifi-off" size={15} color="#8A6A1F" />}
              message={t("masjid.profile.staleBanner")}
            />
          ) : null}

          {unclaimed ? (
            <Banner
              variant="info"
              icon={<Feather name="info" size={15} color={c.primary} />}
              message={t("masjid.profile.unclaimedBanner")}
            />
          ) : null}

          {/* Prayer times (prayer-times-first) */}
          {clock.nextPrayer && today ? (
            <NextPrayerCard
              kicker={clock.nextPrayerKicker}
              prayerName={clock.nextPrayerLabel}
              prayerTime={formatClockString(azanTime(today, clock.nextPrayer), i18n.language)}
              countdownLabel={clock.countdownLabel}
            />
          ) : null}

          {today ? (
            <View className="gap-2.5">
              <SectionHeader
                title={t("masjid.profile.todaysPrayers")}
                action={
                  <Pressable accessibilityRole="button" onPress={() => router.push("/hijri-calendar")} hitSlop={8}>
                    <Text className="text-caption font-semibold text-primary">
                      {t("home.fullSchedule")}
                    </Text>
                  </Pressable>
                }
              />
              <MasjidTimesSection times={today} jumah={jumah} dateLabel={hijri.label} />
            </View>
          ) : null}

          <FacilitiesSection presentation={facilities} />
          {facilities.imam ? <ImamCard imam={facilities.imam} /> : null}
          <ContactSection links={contactLinks} />

          <CampaignsSection
            campaigns={campaigns}
            onOpen={(campaignId) =>
              router.push({ pathname: "/campaign/[id]", params: { id: campaignId, masjidId } })
            }
            onDonate={(campaignId) => goDonate(campaignId)}
          />

          <EventsSection
            events={events}
            onOpen={(ev) =>
              router.push({
                pathname: "/event/[id]",
                params: {
                  id: ev.event_id,
                  masjidId,
                  // The public list lacks the caller's own RSVP — the detail screen
                  // defaults it to "not going" and trusts the toggle's response.
                  e: JSON.stringify({ ...ev, masjid_name: masjid.name, is_rsvped: false }),
                },
              })
            }
          />

          <VisitorPhotoStrip
            photos={communityPhotos}
            onAddPhoto={() => goGated("/add-photo")}
            onOpenPhoto={(index) =>
              router.push({
                pathname: "/gallery",
                params: { masjidId, index: String(index), source: "community" },
              })
            }
            onEndReached={() => {
              if (photosQuery.hasNextPage && !photosQuery.isFetchingNextPage) {
                void photosQuery.fetchNextPage();
              }
            }}
          />

          <QnASection questions={answered} onAsk={() => goGated("/ask-question")} />

          <ReviewsSlot
            averageRating={reviews?.average_rating ?? null}
            total={reviews?.total ?? 0}
            preview={reviews?.items ?? []}
            onSeeAll={() => router.push({ pathname: "/reviews/[id]", params: { id: masjidId } })}
            onWrite={() =>
              requireAuth(
                () => router.push({ pathname: "/review/[id]", params: { id: masjidId } }),
                "community",
              )
            }
          />

          <SuggestEditRow
            onPress={() => router.push({ pathname: "/suggest-edit", params: { masjidId } })}
          />
        </View>
      </ScrollView>

      {masjid.donations_enabled ? (
        <View style={{ paddingBottom: insets.bottom }} className="bg-surface">
          <DonateBar
            label={t("masjid.donate.label")}
            hint={t("masjid.donate.methods")}
            action={
              <Button
                label={t("masjid.donate.cta")}
                leftIcon={<Feather name="heart" size={16} color={c["on-inverse"]} />}
                onPress={() => goDonate()}
              />
            }
          />
        </View>
      ) : null}
    </View>
  );
}

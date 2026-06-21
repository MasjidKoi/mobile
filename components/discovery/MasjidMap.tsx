import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

import { ClusterBubble } from "@/components/ClusterBubble";
import { MapPin } from "@/components/MapPin";
import { Colors } from "@/constants/theme";
import type { Coords } from "@/lib/location/types";
import {
  buildClusterIndex,
  clustersFor,
  type ClusterPoint,
  type Region,
} from "@/lib/masjids/clustering";
import type { MasjidNearbyResult } from "@/lib/masjids/types";

export type MasjidMapProps = {
  results: MasjidNearbyResult[];
  /** The resolved centre (GPS / city). Re-centres the camera when it changes. */
  center: Coords;
  selectedId: string | null;
  onSelect: (masjid: MasjidNearbyResult) => void;
  onDeselect: () => void;
  /** Whether to show the user's blue dot (permission-gated by the OS). */
  showsUserLocation?: boolean;
};

const DEFAULT_DELTA = 0.05;

/**
 * The Explore map: a `react-native-maps` view (Apple Maps on iOS via
 * PROVIDER_DEFAULT, Google on Android) with pure-JS supercluster clustering.
 * Single pins use the kit's `MapPin`; groups use `ClusterBubble` and zoom in on
 * tap. Clusters recompute on `onRegionChangeComplete`.
 */
export function MasjidMap({
  results,
  center,
  selectedId,
  onSelect,
  onDeselect,
  showsUserLocation = true,
}: MasjidMapProps) {
  const mapRef = useRef<MapView>(null);
  // On iOS both the map's tap recogniser and a marker's fire for the same tap
  // (react-native-maps sets them to recognise simultaneously), so a pin tap
  // would `onSelect` then immediately `onDeselect`. This guard lets the marker
  // selection win for that one tap while keeping tap-empty-map-to-dismiss.
  const suppressDeselect = useRef(false);
  const initialRegion = useMemo<Region>(
    () => ({
      latitude: center.lat,
      longitude: center.lng,
      latitudeDelta: DEFAULT_DELTA,
      longitudeDelta: DEFAULT_DELTA,
    }),
    // Seed once; later centre changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [region, setRegion] = useState<Region>(initialRegion);

  // Re-centre when the externally-resolved location changes (locate-me / city).
  useEffect(() => {
    mapRef.current?.animateToRegion(
      {
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      },
      350,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);

  const index = useMemo(() => buildClusterIndex(results), [results]);
  const items = useMemo(() => clustersFor(index, region), [index, region]);

  const onClusterPress = (cluster: ClusterPoint) => {
    const zoom = Math.min(index.getClusterExpansionZoom(cluster.clusterId), 18);
    const delta = 360 / 2 ** zoom;
    mapRef.current?.animateToRegion(
      {
        latitude: cluster.latitude,
        longitude: cluster.longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      350,
    );
  };

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      style={{ flex: 1 }}
      initialRegion={initialRegion}
      onRegionChangeComplete={setRegion}
      onPress={() => {
        if (suppressDeselect.current) {
          suppressDeselect.current = false;
          return;
        }
        onDeselect();
      }}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      toolbarEnabled={false}
    >
      {items.map((item) =>
        item.type === "cluster" ? (
          <Marker
            key={`cluster-${item.clusterId}`}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            onPress={() => {
              suppressDeselect.current = true;
              onClusterPress(item);
            }}
          >
            <ClusterBubble count={item.count} />
          </Marker>
        ) : (
          <Marker
            key={item.masjid.masjid_id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            onPress={() => {
              suppressDeselect.current = true;
              onSelect(item.masjid);
            }}
          >
            <MapPin
              selected={item.masjid.masjid_id === selectedId}
              icon={
                <MaterialCommunityIcons
                  name="mosque"
                  size={item.masjid.masjid_id === selectedId ? 22 : 18}
                  color={item.masjid.masjid_id === selectedId ? Colors["on-inverse"] : Colors.primary}
                />
              }
            />
          </Marker>
        ),
      )}
    </MapView>
  );
}

export default MasjidMap;

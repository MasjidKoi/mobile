import Supercluster from "supercluster";

import type { MasjidNearbyResult } from "./types";

/** react-native-maps Region (lat/lng centre + visible deltas). */
export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/** A single masjid pin on the map. */
export interface MasjidPoint {
  type: "masjid";
  masjid: MasjidNearbyResult;
  latitude: number;
  longitude: number;
}

/** A clustered group of pins; tapping it should zoom in. */
export interface ClusterPoint {
  type: "cluster";
  clusterId: number;
  count: number;
  latitude: number;
  longitude: number;
}

export type MapItem = MasjidPoint | ClusterPoint;

type ClusterProps = { masjid: MasjidNearbyResult };

/**
 * Pure-JS map clustering (no native code). Build an index from the nearby
 * results, then ask `clustersFor(region)` for the pins/clusters visible in the
 * current viewport at the current zoom. Recompute on `onRegionChangeComplete`.
 */
export function buildClusterIndex(
  results: MasjidNearbyResult[],
): Supercluster<ClusterProps> {
  const index = new Supercluster<ClusterProps>({ radius: 60, maxZoom: 16 });
  index.load(
    results.map((masjid) => ({
      type: "Feature" as const,
      properties: { masjid },
      geometry: { type: "Point" as const, coordinates: [masjid.longitude, masjid.latitude] },
    })),
  );
  return index;
}

/** Web-Mercator zoom level implied by a region's longitude span. */
export function zoomForRegion(region: Region): number {
  const zoom = Math.round(Math.log2(360 / Math.max(region.longitudeDelta, 1e-6)));
  return Math.max(0, Math.min(20, zoom));
}

export function clustersFor(index: Supercluster<ClusterProps>, region: Region): MapItem[] {
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
  // react-native-maps deltas are the FULL visible span, so the viewport is
  // centre ± delta/2.
  const halfLng = longitudeDelta / 2;
  const halfLat = latitudeDelta / 2;
  const bbox: [number, number, number, number] = [
    longitude - halfLng,
    latitude - halfLat,
    longitude + halfLng,
    latitude + halfLat,
  ];
  return index.getClusters(bbox, zoomForRegion(region)).map<MapItem>((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    if ("cluster" in feature.properties && feature.properties.cluster) {
      return {
        type: "cluster",
        clusterId: feature.properties.cluster_id,
        count: feature.properties.point_count,
        latitude: lat,
        longitude: lng,
      };
    }
    return {
      type: "masjid",
      masjid: feature.properties.masjid,
      latitude: lat,
      longitude: lng,
    };
  });
}

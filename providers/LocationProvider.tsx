import * as Location from "expo-location";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getCityById } from "@/lib/location/cities";
import {
  getPersistedLocation,
  setPersistedCity,
  setPersistedLastKnown,
} from "@/lib/location/store";
import type {
  Coords,
  LocationPermission,
  LocationSource,
  ResolvedLocation,
} from "@/lib/location/types";
import { recordPermissionDenied } from "@/lib/permissions";

interface LocationContextValue extends ResolvedLocation {
  /** Prompt for OS permission (if needed) and acquire a GPS fix; falls back to last-known/city. */
  requestLocation: () => Promise<void>;
  /** Manually pick a fallback city (the location-denied path). */
  setCity: (cityId: string) => Promise<void>;
  /** Drop the manual city; revert to last-known GPS if available. */
  clearCity: () => Promise<void>;
  /** Re-acquire a GPS fix (permission must already be granted; no prompt). */
  refresh: () => Promise<void>;
}

const LocationContext = createContext<LocationContextValue | null>(null);

function toPermission(status: Location.PermissionStatus): LocationPermission {
  if (status === Location.PermissionStatus.GRANTED) return "granted";
  if (status === Location.PermissionStatus.DENIED) return "denied";
  return "undetermined";
}

/**
 * The single location authority (GPS + permission state + city fallback) shared
 * by Discovery, nearest-masjid and (later) Qibla. It is **lazy**: on mount it
 * only does a silent permission check (no prompt) and seeds coords from the
 * cheapest persisted fallback, so screens that never call `requestLocation()`
 * pay nothing. GPS is acquired only when `requestLocation()`/`refresh()` runs.
 */
export function LocationProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [source, setSource] = useState<LocationSource>("none");
  const [permission, setPermission] = useState<LocationPermission>("undetermined");
  const [isResolving, setIsResolving] = useState(false);
  const [cityId, setCityId] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // On mount: silent permission status (never prompts) + seed from persistence.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [persisted, perm] = await Promise.all([
        getPersistedLocation(),
        Location.getForegroundPermissionsAsync().catch(() => null),
      ]);
      if (cancelled) return;
      if (perm) setPermission(toPermission(perm.status));
      const city = getCityById(persisted.cityId);
      if (city) {
        setCityId(persisted.cityId);
        setCoords(city.coords);
        setSource("city");
      } else if (persisted.lastKnown) {
        setCoords(persisted.lastKnown);
        setSource("lastKnown");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const acquireGps = useCallback(async () => {
    setIsResolving(true);
    try {
      // Fast: last-known fix first so the map can paint immediately…
      const last = await Location.getLastKnownPositionAsync().catch(() => null);
      if (mounted.current && last) {
        setCoords({ lat: last.coords.latitude, lng: last.coords.longitude });
        setSource("lastKnown");
      }
      // …then the precise current position.
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next: Coords = { lat: current.coords.latitude, lng: current.coords.longitude };
      if (mounted.current) {
        setCoords(next);
        setSource("gps");
      }
      void setPersistedLastKnown(next);
    } catch {
      // GPS unavailable — keep whatever fallback we already have.
    } finally {
      if (mounted.current) setIsResolving(false);
    }
  }, []);

  const requestLocation = useCallback(async () => {
    const res = await Location.requestForegroundPermissionsAsync();
    const perm = toPermission(res.status);
    setPermission(perm);
    if (perm === "granted") {
      await acquireGps();
    } else if (perm === "denied") {
      void recordPermissionDenied("location");
    }
  }, [acquireGps]);

  const refresh = useCallback(async () => {
    const res = await Location.getForegroundPermissionsAsync().catch(() => null);
    if (res && toPermission(res.status) === "granted") {
      await acquireGps();
    }
  }, [acquireGps]);

  const setCity = useCallback(async (id: string) => {
    const city = getCityById(id);
    if (!city) return;
    setCityId(id);
    setCoords(city.coords);
    setSource("city");
    await setPersistedCity(id);
  }, []);

  const clearCity = useCallback(async () => {
    setCityId(null);
    await setPersistedCity(null);
    const persisted = await getPersistedLocation();
    if (!mounted.current) return;
    if (persisted.lastKnown) {
      setCoords(persisted.lastKnown);
      setSource("lastKnown");
    } else {
      setCoords(null);
      setSource("none");
    }
  }, []);

  const value = useMemo<LocationContextValue>(
    () => ({
      coords,
      source,
      permission,
      isResolving,
      cityId,
      requestLocation,
      setCity,
      clearCity,
      refresh,
    }),
    [coords, source, permission, isResolving, cityId, requestLocation, setCity, clearCity, refresh],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within <LocationProvider>");
  }
  return ctx;
}

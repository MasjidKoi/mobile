import type { PhotoResponse } from "./types";

/**
 * Canonical admin-gallery order: the cover photo first, then ascending
 * `display_order`. Returns a new array (never mutates the input). Shared by the
 * profile cover and the gallery viewer so the cover thumbnail and the gallery's
 * first slide can never diverge.
 */
export function orderAdminPhotos(photos: PhotoResponse[]): PhotoResponse[] {
  return [...photos].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.display_order - b.display_order,
  );
}

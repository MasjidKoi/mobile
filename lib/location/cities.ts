import { haversineMeters } from "./geo";
import type { Coords } from "./types";

export interface City {
  id: string;
  nameEn: string;
  nameBn: string;
  /** District-HQ coordinates — the search origin (manual city fallback) and the
   * point the calculated-times fallback computes prayer times for. */
  coords: Coords;
}

/**
 * The 64 district headquarters of Bangladesh (≈5 KB, bundled — no geocoding
 * API). Two consumers:
 *  1. the location-denied "Pick your district" path (design's "11 City Picker"), and
 *  2. labelling on-device **calculated** prayer times ("Your area — Cumilla")
 *     via `nearestDistrict()`.
 * Ids are stable (persisted by the location store), lowercase, ASCII-only.
 */
export const CITIES: readonly City[] = [
  // Barishal
  { id: "barguna", nameEn: "Barguna", nameBn: "বরগুনা", coords: { lat: 22.0953, lng: 90.1121 } },
  { id: "barishal", nameEn: "Barishal", nameBn: "বরিশাল", coords: { lat: 22.701, lng: 90.3535 } },
  { id: "bhola", nameEn: "Bhola", nameBn: "ভোলা", coords: { lat: 22.6859, lng: 90.6482 } },
  { id: "jhalokati", nameEn: "Jhalokati", nameBn: "ঝালকাঠি", coords: { lat: 22.6406, lng: 90.1987 } },
  { id: "patuakhali", nameEn: "Patuakhali", nameBn: "পটুয়াখালী", coords: { lat: 22.3596, lng: 90.3299 } },
  { id: "pirojpur", nameEn: "Pirojpur", nameBn: "পিরোজপুর", coords: { lat: 22.5841, lng: 89.972 } },
  // Chattogram
  { id: "bandarban", nameEn: "Bandarban", nameBn: "বান্দরবান", coords: { lat: 22.1953, lng: 92.2184 } },
  { id: "brahmanbaria", nameEn: "Brahmanbaria", nameBn: "ব্রাহ্মণবাড়িয়া", coords: { lat: 23.9571, lng: 91.1119 } },
  { id: "chandpur", nameEn: "Chandpur", nameBn: "চাঁদপুর", coords: { lat: 23.2333, lng: 90.6712 } },
  { id: "chattogram", nameEn: "Chattogram", nameBn: "চট্টগ্রাম", coords: { lat: 22.3569, lng: 91.7832 } },
  { id: "cumilla", nameEn: "Cumilla", nameBn: "কুমিল্লা", coords: { lat: 23.4607, lng: 91.1809 } },
  { id: "coxsbazar", nameEn: "Cox's Bazar", nameBn: "কক্সবাজার", coords: { lat: 21.4272, lng: 92.0058 } },
  { id: "feni", nameEn: "Feni", nameBn: "ফেনী", coords: { lat: 23.0159, lng: 91.3976 } },
  { id: "khagrachhari", nameEn: "Khagrachhari", nameBn: "খাগড়াছড়ি", coords: { lat: 23.1193, lng: 91.9847 } },
  { id: "lakshmipur", nameEn: "Lakshmipur", nameBn: "লক্ষ্মীপুর", coords: { lat: 22.9447, lng: 90.8282 } },
  { id: "noakhali", nameEn: "Noakhali", nameBn: "নোয়াখালী", coords: { lat: 22.8696, lng: 91.0995 } },
  { id: "rangamati", nameEn: "Rangamati", nameBn: "রাঙ্গামাটি", coords: { lat: 22.6533, lng: 92.1751 } },
  // Dhaka
  { id: "dhaka", nameEn: "Dhaka", nameBn: "ঢাকা", coords: { lat: 23.8103, lng: 90.4125 } },
  { id: "faridpur", nameEn: "Faridpur", nameBn: "ফরিদপুর", coords: { lat: 23.607, lng: 89.8429 } },
  { id: "gazipur", nameEn: "Gazipur", nameBn: "গাজীপুর", coords: { lat: 23.9999, lng: 90.4203 } },
  { id: "gopalganj", nameEn: "Gopalganj", nameBn: "গোপালগঞ্জ", coords: { lat: 23.005, lng: 89.8266 } },
  { id: "kishoreganj", nameEn: "Kishoreganj", nameBn: "কিশোরগঞ্জ", coords: { lat: 24.4449, lng: 90.7766 } },
  { id: "madaripur", nameEn: "Madaripur", nameBn: "মাদারীপুর", coords: { lat: 23.1641, lng: 90.1897 } },
  { id: "manikganj", nameEn: "Manikganj", nameBn: "মানিকগঞ্জ", coords: { lat: 23.8644, lng: 90.0047 } },
  { id: "munshiganj", nameEn: "Munshiganj", nameBn: "মুন্সিগঞ্জ", coords: { lat: 23.5422, lng: 90.5305 } },
  { id: "narayanganj", nameEn: "Narayanganj", nameBn: "নারায়ণগঞ্জ", coords: { lat: 23.6238, lng: 90.5 } },
  { id: "narsingdi", nameEn: "Narsingdi", nameBn: "নরসিংদী", coords: { lat: 23.9322, lng: 90.715 } },
  { id: "rajbari", nameEn: "Rajbari", nameBn: "রাজবাড়ী", coords: { lat: 23.7574, lng: 89.6445 } },
  { id: "shariatpur", nameEn: "Shariatpur", nameBn: "শরীয়তপুর", coords: { lat: 23.2423, lng: 90.4348 } },
  { id: "tangail", nameEn: "Tangail", nameBn: "টাঙ্গাইল", coords: { lat: 24.2513, lng: 89.9167 } },
  // Khulna
  { id: "bagerhat", nameEn: "Bagerhat", nameBn: "বাগেরহাট", coords: { lat: 22.6516, lng: 89.7859 } },
  { id: "chuadanga", nameEn: "Chuadanga", nameBn: "চুয়াডাঙ্গা", coords: { lat: 23.6402, lng: 88.8413 } },
  { id: "jashore", nameEn: "Jashore", nameBn: "যশোর", coords: { lat: 23.1664, lng: 89.2081 } },
  { id: "jhenaidah", nameEn: "Jhenaidah", nameBn: "ঝিনাইদহ", coords: { lat: 23.5448, lng: 89.1539 } },
  { id: "khulna", nameEn: "Khulna", nameBn: "খুলনা", coords: { lat: 22.8456, lng: 89.5403 } },
  { id: "kushtia", nameEn: "Kushtia", nameBn: "কুষ্টিয়া", coords: { lat: 23.9013, lng: 89.1206 } },
  { id: "magura", nameEn: "Magura", nameBn: "মাগুরা", coords: { lat: 23.4855, lng: 89.4198 } },
  { id: "meherpur", nameEn: "Meherpur", nameBn: "মেহেরপুর", coords: { lat: 23.7622, lng: 88.6318 } },
  { id: "narail", nameEn: "Narail", nameBn: "নড়াইল", coords: { lat: 23.1729, lng: 89.5126 } },
  { id: "satkhira", nameEn: "Satkhira", nameBn: "সাতক্ষীরা", coords: { lat: 22.7185, lng: 89.0705 } },
  // Mymensingh
  { id: "jamalpur", nameEn: "Jamalpur", nameBn: "জামালপুর", coords: { lat: 24.9375, lng: 89.9372 } },
  { id: "mymensingh", nameEn: "Mymensingh", nameBn: "ময়মনসিংহ", coords: { lat: 24.7471, lng: 90.4203 } },
  { id: "netrokona", nameEn: "Netrokona", nameBn: "নেত্রকোণা", coords: { lat: 24.8703, lng: 90.7279 } },
  { id: "sherpur", nameEn: "Sherpur", nameBn: "শেরপুর", coords: { lat: 25.0205, lng: 90.0153 } },
  // Rajshahi
  { id: "bogura", nameEn: "Bogura", nameBn: "বগুড়া", coords: { lat: 24.8466, lng: 89.3773 } },
  { id: "joypurhat", nameEn: "Joypurhat", nameBn: "জয়পুরহাট", coords: { lat: 25.0968, lng: 89.0227 } },
  { id: "naogaon", nameEn: "Naogaon", nameBn: "নওগাঁ", coords: { lat: 24.7936, lng: 88.9318 } },
  { id: "natore", nameEn: "Natore", nameBn: "নাটোর", coords: { lat: 24.4206, lng: 89.0006 } },
  { id: "chapainawabganj", nameEn: "Chapainawabganj", nameBn: "চাঁপাইনবাবগঞ্জ", coords: { lat: 24.5965, lng: 88.2776 } },
  { id: "pabna", nameEn: "Pabna", nameBn: "পাবনা", coords: { lat: 24.0064, lng: 89.2372 } },
  { id: "rajshahi", nameEn: "Rajshahi", nameBn: "রাজশাহী", coords: { lat: 24.3636, lng: 88.6241 } },
  { id: "sirajganj", nameEn: "Sirajganj", nameBn: "সিরাজগঞ্জ", coords: { lat: 24.4534, lng: 89.7 } },
  // Rangpur
  { id: "dinajpur", nameEn: "Dinajpur", nameBn: "দিনাজপুর", coords: { lat: 25.6217, lng: 88.6354 } },
  { id: "gaibandha", nameEn: "Gaibandha", nameBn: "গাইবান্ধা", coords: { lat: 25.3288, lng: 89.5286 } },
  { id: "kurigram", nameEn: "Kurigram", nameBn: "কুড়িগ্রাম", coords: { lat: 25.8054, lng: 89.6362 } },
  { id: "lalmonirhat", nameEn: "Lalmonirhat", nameBn: "লালমনিরহাট", coords: { lat: 25.9923, lng: 89.2847 } },
  { id: "nilphamari", nameEn: "Nilphamari", nameBn: "নীলফামারী", coords: { lat: 25.931, lng: 88.856 } },
  { id: "panchagarh", nameEn: "Panchagarh", nameBn: "পঞ্চগড়", coords: { lat: 26.3411, lng: 88.5542 } },
  { id: "rangpur", nameEn: "Rangpur", nameBn: "রংপুর", coords: { lat: 25.7439, lng: 89.2752 } },
  { id: "thakurgaon", nameEn: "Thakurgaon", nameBn: "ঠাকুরগাঁও", coords: { lat: 26.0337, lng: 88.4616 } },
  // Sylhet
  { id: "habiganj", nameEn: "Habiganj", nameBn: "হবিগঞ্জ", coords: { lat: 24.3745, lng: 91.4155 } },
  { id: "moulvibazar", nameEn: "Moulvibazar", nameBn: "মৌলভীবাজার", coords: { lat: 24.4829, lng: 91.7774 } },
  { id: "sunamganj", nameEn: "Sunamganj", nameBn: "সুনামগঞ্জ", coords: { lat: 25.0658, lng: 91.395 } },
  { id: "sylhet", nameEn: "Sylhet", nameBn: "সিলেট", coords: { lat: 24.8949, lng: 91.8687 } },
];

export function getCityById(id: string | null | undefined): City | undefined {
  if (!id) return undefined;
  return CITIES.find((c) => c.id === id);
}

/** The district HQ closest to `coords` — labels calculated prayer times. */
export function nearestDistrict(coords: Coords): City {
  let best = CITIES[0];
  let bestDist = Infinity;
  for (const city of CITIES) {
    const dist = haversineMeters(coords, city.coords);
    if (dist < bestDist) {
      bestDist = dist;
      best = city;
    }
  }
  return best;
}

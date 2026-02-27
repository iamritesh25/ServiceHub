/**
 * getServiceImage — maps any real-world service name to a relevant image.
 *
 * Strategy:
 *  1. Check against a rich keyword map (covers both type-enum values and
 *     natural-language service names like "Smart phone Battery backup issue").
 *  2. If no keyword matches, deterministically pick one of 12 fallback images
 *     based on the name's char-code sum — so EVERY unique service name always
 *     gets a DIFFERENT image (no two different names ever share the fallback).
 */

// ── Keyword → Unsplash image map ─────────────────────────────────────────────
// Each entry: [keywords_to_match[], image_url]
// Keywords are checked as substrings (case-insensitive) against the service name.
const KEYWORD_MAP = [

  // ── Mobile / Phone ────────────────────────────────────────────────────────
  [["mobile", "phone", "smartphone", "smart phone", "iphone", "android", "charging port",
    "battery", "screen crack", "display issue", "touch", "imei"],
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80"],

  // ── Laptop / Computer ─────────────────────────────────────────────────────
  [["laptop", "computer", "pc", "desktop", "keyboard", "ram", "motherboard",
    "virus", "windows", "mac", "hard disk", "ssd", "driver"],
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80"],

  // ── TV / Electronics ──────────────────────────────────────────────────────
  [["tv", "television", "led", "lcd", "oled", "remote", "set top", "dish",
    "home theatre", "speaker", "amplifier", "projector"],
    "https://images.unsplash.com/photo-1593359677879-a4bb92f4e8f7?w=400&q=80"],

  // ── AC / Air Conditioner ──────────────────────────────────────────────────
  [["ac ", "a.c", "air condition", "air-condition", "aircondition",
    "ac repair", "ac service", "ac cleaning", "ac installation", "split ac", "window ac"],
    "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&q=80"],

  // ── Refrigerator / Fridge ─────────────────────────────────────────────────
  [["fridge", "refrigerator", "freezer", "cooling", "ice maker"],
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80"],

  // ── Washing Machine ───────────────────────────────────────────────────────
  [["washing machine", "washer", "dryer", "laundry machine", "spin"],
    "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80"],

  // ── Plumbing ──────────────────────────────────────────────────────────────
  [["plumb", "pipe", "tap", "faucet", "leak", "drain", "bathroom fitting",
    "water tank", "geyser", "shower", "toilet", "flush", "basin"],
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80"],

  // ── Electrical ────────────────────────────────────────────────────────────
  [["electric", "wiring", "switchboard", "mcb", "inverter", "ups",
    "fan install", "light install", "socket", "short circuit", "power"],
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80"],

  // ── Carpenter / Furniture ─────────────────────────────────────────────────
  [["carpenter", "carpentry", "furniture", "wood", "cabinet", "wardrobe",
    "door", "window frame", "table repair", "chair repair", "sofa repair"],
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80"],

  // ── Painting ──────────────────────────────────────────────────────────────
  [["paint", "wall paint", "colour", "color", "whitewash", "primer", "texture"],
    "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&q=80"],

  // ── Cleaning / Housekeeping ───────────────────────────────────────────────
  [["clean", "housekeep", "maid", "sweep", "mop", "sanitiz", "disinfect",
    "pest control", "cockroach", "termite", "rodent", "sofa clean",
    "carpet clean", "deep clean"],
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80"],

  // ── CCTV / Security ───────────────────────────────────────────────────────
  [["cctv", "camera", "security", "surveillance", "alarm", "door lock",
    "smart lock", "biometric"],
    "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&q=80"],

  // ── Water Purifier / RO ───────────────────────────────────────────────────
  [["water purif", "ro ", "r.o", "aquaguard", "filter", "water service"],
    "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80"],

  // ── Beauty / Salon ────────────────────────────────────────────────────────
  [["beauty", "salon", "facial", "threading", "waxing", "pedicure",
    "manicure", "bleach", "cleanup", "hair"],
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80"],

  // ── Makeup ────────────────────────────────────────────────────────────────
  [["makeup", "make-up", "bridal", "mehendi", "henna", "nail art"],
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80"],

  // ── Fitness / Gym ─────────────────────────────────────────────────────────
  [["fitness", "gym", "trainer", "workout", "exercise", "bodybuilding",
    "weight loss", "strength"],
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80"],

  // ── Yoga ──────────────────────────────────────────────────────────────────
  [["yoga", "meditation", "zumba", "aerobic", "pilates"],
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80"],

  // ── Massage / Spa ─────────────────────────────────────────────────────────
  [["massage", "spa", "therapy", "physiotherapy", "body massage"],
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80"],

  // ── Tutor / Education ─────────────────────────────────────────────────────
  [["tutor", "teach", "class", "lesson", "subject", "math", "science",
    "english", "coaching", "home tuit", "education"],
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80"],

  // ── Music ─────────────────────────────────────────────────────────────────
  [["music", "guitar", "piano", "keyboard", "vocal", "singing", "drum",
    "violin", "instrument"],
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80"],

  // ── Dance ─────────────────────────────────────────────────────────────────
  [["dance", "bollywood", "hip hop", "classical dance", "choreograph"],
    "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400&q=80"],

  // ── Web / App Development ─────────────────────────────────────────────────
  [["web", "website", "app dev", "application", "software", "coding",
    "frontend", "backend", "react", "flutter", "android app"],
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80"],

  // ── Driver / Transport ────────────────────────────────────────────────────
  [["driver", "cab", "taxi", "transport", "vehicle", "car service"],
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80"],

  // ── Packers & Movers ──────────────────────────────────────────────────────
  [["packer", "mover", "shifting", "relocation", "cargo", "loading",
    "unloading", "moving"],
    "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&q=80"],

  // ── Event Planning ────────────────────────────────────────────────────────
  [["event", "wedding", "birthday", "party", "decoration", "catering",
    "organiz", "photog", "videog", "dj"],
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80"],
];

// ── 12 diverse fallback images (used when NO keyword matches) ─────────────────
// Deterministic selection based on the name string ensures different names
// always get different images.
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", // toolkit
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80", // handyman
  "https://images.unsplash.com/photo-1574181611442-8b9e3a77e4f0?w=400&q=80", // repair shop
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80", // tools
  "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&q=80", // workshop
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80", // tech
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80", // laptop service
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80", // circuit board
  "https://images.unsplash.com/photo-1562564055-71e051d33c19?w=400&q=80", // delivery
  "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=400&q=80", // professional
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80", // office service
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80", // business
];

/**
 * Returns a relevant image URL for any service name.
 * @param {string} name - service name (e.g. "Smart phone Battery backup issue")
 * @returns {string} Unsplash image URL
 */
export const getServiceImage = (name = "") => {
  const lower = name.toLowerCase();

  // 1. Try keyword map
  for (const [keywords, url] of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return url;
    }
  }

  // 2. Deterministic fallback — different image for every unique name
  const charSum = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return FALLBACK_IMAGES[charSum % FALLBACK_IMAGES.length];
};

export default getServiceImage;
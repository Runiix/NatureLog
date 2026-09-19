import { fail, ok, type ActionResult } from "./result";

export const TEAMS = ["wolf", "kingfisher", "adder", "frog", "dragonfly"] as const;
export type Team = (typeof TEAMS)[number];

export const isTeam = (value: unknown): value is Team =>
  typeof value === "string" && (TEAMS as readonly string[]).includes(value);

/** Public URL of a team's portrait in the profile_icons bucket. */
export function teamImageUrl(team: Team): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile_icons/teams/${team}-portrait.jpg`;
}

/** Reverse of teamImageUrl, for the stored `team_link` column. */
export function teamFromUrl(url: string | null): Team | null {
  const match = url?.match(/\/teams\/([a-z]+)-portrait\.jpg$/);
  return match && isTeam(match[1]) ? match[1] : null;
}

export const MAX_FAVORITE_ANIMAL = 60;

export function validateFavoriteAnimal(value: unknown): ActionResult<string> {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length === 0) return fail("Favorite animal is required");
  if (text.length > MAX_FAVORITE_ANIMAL) return fail("Favorite animal is too long");
  return ok(text);
}

const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com", "instagr.am"]);

/**
 * The link is rendered as an href on a public profile, so only https links to
 * Instagram itself are accepted — anything else (javascript:, data:, a
 * look-alike domain) would be a clickable attack on every visitor. A bare
 * handle is turned into a profile URL. Empty clears the link.
 */
export function validateInstagramLink(value: unknown): ActionResult<string | null> {
  const raw = typeof value === "string" ? value.trim() : "";
  if (raw === "") return ok(null);

  const handle = raw.replace(/^@/, "");
  if (/^[A-Za-z0-9._]{1,30}$/.test(handle)) {
    return ok(`https://www.instagram.com/${handle}/`);
  }

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return fail("Invalid link");
  }
  if (url.protocol !== "https:" || !INSTAGRAM_HOSTS.has(url.hostname.toLowerCase())) {
    return fail("Only Instagram links are allowed");
  }
  url.hash = "";
  return ok(url.toString());
}

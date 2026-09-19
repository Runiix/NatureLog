/**
 * Public URL of a user's profile picture. The `profiles` bucket serves these
 * publicly (the feed and lists already relied on it); the project host comes
 * from the environment rather than being hard-coded in each component.
 */
export function avatarUrl(userId: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profiles/${userId}/ProfilePicture/ProfilePic.jpg`;
}

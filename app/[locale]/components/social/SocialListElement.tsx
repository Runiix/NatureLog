"use client";

import { Check, PersonAdd, Visibility } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import follow from "@/app/[locale]/actions/social/follow";
import type { SocialUser } from "@/app/[locale]/actions/social/getUsers";
import unfollow from "@/app/[locale]/actions/social/unfollow";
import { avatarUrl } from "@/app/[locale]/utils/avatars";
import { cn } from "@/app/[locale]/utils/cn";
import { Link } from "@/i18n/navigation";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useToast } from "../ui/Toast";

/**
 * One person in the community list. The follow button is a sibling of the
 * profile link rather than nested inside it (a button inside a link is invalid
 * and made every follow click also navigate).
 */
export default function SocialListElement({ person }: { person: SocialUser }) {
  const t = useTranslations("Social");
  const toast = useToast();
  const [isFollowing, setIsFollowing] = useState(person.isFollowing);
  const [pending, setPending] = useState(false);

  async function toggleFollow() {
    const next = !isFollowing;
    setPending(true);
    setIsFollowing(next);
    // Decide from the current state — the old handler checked the initial
    // prop, so a second click sent the same action again.
    const res = next ? await follow(person.id) : await unfollow(person.id);
    if (!res.success) {
      setIsFollowing(!next);
      toast(t("error"), "error");
    }
    setPending(false);
  }

  return (
    <Card padding="sm" className="flex items-center gap-3">
      <Link
        href={`/profilepage/${person.displayName}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Avatar
          src={person.hasAvatar ? avatarUrl(person.id) : null}
          name={person.displayName}
          alt={t("avatarAlt", { name: person.displayName })}
        />
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-fg hover:text-accent-text">
            {person.displayName}
          </span>
          <span className="flex items-center gap-1 text-sm text-fg-muted">
            <Visibility aria-hidden fontSize="inherit" />
            {t("species", { count: person.spottedCount })}
          </span>
        </span>
      </Link>
      <Button
        size="sm"
        variant={isFollowing ? "secondary" : "primary"}
        loading={pending}
        onClick={() => void toggleFollow()}
        aria-pressed={isFollowing}
        aria-label={
          isFollowing
            ? t("unfollow", { name: person.displayName })
            : t("follow", { name: person.displayName })
        }
        icon={isFollowing ? <Check /> : <PersonAdd />}
        className={cn("shrink-0", isFollowing && "hover:border-danger hover:text-danger")}
      >
        {isFollowing ? t("followingShort") : t("followShort")}
      </Button>
    </Card>
  );
}

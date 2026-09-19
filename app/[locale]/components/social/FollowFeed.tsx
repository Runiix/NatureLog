"use client";

import { DynamicFeed } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import getFeed, { type FeedEntry } from "@/app/[locale]/actions/social/getFeed";
import { ButtonLink } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { Spinner } from "../ui/Spinner";
import FollowFeedItem from "./FollowFeedItem";

const PAGE_SIZE = 10;

/** Sightings from people the user follows, newest first, loading on scroll. */
export default function FollowFeed({ socialHref }: { socialHref: string }) {
  const t = useTranslations("Social");
  const [feed, setFeed] = useState<FeedEntry[] | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const loadingMore = useRef(false);
  const { ref: sentinel, inView } = useInView({ rootMargin: "300px" });

  useEffect(() => {
    getFeed(0, PAGE_SIZE)
      .then((data) => {
        setFeed(data);
        setOffset(1);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((error) => console.error("Error loading feed:", error));
  }, []);

  useEffect(() => {
    if (!inView || !hasMore || offset === 0 || loadingMore.current) return;
    loadingMore.current = true;
    getFeed(offset, PAGE_SIZE)
      .then((data) => {
        setFeed((prev) => [...(prev ?? []), ...data]);
        setOffset((prev) => prev + 1);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((error) => console.error("Error loading more feed:", error))
      .finally(() => {
        loadingMore.current = false;
      });
  }, [inView, hasMore, offset]);

  if (feed === null) {
    return (
      <div className="flex flex-col gap-2" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <EmptyState
        icon={<DynamicFeed />}
        title={t("feedEmpty")}
        description={t("feedEmptyText")}
        action={
          <ButtonLink href={socialHref} variant="secondary" size="sm">
            {t("feedFindPeople")}
          </ButtonLink>
        }
        className="border-none px-2"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {feed.map((post) => (
        <FollowFeedItem key={post.id} post={post} />
      ))}
      {hasMore && (
        <div ref={sentinel} className="flex justify-center py-4 text-accent" aria-live="polite">
          <Spinner size="sm" label={t("feedLoadingMore")} />
        </div>
      )}
    </div>
  );
}

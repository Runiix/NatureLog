"use client";

import { Groups, SearchOff } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import getUsers, { type SocialTab, type SocialUser } from "@/app/[locale]/actions/social/getUsers";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import SocialListElement from "./SocialListElement";

const toTab = (value: string | null): SocialTab =>
  value === "following" || value === "followers" ? value : "top";

export default function SocialList() {
  const t = useTranslations("Social");
  const searchParams = useSearchParams();
  const tab = toTab(searchParams.get("following"));
  const query = searchParams.get("query") ?? "";
  const [people, setPeople] = useState<SocialUser[] | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    const current = ++generation.current;
    getUsers(tab, query)
      .then((data) => {
        if (current === generation.current) setPeople(data);
      })
      .catch((error) => console.error("Error loading users:", error));
  }, [tab, query]);

  if (people === null) {
    return (
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i}>
            <Skeleton className="h-[4.5rem]" />
          </li>
        ))}
      </ul>
    );
  }

  if (people.length === 0) {
    return query ? (
      <EmptyState icon={<SearchOff />} title={t("emptySearch")} description={t("emptySearchText")} />
    ) : (
      <EmptyState
        icon={<Groups />}
        title={
          tab === "following" ? t("noFollowing") : tab === "followers" ? t("noFollowers") : t("emptyTop")
        }
      />
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {people.map((person) => (
        <li key={person.id}>
          <SocialListElement person={person} />
        </li>
      ))}
    </ul>
  );
}

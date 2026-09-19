"use client";

import { ArrowBack, FormatListBulleted } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { User } from "@supabase/supabase-js";
import type AnimalListSummary from "@/app/[locale]/utils/AnimalListSummaryType";
import { cn } from "@/app/[locale]/utils/cn";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import AnimalList from "./AnimalList";
import AnimalListCard from "./AnimalListCard";
import CreateListButton from "./CreateListButton";

/**
 * The lists overview grid, or one list's detail when `?listId=` is set. The
 * page header (title, back link, create button) belongs to the page; this
 * renders no header of its own — it used to, which gave visitors two.
 */
export default function AnimalLists({
  data,
  user,
  spottedList,
  currUser,
  ownerName,
}: {
  data: AnimalListSummary[];
  user: User;
  spottedList: number[];
  currUser: boolean;
  ownerName: string;
}) {
  const t = useTranslations("Lists");
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const selectedId = searchParams.get("listId");
  const selected = selectedId ? data.find((list) => list.id === selectedId) ?? null : null;

  const selectList = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("listId", id);
    else params.delete("listId");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathName}?${query}` : pathName, { scroll: false });
    });
  };

  return (
    <div
      aria-busy={isPending}
      className={cn("transition-opacity", isPending && "opacity-60")}
    >
      {selected ? (
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowBack />}
            onClick={() => selectList(null)}
            className="-ml-3 self-start"
          >
            {t("backToLists")}
          </Button>
          <AnimalList
            key={selected.id}
            listId={selected.id}
            title={selected.title}
            description={selected.description}
            isPublic={selected.is_public}
            user={user}
            spottedList={spottedList}
            currUser={currUser}
            onDeleted={() => selectList(null)}
          />
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<FormatListBulleted />}
          title={currUser ? t("emptyOwnerTitle") : t("emptyVisitorTitle")}
          description={
            currUser ? t("emptyOwnerText") : t("emptyVisitorText", { name: ownerName })
          }
          action={currUser ? <CreateListButton /> : undefined}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((list) => (
            <li key={list.id}>
              <AnimalListCard list={list} onClick={() => selectList(list.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

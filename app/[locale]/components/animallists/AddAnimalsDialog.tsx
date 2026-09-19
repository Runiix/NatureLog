"use client";

import { Search } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import getAnimalListSearchItems from "@/app/[locale]/actions/animallists/getAnimalListSearchItems";
import Modal from "../general/Modal";
import { Input } from "../ui/Field";
import { Skeleton } from "../ui/Skeleton";
import type { AnimalListItemType } from "./AnimalList";
import AnimalListSearchItem from "./AnimalListSearchItem";

/**
 * Search-and-add picker for a list. Keeps the search term in local state; it
 * used to be written into the page URL, which leaked into the lists page's own
 * query string.
 */
export default function AddAnimalsDialog({
  listId,
  user,
  spottedList,
  inList,
  onChanged,
  onClose,
}: {
  listId: string;
  user: User;
  spottedList: number[];
  inList: Set<number>;
  onChanged: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("Lists");
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 250);
  const [results, setResults] = useState<AnimalListItemType[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAnimalListSearchItems(debouncedQuery)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch((error) => console.error("Error searching animals:", error));
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <Modal title={t("addAnimalTitle")} closeModal={onClose}>
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-fg-subtle"
        >
          <Search fontSize="small" />
        </span>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          className="pl-9"
          autoFocus
        />
      </div>
      <ul className="-mx-1 flex max-h-[50vh] flex-col gap-1 overflow-y-auto px-1">
        {results === null ? (
          Array.from({ length: 5 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-14 w-full" />
            </li>
          ))
        ) : results.length === 0 ? (
          <li className="py-6 text-center text-sm text-fg-muted">{t("noResults")}</li>
        ) : (
          results.map((animal) => (
            <AnimalListSearchItem
              key={animal.id}
              listId={listId}
              animalId={animal.id}
              name={animal.common_name}
              image={animal.lexicon_link}
              user={user}
              spottedList={spottedList}
              inList={inList.has(animal.id)}
              onChanged={onChanged}
            />
          ))
        )}
      </ul>
    </Modal>
  );
}

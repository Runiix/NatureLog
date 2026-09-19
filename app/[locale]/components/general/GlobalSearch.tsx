"use client";

import { AutoStories, Person, Search as SearchIcon, Summarize } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Link } from "@/i18n/navigation";
import globalSearch, { type SearchResults } from "@/app/[locale]/actions/general/globalSearch";
import { cn } from "@/app/[locale]/utils/cn";
import Modal from "./Modal";
import { Spinner } from "../ui/Spinner";

const MIN_LENGTH = 2;

type Group = {
  key: "animals" | "users" | "lists";
  icon: React.ReactNode;
  items: { href: string; label: string; detail?: string }[];
  /** Scientific names are set in italics; owner names are not. */
  italicDetail?: boolean;
};

function toGroups(results: SearchResults): Group[] {
  return [
    {
      key: "animals" as const,
      icon: <AutoStories />,
      italicDetail: true,
      items: results.animals.map((a) => ({
        href: `/animalpage/${a.name}`,
        label: a.name,
        detail: a.scientificName,
      })),
    },
    {
      key: "users" as const,
      icon: <Person />,
      items: results.users.map((u) => ({ href: `/profilepage/${u.name}`, label: u.name })),
    },
    {
      key: "lists" as const,
      icon: <Summarize />,
      items: results.lists.map((l) => ({
        href: `/animallistspage/${l.ownerName}?listId=${l.id}`,
        label: l.title,
        detail: l.ownerName,
      })),
    },
  ].filter((group) => group.items.length > 0);
}

/**
 * Nav search across species, people and lists. Opens from the nav button or
 * with Ctrl/⌘+K anywhere; results are links, so Tab/Enter work without any
 * custom key handling.
 */
export default function GlobalSearch({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("GlobalSearch");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        className="flex items-center gap-2 rounded-lg p-1 text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent xl:border xl:border-border xl:bg-surface xl:px-3 xl:py-1.5 xl:text-sm"
      >
        <SearchIcon aria-hidden fontSize="small" />
        <span className="sr-only xl:not-sr-only">{t("open")}</span>
        <kbd className="hidden rounded border border-border-muted px-1 text-xs text-fg-subtle xl:inline">
          Ctrl K
        </kbd>
      </button>
      {open && <SearchDialog signedIn={signedIn} close={() => setOpen(false)} />}
    </>
  );
}

function SearchDialog({ signedIn, close }: { signedIn: boolean; close: () => void }) {
  const t = useTranslations("GlobalSearch");
  const input = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useDebouncedCallback(async (value: string) => {
    const id = ++request.current;
    if (value.trim().length < MIN_LENGTH) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const found = await globalSearch(value);
      // A slower, older request must not overwrite newer results.
      if (id === request.current) setResults(toGroups(found));
    } catch {
      if (id === request.current) setResults([]);
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, 250);

  const tooShort = term.trim().length < MIN_LENGTH;

  return (
    <Modal
      closeModal={close}
      label={t("title")}
      initialFocus={input}
      styles="mt-[10vh] max-w-xl gap-3 self-start"
    >
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-fg-subtle"
        >
          <SearchIcon fontSize="small" />
        </span>
        <input
          ref={input}
          type="search"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            void run(event.target.value);
          }}
          placeholder={signedIn ? t("placeholder") : t("placeholderAnimals")}
          aria-label={t("title")}
          aria-describedby="global-search-status"
          className="h-11 w-full rounded-lg border border-border bg-surface pl-9 pr-9 text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2">
            <Spinner size="sm" label={t("loading")} />
          </span>
        )}
      </div>

      <p id="global-search-status" aria-live="polite" className="text-sm text-fg-muted">
        {tooShort
          ? t("hint", { min: MIN_LENGTH })
          : results && results.length === 0 && !loading
            ? t("noResults", { term: term.trim() })
            : null}
      </p>

      {!tooShort && results && results.length > 0 && (
        <div className="flex flex-col gap-4">
          {results.map((group) => (
            <section key={group.key} aria-labelledby={`global-search-${group.key}`}>
              <h3
                id={`global-search-${group.key}`}
                className="mb-1 text-xs font-semibold uppercase tracking-wide text-fg-subtle"
              >
                {t(`groups.${group.key}`)}
              </h3>
              <ul className="flex flex-col">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-sunken",
                        "focus-visible:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      )}
                    >
                      <span aria-hidden className="flex text-fg-subtle [&_svg]:h-5 [&_svg]:w-5">
                        {group.icon}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                      {item.detail && (
                        <span
                          className={cn(
                            "shrink-0 truncate text-sm text-fg-subtle",
                            group.italicDetail && "italic",
                          )}
                        >
                          {item.detail}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Modal>
  );
}

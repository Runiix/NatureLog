"use client";

import { AddCircleOutline, Tune } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { countActiveFilters } from "@/app/[locale]/utils/lexiconFilters";
import Modal from "../general/Modal";
import { Button, ButtonLink } from "../ui/Button";
import { useUrlFilters } from "./useUrlFilters";

/**
 * Filter panel container: a sticky sidebar on large screens, a dialog opened
 * from a floating button below that. Replaces a fixed off-canvas panel whose
 * toggle floated half-way down the screen.
 */
export default function LexiconFilterNav({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Lexicon");
  const [open, setOpen] = useState(false);
  const filters = useUrlFilters();
  const activeCount = countActiveFilters(filters.searchParams);

  return (
    <>
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto rounded-xl border border-border-muted bg-surface p-5">
          <h2 className="mb-4 text-lg font-semibold">{t("filters")}</h2>
          {children}
        </div>
      </aside>

      <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 lg:hidden">
        <Button
          onClick={() => setOpen(true)}
          icon={<Tune />}
          className="rounded-full shadow-raised"
          aria-label={t("openFilters")}
        >
          {t("filters")}
          {activeCount > 0 && (
            <span className="ml-1 rounded-full bg-accent-fg px-1.5 text-xs font-semibold text-accent-solid">
              {activeCount}
            </span>
          )}
        </Button>
      </div>
      {open && (
        <Modal title={t("filters")} closeModal={() => setOpen(false)}>
          {children}
          {/* The page header shows this from `lg` up; below, it would crowd the grid. */}
          <ButtonLink
            href="/suggestanimalpage"
            variant="secondary"
            size="sm"
            icon={<AddCircleOutline />}
            className="mb-4 self-start"
          >
            {t("suggestMissing")}
          </ButtonLink>
          <Button fullWidth onClick={() => setOpen(false)} className="sticky bottom-0">
            {t("showResults")}
          </Button>
        </Modal>
      )}
    </>
  );
}

"use client";

import { Close } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import useHydrated from "@/app/[locale]/utils/useHydrated";
import { cn } from "@/app/[locale]/utils/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Dialog shell: portal, backdrop, close button.
 *
 * role="dialog" with aria-modal, labelled by `title` (or `label` when the
 * content has its own heading). Escape and backdrop click close it, focus
 * moves in on open, Tab is kept inside, focus returns to the trigger on close,
 * and the page behind cannot scroll. `styles` are merged over the panel
 * defaults, so a caller can widen it (e.g. the photo lightbox).
 */
export default function Modal({
  children,
  closeModal,
  styles,
  title,
  label,
  initialFocus,
}: {
  children: React.ReactNode;
  closeModal: (open?: false) => void;
  styles?: string;
  /** Visible heading; also names the dialog for screen readers. */
  title?: React.ReactNode;
  /** Accessible name when there is no `title`. */
  label?: string;
  /** Element to focus on open instead of the first focusable one. */
  initialFocus?: React.RefObject<HTMLElement | null>;
}) {
  const t = useTranslations("General");
  // The portal target only exists in the browser.
  const mounted = useHydrated();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(closeModal);
  const initialFocusRef = useRef(initialFocus);
  useEffect(() => {
    closeRef.current = closeModal;
  });

  useEffect(() => {
    if (!mounted) return;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const first =
      initialFocusRef.current?.current ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 p-4 backdrop-blur-sm"
      // React events bubble through portals to the component tree, and many
      // modals live inside clickable cards: stop clicks here so they never
      // reach the card behind.
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) closeModal(false);
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : label}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl border border-border-muted bg-surface p-6 pt-12 font-normal text-fg shadow-overlay outline-none sm:p-8 sm:pt-12",
          styles,
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            closeModal(false);
          }}
          className="absolute right-2 top-2 rounded-full p-1 text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={t("close")}
        >
          <Close />
        </button>
        {title && (
          <h2 id={titleId} className="text-xl font-semibold text-fg">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

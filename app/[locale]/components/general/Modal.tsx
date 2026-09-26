"use client";

import { Close } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import useHydrated from "@/app/[locale]/utils/useHydrated";
import { cn } from "@/app/[locale]/utils/cn";
import { useToastLayer } from "@/app/[locale]/components/ui/Toast";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** True when the pointer event landed on the ::backdrop, outside the panel. */
function onBackdrop(event: React.MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;
  const rect = event.currentTarget.getBoundingClientRect();
  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  );
}

/**
 * Dialog shell: portal, backdrop, close button.
 *
 * A native <dialog> opened with showModal(), labelled by `title` (or `label`
 * when the content has its own heading). The browser makes the page behind
 * inert and keeps focus inside; Escape and backdrop click close it, focus
 * moves in on open, returns to the trigger on close, and the page behind
 * cannot scroll. `styles` are merged over the panel defaults, so a caller can
 * widen it (e.g. the photo lightbox).
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
  const panelRef = useRef<HTMLDialogElement>(null);
  const pressedBackdrop = useRef(false);
  const titleId = useId();
  const closeRef = useRef(closeModal);
  const initialFocusRef = useRef(initialFocus);
  const registerToastLayer = useToastLayer();
  useEffect(() => {
    closeRef.current = closeModal;
  });

  useEffect(() => {
    if (!mounted) return;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.showModal();
    const unregisterToastLayer = panel ? registerToastLayer?.(panel) : undefined;

    const first = initialFocusRef.current?.current ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    return () => {
      unregisterToastLayer?.();
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [mounted, registerToastLayer]);

  if (!mounted) return null;

  return createPortal(
    // React events bubble through portals to the component tree, and many
    // modals live inside clickable cards: stop clicks here so they never
    // reach the card behind. Backdrop click closes for mouse users; keyboard
    // and screen reader users have Escape and the close button.
    <dialog
      ref={panelRef}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : label}
      tabIndex={-1}
      onMouseDown={(e) => {
        pressedBackdrop.current = onBackdrop(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (pressedBackdrop.current && onBackdrop(e)) closeModal(false);
        pressedBackdrop.current = false;
      }}
      // Escape: the caller decides whether to close (it unmounts us), so the
      // browser must not close the dialog on its own. Stop it here so an outer
      // modal does not close too.
      onCancel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal(false);
      }}
      // The browser can still force-close (e.g. repeated Escape). Ask the
      // caller to close; if it refuses and keeps us mounted, reopen.
      onClose={(e) => {
        e.stopPropagation();
        closeRef.current(false);
        requestAnimationFrame(() => {
          const panel = panelRef.current;
          if (panel?.isConnected && !panel.open) panel.showModal();
        });
      }}
      className={cn(
        "w-[calc(100%-2rem)] max-h-[90vh] max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl border border-border-muted bg-surface p-6 pt-12 font-normal text-fg shadow-overlay outline-none open:flex backdrop:bg-overlay/60 backdrop:backdrop-blur-sm sm:p-8 sm:pt-12",
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
    </dialog>,
    document.body,
  );
}

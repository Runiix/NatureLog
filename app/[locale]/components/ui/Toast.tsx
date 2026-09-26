"use client";

import { CheckCircle, Close, ErrorOutline } from "@mui/icons-material";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/app/[locale]/utils/cn";

type ToastVariant = "success" | "error";
type Toast = { id: number; message: string; variant: ToastVariant };

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** Registers an open modal <dialog>; returns the unregister function. */
type RegisterLayer = (layer: HTMLElement) => () => void;
const ToastLayerContext = createContext<RegisterLayer | null>(null);

const DURATION_MS = 5000;

/**
 * Non-blocking feedback in a polite live region, replacing alert(). Errors
 * stay a little longer than confirmations and can be dismissed.
 *
 * A modal <dialog> sits in the top layer and makes the rest of the page inert,
 * so while one is open the region is mirrored into it; otherwise toasts would
 * be hidden behind the backdrop and never announced.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [layers, setLayers] = useState<HTMLElement[]>([]);
  const nextId = useRef(0);

  const registerLayer = useCallback<RegisterLayer>((layer) => {
    setLayers((current) => [...current, layer]);
    return () => setLayers((current) => current.filter((item) => item !== layer));
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, message, variant }]);
      window.setTimeout(() => dismiss(id), variant === "error" ? DURATION_MS * 1.6 : DURATION_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  const region = (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface p-4 font-normal text-fg shadow-raised",
            item.variant === "error" ? "border-danger/40" : "border-border-muted",
          )}
        >
          <span
            aria-hidden
            className={item.variant === "error" ? "text-danger" : "text-accent-text"}
          >
            {item.variant === "error" ? <ErrorOutline /> : <CheckCircle />}
          </span>
          <p className="flex-1 text-sm">{item.message}</p>
          <button
            type="button"
            onClick={() => dismiss(item.id)}
            aria-label="Meldung schließen"
            className="rounded text-fg-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Close fontSize="small" />
          </button>
        </div>
      ))}
    </div>
  );
  const topLayer = layers[layers.length - 1];

  return (
    <ToastContext.Provider value={value}>
      <ToastLayerContext.Provider value={registerLayer}>
        {children}
        {region}
        {topLayer && createPortal(region, topLayer)}
      </ToastLayerContext.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context.toast;
}

/** For Modal: register its open <dialog> so toasts render inside it. */
export function useToastLayer() {
  return useContext(ToastLayerContext);
}

"use client";

import { useSyncExternalStore } from "react";

let pending = false;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getSnapshot = () => pending;
const getServerSnapshot = () => false;

/**
 * Set by the URL-bound Search box while a new `?query=` is navigating in, so a
 * grid elsewhere on the page can show that its results are about to change.
 */
export function setSearchPending(value: boolean) {
  if (value === pending) return;
  pending = value;
  listeners.forEach((listener) => listener());
}

export default function useSearchPending() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

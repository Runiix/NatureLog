"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns false while rendering on the server and during hydration, then true.
 *
 * Use it for values that only exist in the browser (portals, `new Date()`,
 * anything locale-dependent). It replaces the `useState(false)` +
 * `useEffect(() => setMounted(true))` pattern, which triggers a second render
 * pass on every mount and trips react-hooks/set-state-in-effect.
 */
export default function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

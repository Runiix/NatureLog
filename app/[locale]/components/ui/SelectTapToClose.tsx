"use client";

import { useEffect } from "react";

/**
 * With the customizable select (`appearance: base-select`, see globals.css),
 * Chrome closes an open picker on a second mouse click but not on a second
 * tap: the tap reopens it right away. Cancelling that pointerdown and blurring
 * the select closes it. Taps on an option are left alone, so picking works.
 */
export function SelectTapToClose() {
  useEffect(() => {
    if (!CSS.supports("appearance", "base-select")) return;
    const onPointerDown = (event: PointerEvent) => {
      const select = event.target;
      if (event.pointerType === "mouse") return;
      if (!(select instanceof HTMLSelectElement) || !select.matches(":open")) return;
      event.preventDefault();
      select.blur();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  return null;
}

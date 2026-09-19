import { clsx, type ClassValue } from "clsx";
import { twMerge } from "@/utils/twMerge";

/**
 * Joins class names and resolves Tailwind conflicts so the last one wins: two
 * padding utilities reduce to the later one. Without the merge step, which of
 * two conflicting utilities applies depends on CSS source order, not on the order
 * a component and its caller wrote them.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

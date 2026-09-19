"use client";

import { ArrowBack } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/app/[locale]/utils/cn";

/** History-back button, floating over hero imagery. A real <button> now. */
export default function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  const t = useTranslations("General");
  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label={t("back")}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        className,
      )}
    >
      <ArrowBack />
    </button>
  );
}

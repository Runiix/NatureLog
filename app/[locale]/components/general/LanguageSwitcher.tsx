// app/[locale]/components/LanguageSwitcher.tsx
"use client";
import { Language } from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // Extract current locale from the pathname (assuming /en/... or /de/...)
  const currentLocale = pathname.split("/")[1];
  const otherLocale = currentLocale === "en" ? "de" : "en";

  // Replace the locale in the pathname
  const switchLocale = () => {
    const segments = pathname.split("/");
    segments[1] = otherLocale;
    router.push(segments.join("/"));
  };

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-1 text-gray-900 hover:text-gray-700 transition-all duration-300"
      aria-label="Switch Language"
    >
      <Language /> {otherLocale === "en" ? "Deutsch" : "English"}
    </button>
  );
}

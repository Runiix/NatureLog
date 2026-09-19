import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const linkClass =
    "rounded text-fg-muted hover:text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <footer className="border-t border-border-muted bg-canvas font-normal text-fg">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-accent-text">NatureLog</p>
          <p className="max-w-md text-fg-muted">
            {t("support")}{" "}
            <a
              className="font-medium text-accent-text underline-offset-4 hover:underline"
              href="https://www.paypal.me/RubenLiebert"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("donate")}
            </a>
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/impressum" className={linkClass}>
            {t("imprint")}
          </Link>
          <Link href="/termsofservice" className={linkClass}>
            {t("terms")}
          </Link>
          <Link href="/contactpage" className={linkClass}>
            {t("contact")}
          </Link>
          <span className="text-fg-subtle">© Ruben Liebert {new Date().getFullYear()}</span>
        </nav>
      </div>
    </footer>
  );
}

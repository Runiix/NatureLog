import { Home, MenuBook, TravelExplore } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "./components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-24 font-normal text-fg">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div
          aria-hidden
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent-text [&_svg]:h-8 [&_svg]:w-8"
        >
          <TravelExplore />
        </div>
        <p className="text-sm font-semibold text-accent-text">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-fg-muted">{t("text")}</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" icon={<Home />}>
            {t("home")}
          </ButtonLink>
          <ButtonLink href="/lexiconpage" variant="secondary" icon={<MenuBook />}>
            {t("lexicon")}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

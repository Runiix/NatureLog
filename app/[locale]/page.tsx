import Image from "next/image";
import { ArrowDownward, Login, MenuBook } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import Nav from "./components/general/Nav";
import HomeHero from "./assets/images/HomeHero.webp";
import { createClient } from "@/utils/supabase/server";
import LandingInfo from "./components/landing/LandingInfo";
import Lexikon from "./assets/images/Lexikon.png";
import Sammlung from "./assets/images/Sammlung.png";
import Profil from "./assets/images/Profil.png";
import Community from "./assets/images/community.png";
import Lists from "./assets/images/Listen.png";
import Mobile from "./assets/images/Mobile.png";
import { getUser } from "@/app/[locale]/utils/data";
import { ButtonLink } from "./components/ui/Button";

// Copy lives in messages/*.json under Landing.features.<id>; only the images
// are code.
const FEATURES = [
  { id: "lexicon", src: Lexikon },
  { id: "collection", src: Sammlung },
  { id: "profile", src: Profil },
  { id: "community", src: Community },
  { id: "lists", src: Lists },
  { id: "app", src: Mobile },
] as const;

export default async function LandingPage() {
  const supabase = await createClient();
  const [user, t] = await Promise.all([getUser(supabase), getTranslations("Landing")]);

  return (
    <div className="w-full bg-canvas font-normal text-fg">
      <Nav user={user} />

      <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pt-16">
        <Image
          src={HomeHero}
          alt={t("heroAlt")}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        {/* The photo is arbitrary; the scrim guarantees the text contrast. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/35 to-black/75"
        />

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center text-white">
          <p className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-sm font-medium backdrop-blur">
            {t("eyebrow")}
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            {t.rich("title", {
              brand: (chunks) => <span className="text-green-400">{chunks}</span>,
            })}
          </h1>
          <p className="max-w-xl text-balance text-base text-white/85 sm:text-lg">
            {t("tagline")}
          </p>
          <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href="/loginpage" size="lg" icon={<Login />}>
              {t("ctaPrimary")}
            </ButtonLink>
            <ButtonLink
              href="/lexiconpage"
              size="lg"
              variant="secondary"
              icon={<MenuBook />}
              className="border-white/40 bg-white/10 text-white backdrop-blur hover:border-white hover:bg-white/20 hover:text-white"
            >
              {t("ctaSecondary")}
            </ButtonLink>
          </div>
        </div>

        <a
          href="#features"
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 rounded-lg px-3 py-1 text-sm text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {t("scrollHint")}
          <ArrowDownward fontSize="small" className="motion-safe:animate-bounce" />
        </a>
      </section>

      <section id="features" className="scroll-mt-16 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <header className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("featuresTitle")}
            </h2>
            <p className="mt-3 text-balance text-fg-muted sm:text-lg">{t("featuresSubtitle")}</p>
          </header>
          <ul className="mt-8 divide-y divide-border-muted">
            {FEATURES.map((feature, index) => (
              <LandingInfo
                key={feature.id}
                index={index}
                src={feature.src}
                position={index % 2 === 0 ? "left" : "right"}
                title={t(`features.${feature.id}.title`)}
                text={t(`features.${feature.id}.text`)}
                alt={t(`features.${feature.id}.alt`)}
              />
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-3xl bg-surface-gradient px-6 py-12 text-center shadow-card sm:py-16">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("closingTitle")}
          </h2>
          <p className="text-fg-muted">{t("closingText")}</p>
          <ButtonLink href="/loginpage" size="lg" icon={<Login />}>
            {t("ctaPrimary")}
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}

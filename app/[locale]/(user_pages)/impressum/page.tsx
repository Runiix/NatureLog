import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalPage from "@/app/[locale]/components/general/LegalPage";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/app/[locale]/utils/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return pageMetadata({ locale, path: "/impressum", title: t("imprintTitle"), description: t("imprintDescription") });
}

const H3 = "mt-6 text-lg font-semibold text-fg";

export default function Impressum() {
  return (
    <LegalPage>
      <h1>Impressum</h1>

      <div className="space-y-4 text-base">
        <p>
          <strong>Angaben gemäß § 5 DDG:</strong>
        </p>
        <p>
          Ruben Liebert
          <br />
          Rahserstraße 178a <br />
          41748 Viersen
          <br />
          Deutschland
        </p>

        <p>
          <strong>Kontakt:</strong>
          <br />
          E-Mail: <a href="mailto:rubenliebert@gmail.com">rubenliebert@gmail.com</a>
          <br />
          Telefon: +49 15755762809
        </p>

        <p>
          <strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</strong>
          <br />
          Ruben Liebert
          <br />
          Adresse wie oben
        </p>

        <h3 className={H3}>Zentrale Kontaktstelle nach Art. 11 und 12 DSA</h3>
        <p>
          Zentrale Kontaktstelle für Behörden, die Europäische Kommission und
          Nutzer nach der Verordnung (EU) 2022/2065 (Digital Services Act) ist:
          <br />
          E-Mail: <a href="mailto:rubenliebert@gmail.com">rubenliebert@gmail.com</a>
          <br />
          Die Kommunikation ist auf Deutsch und Englisch möglich. Rechtswidrige
          Inhalte können Sie außerdem direkt über die Meldefunktion auf der
          Website melden.
        </p>

        <h3 className={H3}>Verbraucherstreitbeilegung</h3>
        <p>
          Ich bin nicht bereit und nicht verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>

        <h3 className={H3}>Haftung für Links</h3>
        <p>
          Diese Website enthält Links zu externen Websites Dritter, auf deren
          Inhalte ich keinen Einfluss habe. Für diese fremden Inhalte ist stets
          der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Bei
          Bekanntwerden von Rechtsverletzungen werde ich derartige Links
          umgehend entfernen.
        </p>

        <p>
          Informationen zur Verarbeitung personenbezogener Daten finden Sie in
          der <Link href="/datenschutz">Datenschutzerklärung</Link>.
        </p>
      </div>
    </LegalPage>
  );
}

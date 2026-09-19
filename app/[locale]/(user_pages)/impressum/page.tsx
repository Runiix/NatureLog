import LegalPage from "@/app/[locale]/components/general/LegalPage";

export default function Impressum() {
  return (
    <LegalPage>
      <h1 >Impressum</h1>

      <div className="space-y-4 text-base">
        <p>
          <strong>Angaben gemäß § 5 TMG:</strong>
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
          E-Mail:{" "}
          <a
            href="mailto:rubenliebert@gmail.com"
           
          >
            rubenliebert@gmail.com
          </a>
          <br />
          Telefon: +49 15755762809
        </p>

        <p>
          <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong>
          <br />
          Ruben Liebert
          <br />
          Adresse wie oben
        </p>
      </div>

      <hr className="my-6 border-border-muted" />

      <h2 className="!mt-0 !text-2xl">Datenschutzerklärung</h2>

      <div className="space-y-4 text-base">
        <p>
          Der Schutz Ihrer persönlichen Daten ist mir ein besonderes Anliegen.
          Ich verarbeite Ihre Daten daher ausschließlich auf Grundlage der
          gesetzlichen Bestimmungen (DSGVO, TMG).
        </p>

        <h3 className="mt-4 text-lg font-semibold text-fg">1. Verantwortlicher</h3>
        <p>
          Verantwortlich für die Datenverarbeitung auf dieser Website ist:
          <br />
          Ruben Liebert, Rahserstraße 178a, 41748 Viersen, Deutschland
          <br />
          E-Mail:{" "}
          <a
            href="mailto:rubenliebert@gmail.com"
           
          >
            rubenliebert@gmail.com
          </a>
        </p>

        <h3 className="mt-4 text-lg font-semibold text-fg">2. Erhobene Daten</h3>
        <p>Folgende personenbezogene Daten werden verarbeitet:</p>
        <ul className="list-disc pl-5">
          <li>E-Mail-Adresse bei Registrierung</li>
          <li>Hochgeladene Bilder und zugehörige Metadaten</li>
          <li>IP-Adresse (durch Hosting- und Analysedienste)</li>
        </ul>

        <h3 className="mt-4 text-lg font-semibold text-fg">
          3. Zwecke der Datenverarbeitung
        </h3>
        <p>
          Die Daten werden zur Bereitstellung und Verbesserung der Plattform
          NatureLog verarbeitet. Eine Weitergabe der Daten an Dritte erfolgt
          nicht, außer zur Erfüllung technischer Anforderungen (siehe
          Drittanbieter).
        </p>

        <h3 className="mt-4 text-lg font-semibold text-fg">
          4. Drittanbieter und Dienste
        </h3>
        <p>Die Website nutzt folgende externe Dienste:</p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Supabase:</strong> Hosting, Datenbank und Authentifizierung
          </li>
          <li>
            <strong>OpenStreetMap:</strong> Auf dieser Website wird zur
            Darstellung von Karten der Dienst OpenStreetMap verwendet. Anbieter
            ist die OpenStreetMap Foundation, St John&apos;s Innovation Centre,
            Cowley Road, Cambridge, CB4 0WS, Großbritannien. Beim Aufruf der
            Karten werden Inhalte direkt von Servern der OpenStreetMap
            Foundation geladen. Dabei kann Ihre IP-Adresse verarbeitet werden.
            Diese Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f
            DSGVO im berechtigten Interesse an einer ansprechenden Darstellung
            unseres Online-Angebots. Weitere Informationen zum Datenschutz bei
            OpenStreetMap finden Sie unter:{" "}
            <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">
              https://wiki.osmfoundation.org/wiki/Privacy_Policy
            </a>
          </li>
        </ul>
        <p>
          Diese Anbieter können personenbezogene Daten (z.B. IP-Adresse)
          verarbeiten. Es gelten deren Datenschutzbestimmungen.
        </p>

        <h3 className="mt-4 text-lg font-semibold text-fg">5. Ihre Rechte</h3>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
          Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch.
          Bitte wenden Sie sich dazu an die oben angegebene E-Mail-Adresse.
        </p>

        <h3 className="mt-4 text-lg font-semibold text-fg">6. Freiwillige Spenden</h3>
        <p>
          <strong>Freiwillige Unterstützung via PayPal:</strong>
          <br /> Auf unserer Website bieten wir die Möglichkeit, das Projekt
          freiwillig über den Zahlungsdienstleister PayPal zu unterstützen. Bei
          einer freiwilligen Zahlung werden die zur Abwicklung notwendigen Daten
          (wie Name, E-Mail-Adresse und Zahlungsinformationen) von PayPal
          verarbeitet. Anbieter ist PayPal (Europe) S.à r.l. et Cie, S.C.A.,
          22-24 Boulevard Royal, L-2449 Luxemburg. Die Datenverarbeitung erfolgt
          auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertrag bzw.
          vorvertragliche Maßnahme) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
          Interesse an einer einfachen und sicheren Abwicklung). Weitere
          Informationen zur Datenverarbeitung durch PayPal finden Sie unter:{" "}
          <a href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer">
            https://www.paypal.com/de/webapps/mpp/ua/privacy-full
          </a>
        </p>

        <h3 className="mt-4 text-lg font-semibold text-fg">7. Änderungen</h3>
        <p>
          Ich behalte mir vor, diese Datenschutzerklärung anzupassen, um sie an
          aktuelle rechtliche Anforderungen anzupassen.
        </p>
      </div>
    </LegalPage>
  );
}

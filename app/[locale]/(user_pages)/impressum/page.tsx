import LegalPage from "@/app/[locale]/components/general/LegalPage";

const H3 = "mt-6 text-lg font-semibold text-fg";
const H4 = "mt-4 font-semibold text-fg";

function ExtLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="break-all">
      {href}
    </a>
  );
}

export default function Impressum() {
  return (
    <LegalPage>
      <h1 >Impressum</h1>

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
          <strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</strong>
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
          Mit dieser Datenschutzerklärung informiere ich Sie gemäß Art. 13 und 14
          der Datenschutz-Grundverordnung (DSGVO) darüber, welche
          personenbezogenen Daten bei der Nutzung von NatureLog verarbeitet
          werden, zu welchen Zwecken, auf welcher Rechtsgrundlage und welche
          Rechte Ihnen zustehen.
        </p>

        <h3 className={H3}>1. Verantwortlicher</h3>
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
          <br />
          Ein Datenschutzbeauftragter ist nicht bestellt, da hierzu keine
          gesetzliche Pflicht besteht.
        </p>

        <h3 className={H3}>2. Überblick über die Rechtsgrundlagen</h3>
        <p>Ich verarbeite personenbezogene Daten auf folgenden Grundlagen:</p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> (Einwilligung), sofern
            Sie in eine Verarbeitung eingewilligt haben;
          </li>
          <li>
            <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> (Vertrag), soweit die
            Verarbeitung für die Bereitstellung Ihres Nutzerkontos und der
            Funktionen von NatureLog nach den Nutzungsbedingungen erforderlich
            ist;
          </li>
          <li>
            <strong>Art. 6 Abs. 1 lit. c DSGVO</strong> (rechtliche
            Verpflichtung), z.B. beim Umgang mit gemeldeten rechtswidrigen
            Inhalten;
          </li>
          <li>
            <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> (berechtigte
            Interessen), z.B. am sicheren und stabilen Betrieb der Website und
            am Schutz der Nutzer vor rechtswidrigen Inhalten.
          </li>
        </ul>

        <h3 className={H3}>3. Hosting und Server-Logfiles</h3>
        <h4 className={H4}>Vercel</h4>
        <p>
          Die Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina,
          CA 91723, USA, gehostet. Beim Aufruf der Website verarbeitet Vercel
          automatisch technisch notwendige Daten (sog. Server-Logfiles): IP-Adresse,
          Datum und Uhrzeit des Zugriffs, aufgerufene Seite, Referrer-URL,
          Browsertyp und -version sowie Betriebssystem. Diese Daten sind
          erforderlich, um die Website auszuliefern und ihre Sicherheit und
          Stabilität zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO). Die Logfiles
          werden von Vercel nur für kurze Zeit gespeichert und anschließend
          gelöscht. Mit Vercel besteht ein Vertrag über die
          Auftragsverarbeitung (Art. 28 DSGVO). Vercel ist unter dem EU-US Data
          Privacy Framework zertifiziert; zusätzlich gelten die
          Standardvertragsklauseln der EU-Kommission. Weitere Informationen:{" "}
          <ExtLink href="https://vercel.com/legal/privacy-policy" />
        </p>
        <h4 className={H4}>Supabase</h4>
        <p>
          Datenbank, Dateispeicher (Bilder) und Anmeldung werden über Supabase
          Inc., 970 Toa Payoh North #07-04, Singapur 318992, bereitgestellt. Die
          Daten werden in einem Rechenzentrum in der Europäischen Union
          gespeichert. Mit Supabase besteht ein Vertrag über die
          Auftragsverarbeitung (Art. 28 DSGVO) einschließlich der
          Standardvertragsklauseln der EU-Kommission für den Fall, dass im
          Rahmen von Support oder Wartung ein Zugriff aus Drittländern erfolgt.
          Supabase versendet in meinem Auftrag außerdem die E-Mails zur
          Bestätigung der Registrierung und zum Zurücksetzen des Passworts.
          Weitere Informationen:{" "}
          <ExtLink href="https://supabase.com/privacy" />
        </p>

        <h3 className={H3}>4. Cookies</h3>
        <p>
          NatureLog verwendet ausschließlich technisch notwendige Cookies. Es
          werden keine Analyse-, Tracking- oder Werbe-Cookies eingesetzt und
          keine Nutzungsprofile erstellt.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Anmelde-Cookies (Supabase):</strong> halten Sie nach dem
            Login angemeldet. Sie werden beim Abmelden bzw. nach Ablauf der
            Sitzung gelöscht.
          </li>
          <li>
            <strong>Sprach-Cookie:</strong> speichert die gewählte Sprache
            (Deutsch/Englisch).
          </li>
          <li>
            <strong>Theme-Cookie:</strong> speichert die gewählte Darstellung
            (hell/dunkel/System), Speicherdauer ein Jahr.
          </li>
        </ul>
        <p>
          Das Speichern dieser Cookies ist nach § 25 Abs. 2 Nr. 2 TDDDG ohne
          Einwilligung zulässig, da sie unbedingt erforderlich sind, um den von
          Ihnen ausdrücklich gewünschten Dienst bereitzustellen. Die weitere
          Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b bzw. lit.
          f DSGVO. Sie können Cookies in Ihrem Browser jederzeit löschen; ohne
          Anmelde-Cookies ist eine Nutzung des Kontos jedoch nicht möglich.
        </p>

        <h3 className={H3}>5. Registrierung und Nutzerkonto</h3>
        <p>
          Für die Registrierung benötige ich Ihre E-Mail-Adresse, ein Passwort
          (wird ausschließlich verschlüsselt als Hash gespeichert) und einen
          Anzeigenamen. Zusätzlich werden das Registrierungsdatum und Ihre
          Rolle (z.B. Administrator) gespeichert. Die Verarbeitung ist zur
          Bereitstellung des Kontos erforderlich (Art. 6 Abs. 1 lit. b DSGVO).
          Ohne diese Angaben ist eine Registrierung nicht möglich; die Nutzung
          der öffentlich zugänglichen Seiten ist auch ohne Konto möglich.
        </p>
        <p>
          Sie können Ihr Konto jederzeit in den Einstellungen löschen. Dabei
          werden Ihre Kontodaten, Profilangaben, Sichtungen, Listen und
          hochgeladenen Bilder gelöscht, soweit keine gesetzlichen
          Aufbewahrungspflichten entgegenstehen.
        </p>

        <h3 className={H3}>6. Profil, Sammlung und öffentliche Inhalte</h3>
        <p>
          Im Rahmen der Nutzung verarbeite ich die Daten, die Sie selbst
          angeben oder erzeugen:
        </p>
        <ul className="list-disc pl-5">
          <li>
            Profilangaben (Anzeigename, Region, Lieblingstier, Link zu
            Instagram bzw. einem Team, Profilbild);
          </li>
          <li>
            gesichtete Arten mit Datum der ersten Sichtung sowie zugehörige
            Fotos;
          </li>
          <li>
            Tierlisten mit Titel, Beschreibung und – falls Sie dies angeben –
            einem Standort (Koordinaten);
          </li>
          <li>Follower-Beziehungen und Bewertungen („Upvotes“) von Listen.</li>
        </ul>
        <p>
          NatureLog ist eine Community-Plattform: Ihr Profil, Ihre Sammlung und
          Ihre Fotos sind für andere Nutzer sichtbar, sofern Sie Ihr Profil
          öffentlich stellen. Als öffentlich markierte Listen einschließlich
          eines angegebenen Standorts werden auf einer Karte für alle Besucher
          angezeigt. Bitte geben Sie deshalb keine Standorte an, die
          Rückschlüsse auf Ihre Wohnadresse zulassen. Die Sichtbarkeit können
          Sie in den Einstellungen bzw. pro Liste jederzeit ändern.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Die Daten werden
          gespeichert, bis Sie sie löschen oder Ihr Konto löschen.
        </p>

        <h3 className={H3}>7. Bild-Uploads und automatische Inhaltsprüfung</h3>
        <p>
          Bilder werden vor dem Hochladen in Ihrem Browser verkleinert. Dabei
          werden eingebettete Metadaten (EXIF-Daten wie GPS-Position,
          Aufnahmezeit oder Kameramodell) entfernt, sodass diese nicht an
          meine Server übertragen werden.
        </p>
        <p>
          Um die Plattform und ihre Nutzer vor rechtswidrigen oder
          unangemessenen Inhalten (z.B. Gewaltdarstellungen, sexuelle Inhalte)
          zu schützen, wird jedes hochgeladene Bild vor der Veröffentlichung
          automatisiert mit dem Moderationsdienst „omni-moderation“ von OpenAI
          geprüft. Anbieter ist die OpenAI Ireland Ltd., 1st Floor, The Liffey
          Trust Centre, 117-126 Sheriff Street Upper, Dublin 1, D01 YC43,
          Irland. Dabei wird ausschließlich das Bild übermittelt, nicht Ihr Name
          oder Ihre E-Mail-Adresse. Eine Verarbeitung durch die OpenAI OpCo,
          LLC in den USA ist möglich; die Übermittlung ist durch die
          Standardvertragsklauseln der EU-Kommission im Rahmen des mit OpenAI
          geschlossenen Auftragsverarbeitungsvertrags (Art. 28 DSGVO)
          abgesichert. OpenAI verwendet die übermittelten Daten nach eigenen
          Angaben nicht zum Training von KI-Modellen und speichert sie
          höchstens 30 Tage zur Erkennung von Missbrauch. Weitere
          Informationen:{" "}
          <ExtLink href="https://openai.com/policies/privacy-policy" />
        </p>
        <p>
          Das Ergebnis der Prüfung (Kategorien und Bewertungen) wird zusammen
          mit Ihrer Nutzerkennung gespeichert. Unauffällige Bilder werden
          sofort veröffentlicht. Grenzwertige Bilder werden in einem nicht
          öffentlichen Speicher zurückgehalten und von einem Administrator
          manuell geprüft, bevor sie freigegeben oder gelöscht werden.
          Eindeutig unzulässige Bilder werden automatisch abgelehnt und nicht
          gespeichert. Ist der Prüfdienst nicht erreichbar, wird das Bild
          ebenfalls manuell geprüft. Die automatische Ablehnung eines Bildes
          hat für Sie keine rechtliche oder vergleichbar erhebliche Wirkung im
          Sinne von Art. 22 DSGVO; wenn Sie eine Ablehnung für falsch halten,
          können Sie sich jederzeit an mich wenden und eine Prüfung durch einen
          Menschen verlangen.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; mein berechtigtes
          Interesse liegt im Schutz der Nutzer und der Plattform vor
          rechtswidrigen Inhalten und in der Erfüllung der Sorgfaltspflichten
          als Anbieter einer Plattform mit nutzergenerierten Inhalten
          (Verordnung (EU) 2022/2065, Digital Services Act). Die
          Prüfergebnisse werden gespeichert, solange das Bild bzw. Ihr Konto
          besteht.
        </p>

        <h3 className={H3}>8. Bildersuche mit Google Lens</h3>
        <p>
          Wenn Sie die Bildersuche nutzen, wird Ihr Foto nach der oben
          beschriebenen Prüfung in einem öffentlich abrufbaren Speicher unter
          einer zufälligen Adresse abgelegt und auf Ihren Klick hin in Google
          Lens geöffnet. Google ruft das Bild dabei über diese Adresse ab.
          Anbieter ist die Google Ireland Limited, Gordon House, Barrow Street,
          Dublin 4, Irland. Für die Verarbeitung bei Google ist Google selbst
          verantwortlich; es gilt die Datenschutzerklärung von Google:{" "}
          <ExtLink href="https://policies.google.com/privacy" />. Es wird
          jeweils nur Ihr zuletzt hochgeladenes Suchbild gespeichert; beim
          nächsten Upload bzw. beim Löschen Ihres Kontos wird es gelöscht.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, da die Funktion auf
          Ihren ausdrücklichen Wunsch ausgeführt wird.
        </p>

        <h3 className={H3}>9. Lexikon-Vorschläge und Meldungen</h3>
        <p>
          Wenn Sie Tierarten oder Bilder für das Lexikon vorschlagen oder
          Inhalte melden, werden der Inhalt Ihres Vorschlags bzw. Ihrer Meldung
          und Ihre Nutzerkennung gespeichert und von einem Administrator
          geprüft. Bilder in Vorschlägen durchlaufen die unter Ziffer 7
          beschriebene Prüfung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
          bzw. für Meldungen rechtswidriger Inhalte Art. 6 Abs. 1 lit. c DSGVO
          i.V.m. Art. 16 DSA.
        </p>

        <h3 className={H3}>10. Kontaktaufnahme per E-Mail</h3>
        <p>
          Das Kontaktformular öffnet Ihr eigenes E-Mail-Programm; es werden
          dabei keine Daten über diese Website übertragen. Wenn Sie mir eine
          E-Mail schreiben, verarbeite ich Ihre E-Mail-Adresse und den Inhalt
          Ihrer Nachricht, um Ihre Anfrage zu beantworten (Art. 6 Abs. 1 lit. b
          bzw. lit. f DSGVO). Mein E-Mail-Postfach wird von Google (Gmail)
          bereitgestellt. Die Nachrichten werden gelöscht, sobald die Anfrage
          abschließend bearbeitet ist und keine gesetzlichen
          Aufbewahrungspflichten entgegenstehen.
        </p>

        <h3 className={H3}>11. Kartendienst OpenStreetMap</h3>
        <p>
          Zur Darstellung von Karten wird der Dienst OpenStreetMap verwendet.
          Anbieter ist die OpenStreetMap Foundation, St John&apos;s Innovation
          Centre, Cowley Road, Cambridge, CB4 0WS, Großbritannien. Beim Aufruf
          einer Karte werden Kartenkacheln direkt von Servern der OpenStreetMap
          Foundation geladen; dabei wird Ihre IP-Adresse an diese übermittelt.
          Für das Vereinigte Königreich besteht ein Angemessenheitsbeschluss
          der EU-Kommission (Art. 45 DSGVO). Die Verarbeitung erfolgt auf
          Grundlage von Art. 6 Abs. 1 lit. f DSGVO im berechtigten Interesse an
          einer ansprechenden Darstellung von Kartenfunktionen. Weitere
          Informationen:{" "}
          <ExtLink href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" />
        </p>

        <h3 className={H3}>12. Freiwillige Spenden über PayPal</h3>
        <p>
          Auf der Website befindet sich ein Link, über den Sie das Projekt
          freiwillig über PayPal unterstützen können. Erst wenn Sie diesen Link
          anklicken, werden Sie zu PayPal weitergeleitet. Die zur Abwicklung
          notwendigen Daten (z.B. Name, E-Mail-Adresse, Zahlungsinformationen)
          werden dann von PayPal (Europe) S.à r.l. et Cie, S.C.A., 22-24
          Boulevard Royal, L-2449 Luxemburg, verarbeitet. Ich erhalte von
          PayPal lediglich die für die Zahlung übermittelten Angaben (z.B.
          Name, E-Mail-Adresse, Betrag). Rechtsgrundlage ist Art. 6 Abs. 1 lit.
          b DSGVO; die Zahlungsdaten werden entsprechend den steuer- und
          handelsrechtlichen Aufbewahrungsfristen gespeichert. Weitere
          Informationen:{" "}
          <ExtLink href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" />
        </p>

        <h3 className={H3}>13. Externe Links</h3>
        <p>
          Die Website enthält Links zu externen Angeboten (z.B. Instagram-Profile
          von Nutzern, Bildquellen und Lizenzen). Beim Anklicken verlassen Sie
          NatureLog; für die Datenverarbeitung auf den verlinkten Seiten ist
          deren jeweiliger Betreiber verantwortlich. Vor dem Anklicken werden
          keine Daten an diese Anbieter übermittelt.
        </p>

        <h3 className={H3}>14. Übermittlung in Drittländer</h3>
        <p>
          Soweit Daten in Länder außerhalb der EU bzw. des EWR übermittelt
          werden (insbesondere in die USA, siehe Ziffern 3 und 7), erfolgt dies
          nur, wenn ein Angemessenheitsbeschluss der EU-Kommission besteht (z.B.
          EU-US Data Privacy Framework für zertifizierte Unternehmen) oder
          geeignete Garantien nach Art. 46 DSGVO vorliegen, insbesondere die
          Standardvertragsklauseln der EU-Kommission. Eine Kopie dieser
          Garantien erhalten Sie auf Anfrage.
        </p>

        <h3 className={H3}>15. Speicherdauer</h3>
        <p>
          Soweit in dieser Erklärung nicht anders angegeben, speichere ich
          personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck
          erforderlich ist, in der Regel bis zur Löschung Ihres Kontos.
          Gesetzliche Aufbewahrungspflichten bleiben unberührt; in diesem Fall
          werden die Daten gesperrt und nach Ablauf der Frist gelöscht.
        </p>

        <h3 className={H3}>16. Ihre Rechte</h3>
        <p>Sie haben gegenüber mir folgende Rechte:</p>
        <ul className="list-disc pl-5">
          <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>
            Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft
            (Art. 7 Abs. 3 DSGVO)
          </li>
        </ul>
        <p>
          <strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Soweit ich Ihre
          Daten auf Grundlage berechtigter Interessen (Art. 6 Abs. 1 lit. f
          DSGVO) verarbeite, haben Sie das Recht, aus Gründen, die sich aus
          Ihrer besonderen Situation ergeben, jederzeit Widerspruch gegen diese
          Verarbeitung einzulegen. Ich verarbeite die Daten dann nicht mehr, es
          sei denn, ich kann zwingende schutzwürdige Gründe nachweisen, die
          Ihre Interessen, Rechte und Freiheiten überwiegen, oder die
          Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von
          Rechtsansprüchen.
        </p>
        <p>
          Zur Ausübung Ihrer Rechte genügt eine E-Mail an die oben angegebene
          Adresse.
        </p>
        <p>
          <strong>Beschwerderecht (Art. 77 DSGVO):</strong> Sie haben das
          Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Für
          mich zuständig ist die Landesbeauftragte für Datenschutz und
          Informationsfreiheit Nordrhein-Westfalen, Kavalleriestraße 2-4, 40213
          Düsseldorf,{" "}
          <ExtLink href="https://www.ldi.nrw.de" />.
        </p>

        <h3 className={H3}>17. Datensicherheit</h3>
        <p>
          Die Übertragung aller Daten zwischen Ihrem Browser und NatureLog
          erfolgt verschlüsselt per TLS (HTTPS). Der Zugriff auf gespeicherte
          Daten ist durch technische Zugriffsbeschränkungen auf das
          Erforderliche begrenzt.
        </p>

        <h3 className={H3}>18. Änderungen</h3>
        <p>
          Ich passe diese Datenschutzerklärung an, wenn sich die
          Datenverarbeitung oder die rechtlichen Anforderungen ändern. Es gilt
          die jeweils auf dieser Seite veröffentlichte Fassung.
        </p>
        <p className="text-sm text-fg-muted">Stand: September 2026</p>
      </div>
    </LegalPage>
  );
}

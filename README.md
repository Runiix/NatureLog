### NatureLog ist eine Webanwendung mit der die persönliche Anzahl an gesichteten Wildtierarten getrackt werden kann.

## Softwarestack:

- Next.js mit Typscript und Tailwind
- Supabase für auth, Datenbank und Storage

## Supabase CLI:

Die Supabase CLI wird absichtlich **nicht** als npm-devDependency geführt. Das npm-Paket `supabase` lädt beim Installieren per Install-Script eine native Binärdatei nach; das erzeugt Install-Time-Codeausführung in jedem `npm install` und wird von Supply-Chain-Scannern entsprechend bewertet. Stattdessen wird die CLI über den nativen Paketmanager installiert:

- Windows: `scoop install supabase` (nach `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git`)
- macOS/Linux: `brew install supabase/tap/supabase`

Die lokale Konfiguration liegt weiterhin in `supabase/config.toml`.

## Seiten:

- Lexikonseite: zeigt alle vorkommenden Wildtiere an (aktuell nur in Deutschland vorkommende Arten, Insekten noch nicht hinzugefügt)
- Sammlungsseite: zeigt die persönlichen gesichteten arten und erlaubt das hochladen eines Lieblingsfots für jede Art
- Profilseite: benutzerdefinierbare Profilseite mit Informationen zum Nutzer und seinen Liebelingsfotos, sowohl die Sammlung, als auch das Profile sind con anderen Nutzern einsehbar
- Landingseite: Informationen zur Anwendung
- Loginseite: Anmeldung, Registrierung und Passwort zurücksetzung

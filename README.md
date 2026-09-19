### NatureLog ist eine Webanwendung mit der die persönliche Anzahl an gesichteten Wildtierarten getrackt werden kann.

## Softwarestack:

- Next.js mit Typscript und Tailwind
- Supabase für auth, Datenbank und Storage

## Supabase CLI:

Die Supabase CLI wird absichtlich **nicht** als npm-devDependency geführt. Das npm-Paket `supabase` lädt beim Installieren per Install-Script eine native Binärdatei nach; das erzeugt Install-Time-Codeausführung in jedem `npm install` und wird von Supply-Chain-Scannern entsprechend bewertet. Stattdessen wird die CLI über den nativen Paketmanager installiert:

- Windows: `scoop install supabase` (nach `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git`)
- macOS/Linux: `brew install supabase/tap/supabase`

Die lokale Konfiguration liegt weiterhin in `supabase/config.toml`.

## Umgebungsvariablen:

In `.env.local` (lokal) und beim Hoster:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`: nur serverseitig, **ohne** `NEXT_PUBLIC_`-Präfix (Supabase Dashboard → Project Settings → API Keys). Umgeht alle RLS-Policies.
- `OPENAI_API_KEY`: für die automatische Bildprüfung (`omni-moderation-latest`, kostenlos). Ohne Key landet jedes Upload-Bild in der Admin-Warteschlange und die Bildsuche lehnt alle Bilder ab.

## Bildmoderation und Admins:

Jedes hochgeladene Bild wird serverseitig geprüft (`utils/moderation/`). Unauffällige Bilder gehen direkt online, grenzwertige landen im privaten Bucket `moderation_queue` und warten auf ein Admin, eindeutig unzulässige werden abgelehnt. Admins sehen die Warteschlange unter `/adminpage` (Link im Profil-Menü).

Admin-Rechte werden im Supabase SQL Editor vergeben:

```sql
insert into public.user_roles (user_id, role) values ('<user-uuid>', 'admin');
```

## Seiten:

- Lexikonseite: zeigt alle vorkommenden Wildtiere an (aktuell nur in Deutschland vorkommende Arten, Insekten noch nicht hinzugefügt)
- Sammlungsseite: zeigt die persönlichen gesichteten arten und erlaubt das hochladen eines Lieblingsfots für jede Art
- Profilseite: benutzerdefinierbare Profilseite mit Informationen zum Nutzer und seinen Liebelingsfotos, sowohl die Sammlung, als auch das Profile sind con anderen Nutzern einsehbar
- Landingseite: Informationen zur Anwendung
- Loginseite: Anmeldung, Registrierung und Passwort zurücksetzung

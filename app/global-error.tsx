"use client";

// Replaces the root layout when it crashes, so it cannot rely on its providers
// (translations, theme) and must render its own <html>.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="de">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 32, textAlign: "center" }}>
        <h1>Etwas ist schiefgelaufen / Something went wrong</h1>
        <button type="button" onClick={reset}>
          Erneut versuchen / Try again
        </button>
      </body>
    </html>
  );
}

import { OpenInNew } from "@mui/icons-material";

const LINKS = [
  { name: "Ornitho", href: "https://www.ornitho.de" },
  { name: "Naturgucker", href: "https://www.naturgucker.de" },
  { name: "Vogelmeldung", href: "https://www.vogelmeldung.de" },
  { name: "Waarneming", href: "https://www.waarneming.nl" },
  { name: "eBird", href: "https://ebird.org" },
];

/** External observation portals. */
export default function UseFullLinks() {
  return (
    <ul className="flex flex-col gap-1">
      {LINKS.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-fg-muted transition-colors hover:bg-surface-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {link.name}
            <OpenInNew fontSize="small" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}

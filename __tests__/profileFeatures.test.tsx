import { render, screen } from "@testing-library/react";
import { createFormatter, createTranslator } from "next-intl";
import de from "../messages/de.json";
import en from "../messages/en.json";
import { computeAchievements } from "@/app/[locale]/utils/achievements";

let locale: "de" | "en" = "de";

// The profile sections are async server components; resolve their
// translations from the real catalogues and fail on any missing key.
jest.mock("next-intl/server", () => ({
  getTranslations: (namespace: string) =>
    Promise.resolve(
      createTranslator({
        locale,
        messages: locale === "de" ? de : en,
        namespace: namespace as never,
        onError: (error) => {
          throw error;
        },
      }),
    ),
  getFormatter: () => Promise.resolve(createFormatter({ locale, timeZone: "Europe/Berlin" })),
}));
jest.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import ProfileAchievements from "@/app/[locale]/components/profile/ProfileAchievements";
import ProfileActivity from "@/app/[locale]/components/profile/ProfileActivity";

describe.each(["de", "en"] as const)("profile features render in %s", (current) => {
  beforeEach(() => {
    locale = current;
  });

  test("achievements show tiers, next steps and the overall score", async () => {
    const achievements = computeAchievements({
      sightings: Array.from({ length: 60 }, (_, i) => ({
        category: "Vogel",
        veryRare: i < 3,
        endangerment: null,
        hasPhoto: false,
      })),
      publicLists: 0,
    });
    render(await ProfileAchievements({ achievements }));
    const de = current === "de";
    // sightings silver (2) + rare bronze (1)
    expect(screen.getByText(de ? "3 von 22 Stufen erreicht" : "3 of 22 tiers earned")).toBeInTheDocument();
    expect(screen.getByText(de ? "Silber" : "Silver")).toBeInTheDocument();
    expect(screen.getByText(de ? "Gold: 60 von 100" : "Gold: 60 of 100")).toBeInTheDocument();
    expect(screen.getByText(de ? "Sichte 100 Arten." : "Spot 100 species.")).toBeInTheDocument();
    expect(screen.getByLabelText(de ? "2 von 5 Stufen" : "2 of 5 tiers")).toBeInTheDocument();
  });

  test("a maxed track says so", async () => {
    const achievements = computeAchievements({
      sightings: Array.from({ length: 400 }, () => ({
        category: "Vogel",
        veryRare: false,
        endangerment: null,
        hasPhoto: true,
      })),
      publicLists: 0,
    });
    render(await ProfileAchievements({ achievements }));
    expect(screen.getAllByText(current === "de" ? "Diamant" : "Diamond")).not.toHaveLength(0);
    expect(
      screen.getByText(current === "de" ? /400 Arten gesichtet/ : /400 species spotted/),
    ).toBeInTheDocument();
  });

  test("activity links each event to its animal", async () => {
    render(
      await ProfileActivity({
        activity: [
          { kind: "photo", animal: "Eisvogel", at: "2026-06-10T09:00:00Z" },
          { kind: "sighting", animal: "Luchs", at: "2026-05-01" },
        ],
        displayName: "anna",
        isOwner: false,
      }),
    );
    expect(screen.getByRole("link", { name: "Eisvogel" })).toHaveAttribute("href", "/animalpage/Eisvogel");
    expect(screen.getByRole("link", { name: "Luchs" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  test("activity empty state names the visitor's target", async () => {
    render(await ProfileActivity({ activity: [], displayName: "anna", isOwner: false }));
    expect(screen.getByText(/anna/)).toBeInTheDocument();
  });
});

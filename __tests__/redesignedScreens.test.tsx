import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { User } from "@supabase/supabase-js";
import de from "../messages/de.json";
import en from "../messages/en.json";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/animallistspage/anna",
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: any) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/animallistspage/anna",
}));
// Server actions are never called in these render tests.
jest.mock("@/app/[locale]/actions/animallists/addAnimalList", () => jest.fn());
jest.mock("@/app/[locale]/actions/profile/changeTeam", () => jest.fn());
jest.mock("@/app/[locale]/actions/profile/changeFavoriteAnimal", () => jest.fn());
jest.mock("@/app/[locale]/actions/profile/changeInstaLink", () => jest.fn());
jest.mock("@/app/[locale]/actions/profile/changePublicProfile", () => jest.fn());
jest.mock("@/app/[locale]/actions/auth/deleteUser", () => jest.fn());
jest.mock("@/app/[locale]/components/animallists/Map", () => () => null);

import AnimalLists from "@/app/[locale]/components/animallists/AnimalLists";
import ProfileInfos from "@/app/[locale]/components/profile/ProfileInfos";
import SettingsList from "@/app/[locale]/components/settings/SettingsList";
import { ToastProvider } from "@/app/[locale]/components/ui/Toast";
import { ThemeProvider } from "@/app/[locale]/components/ui/theme/ThemeProvider";

const user = { id: "u1", user_metadata: { displayName: "anna" } } as unknown as User;

beforeAll(() => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
});

function renderIn(locale: "de" | "en", ui: React.ReactNode) {
  // onError throws, so a missing key or bad ICU argument fails the test
  // instead of silently rendering the key path.
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === "de" ? de : en}
      onError={(error) => {
        throw error;
      }}
    >
      <ThemeProvider initialTheme="light">
        <ToastProvider>{ui}</ToastProvider>
      </ThemeProvider>
    </NextIntlClientProvider>,
  );
}

describe.each(["de", "en"] as const)("redesigned screens render in %s", (locale) => {
  test("lists: owner empty state offers to create a list", () => {
    renderIn(
      locale,
      <AnimalLists data={[]} user={user} spottedList={[]} currUser ownerName="anna" />,
    );
    const create = locale === "de" ? "Neue Liste" : "New list";
    expect(screen.getByRole("button", { name: create })).toBeInTheDocument();
  });

  test("lists: visitor empty state names the owner", () => {
    renderIn(
      locale,
      <AnimalLists data={[]} user={user} spottedList={[]} currUser={false} ownerName="ben" />,
    );
    expect(screen.getByText(/ben/)).toBeInTheDocument();
  });

  test("lists: cards are buttons with a visibility label", () => {
    renderIn(
      locale,
      <AnimalLists
        data={[
          { id: "l1", title: "Garten", description: "Vögel", is_public: true },
          { id: "l2", title: null, description: null, is_public: false },
        ]}
        user={user}
        spottedList={[]}
        currUser
        ownerName="anna"
      />,
    );
    expect(screen.getByRole("button", { name: /Garten/ })).toBeInTheDocument();
    const untitled = locale === "de" ? "Unbenannte Liste" : "Untitled list";
    expect(screen.getByRole("button", { name: new RegExp(untitled) })).toBeInTheDocument();
  });

  test("profile: stats render for owner and visitor", () => {
    const { unmount } = renderIn(
      locale,
      <ProfileInfos
        displayName="anna"
        animalCount={42}
        listsCount={3}
        teamIcon="https://x.supabase.co/storage/v1/object/public/profile_icons/teams/wolf-portrait.jpg"
        favoriteAnimal={null}
        currUser
        instaLink="https://www.instagram.com/anna/"
      />,
    );
    expect(screen.getByRole("heading", { name: "anna" })).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Wolf")).toBeInTheDocument();
    unmount();

    renderIn(
      locale,
      <ProfileInfos
        displayName="ben"
        animalCount={0}
        listsCount={0}
        teamIcon={null}
        favoriteAnimal="Luchs"
        currUser={false}
        instaLink={null}
      />,
    );
    expect(screen.getByText("Luchs")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Instagram/ })).not.toBeInTheDocument();
  });

  test("settings: switch, theme and language controls are exposed", () => {
    renderIn(locale, <SettingsList user={user} isPublic />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    expect(screen.getAllByRole("radiogroup")).toHaveLength(2);
  });
});

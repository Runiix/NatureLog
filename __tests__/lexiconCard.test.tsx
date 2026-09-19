import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import de from "../messages/de.json";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/lexiconpage",
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import LexiconCard from "@/app/[locale]/components/lexicon/LexiconCard";

const base = {
  id: 1,
  common_name: "Luchs",
  scientific_name: "Lynx lynx",
  endangerment_status: "Stark gefährdet",
  size_from: 80,
  size_to: 130,
  very_rare: false,
  imageUrl: "/lynx.jpg",
  user: null,
  spottedList: [],
};

const renderCard = (props: Partial<React.ComponentProps<typeof LexiconCard>> = {}) =>
  render(
    <NextIntlClientProvider
      locale="de"
      messages={de}
      onError={(error) => {
        throw error;
      }}
    >
      <LexiconCard {...base} sortBy={null} {...props} />
    </NextIntlClientProvider>,
  );

describe("LexiconCard", () => {
  test("links the name to the animal page and shows the scientific name by default", () => {
    renderCard();
    expect(screen.getByRole("link", { name: "Luchs" })).toHaveAttribute("href", "/animalpage/Luchs");
    expect(screen.getByText("Lynx lynx")).toBeInTheDocument();
  });

  test("the secondary line follows the active sort", () => {
    renderCard({ sortBy: "size_to" });
    expect(screen.getByText("80 – 130 cm")).toBeInTheDocument();
  });

  test("conservation status is localised", () => {
    renderCard({ sortBy: "endangerment_status" });
    expect(screen.getByText("Stark gefährdet")).toBeInTheDocument();
  });

  test("rare species get a visible badge and a screen-reader note", () => {
    renderCard({ very_rare: true });
    expect(screen.getByText("Selten")).toBeInTheDocument();
    expect(screen.getByText(/Irrgast/)).toBeInTheDocument();
  });

  test("collection controls only appear when signed in", () => {
    renderCard();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

jest.mock("@supabase/supabase-js", () => require("../__mocks__/supabase")); // Mock Supabase

import { render, screen } from "@testing-library/react";
import LexiconCard from "@/app/components/lexicon/LexiconCard"; // Adjust path if necessary
import { User } from "@supabase/supabase-js";

describe("LexiconCard Component", () => {
  const mockProps = {
    id: 1,
    common_name: "Lion",
    scientific_name: "Panthera leo",
    population_estimate: "20,000",
    endangerment_status: "Vulnerable",
    size_from: "150",
    size_to: "250",
    sortBy: "population_estimate",
    imageUrl: "/lion.jpg",
    user: null as User | null,
    spottedList: [1, 2, 3],
    animalImageExists: true,
  };

  test("renders the common name and scientific name", () => {
    render(<LexiconCard {...mockProps} />);
    expect(screen.getByText("Lion")).toBeInTheDocument();
    expect(screen.getByText("20,000")).toBeInTheDocument();
  });
});

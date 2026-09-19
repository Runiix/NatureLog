/**
 * @jest-environment node
 */
import {
  isTeam,
  teamFromUrl,
  validateFavoriteAnimal,
  validateInstagramLink,
} from "@/app/[locale]/utils/profileFields";

describe("validateInstagramLink", () => {
  test.each([
    ["@anna.birds", "https://www.instagram.com/anna.birds/"],
    ["anna_birds", "https://www.instagram.com/anna_birds/"],
    ["https://www.instagram.com/anna/", "https://www.instagram.com/anna/"],
    ["instagram.com/anna", "https://instagram.com/anna"],
    ["https://instagram.com/anna#frag", "https://instagram.com/anna"],
  ])("accepts %p", (input, expected) => {
    expect(validateInstagramLink(input)).toEqual({ success: true, data: expected, error: null });
  });

  test("empty clears the link", () => {
    expect(validateInstagramLink("  ")).toEqual({ success: true, data: null, error: null });
  });

  test.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "http://instagram.com/anna",
    "https://instagram.com.evil.example/anna",
    "https://evil.example/instagram.com",
    "https://user@evil.example",
    "not a url at all!",
  ])("rejects %p", (input) => {
    expect(validateInstagramLink(input).success).toBe(false);
  });
});

describe("validateFavoriteAnimal", () => {
  test("trims and bounds", () => {
    expect(validateFavoriteAnimal("  Luchs ")).toMatchObject({ success: true, data: "Luchs" });
    expect(validateFavoriteAnimal("   ").success).toBe(false);
    expect(validateFavoriteAnimal("x".repeat(61)).success).toBe(false);
  });
});

describe("teams", () => {
  test("only known teams are accepted", () => {
    expect(isTeam("wolf")).toBe(true);
    expect(isTeam("../../evil")).toBe(false);
    expect(isTeam("Wolf")).toBe(false);
  });

  test("the stored URL maps back to its team", () => {
    expect(
      teamFromUrl("https://x.supabase.co/storage/v1/object/public/profile_icons/teams/frog-portrait.jpg"),
    ).toBe("frog");
    expect(teamFromUrl("https://x/teams/evil-portrait.jpg")).toBeNull();
    expect(teamFromUrl(null)).toBeNull();
  });
});

/**
 * @jest-environment node
 */
import {
  EMPTY_ANIMAL_FORM,
  parseAnimalFields,
  parseDescription,
  toFormValues,
  type AnimalFormValues,
} from "@/utils/lexicon/animalFields";

const valid: AnimalFormValues = {
  ...EMPTY_ANIMAL_FORM,
  common_name: "Rotfuchs",
  scientific_name: "Vulpes vulpes",
  category: "Säugetier",
  taxonomic_order: "Raubtiere (Carnivora)",
  endangerment_status: "Vorwarnliste",
  size_from: "60",
  size_to: "90",
  colors: ["orange", "white"],
  similar_animals: "Goldschakal, Marderhund",
};

describe("parseAnimalFields", () => {
  test("accepts a complete animal and normalises it", () => {
    const result = parseAnimalFields(valid);
    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        common_name: "Rotfuchs",
        endangerment_order: 3,
        size_from: 60,
        size_to: 90,
        colors: "orange,white",
        similar_animals: ["Goldschakal", "Marderhund"],
        very_rare: false,
        description: null,
      }),
    });
  });

  test("requires names, group and status", () => {
    const result = parseAnimalFields(EMPTY_ANIMAL_FORM);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toMatchObject({
      common_name: "required",
      scientific_name: "required",
      category: "required",
      endangerment_status: "required",
    });
  });

  test("refuses names that would break the animal page URL", () => {
    const result = parseAnimalFields({ ...valid, common_name: "Fuchs/Wolf" });
    expect(result).toMatchObject({ ok: false, errors: { common_name: "invalid" } });
  });

  test("refuses values outside the lexicon vocabulary", () => {
    const result = parseAnimalFields({
      ...valid,
      category: "Fisch",
      endangerment_status: "Unklar",
      colors: ["pink"],
    });
    expect(result).toMatchObject({
      ok: false,
      errors: { category: "invalid", endangerment_status: "invalid", colors: "invalid" },
    });
  });

  test("requires an order from the group's list, and drops it for groups without one", () => {
    expect(parseAnimalFields({ ...valid, taxonomic_order: "" })).toMatchObject({
      ok: false,
      errors: { taxonomic_order: "required" },
    });
    expect(parseAnimalFields({ ...valid, taxonomic_order: "Strigiformes – Eulen" })).toMatchObject({
      ok: false,
      errors: { taxonomic_order: "invalid" },
    });
    expect(
      parseAnimalFields({ ...valid, category: "Insekt", taxonomic_order: "anything" }),
    ).toMatchObject({ ok: true, value: { taxonomic_order: null } });
  });

  test("checks the size range", () => {
    expect(parseAnimalFields({ ...valid, size_from: "90", size_to: "60" })).toMatchObject({
      ok: false,
      errors: { size_to: "sizeOrder" },
    });
    expect(parseAnimalFields({ ...valid, size_to: "" })).toMatchObject({
      ok: false,
      errors: { size_to: "required" },
    });
    expect(parseAnimalFields({ ...valid, size_from: "abc" })).toMatchObject({
      ok: false,
      errors: { size_from: "invalid" },
    });
  });

  test("drops credit and licence unless the caller is the admin form", () => {
    const withCredit = {
      ...valid,
      image_credit_text: "Someone",
      image_credit_link: "https://example.org",
    };
    expect(parseAnimalFields(withCredit)).toMatchObject({
      ok: true,
      value: { image_credit_text: null, image_credit_link: null },
    });
    expect(parseAnimalFields(withCredit, { allowCredit: true })).toMatchObject({
      ok: true,
      value: { image_credit_text: "Someone", image_credit_link: "https://example.org" },
    });
    expect(
      parseAnimalFields({ ...withCredit, image_credit_link: "javascript:alert(1)" }, { allowCredit: true }),
    ).toMatchObject({ ok: false, errors: { image_credit_link: "invalid" } });
  });

  test("round-trips through the form values", () => {
    const parsed = parseAnimalFields(valid);
    if (!parsed.ok) throw new Error("expected valid");
    expect(parseAnimalFields(toFormValues(parsed.value))).toEqual(parsed);
  });
});

describe("parseDescription", () => {
  test("trims and accepts a real description", () => {
    expect(parseDescription("  Der Rotfuchs ist der häufigste Wildhund.  ")).toEqual({
      ok: true,
      value: "Der Rotfuchs ist der häufigste Wildhund.",
    });
  });

  test.each([
    [null, "required"],
    ["   ", "required"],
    ["zu kurz", "tooShort"],
    ["x".repeat(5001), "tooLong"],
  ])("refuses %p", (input, error) => {
    expect(parseDescription(input)).toEqual({ ok: false, error });
  });
});

import {
  COLOR_VALUES,
  ENDANGERMENT,
  GENERA,
  isInvertebrate,
  ORDERS_BY_GENUS,
} from "@/app/[locale]/utils/lexiconFilters";
import type { TablesInsert, TypedSupabaseClient } from "@/utils/supabase/types";

/**
 * Validation for animal data coming from users and admins: the "suggest a
 * missing animal" form, an admin's edits before approving, and the admin's
 * "new animal" form all go through `parseAnimalFields`. Pure, so the same
 * rules run in the browser (inline errors) and on the server (the real check).
 */

/** The animal columns a form can set. Images are handled separately. */
export type AnimalFields = Omit<
  TablesInsert<"animals">,
  "id" | "created_at" | "image_link" | "lexicon_link"
>;

/** What the form holds while it is being edited: text inputs, one per column. */
export type AnimalFormValues = {
  common_name: string;
  scientific_name: string;
  category: string;
  taxonomic_order: string;
  endangerment_status: string;
  description: string;
  habitat: string;
  population_estimate: string;
  presence_time: string;
  sexual_dimorphism: string;
  size_from: string;
  size_to: string;
  colors: string[];
  /** Comma-separated common names. */
  similar_animals: string;
  very_rare: boolean;
  image_credit_text: string;
  image_credit_link: string;
  image_license_text: string;
  image_license_link: string;
};

export const EMPTY_ANIMAL_FORM: AnimalFormValues = {
  common_name: "",
  scientific_name: "",
  category: "",
  taxonomic_order: "",
  endangerment_status: "",
  description: "",
  habitat: "",
  population_estimate: "",
  presence_time: "",
  sexual_dimorphism: "",
  size_from: "",
  size_to: "",
  colors: [],
  similar_animals: "",
  very_rare: false,
  image_credit_text: "",
  image_credit_link: "",
  image_license_text: "",
  image_license_link: "",
};

/** Prefills the form from stored values (a submission's data or an animal row). */
export function toFormValues(fields: Partial<AnimalFields> | null | undefined): AnimalFormValues {
  const text = (value: unknown) => (typeof value === "string" ? value : "");
  const number = (value: unknown) => (typeof value === "number" ? String(value) : "");
  if (!fields) return EMPTY_ANIMAL_FORM;
  return {
    common_name: text(fields.common_name),
    scientific_name: text(fields.scientific_name),
    category: text(fields.category),
    taxonomic_order: text(fields.taxonomic_order),
    endangerment_status: text(fields.endangerment_status),
    description: text(fields.description),
    habitat: text(fields.habitat),
    population_estimate: text(fields.population_estimate),
    presence_time: text(fields.presence_time),
    sexual_dimorphism: text(fields.sexual_dimorphism),
    size_from: number(fields.size_from),
    size_to: number(fields.size_to),
    colors: text(fields.colors).split(",").filter((color) => COLOR_VALUES.includes(color)),
    similar_animals: Array.isArray(fields.similar_animals) ? fields.similar_animals.join(", ") : "",
    very_rare: fields.very_rare === true,
    image_credit_text: text(fields.image_credit_text),
    image_credit_link: text(fields.image_credit_link),
    image_license_text: text(fields.image_license_text),
    image_license_link: text(fields.image_license_link),
  };
}

export type FieldError = "required" | "tooLong" | "tooShort" | "invalid" | "sizeOrder";
export type AnimalFieldErrors = Partial<Record<keyof AnimalFormValues, FieldError>>;

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: AnimalFieldErrors };

export const DESCRIPTION_MIN = 20;
export const DESCRIPTION_MAX = 5000;
const NAME_MAX = 100;
const SHORT_TEXT_MAX = 200;
const LONG_TEXT_MAX = 1000;
const URL_MAX = 500;
const SIZE_LIMIT_CM = 10000;
const SIMILAR_MAX = 10;
/** The name is the animal page's URL segment, so it must survive a round trip. */
const NAME_FORBIDDEN = /[/\\%?#]/;

export type DescriptionResult = { ok: true; value: string } | { ok: false; error: FieldError };

export function parseDescription(value: unknown): DescriptionResult {
  if (typeof value !== "string") return { ok: false, error: "required" };
  const text = value.trim();
  if (text.length === 0) return { ok: false, error: "required" };
  if (text.length < DESCRIPTION_MIN) return { ok: false, error: "tooShort" };
  if (text.length > DESCRIPTION_MAX) return { ok: false, error: "tooLong" };
  return { ok: true, value: text };
}

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Checks and normalises animal columns. Accepts the form's values or stored
 * JSON (numbers, arrays). Credit and licence columns are kept only with
 * `allowCredit` (the admin form); for everyone else they are set by the
 * server, never taken from input.
 */
export function parseAnimalFields(
  input: unknown,
  { allowCredit = false }: { allowCredit?: boolean } = {},
): ParseResult<AnimalFields> {
  const source = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const errors: AnimalFieldErrors = {};

  const text = (key: keyof AnimalFormValues) => {
    const value = source[key];
    return typeof value === "string" ? value.trim() : "";
  };

  const optionalText = (key: keyof AnimalFormValues, max: number) => {
    const value = text(key);
    if (value.length > max) errors[key] = "tooLong";
    return value === "" ? null : value;
  };

  const name = (key: "common_name" | "scientific_name") => {
    const value = text(key);
    if (value === "") errors[key] = "required";
    else if (value.length > NAME_MAX) errors[key] = "tooLong";
    else if (NAME_FORBIDDEN.test(value)) errors[key] = "invalid";
    return value;
  };

  const common_name = name("common_name");
  const scientific_name = name("scientific_name");

  const category = text("category");
  if (category === "") errors.category = "required";
  else if (!(GENERA as readonly string[]).includes(category)) errors.category = "invalid";

  // Groups with a known list of orders must pick one; the others have none.
  const orders = ORDERS_BY_GENUS[category];
  let taxonomic_order: string | null = text("taxonomic_order") || null;
  if (orders) {
    if (!taxonomic_order) errors.taxonomic_order = "required";
    else if (!orders.includes(taxonomic_order)) errors.taxonomic_order = "invalid";
  } else {
    taxonomic_order = null;
  }

  // Most invertebrates have no Rote Liste rating, so they may leave it empty.
  const endangerment_status = text("endangerment_status") || null;
  const statusIndex = (ENDANGERMENT as readonly string[]).indexOf(endangerment_status ?? "");
  if (endangerment_status === null) {
    if (!isInvertebrate(category)) errors.endangerment_status = "required";
  } else if (statusIndex < 0) errors.endangerment_status = "invalid";

  const description = optionalText("description", DESCRIPTION_MAX);

  const size = (key: "size_from" | "size_to") => {
    const raw = source[key];
    if (raw === null || raw === undefined || raw === "") return null;
    const value = typeof raw === "number" ? raw : Number(String(raw).replace(",", "."));
    if (!Number.isFinite(value) || value <= 0 || value > SIZE_LIMIT_CM) {
      errors[key] = "invalid";
      return null;
    }
    return value;
  };
  const size_from = size("size_from");
  const size_to = size("size_to");
  if ((size_from === null) !== (size_to === null) && !errors.size_from && !errors.size_to) {
    errors[size_from === null ? "size_from" : "size_to"] = "required";
  }
  if (size_from !== null && size_to !== null && size_from > size_to) errors.size_to = "sizeOrder";

  const rawColors = Array.isArray(source.colors)
    ? source.colors
    : typeof source.colors === "string"
      ? source.colors.split(",")
      : [];
  const colorList = [...new Set(rawColors.map((color) => String(color).trim()).filter(Boolean))];
  if (colorList.some((color) => !COLOR_VALUES.includes(color))) errors.colors = "invalid";

  const rawSimilar = Array.isArray(source.similar_animals)
    ? source.similar_animals
    : typeof source.similar_animals === "string"
      ? source.similar_animals.split(",")
      : [];
  const similar = [...new Set(rawSimilar.map((entry) => String(entry).trim()).filter(Boolean))];
  if (similar.length > SIMILAR_MAX) errors.similar_animals = "tooLong";
  else if (similar.some((entry) => entry.length > NAME_MAX || NAME_FORBIDDEN.test(entry))) {
    errors.similar_animals = "invalid";
  }

  const credit = (key: keyof AnimalFormValues, isLink: boolean) => {
    if (!allowCredit) return null;
    const value = optionalText(key, isLink ? URL_MAX : SHORT_TEXT_MAX);
    if (value && isLink && !isHttpsUrl(value)) errors[key] = "invalid";
    return value;
  };

  const value: AnimalFields = {
    common_name,
    scientific_name,
    category,
    taxonomic_order,
    endangerment_status,
    endangerment_order: statusIndex >= 0 ? statusIndex + 1 : null,
    description,
    habitat: optionalText("habitat", LONG_TEXT_MAX),
    population_estimate: optionalText("population_estimate", SHORT_TEXT_MAX),
    presence_time: optionalText("presence_time", SHORT_TEXT_MAX),
    sexual_dimorphism: optionalText("sexual_dimorphism", SHORT_TEXT_MAX),
    size_from,
    size_to,
    colors: colorList.length ? colorList.join(",") : null,
    similar_animals: similar.length ? similar : null,
    very_rare: source.very_rare === true || source.very_rare === "true",
    image_credit_text: credit("image_credit_text", false),
    image_credit_link: credit("image_credit_link", true),
    image_license_text: credit("image_license_text", false),
    image_license_link: credit("image_license_link", true),
  };

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

/** Case-insensitive check whether an animal with this name already exists. */
export async function nameTaken(supabase: TypedSupabaseClient, name: string): Promise<boolean> {
  const pattern = name.replace(/[\\%_]/g, (char) => `\\${char}`);
  const { data, error } = await supabase
    .from("animals")
    .select("id")
    .ilike("common_name", pattern)
    .limit(1);
  if (error) throw new Error(`Name check failed: ${error.message}`);
  return data.length > 0;
}

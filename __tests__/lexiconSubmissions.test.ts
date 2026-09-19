/**
 * @jest-environment node
 */
import approveLexiconSubmission from "@/app/[locale]/actions/admin/approveLexiconSubmission";
import createAnimal from "@/app/[locale]/actions/admin/createAnimal";
import rejectLexiconSubmission from "@/app/[locale]/actions/admin/rejectLexiconSubmission";
import submitLexiconSuggestion from "@/app/[locale]/actions/lexicon/submitLexiconSuggestion";

/**
 * A stand-in for the caller's Supabase client. Every query is recorded and
 * answered by `mockRespond`, so each test decides what the database (and its
 * row-level policies) would say.
 */
type Call = {
  table: string;
  op: "select" | "insert" | "update" | "delete";
  payload: unknown;
  filters: Record<string, unknown>;
};
type Reply = { data?: unknown; error?: { code?: string; message: string } | null };

const mockCalls: Call[] = [];
const mockStorage: { bucket: string; op: string; paths: string[] }[] = [];
let mockRespond: (call: Call) => Reply = () => ({ data: null, error: null });

function mockClient() {
  return {
    from(table: string) {
      const call: Call = { table, op: "select", payload: null, filters: {} };
      const settle = () => {
        mockCalls.push(call);
        const reply = mockRespond(call);
        return Promise.resolve({ data: reply.data ?? null, error: reply.error ?? null });
      };
      const builder = {
        select: () => builder,
        insert: (payload: unknown) => Object.assign(call, { op: "insert", payload }) && builder,
        update: (payload: unknown) => Object.assign(call, { op: "update", payload }) && builder,
        delete: () => Object.assign(call, { op: "delete" }) && builder,
        eq: (key: string, value: unknown) => {
          call.filters[key] = value;
          return builder;
        },
        match: (values: Record<string, unknown>) => {
          Object.assign(call.filters, values);
          return builder;
        },
        ilike: (key: string, value: unknown) => {
          call.filters[key] = value;
          return builder;
        },
        in: () => builder,
        order: () => builder,
        limit: () => builder,
        maybeSingle: settle,
        then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
          settle().then(resolve, reject),
      };
      return builder;
    },
    storage: {
      from(bucket: string) {
        return {
          upload: (path: string) => {
            mockStorage.push({ bucket, op: "upload", paths: [path] });
            return Promise.resolve({ error: null });
          },
          remove: (paths: string[]) => {
            mockStorage.push({ bucket, op: "remove", paths });
            return Promise.resolve({ error: null });
          },
          download: () =>
            Promise.resolve({ data: new Blob(["x"], { type: "image/jpeg" }), error: null }),
          getPublicUrl: (path: string) => ({ data: { publicUrl: `https://cdn/${bucket}/${path}` } }),
        };
      },
    },
  };
}

const mockSupabase = mockClient();
const mockCheckImage = jest.fn();

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/utils/supabase/requireAuth", () => ({
  __esModule: true,
  default: () => Promise.resolve({ supabase: mockSupabase, user: { id: "user-1" } }),
}));
jest.mock("@/utils/supabase/requireAdmin", () => ({
  __esModule: true,
  default: () => Promise.resolve({ supabase: mockSupabase, user: { id: "admin-1" } }),
}));
jest.mock("@/utils/moderation/checkImage", () => ({
  checkImage: (...args: unknown[]) => mockCheckImage(...args),
}));

const jpeg = () =>
  new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "x.jpg", { type: "image/jpeg" });

const animalFields = {
  common_name: "Rotfuchs",
  scientific_name: "Vulpes vulpes",
  category: "Säugetier",
  taxonomic_order: "Raubtiere (Carnivora)",
  endangerment_status: "Nicht gefährdet",
};

const form = (entries: Record<string, string | File>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.append(key, value);
  return data;
};

const callsTo = (table: string, op: Call["op"]) =>
  mockCalls.filter((call) => call.table === table && call.op === op);

beforeEach(() => {
  mockCalls.length = 0;
  mockStorage.length = 0;
  mockRespond = ({ table, op }) =>
    table === "animals" && op === "select" ? { data: { id: 5 } } : { data: null };
});

describe("submitLexiconSuggestion", () => {
  test("files a description proposal as the user", async () => {
    const res = await submitLexiconSuggestion(
      form({ kind: "description", animalId: "5", description: "Ein ausreichend langer Text." }),
    );
    expect(res.success).toBe(true);
    expect(callsTo("lexicon_submissions", "insert")[0].payload).toEqual(
      expect.objectContaining({
        user_id: "user-1",
        kind: "description",
        animal_id: 5,
        data: { description: "Ein ausreichend langer Text." },
      }),
    );
  });

  test.each([
    ["42501", "limitReached"],
    ["23505", "duplicate"],
  ])("maps database error %s to %s", async (code, error) => {
    mockRespond = ({ table, op }) =>
      table === "lexicon_submissions" && op === "insert"
        ? { error: { code, message: "refused" } }
        : { data: { id: 5 } };
    const res = await submitLexiconSuggestion(
      form({ kind: "description", animalId: "5", description: "Ein ausreichend langer Text." }),
    );
    expect(res).toMatchObject({ success: false, error });
  });

  test("refuses a blocked photo and stores nothing", async () => {
    mockCheckImage.mockResolvedValue({ verdict: "block", scores: {}, flagged: ["sexual"] });
    const res = await submitLexiconSuggestion(
      form({ kind: "image", animalId: "5", consent: "true", file: jpeg(), modalFile: jpeg() }),
    );
    expect(res).toMatchObject({ success: false, error: "imageRejected" });
    expect(mockStorage).toEqual([]);
    expect(callsTo("lexicon_submissions", "insert")).toEqual([]);
  });

  test("queues a photo in the user's own folder", async () => {
    mockCheckImage.mockResolvedValue({ verdict: "review", scores: { violence: 0.4 }, flagged: ["violence"] });
    const res = await submitLexiconSuggestion(
      form({ kind: "image", animalId: "5", consent: "true", file: jpeg(), modalFile: jpeg() }),
    );
    expect(res.success).toBe(true);
    const uploads = mockStorage.filter((entry) => entry.op === "upload");
    expect(uploads).toHaveLength(2);
    for (const upload of uploads) {
      expect(upload.bucket).toBe("moderation_queue");
      expect(upload.paths[0]).toMatch(/^lexicon\/user-1\/.+\.jpg$/);
    }
    expect(callsTo("lexicon_submissions", "insert")[0].payload).toEqual(
      expect.objectContaining({
        kind: "image",
        queue_paths: uploads.map((upload) => upload.paths[0]),
        flagged_categories: ["violence"],
      }),
    );
  });

  test("removes queued photos when the insert is refused", async () => {
    mockCheckImage.mockResolvedValue({ verdict: "pass", scores: {}, flagged: [] });
    mockRespond = ({ table, op }) =>
      table === "lexicon_submissions" && op === "insert"
        ? { error: { code: "42501", message: "policy" } }
        : { data: { id: 5 } };
    await submitLexiconSuggestion(
      form({ kind: "image", animalId: "5", consent: "true", file: jpeg(), modalFile: jpeg() }),
    );
    expect(mockStorage.find((entry) => entry.op === "remove")?.paths).toHaveLength(2);
  });

  test("requires consent for a photo", async () => {
    const res = await submitLexiconSuggestion(
      form({ kind: "image", animalId: "5", file: jpeg(), modalFile: jpeg() }),
    );
    expect(res).toMatchObject({ success: false, error: "consentMissing" });
    expect(mockCheckImage).not.toHaveBeenCalled();
  });

  test("refuses a new animal whose name exists", async () => {
    mockRespond = ({ table }) => (table === "animals" ? { data: [{ id: 1 }] } : { data: null });
    const res = await submitLexiconSuggestion(
      form({ kind: "new_animal", fields: JSON.stringify(animalFields) }),
    );
    expect(res).toMatchObject({ success: false, error: "nameTaken" });
  });

  test("never takes credit fields from a user", async () => {
    mockRespond = ({ table }) => (table === "animals" ? { data: [] } : { data: null });
    await submitLexiconSuggestion(
      form({
        kind: "new_animal",
        fields: JSON.stringify({ ...animalFields, image_credit_text: "Fake" }),
      }),
    );
    expect(callsTo("lexicon_submissions", "insert")[0].payload).toEqual(
      expect.objectContaining({
        animal_id: null,
        data: expect.objectContaining({ common_name: "Rotfuchs", image_credit_text: null }),
      }),
    );
  });
});

describe("approveLexiconSubmission", () => {
  const submission = (overrides: Record<string, unknown>) => ({
    id: "sub-1",
    user_id: "user-1",
    status: "pending",
    animal_id: 5,
    queue_paths: [],
    data: {},
    ...overrides,
  });

  test("applies an edited description and records the old one", async () => {
    mockRespond = ({ table, op }) => {
      if (table === "lexicon_submissions" && op === "select") {
        return { data: submission({ kind: "description", data: { description: "Alt vorgeschlagen, lang genug." } }) };
      }
      if (table === "animals" && op === "select") return { data: { id: 5, description: "Bisher." } };
      return { data: { id: 5 } };
    };
    const res = await approveLexiconSubmission("sub-1", { description: "Vom Admin verbesserter Text." });
    expect(res.success).toBe(true);
    expect(callsTo("animals", "update")[0]).toMatchObject({
      payload: { description: "Vom Admin verbesserter Text." },
      filters: { id: 5 },
    });
    expect(callsTo("lexicon_submissions", "update")[0].payload).toEqual(
      expect.objectContaining({ status: "approved", previous: { description: "Bisher." } }),
    );
  });

  test("publishes a photo to the lexicon bucket with the user's credit", async () => {
    mockRespond = ({ table, op }) => {
      if (table === "lexicon_submissions" && op === "select") {
        return { data: submission({ kind: "image", queue_paths: ["lexicon/user-1/a.jpg", "lexicon/user-1/b.jpg"] }) };
      }
      if (table === "animals" && op === "select") return { data: { id: 5, category: "Säugetier" } };
      if (table === "users") return { data: { display_name: "anna" } };
      return { data: { id: 5 } };
    };
    const res = await approveLexiconSubmission("sub-1");
    expect(res.success).toBe(true);

    const uploads = mockStorage.filter((entry) => entry.op === "upload");
    expect(uploads.map((entry) => entry.bucket)).toEqual(["animalImages", "animalImages"]);
    expect(uploads.map((entry) => entry.paths[0])).toEqual([
      expect.stringMatching(/^lexicon\/saeugetier\/.+\.jpg$/),
      expect.stringMatching(/^main\/saeugetier\/.+\.jpg$/),
    ]);
    expect(callsTo("animals", "update")[0].payload).toEqual(
      expect.objectContaining({
        image_link: expect.stringContaining("animalImages/main/"),
        lexicon_link: expect.stringContaining("animalImages/lexicon/"),
        image_credit_text: "anna",
        image_credit_link: "/profilepage/anna",
        image_license_text: "CC BY 4.0",
      }),
    );
    expect(mockStorage.at(-1)).toEqual({
      bucket: "moderation_queue",
      op: "remove",
      paths: ["lexicon/user-1/a.jpg", "lexicon/user-1/b.jpg"],
    });
  });

  test("removes the published photos when creating the animal fails", async () => {
    mockRespond = ({ table, op }) => {
      if (table === "lexicon_submissions" && op === "select") {
        return {
          data: submission({
            kind: "new_animal",
            animal_id: null,
            data: animalFields,
            queue_paths: ["lexicon/user-1/a.jpg", "lexicon/user-1/b.jpg"],
          }),
        };
      }
      if (table === "animals" && op === "select") return { data: [] };
      if (table === "animals" && op === "insert") return { error: { message: "policy" } };
      if (table === "users") return { data: { display_name: "anna" } };
      return { data: null };
    };
    jest.spyOn(console, "error").mockImplementation(() => {});
    const res = await approveLexiconSubmission("sub-1");

    expect(res.success).toBe(false);
    const published = mockStorage
      .filter((entry) => entry.bucket === "animalImages" && entry.op === "upload")
      .map((entry) => entry.paths[0]);
    expect(mockStorage).toContainEqual({ bucket: "animalImages", op: "remove", paths: published });
    expect(callsTo("lexicon_submissions", "update")).toEqual([]);
  });

  test("does nothing for a proposal that is no longer pending", async () => {
    mockRespond = () => ({ data: null });
    expect(await approveLexiconSubmission("sub-1")).toMatchObject({ success: false });
    expect(callsTo("animals", "update")).toEqual([]);
  });
});

describe("rejectLexiconSubmission", () => {
  test("declines with a note and clears the queued photos", async () => {
    mockRespond = ({ table, op }) =>
      table === "lexicon_submissions" && op === "select"
        ? { data: { id: "sub-1", queue_paths: ["lexicon/user-1/a.jpg"] } }
        : { data: { id: "sub-1" } };
    const res = await rejectLexiconSubmission("sub-1", "  Unscharf  ");
    expect(res.success).toBe(true);
    expect(callsTo("lexicon_submissions", "update")[0]).toMatchObject({
      payload: { status: "rejected", review_note: "Unscharf", queue_paths: [] },
      filters: { id: "sub-1", status: "pending" },
    });
    expect(mockStorage).toEqual([
      { bucket: "moderation_queue", op: "remove", paths: ["lexicon/user-1/a.jpg"] },
    ]);
  });
});

describe("createAnimal", () => {
  test("adds the animal with the admin's credit", async () => {
    mockRespond = ({ table, op }) => (table === "animals" && op === "select" ? { data: [] } : { data: null });
    const res = await createAnimal(
      form({
        fields: JSON.stringify({ ...animalFields, image_credit_text: "Foto: Max" }),
        file: jpeg(),
        modalFile: jpeg(),
      }),
    );
    expect(res).toMatchObject({ success: true, data: "Rotfuchs" });
    expect(callsTo("animals", "insert")[0].payload).toEqual(
      expect.objectContaining({
        common_name: "Rotfuchs",
        image_credit_text: "Foto: Max",
        image_link: expect.stringContaining("animalImages/main/"),
      }),
    );
  });

  test("refuses a duplicate name", async () => {
    mockRespond = ({ table }) => (table === "animals" ? { data: [{ id: 1 }] } : { data: null });
    const res = await createAnimal(form({ fields: JSON.stringify(animalFields) }));
    expect(res).toMatchObject({ success: false, error: "nameTaken" });
    expect(callsTo("animals", "insert")).toEqual([]);
  });
});

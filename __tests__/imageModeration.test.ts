/**
 * @jest-environment node
 */
import { classifyScores, flaggedCategories, worstResult } from "@/utils/moderation/verdict";
import { checkImage } from "@/utils/moderation/checkImage";
import type { ValidatedImage } from "@/utils/supabase/imageUpload";

const image: ValidatedImage = {
  file: new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "x.jpg", { type: "image/jpeg" }),
  contentType: "image/jpeg",
  extension: "jpg",
};

describe("classifyScores", () => {
  test("passes a clean image", () => {
    expect(classifyScores({ sexual: 0.01, violence: 0.05 })).toBe("pass");
  });

  test("sends anything above the review threshold to an admin", () => {
    expect(classifyScores({ violence: 0.31 })).toBe("review");
  });

  test("never passes an image OpenAI flagged", () => {
    expect(classifyScores({ sexual: 0.01 }, true)).toBe("review");
  });

  test("blocks clearly unsafe images", () => {
    expect(classifyScores({ sexual: 0.81 })).toBe("block");
    expect(classifyScores({ "sexual/minors": 0.21 })).toBe("block");
    expect(classifyScores({ "violence/graphic": 0.95 })).toBe("block");
  });

  test("only reviews plain violence, even when high (predators and prey)", () => {
    expect(classifyScores({ violence: 0.99 })).toBe("review");
  });

  test("lists suspicious categories highest first", () => {
    expect(flaggedCategories({ violence: 0.4, sexual: 0.6, hate: 0.1 })).toEqual([
      "sexual",
      "violence",
    ]);
  });
});

describe("worstResult", () => {
  test("the most severe verdict decides", () => {
    const pass = { verdict: "pass" as const };
    const review = { verdict: "review" as const };
    const block = { verdict: "block" as const };
    expect(worstResult([pass, block, review])).toBe(block);
    expect(worstResult([pass, review])).toBe(review);
    expect(worstResult([pass])).toBe(pass);
  });
});

describe("checkImage", () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
    global.fetch = fetchMock;
  });
  afterAll(() => {
    process.env.OPENAI_API_KEY = originalKey;
  });

  test("sends the image as a data URL and classifies the scores", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [{ flagged: false, category_scores: { sexual: 0.01, violence: 0.02 } }],
        }),
    });

    const result = await checkImage(image);

    expect(result).toEqual({
      verdict: "pass",
      scores: { sexual: 0.01, violence: 0.02 },
      flagged: [],
    });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("omni-moderation-latest");
    expect(body.input[0].image_url.url).toMatch(/^data:image\/jpeg;base64,/);
  });

  test("retries once after a 429", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ "retry-after": "0" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ results: [{ flagged: false, category_scores: { sexual: 0 } }] }),
      });

    expect(await checkImage(image)).toMatchObject({ verdict: "pass" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test.each([
    [
      "an error response",
      () => fetchMock.mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve("") }),
    ],
    ["a network failure", () => fetchMock.mockRejectedValue(new Error("timeout"))],
    ["a missing API key", () => delete process.env.OPENAI_API_KEY],
  ])("quarantines the image on %s", async (_, setup) => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    setup();
    expect(await checkImage(image)).toMatchObject({ verdict: "review", flagged: ["unchecked"] });
  });
});

describe("submitModeratedImage", () => {
  const insert = jest.fn().mockResolvedValue({ error: null });
  const upload = jest.fn().mockResolvedValue({ error: null });
  const remove = jest.fn().mockResolvedValue({ error: null });
  const deleteChain = { eq: () => deleteChain, overlaps: jest.fn().mockResolvedValue({}) };
  const admin = {
    from: () => ({ insert, delete: () => deleteChain }),
    storage: { from: () => ({ upload, remove }) },
  };

  const publishImage = jest.fn();
  const mockedCheck = jest.fn();

  jest.doMock("@/utils/supabase/admin", () => ({ createAdminClient: () => admin }));
  jest.doMock("@/utils/moderation/publish", () => ({ publishImage }));
  jest.doMock("@/utils/moderation/checkImage", () => ({ checkImage: mockedCheck }));

  const submit = async () => {
    const { submitModeratedImage } = await import("@/utils/moderation/submitImage");
    return submitModeratedImage({
      kind: "profile_picture",
      userId: "user-1",
      files: [image],
      payload: {},
    });
  };

  test("publishes a passing image and records it", async () => {
    mockedCheck.mockResolvedValue({ verdict: "pass", scores: {}, flagged: [] });
    publishImage.mockResolvedValue(["user-1/ProfilePicture/ProfilePic.jpg"]);

    expect(await submit()).toEqual({ ok: true, status: "approved" });
    expect(publishImage).toHaveBeenCalledWith("profile_picture", admin, "user-1", expect.any(Array), {});
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved", decided_by: "auto" }),
    );
    expect(upload).not.toHaveBeenCalled();
  });

  test("quarantines a borderline image without publishing it", async () => {
    mockedCheck.mockResolvedValue({ verdict: "review", scores: { violence: 0.5 }, flagged: ["violence"] });

    expect(await submit()).toEqual({ ok: true, status: "pending" });
    expect(publishImage).not.toHaveBeenCalled();
    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(/^user-1\/.+\.jpg$/),
      image.file,
      { contentType: "image/jpeg" },
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "pending", flagged_categories: ["violence"] }),
    );
  });

  test("refuses a blocked image and stores nothing", async () => {
    mockedCheck.mockResolvedValue({ verdict: "block", scores: { sexual: 0.9 }, flagged: ["sexual"] });

    expect(await submit()).toEqual({ ok: false, error: "imageRejected" });
    expect(publishImage).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });
});

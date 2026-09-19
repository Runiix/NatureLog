/**
 * @jest-environment node
 */
import requireAdmin from "@/utils/supabase/requireAdmin";

const mockNotFound = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
const mockRpc = jest.fn();
const mockSession = { supabase: { rpc: mockRpc }, user: { id: "user-1" } };

jest.mock("next/navigation", () => ({ notFound: () => mockNotFound() }));
jest.mock("@/utils/supabase/requireAuth", () => ({
  __esModule: true,
  default: () => Promise.resolve(mockSession),
}));

describe("requireAdmin", () => {
  test("lets an admin through", async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    await expect(requireAdmin()).resolves.toEqual(mockSession);
    expect(mockRpc).toHaveBeenCalledWith("is_admin");
  });

  test("answers 404 for everyone else", async () => {
    mockRpc.mockResolvedValue({ data: false, error: null });
    await expect(requireAdmin()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  test("treats a failed role check as not admin", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockRpc.mockResolvedValue({ data: null, error: { message: "boom" } });
    await expect(requireAdmin()).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

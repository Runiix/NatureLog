export const supabase = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: "123", email: "test@example.com" } },
      error: null,
    }),
  },
};

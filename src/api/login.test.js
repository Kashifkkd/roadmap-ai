import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginUser } from "./login";

vi.mock("./apiService", () => ({
  apiService: vi.fn(async () => ({ success: true })),
}));

import { apiService } from "./apiService";

describe("loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes email to lowercase before sending to the API", async () => {
    await loginUser({
      email: "  User@Example.com  ",
      password: "secret",
    });

    expect(apiService).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "user@example.com",
          password: "secret",
        }),
      })
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerUser } from "./register";

vi.mock("./apiService", () => ({
  apiService: vi.fn(async () => ({ success: true })),
}));

import { apiService } from "./apiService";

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes email to lowercase before sending to the API", async () => {
    await registerUser({
      email: "Creator@Example.com",
      password: "secret123",
      first_name: "Jane",
      last_name: "Doe",
      client_id: 1,
      role: "creator",
      phone: "",
    });

    expect(apiService).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "creator@example.com",
        }),
      })
    );
  });
});

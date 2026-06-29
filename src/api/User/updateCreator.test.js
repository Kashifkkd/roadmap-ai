import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateCreator } from "./updateCreator";

vi.mock("../apiService", () => ({
  apiService: vi.fn(async () => ({ success: true })),
}));

import { apiService } from "../apiService";

describe("updateCreator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes email to lowercase when updating a creator", async () => {
    await updateCreator("42", {
      email: "Editor@Example.com",
      first_name: "Jane",
    });

    expect(apiService).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "editor@example.com",
        }),
      })
    );
  });
});

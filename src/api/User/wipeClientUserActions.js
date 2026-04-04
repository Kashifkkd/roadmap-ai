import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const wipeClientUserActions = async (userId) => {
  const userIdInt = parseInt(userId, 10);

  if (isNaN(userIdInt)) {
    throw new Error("User ID must be a valid integer");
  }

  return await apiService({
    endpoint: endpoints.wipeClientUserActions(userIdInt),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

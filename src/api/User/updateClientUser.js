import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const updateClientUser = async (userId, userData) => {
  // Ensure userId is an integer
  const userIdInt = parseInt(userId, 10);
  if (isNaN(userIdInt)) {
    throw new Error("User ID must be a valid integer");
  }

  return await apiService({
    endpoint: endpoints.updateClientUser(userIdInt),
    method: "PUT",
    data: userData,
  });
};

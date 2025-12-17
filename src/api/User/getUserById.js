import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const getUserById = async ({ clientId }) => {
  if (!clientId) {
    throw new Error("clientId is required");
  }

  return await apiService({
    endpoint: endpoints.getUserById(clientId),
    method: "GET",
  });
};

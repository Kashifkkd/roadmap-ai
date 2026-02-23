import { apiService } from "../apiService";
import { endpoints } from "../endpoint";


export const getPathUsers = async (sessionId) => {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  return await apiService({
    endpoint: endpoints.pathUsers(sessionId),
    method: "GET",
    headers: { Accept: "application/json" },
  });
};

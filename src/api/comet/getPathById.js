import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const getPathById = async (pathId) => {
  if (!pathId) {
    throw new Error("pathId is required");
  }
  return await apiService({
    endpoint: endpoints.getPathById(pathId),
    method: "GET",
  });
};

import { apiService } from "./apiService";
import { endpoints } from "./endpoint";


export const getSourceMaterials = async (sessionId) => {
  const response = await apiService({
    endpoint: endpoints.getSourceMaterials,
    method: "GET",
    params: {
      session_id: sessionId,
    },
  });

  if (response.error) {
    throw new Error(
      response.error?.message || "Failed to fetch source materials"
    );
  }

  if (response.response) {
    return Array.isArray(response.response) ? response.response : [];
  }

  return [];
};

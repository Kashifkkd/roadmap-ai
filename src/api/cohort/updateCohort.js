import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const updateCohort = async ({ cohortId, name, description }) => {
  if (!cohortId) {
    throw new Error("cohortId is required");
  }

  if (!name) {
    throw new Error("name is required");
  }

  return await apiService({
    endpoint: endpoints.updateCohort(cohortId),
    method: "PUT",
    data: {
      name,
      description: description || "",
    },
  });
};

import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const deleteCohort = async ({ cohortId }) => {
  if (!cohortId) {
    throw new Error("cohortId is required");
  }

  return await apiService({
    endpoint: endpoints.deleteCohort(cohortId),
    method: "DELETE",
  });
};

import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const updateCohortPaths = async ({
  cohortId,
  pathIds,
  enabled = true,
}) => {
  if (!cohortId) {
    throw new Error("cohortId is required");
  }

  if (!Array.isArray(pathIds)) {
    throw new Error("pathIds must be an array");
  }

  return await apiService({
    endpoint: endpoints.getCohortPaths(cohortId),
    method: "PUT",
    data: {
      path_ids: pathIds,
      enabled: enabled,
    },
  });
};

import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const getCohortPaths = async ({ cohortId }) => {
  if (!cohortId) {
    throw new Error("cohortId is required");
  }

  return await apiService({
    endpoint: endpoints.getCohortPaths(cohortId),
    method: "GET",
  });
};

export const getClientPaths = async ({ clientId }) => {
  if (!clientId) {
    throw new Error("clientId is required");
  }

  return await apiService({
    endpoint: endpoints.getClientPaths(clientId),
    method: "GET",
  });
};


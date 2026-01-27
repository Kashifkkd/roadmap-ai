import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const getCohorts = async ({ clientId }) => {
  if (!clientId) {
    throw new Error("clientId is required");
  }

  return await apiService({
    endpoint: endpoints.getCohorts(clientId),
    method: "GET",
  });
};

export const getCommit = async ({ clientId }) => {
  if (!clientId) {
    throw new Error("clientId is required");
  }

  return await apiService({
    endpoint: endpoints.getCommit(clientId),
    method: "GET",
  });
};

export const getCohortbyPath = async ({ cohortId }) => {
  if (!cohortId) {
    throw new Error("Id is required");
  }

  return await apiService({
    endpoint: endpoints.getCohortPaths(cohortId),
    method: "GET",
  });
};

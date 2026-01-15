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

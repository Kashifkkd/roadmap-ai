import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const createCohort = async ({ name, description, clientId }) => {
  if (!name) {
    throw new Error("name is required");
  }

  if (!clientId) {
    throw new Error("clientId is required");
  }

  return await apiService({
    endpoint: endpoints.createCohort,
    method: "POST",
    data: {
      name,
      description: description || "",
      client_id: clientId,
    },
  });
};

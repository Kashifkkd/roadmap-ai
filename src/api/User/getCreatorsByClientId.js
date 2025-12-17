import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const getCreatorsByClientId = async ({ clientId }) => {
  if (!clientId) {
    throw new Error("clientId is required");
  }

  return await apiService({
    endpoint: endpoints.getCreatorsByClientId(clientId),
    method: "GET",
  });
};

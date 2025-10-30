import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export async function getClients({ skip = 0, limit = 5, enabledOnly = true } = {}) {
  const res = await apiService({
    endpoint: `${endpoints.getClients}`,
    method: "GET",
    params: {
      skip,
      limit,
      enabled_only: enabledOnly,
    },
  });
  return res;
}



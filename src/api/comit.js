import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export const comitFetchList = async (data) => {
  return await apiService({
    endpoint: endpoints.fetchList(),
    method: "GET",
    data:data,
    headers: {
      Accept: "application/json",
    },
  });
};

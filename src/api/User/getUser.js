import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const getUser = async () => {
  return await apiService({
    endpoint: endpoints.getUser,
    method: "GET",
  });
};

import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const registerClientUser = async (userData) => {
  return await apiService({
    endpoint: endpoints.registerClientUser,
    method: "POST",
    data: userData,
  });
};

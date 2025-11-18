import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const updateProfile = async (userData) => {
  return await apiService({
    endpoint: endpoints.updateUser,
    method: "POST",
    data: userData,
  });
};

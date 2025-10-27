import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export const registerUser = async (userData) => {
  const payload = {
    email: userData.email,
    password: userData.password,
    first_name: userData.first_name,
    last_name: userData.last_name,
    timezone: userData.timezone,
    access_level: 3,
  };

  return await apiService({
    endpoint: endpoints.register,
    method: "POST",
    data: payload,
    removeToken: true,
  });
};

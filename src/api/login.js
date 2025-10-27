import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export const loginUser = async (userData) => {
  const payload = {
    email: userData.email,
    password: userData.password,
  };

  return await apiService({
    endpoint: endpoints.login,
    method: "POST",
    data: payload,
    removeToken: true,
  });
};

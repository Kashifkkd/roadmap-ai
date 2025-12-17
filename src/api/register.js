import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export const registerUser = async (userData, { useAuthToken = false } = {}) => {
  const payload = {
    email: userData.email,
    password: userData.password,
    first_name: userData.first_name,
    last_name: userData.last_name,
    client_id: userData.client_id,
    role: userData.role,
    image_url: userData.image_url ?? null,
    phone: userData.phone,
    timezone: userData.timezone || "UTC",
    metadata: userData.metadata ?? {},
  };

  return await apiService({
    endpoint: endpoints.register,
    method: "POST",
    data: payload,
    removeToken: !useAuthToken,
  });
};

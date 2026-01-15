import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export const loginUser = async (userData) => {
  // Get existing session_id from localStorage if available
  const sessionId = typeof window !== "undefined"
    ? localStorage.getItem("sessionId")
    : null;

  const payload = {
    email: userData.email,
    password: userData.password,
    session_id: sessionId || null,
  };

  return await apiService({
    endpoint: endpoints.login,
    method: "POST",
    data: payload,
    removeToken: true,
  });
};

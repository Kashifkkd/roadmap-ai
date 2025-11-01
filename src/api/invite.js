import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export const inviteUser = async (inviteData) => {
  const payload = {
    email: inviteData.email,

  };

  return await apiService({
    endpoint: endpoints.inviteUser,
    method: "POST",
    data: payload,
  });
};


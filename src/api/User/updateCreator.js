import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const updateCreator = async (creatorId, creatorData) => {
  const creatorIdInt = parseInt(creatorId, 10);
  if (isNaN(creatorIdInt)) {
    throw new Error("Creator ID must be a valid integer");
  }

  const payload = { ...creatorData };
  if (typeof payload.email === "string") {
    payload.email = payload.email.trim().toLowerCase();
  }

  return await apiService({
    endpoint: endpoints.updateCreator(creatorIdInt),
    method: "PUT",
    data: payload,
  });
};

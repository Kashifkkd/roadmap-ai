import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const getCreatorDetails = async (creatorId) => {
  if (!creatorId) {
    throw new Error("creatorId is required");
  }

  const creatorIdInt = parseInt(creatorId, 10);
  if (isNaN(creatorIdInt)) {
    throw new Error("Creator ID must be a valid integer");
  }

  return await apiService({
    endpoint: endpoints.updateCreator(creatorIdInt), // Same endpoint pattern for GET
    method: "GET",
  });
};

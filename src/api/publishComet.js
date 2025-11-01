import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

/**
 * Publish comet
 * @param {string} sessionId - The session ID of the comet to publish
 * @returns {Promise} API response
 */
export const publishComet = async (sessionId) => {
  return await apiService({
    endpoint: endpoints.publishComet(sessionId),
    method: "POST",
    data: {},
  });
};


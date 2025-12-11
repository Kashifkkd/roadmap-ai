import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export const sendFeedback = async (feedback) => {
  return await apiService({
    endpoint: endpoints.feedbackEmail(feedback),
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
};

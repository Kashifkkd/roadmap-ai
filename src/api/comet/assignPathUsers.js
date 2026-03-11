import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const assignPathUsers = async (sessionId, userEmails) => {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }

  const emails = Array.isArray(userEmails)
    ? userEmails.filter(Boolean)
    : [];

  return await apiService({
    endpoint: endpoints.assignPathUsers(sessionId),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    data: {
      user_emails: emails,
    },
  });
};


import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const assignPathUsers = async (sessionId, userEmails) => {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }

  const emails = Array.isArray(userEmails)
    ? userEmails.filter(Boolean)
    : [];

  if (!emails.length) {
    throw new Error("At least one email is required");
  }

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


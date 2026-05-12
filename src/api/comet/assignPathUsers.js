import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const assignPathUsers = async (sessionId, userEmails, currentCycleUserEmails = []) => {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }

  const emails = Array.isArray(userEmails)
    ? userEmails.filter(Boolean)
    : [];

  const currentCycleEmails = Array.isArray(currentCycleUserEmails)
    ? currentCycleUserEmails.filter(Boolean)
    : [];

  const adhocEmails = emails.filter((e) => !currentCycleEmails.includes(e));

  return await apiService({
    endpoint: endpoints.assignPathUsers(sessionId),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },  
    data: {
      user_emails: emails,
      current_cycle_user_emails: currentCycleEmails,
      adhoc_user_emails: adhocEmails,
      set_as_active: false,
    },
  });
};


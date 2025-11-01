import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

/**
 * Share comet with accessible users
 * @param {string} sessionId - The session ID of the comet
 * @param {string|string[]} accessibleUserEmails - Single email string or array of user emails to share with
 * @returns {Promise} API response
 */
export const shareComet = async (sessionId, accessibleUserEmails) => {
  // Ensure emails is always an array
  const emails = Array.isArray(accessibleUserEmails) 
    ? accessibleUserEmails 
    : [accessibleUserEmails];

  // Convert to URL-encoded format (application/x-www-form-urlencoded)
  // The backend expects form-encoded data, not JSON
  const formData = new URLSearchParams();
  emails.forEach(email => {
    formData.append('accessible_user_emails', email);
  });

  console.log("Sharing comet with emails:", emails);

  return await apiService({
    endpoint: endpoints.shareComet(sessionId),
    method: "POST",
    data: formData.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};


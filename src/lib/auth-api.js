/**
 * Authentication API functions
 * Handles login and registration API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Login user with email and password
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Login response with access token
 */
export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Login failed");
  }

  return response.json();
}

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.first_name - User first name
 * @param {string} userData.last_name - User last name
 * @param {string} userData.timezone - User timezone
 * @param {number} userData.access_level - User access level
 * @returns {Promise<Object>} Registration response
 */
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Registration failed");
  }

  return response.json();
}

/**
 * Update user profile
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Update response
 */
export async function updateUser(userData) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/auth/user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Update failed");
  }

  return response.json();
}

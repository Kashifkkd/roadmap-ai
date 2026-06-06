import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

/**
 * @typedef {Object} PathStepOption
 * @property {number} step_id  - steps.id (used by after_action_commit / complete)
 * @property {number} step_no  - path_steps.position (used by days_after_completion)
 * @property {string|null} title
 * @property {string|null} image
 */

/**
 * GET enabled steps linked to a path, ordered by position.
 *
 * @param {number|string} pathId
 * @returns {Promise<PathStepOption[]>}
 */
export async function getPathSteps(pathId) {
  const res = await apiService({
    endpoint: endpoints.getPathSteps(pathId),
    method: "GET",
  });

  if (!res?.success) {
    const detail =
      (typeof res?.response === "object" && res?.response?.detail) ||
      (typeof res?.response === "object" && res?.response?.message);
    const msg =
      (typeof detail === "string" && detail) ||
      res?.message ||
      "Failed to load path steps";
    throw new Error(msg);
  }

  const data = res?.response ?? res ?? [];
  const list = Array.isArray(data) ? data : [];
  return list.map((row) => ({
    step_id: Number(row?.step_id),
    step_no: Number(row?.step_no),
    title: typeof row?.title === "string" ? row.title : null,
    image: typeof row?.image === "string" ? row.image : null,
  }));
}

/**
 * Build step dropdown options from the path outline (sessionData.response_path).
 *
 * Why not the backend endpoint? The DB `path_steps` table accumulates rows
 * across regeneration cycles — older content created during prior runs is
 * never cleaned up, so a single path can have many obsolete `Steps` rows
 * pointing at orphaned `path_steps`. The path outline, on the other hand,
 * only contains the *current* step set (it's what the user just saved).
 *
 * Each option carries:
 *   - `step_id`: `chapter.steps[].step.id` (integer when published, null otherwise)
 *   - `step_no`: continuous global index across all chapters (0, 1, 2, …)
 *   - `title` and `uuid` for display
 *   - `published`: true when `step.id` is a real DB integer
 */

import { isRealId } from "./cyclePublishStatus";

function stripHtmlToPlain(s) {
  if (s == null || typeof s !== "string") return "";
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {object | null | undefined} responsePath — sessionData.response_path
 * @returns {{ step_id: number|null, step_no: number, title: string, uuid: string|null, published: boolean }[]}
 */
export function collectStepOptionsFromResponsePath(responsePath) {
  const out = [];
  let globalIndex = 0;

  const allChapters = [
    ...(responsePath?.chapters || []),
    ...(responsePath?.remaining_chapters || []),
  ];

  for (const chapter of allChapters) {
    const steps = Array.isArray(chapter?.steps) ? chapter.steps : [];
    for (const stepItem of steps) {
      const stepObj = stepItem?.step || {};
      const published = isRealId(stepObj.id);
      const stepId = published ? Number(stepObj.id) : null;

      const title =
        stripHtmlToPlain(stepObj.title) ||
        stripHtmlToPlain(stepItem?.title) ||
        `Step ${globalIndex}`;

      out.push({
        step_id: stepId,
        step_no: globalIndex,
        title,
        uuid: typeof stepObj.uuid === "string" ? stepObj.uuid : null,
        published,
      });

      globalIndex++;
    }
  }

  return out;
}

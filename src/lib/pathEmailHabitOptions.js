/**
 * Build { routine_info_id, level_id, label } pairs from habits screens on the path outline
 * (mirrors 1st90-admin committedLevel[] / routine + level select).
 */

function stripHtmlToPlain(s) {
  if (s == null || typeof s !== "string") return "";
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function walkChapters(chapters, out, seen) {
  (chapters || []).forEach((chapter) => {
    const steps = Array.isArray(chapter?.steps) ? chapter.steps : [];
    steps.forEach((stepItem) => {
      const screens = Array.isArray(stepItem?.screens) ? stepItem.screens : [];
      screens.forEach((screen) => {
        const sc = screen.screenContents || screen.screen_contents;
        if (!sc) return;
        const contentType = (sc.contentType || sc.content_type || "").toLowerCase();
        if (contentType !== "habits") return;
        const content = sc.content || {};
        const habits = Array.isArray(content.habits) ? content.habits : [];
        habits.forEach((habit, idx) => {
          const rawId = habit?.id ?? idx + 1;
          const rawLevel = habit?.level ?? rawId;
          const routine_info_id = Number(rawId);
          const level_id = Number(rawLevel);
          if (!Number.isFinite(routine_info_id) || !Number.isFinite(level_id)) return;
          const value = `${routine_info_id}::${level_id}`;
          if (seen.has(value)) return;
          seen.add(value);
          const title =
            stripHtmlToPlain(habit?.title) ||
            stripHtmlToPlain(habit?.text) ||
            `Habit ${routine_info_id}`;
          out.push({
            value,
            routine_info_id,
            level_id,
            label: `${title}: Level ${level_id}`,
          });
        });
      });
    });
  });
}

/**
 * @param {object | null | undefined} responsePath — sessionData.response_path
 * @returns {{ value: string, routine_info_id: number, level_id: number, label: string }[]}
 */
export function collectHabitLevelOptionsFromResponsePath(responsePath) {
  const out = [];
  const seen = new Set();
  walkChapters(responsePath?.chapters, out, seen);
  walkChapters(responsePath?.remaining_chapters, out, seen);
  return out;
}

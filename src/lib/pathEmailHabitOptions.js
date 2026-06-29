/**
 * Build habit dropdown options from the path outline (sessionData.response_path).
 *
 * The Kyper habit catalog lives in screen_contents rows with content_type='habits'.
 * The list of habit levels is embedded inside `screen_contents.content.habits[]`.
 *
 * Each option carries the three IDs the backend's after_habit_commit /
 * after_habit_complete triggers require:
 *   - screen_id          (screens.id)
 *   - screen_content_id  (screen_contents.id, where content_type='habits')
 *   - habit_id           (the `id` of an entry inside content.habits[])
 *
 * Composite `value` key: `${screen_id}::${screen_content_id}::${habit_id}`.
 */

function stripHtmlToPlain(s) {
  if (s == null || typeof s !== "string") return "";
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toFiniteNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function walkChapters(chapters, out, seen) {
  (chapters || []).forEach((chapter) => {
    const steps = Array.isArray(chapter?.steps) ? chapter.steps : [];
    steps.forEach((stepItem) => {
      const screens = Array.isArray(stepItem?.screens) ? stepItem.screens : [];
      screens.forEach((screen) => {
        const screenId = toFiniteNumber(screen?.id);
        const sc = screen?.screenContents || screen?.screen_contents;
        if (!sc || screenId == null) return;

        const contentType = (sc.contentType || sc.content_type || "").toLowerCase();
        if (contentType !== "habits") return;

        const screenContentId = toFiniteNumber(sc.id);
        if (screenContentId == null) return;

        const content = sc.content || {};
        const groupTitle = stripHtmlToPlain(content?.title) || "Habit group";
        const habits = Array.isArray(content.habits) ? content.habits : [];

        habits.forEach((habit, idx) => {
          const habitId = toFiniteNumber(habit?.id ?? idx + 1);
          if (habitId == null) return;

          const value = `${screenId}::${screenContentId}::${habitId}`;
          if (seen.has(value)) return;
          seen.add(value);

          const level = toFiniteNumber(habit?.level);
          const habitTitle =
            stripHtmlToPlain(habit?.title) ||
            stripHtmlToPlain(habit?.text) ||
            `Habit ${habitId}`;

          const label =
            level != null
              ? `${groupTitle} — Level ${level}: ${habitTitle}`
              : `${groupTitle}: ${habitTitle}`;

          out.push({
            value,
            screen_id: screenId,
            screen_content_id: screenContentId,
            habit_id: habitId,
            label,
          });
        });
      });
    });
  });
}

/**
 * @param {object | null | undefined} responsePath — sessionData.response_path
 * @returns {{ value: string, screen_id: number, screen_content_id: number, habit_id: number, label: string }[]}
 */
export function collectHabitLevelOptionsFromResponsePath(responsePath) {
  const out = [];
  const seen = new Set();
  walkChapters(responsePath?.chapters, out, seen);
  walkChapters(responsePath?.remaining_chapters, out, seen);
  return out;
}

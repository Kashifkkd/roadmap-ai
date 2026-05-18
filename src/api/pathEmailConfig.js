import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export const TRIGGER_ARRAY_KEYS = [
  "days_after_completion",
  "inactive_days",
  "active_days",
  "after_action_commit",
  "after_action_complete",
  "after_habit_commit",
  "after_habit_complete",
];

/** @typedef {'manager' | 'accountability'} PathEmailVariant */

export const DEFAULT_MANAGER_TRIGGER_SUBHEADER =
  "<p>An update for @user_name's manager from @path_name.</p>";

export const DEFAULT_ACCOUNTABILITY_TRIGGER_SUBHEADER =
  "<p>An update regarding @user_name on @path_name.</p>";

export const createEmptyPathEmailConfig = () => ({
  enabled: false,
  notification_time: "08:00",
  close_out_text: "",
  days_after_completion: [],
  inactive_days: [],
  active_days: [],
  after_action_commit: [],
  after_action_complete: [],
  after_habit_commit: [],
  after_habit_complete: [],
});

/**
 * New trigger row template (1st90-admin newTrigger).
 * Accountability entries must not include `survey_questions`.
 */
export function createEmptyTriggerEntry(
  includeSurveyQuestions = false,
  /** @type {PathEmailVariant} */ variant = "manager",
) {
  const isAccountability = variant === "accountability";
  const defaultSubheader = isAccountability
    ? DEFAULT_ACCOUNTABILITY_TRIGGER_SUBHEADER
    : DEFAULT_MANAGER_TRIGGER_SUBHEADER;

  return {
    days: null,
    step_no: null,
    inactive_days: null,
    active_days: null,
    text: "",
    routine_info_id: null,
    level_id: null,
    subheader: defaultSubheader,
    ...(includeSurveyQuestions ? { survey_questions: [] } : {}),
  };
}

function coerceIntOrNull(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function normalizeSurveyQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  const baseId = Date.now();
  return questions.map((q, qi) => {
    const text = typeof q?.text === "string" ? q.text : "";
    const options = Array.isArray(q?.options) ? q.options : [];
    return {
      text,
      options: options.map((o, oi) => ({
        id:
          typeof o?.id === "number" && Number.isFinite(o.id)
            ? o.id
            : baseId + qi * 10_000 + oi,
        text: typeof o?.text === "string" ? o.text : "",
        isCorrect: !!o?.isCorrect,
      })),
    };
  });
}

/**
 * One trigger row for PUT: only relevant fields set; others null.
 * Manager: includes survey_questions[]. Accountability: omit survey_questions.
 */
export function sanitizeTriggerEntryForApi(
  entry,
  triggerArrayKey,
  includeSurveyQuestions,
) {
  const e = entry || {};
  const text = typeof e.text === "string" ? e.text : e.text == null ? "" : String(e.text);
  let subheader = e.subheader;
  if (subheader === undefined || subheader === "") subheader = null;
  else if (typeof subheader !== "string") subheader = String(subheader);

  const out = {
    days: null,
    step_no: null,
    text,
    subheader,
    level_id: null,
    active_days: null,
    inactive_days: null,
    routine_info_id: null,
  };

  switch (triggerArrayKey) {
    case "days_after_completion":
      out.days = coerceIntOrNull(e.days);
      out.step_no = coerceIntOrNull(e.step_no);
      break;
    case "inactive_days":
      out.inactive_days = coerceIntOrNull(e.inactive_days);
      break;
    case "active_days":
      out.active_days = coerceIntOrNull(e.active_days);
      break;
    case "after_action_commit":
    case "after_action_complete":
      out.step_no = coerceIntOrNull(e.step_no);
      break;
    case "after_habit_commit":
    case "after_habit_complete":
      out.routine_info_id = coerceIntOrNull(e.routine_info_id);
      out.level_id = coerceIntOrNull(e.level_id);
      break;
    default:
      break;
  }

  if (includeSurveyQuestions) {
    out.survey_questions = normalizeSurveyQuestions(e.survey_questions);
  }
  return out;
}

export function prepareConfigForPut(rawConfig, includeSurveyQuestions) {
  const base = createEmptyPathEmailConfig();
  const merged = { ...base, ...rawConfig };
  merged.enabled = !!merged.enabled;
  const nt = merged.notification_time;
  merged.notification_time =
    nt != null && String(nt).trim() !== "" ? String(nt).trim() : null;
  merged.close_out_text =
    merged.close_out_text == null ? "" : String(merged.close_out_text);

  TRIGGER_ARRAY_KEYS.forEach((key) => {
    const arr = Array.isArray(merged[key]) ? merged[key] : [];
    merged[key] = arr.map((entry) =>
      sanitizeTriggerEntryForApi(entry, key, includeSurveyQuestions),
    );
  });
  return merged;
}

const stripSurveyQuestions = (config) => {
  const next = { ...config };
  TRIGGER_ARRAY_KEYS.forEach((key) => {
    next[key] = (next[key] || []).map((entry) => {
      const { survey_questions: _removed, ...rest } = entry;
      return rest;
    });
  });
  return next;
};

/**
 * @param {object} data
 * @param {boolean} includeSurveyQuestions — manager vs accountability
 */
const normalizeConfig = (data, includeSurveyQuestions) => {
  const base = createEmptyPathEmailConfig();
  if (!data || typeof data !== "object") return base;

  const pathVariant = includeSurveyQuestions ? "manager" : "accountability";
  const merged = { ...base, ...data };
  TRIGGER_ARRAY_KEYS.forEach((key) => {
    merged[key] = Array.isArray(merged[key]) ? merged[key] : [];
    if (includeSurveyQuestions) {
      merged[key] = merged[key].map((entry) => {
        const { survey_questions: _sq, ...rest } = entry || {};
        return {
          ...createEmptyTriggerEntry(true, pathVariant),
          ...rest,
          survey_questions: normalizeSurveyQuestions(entry?.survey_questions),
        };
      });
    } else {
      merged[key] = merged[key].map((entry) => {
        const { survey_questions: _removed, ...rest } = entry || {};
        return {
          ...createEmptyTriggerEntry(false, pathVariant),
          ...rest,
        };
      });
    }
  });
  return merged;
};

export async function getManagerEmailConfig(pathId) {
  const res = await apiService({
    endpoint: endpoints.getManagerEmailConfig(pathId),
    method: "GET",
  });
  if (!res?.success) {
    const detail =
      (typeof res?.response === "object" && res?.response?.detail) ||
      (typeof res?.response === "object" && res?.response?.message);
    const msg =
      (typeof detail === "string" && detail) ||
      res?.message ||
      "Failed to load manager email config";
    throw new Error(msg);
  }
  return normalizeConfig(res?.response ?? res, true);
}

export async function updateManagerEmailConfig(pathId, config) {
  const normalized = normalizeConfig(config, true);
  const payload = prepareConfigForPut(normalized, true);
  const res = await apiService({
    endpoint: endpoints.updateManagerEmailConfig(pathId),
    method: "PUT",
    data: payload,
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.success) {
    const detail =
      (typeof res?.response === "object" && res?.response?.detail) ||
      (typeof res?.response === "object" && res?.response?.message);
    const msg =
      (typeof detail === "string" && detail) ||
      res?.message ||
      "Failed to save manager email config";
    throw new Error(msg);
  }
  return normalizeConfig(res?.response ?? res, true);
}

export async function getAccountabilityEmailConfig(pathId) {
  const res = await apiService({
    endpoint: endpoints.getAccountabilityEmailConfig(pathId),
    method: "GET",
  });
  if (!res?.success) {
    const detail =
      (typeof res?.response === "object" && res?.response?.detail) ||
      (typeof res?.response === "object" && res?.response?.message);
    const msg =
      (typeof detail === "string" && detail) ||
      res?.message ||
      "Failed to load accountability email config";
    throw new Error(msg);
  }
  return normalizeConfig(stripSurveyQuestions(res?.response ?? res), false);
}

export async function updateAccountabilityEmailConfig(pathId, config) {
  const normalized = normalizeConfig(stripSurveyQuestions(config), false);
  const payload = stripSurveyQuestions(prepareConfigForPut(normalized, false));
  const res = await apiService({
    endpoint: endpoints.updateAccountabilityEmailConfig(pathId),
    method: "PUT",
    data: payload,
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.success) {
    const detail =
      (typeof res?.response === "object" && res?.response?.detail) ||
      (typeof res?.response === "object" && res?.response?.message);
    const msg =
      (typeof detail === "string" && detail) ||
      res?.message ||
      "Failed to save accountability email config";
    throw new Error(msg);
  }
  return normalizeConfig(stripSurveyQuestions(res?.response ?? res), false);
}

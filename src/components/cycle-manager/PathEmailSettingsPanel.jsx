"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Info,
  Copy,
  GripVertical,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RichTextArea } from "@/components/cycle-manager/forms/FormFields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  createEmptyPathEmailConfig,
  createEmptyTriggerEntry,
  getAccountabilityEmailConfig,
  getManagerEmailConfig,
  sanitizeTriggerEntryForApi,
  updateAccountabilityEmailConfig,
  updateManagerEmailConfig,
} from "@/api/pathEmailConfig";
import { collectHabitLevelOptionsFromResponsePath } from "@/lib/pathEmailHabitOptions";

const PLACEHOLDER_TOKENS = "@user_name, @first_name, @path_name, @user_activity, @leaderboard";

const TRIGGER_SECTIONS = [
  {
    key: "days_after_completion",
    label: "Days after completing step",
    fieldGroup: "days_step",
    helper:
      "Maps to `days` + `step_no`. Other trigger fields are stored as null. Survey block is manager-only.",
  },
  {
    key: "inactive_days",
    label: "After days inactive",
    fieldGroup: "inactive_only",
    helper: "Maps to `inactive_days` only (inactive streak).",
  },
  {
    key: "active_days",
    label: "After straight active days",
    fieldGroup: "active_only",
    helper: "Maps to `active_days` only (active streak).",
  },
  {
    key: "after_action_commit",
    label: "After committing to action",
    fieldGroup: "step_only",
    helper: "Maps to `step_no` (step number where the action lives).",
  },
  {
    key: "after_action_complete",
    label: "After completing action",
    fieldGroup: "step_only",
    helper: "Maps to `step_no` (step number when the action is completed).",
  },
  {
    key: "after_habit_commit",
    label: "After committing to a habit level",
    fieldGroup: "habit_pair",
    helper:
      "Maps to `routine_info_id` + `level_id` (same as 1st90-admin habit select). Persisted from the dropdown when habits exist on the path.",
  },
  {
    key: "after_habit_complete",
    label: "After completing a habit level",
    fieldGroup: "habit_pair",
    helper: "Same as habit commit, but fires when the habit level is completed.",
  },
];

function TriggerNumberField({ label, hint, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-800">{label}</Label>
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
      <Input
        type="number"
        value={value ?? ""}
        onChange={onChange}
        placeholder="—"
        className="rounded-lg border-2 border-gray-200"
      />
    </div>
  );
}

function HabitRoutineLevelField({ entry, onChange, habitLevelOptions }) {
  const composite =
    entry.routine_info_id != null &&
    entry.level_id != null &&
    Number.isFinite(Number(entry.routine_info_id)) &&
    Number.isFinite(Number(entry.level_id))
      ? `${Number(entry.routine_info_id)}::${Number(entry.level_id)}`
      : "";

  const setPair = (routineId, levelId) => {
    onChange({
      ...entry,
      routine_info_id: routineId,
      level_id: levelId,
    });
  };

  const updateManual = (field, raw) => {
    const v = parseOptionalInt(raw);
    onChange({ ...entry, [field]: v });
  };

  const knownPair =
    composite &&
    habitLevelOptions.some((o) => o.value === composite);

  if (habitLevelOptions.length === 0) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          No <strong>habits</strong> screens were found on this path outline. Enter IDs manually, or
          add habits to the cycle and reopen settings.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TriggerNumberField
            label="Routine / habit ID"
            hint="Saved as routine_info_id"
            value={entry.routine_info_id}
            onChange={(e) => updateManual("routine_info_id", e.target.value)}
          />
          <TriggerNumberField
            label="Habit level ID"
            hint="Saved as level_id"
            value={entry.level_id}
            onChange={(e) => updateManual("level_id", e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1.5 max-w-xl">
        <Label className="text-sm font-medium text-gray-800">Select habit level</Label>
        <p className="text-xs text-gray-500">
          One option per habit row on a habits screen (Routine title : Level N).
        </p>
        <Select
          value={knownPair ? composite : undefined}
          onValueChange={(v) => {
            const [a, b] = String(v).split("::");
            setPair(parseOptionalInt(a), parseOptionalInt(b));
          }}
        >
          <SelectTrigger className="h-10 border-gray-200 bg-white">
            <SelectValue placeholder="Choose routine & level…" />
          </SelectTrigger>
          <SelectContent>
            {habitLevelOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {composite && !knownPair ? (
        <p className="text-xs text-amber-800">
          Current routine_info_id / level_id are not on the path outline anymore. Pick a new pair
          or use manual IDs below.
        </p>
      ) : null}
      <details className="rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 text-xs text-gray-600">
        <summary className="cursor-pointer font-medium text-gray-800">Manual IDs</summary>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TriggerNumberField
            label="routine_info_id"
            hint="Override if needed"
            value={entry.routine_info_id}
            onChange={(e) => updateManual("routine_info_id", e.target.value)}
          />
          <TriggerNumberField
            label="level_id"
            hint="Override if needed"
            value={entry.level_id}
            onChange={(e) => updateManual("level_id", e.target.value)}
          />
        </div>
      </details>
    </div>
  );
}

function TriggerDynamicFields({ fieldGroup, entry, onChange, habitLevelOptions }) {
  const upd = (field, raw) => {
    const v = parseOptionalInt(raw);
    onChange({ ...entry, [field]: v });
  };

  switch (fieldGroup) {
    case "days_step":
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TriggerNumberField
            label="Enter # days"
            hint="Saved as `days` — send N days after the step below is completed."
            value={entry.days}
            onChange={(e) => upd("days", e.target.value)}
          />
          <TriggerNumberField
            label="After completing step #"
            hint="Saved as `step_no` — which step completion starts the timer."
            value={entry.step_no}
            onChange={(e) => upd("step_no", e.target.value)}
          />
        </div>
      );
    case "inactive_only":
      return (
        <div className="max-w-md">
          <TriggerNumberField
            label="After # days inactive"
            hint="Saved as `inactive_days` — consecutive days without login."
            value={entry.inactive_days}
            onChange={(e) => upd("inactive_days", e.target.value)}
          />
        </div>
      );
    case "active_only":
      return (
        <div className="max-w-md">
          <TriggerNumberField
            label="After # straight active days"
            hint="Saved as `active_days` — consecutive active days."
            value={entry.active_days}
            onChange={(e) => upd("active_days", e.target.value)}
          />
        </div>
      );
    case "step_only":
      return (
        <div className="max-w-md">
          <TriggerNumberField
            label="Step #"
            hint="Saved as `step_no` — action step index for this trigger type."
            value={entry.step_no}
            onChange={(e) => upd("step_no", e.target.value)}
          />
        </div>
      );
    case "habit_pair":
      return (
        <HabitRoutineLevelField
          entry={entry}
          onChange={onChange}
          habitLevelOptions={habitLevelOptions}
        />
      );
    default:
      return null;
  }
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between py-1">
      <Label className="text-sm font-medium text-gray-800">{label}</Label>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          checked ? "bg-primary" : "bg-gray-300"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function parseOptionalInt(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function HintBanners({ onCopyUserName }) {
  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2.5 text-sm text-gray-800">
        <span className="font-medium text-primary">Email content — </span>
        Type <code className="rounded bg-white/80 px-1 py-0.5 text-xs">@user_name</code>{" "}
        to insert the learner&apos;s name. You can also use {PLACEHOLDER_TOKENS}.
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2.5 text-sm text-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <span>
          <span className="font-medium text-primary">Note — </span>
          use placeholder tokens in the rich text fields so emails stay personalized.
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 border-primary/30 text-primary hover:bg-primary/10"
          onClick={onCopyUserName}
        >
          <Copy size={14} className="mr-1.5" />
          Copy @user_name
        </Button>
      </div>
    </div>
  );
}

function SurveyQuestionsEditor({ questions, onChange }) {
  const updateQuestion = (qIndex, patch) => {
    onChange(questions.map((q, i) => (i === qIndex ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIndex, oIndex, patch) => {
    onChange(
      questions.map((q, i) => {
        if (i !== qIndex) return q;
        return {
          ...q,
          options: (q.options || []).map((opt, j) =>
            j === oIndex ? { ...opt, ...patch } : opt,
          ),
        };
      }),
    );
  };

  const addQuestion = () => onChange([...questions, { text: "", options: [] }]);
  const removeQuestion = (qIndex) =>
    onChange(questions.filter((_, i) => i !== qIndex));

  const addOption = (qIndex) => {
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
    onChange(
      questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: [
                ...(q.options || []),
                { id: uniqueId, text: "", isCorrect: false },
              ],
            }
          : q,
      ),
    );
  };

  const removeOption = (qIndex, oIndex) => {
    onChange(
      questions.map((q, i) =>
        i === qIndex
          ? { ...q, options: (q.options || []).filter((_, j) => j !== oIndex) }
          : q,
      ),
    );
  };

  if (questions.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-primary/25 bg-gray-50/80 px-4 py-6 text-center">
        <p className="text-sm text-gray-600">No survey questions for this trigger.</p>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addQuestion}>
          <Plus size={14} className="mr-1" />
          Add survey question
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">Survey questions</span>
        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
          <Plus size={14} className="mr-1" />
          Add question
        </Button>
      </div>
      {questions.map((q, qIndex) => (
        <div
          key={qIndex}
          className="overflow-hidden rounded-xl border-2 border-primary/15 bg-gradient-to-b from-primary/[0.04] to-white shadow-sm"
        >
          <div className="flex items-center justify-between gap-2 border-b border-primary/10 bg-white/60 px-3 py-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <GripVertical
                size={18}
                className="shrink-0 text-gray-400"
                aria-hidden
              />
              <span className="truncate text-sm font-semibold text-primary">
                Survey question {qIndex + 1}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-red-600 hover:bg-red-50"
              onClick={() => removeQuestion(qIndex)}
              aria-label="Remove survey question"
            >
              <Trash2 size={16} />
            </Button>
          </div>
          <div className="space-y-3 p-3 sm:p-4">
            <RichTextArea
              label="Question text"
              value={q.text || ""}
              onChange={(html) => updateQuestion(qIndex, { text: html })}
              valueFormat="html"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Options
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addOption(qIndex)}>
                  <Plus size={14} className="mr-1" />
                  Add option
                </Button>
              </div>
              {(q.options || []).map((opt, oIndex) => (
                <div
                  key={opt.id ?? oIndex}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2"
                >
                  <GripVertical size={16} className="text-gray-300" aria-hidden />
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {oIndex + 1}
                  </span>
                  <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-gray-200 p-0.5">
                    <button
                      type="button"
                      title="Mark as correct"
                      className={`rounded p-1.5 ${
                        opt.isCorrect
                          ? "bg-primary text-white"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                      onClick={() => updateOption(qIndex, oIndex, { isCorrect: true })}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      title="Not correct"
                      className={`rounded p-1.5 ${
                        !opt.isCorrect
                          ? "bg-gray-200 text-gray-800"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                      onClick={() => updateOption(qIndex, oIndex, { isCorrect: false })}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <Input
                    value={opt.text || ""}
                    onChange={(e) => updateOption(qIndex, oIndex, { text: e.target.value })}
                    placeholder="Option text"
                    className="min-w-[120px] flex-1 border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-red-600 hover:bg-red-50"
                    onClick={() => removeOption(qIndex, oIndex)}
                    aria-label="Remove option"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TriggerEntryCard({
  sectionKey,
  sectionMeta,
  entry,
  includeSurveyQuestions,
  habitLevelOptions,
  onChange,
  onRemove,
  onChangeTriggerType,
}) {
  const setText = (html) => onChange({ ...entry, text: html });
  const setSubheader = (html) => onChange({ ...entry, subheader: html });
  const surveyQuestions = entry.survey_questions || [];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="h-1 w-full bg-primary" aria-hidden />
      <div className="flex flex-col gap-3 border-b border-gray-100 bg-primary/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <Label className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Trigger
          </Label>
          <Select
            value={sectionKey}
            onValueChange={(nextKey) => {
              if (nextKey !== sectionKey) onChangeTriggerType(nextKey);
            }}
          >
            <SelectTrigger className="h-10 w-full border-gray-200 bg-white sm:max-w-md">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {TRIGGER_SECTIONS.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sectionMeta.helper ? (
            <p className="text-xs leading-relaxed text-gray-600">{sectionMeta.helper}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 self-end text-red-600 hover:bg-red-50 sm:self-center"
          onClick={onRemove}
          aria-label="Delete trigger"
        >
          <Trash2 size={18} />
        </Button>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <TriggerDynamicFields
          fieldGroup={sectionMeta.fieldGroup}
          entry={entry}
          onChange={onChange}
          habitLevelOptions={habitLevelOptions}
        />

        <RichTextArea
          label="Sub-header text"
          value={entry.subheader || ""}
          onChange={setSubheader}
          valueFormat="html"
        />

        <RichTextArea
          label="Body text"
          value={entry.text || ""}
          onChange={setText}
          valueFormat="html"
        />

        {includeSurveyQuestions && (
          <>
            <div className="rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2 text-xs text-gray-700">
              <span className="font-medium text-primary">Survey questions — </span>
              Nested on this trigger only (manager). Each question has Quill <code className="mx-0.5 rounded bg-white/90 px-1">text</code> and{" "}
              <code className="mx-0.5 rounded bg-white/90 px-1">options[]</code> with{" "}
              <code className="mx-0.5 rounded bg-white/90 px-1">id</code>,{" "}
              <code className="mx-0.5 rounded bg-white/90 px-1">text</code>,{" "}
              <code className="mx-0.5 rounded bg-white/90 px-1">isCorrect</code>.
            </div>
            <SurveyQuestionsEditor
              questions={surveyQuestions}
              onChange={(next) => onChange({ ...entry, survey_questions: next })}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function PathEmailSettingsPanel({ pathId, variant }) {
  const includeSurveyQuestions = variant === "manager";
  const [config, setConfig] = useState(() => createEmptyPathEmailConfig());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [triggerKindToAdd, setTriggerKindToAdd] = useState("");

  const pathVariant = includeSurveyQuestions ? "manager" : "accountability";

  const habitLevelOptions = useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("sessionData");
      if (!raw) return [];
      const responsePath = JSON.parse(raw)?.response_path;
      return collectHabitLevelOptionsFromResponsePath(responsePath);
    } catch {
      return [];
    }
  }, [pathId]);

  const load = useCallback(async () => {
    if (!pathId) return;
    setLoading(true);
    try {
      const data =
        variant === "manager"
          ? await getManagerEmailConfig(pathId)
          : await getAccountabilityEmailConfig(pathId);
      setConfig(data);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Could not load email settings");
      setConfig(createEmptyPathEmailConfig());
    } finally {
      setLoading(false);
    }
  }, [pathId, variant, includeSurveyQuestions]);

  useEffect(() => {
    load();
  }, [load]);

  const title = useMemo(
    () => (variant === "manager" ? "Manager Emails" : "Accountability Emails"),
    [variant],
  );

  const copyUserName = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("@user_name");
      toast.success("Copied @user_name");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }, []);

  const handleSave = async () => {
    if (!pathId) {
      toast.error("Publish this cycle first to configure path email settings.");
      return;
    }
    setSaving(true);
    try {
      const saved =
        variant === "manager"
          ? await updateManagerEmailConfig(pathId, config)
          : await updateAccountabilityEmailConfig(pathId, config);
      setConfig(saved);
      toast.success("Saved");
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updateTriggerArray = (key, nextArr) => {
    setConfig((prev) => ({ ...prev, [key]: nextArr }));
  };

  const addTrigger = (key) => {
    if (!key) return;
    const empty = createEmptyTriggerEntry(includeSurveyQuestions, pathVariant);
    setConfig((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), empty],
    }));
    setTriggerKindToAdd("");
  };

  const moveTriggerToSection = (fromKey, index, toKey) => {
    if (fromKey === toKey) return;
    setConfig((prev) => {
      const fromArr = [...(prev[fromKey] || [])];
      const [moved] = fromArr.splice(index, 1);
      if (!moved) return prev;
      const merged = {
        ...createEmptyTriggerEntry(includeSurveyQuestions, pathVariant),
        ...moved,
      };
      if (includeSurveyQuestions) {
        merged.survey_questions = Array.isArray(moved.survey_questions)
          ? moved.survey_questions
          : [];
      } else {
        delete merged.survey_questions;
      }
      const sanitized = sanitizeTriggerEntryForApi(merged, toKey, includeSurveyQuestions);
      const toArr = [...(prev[toKey] || []), sanitized];
      return {
        ...prev,
        [fromKey]: fromArr,
        [toKey]: toArr,
      };
    });
  };

  const triggerBlocks = useMemo(() => {
    const blocks = [];
    TRIGGER_SECTIONS.forEach((section) => {
      const arr = config[section.key] || [];
      arr.forEach((entry, index) => {
        blocks.push({ section, entry, index });
      });
    });
    return blocks;
  }, [config]);

  if (!pathId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="max-w-sm rounded-xl border border-primary/20 bg-primary/[0.04] p-6">
          <Info className="mx-auto mb-3 h-10 w-10 text-primary" />
          <p className="text-sm font-medium text-gray-900">Published path required</p>
          <p className="mt-2 text-sm text-gray-600">
            Email triggers are stored on the published cycle. Publish this cycle first, then open
            this tab again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-primary sm:text-xl">
                {title}
              </h3>
              <p className="mt-1 max-w-xl text-xs text-gray-500 sm:text-sm">
                PUT replaces the whole JSONB blob: all seven trigger arrays,{" "}
                <code className="text-[11px]">enabled</code>,{" "}
                <code className="text-[11px]">notification_time</code>,{" "}
                <code className="text-[11px]">close_out_text</code>. Unused fields per trigger are
                sent as <code className="text-[11px]">null</code>.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[240px]">
              <Select
                value={triggerKindToAdd || undefined}
                onValueChange={setTriggerKindToAdd}
              >
                <SelectTrigger className="h-10 w-full border-gray-200 bg-white">
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_SECTIONS.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => addTrigger(triggerKindToAdd)}
                disabled={!triggerKindToAdd}
              >
                <Plus size={16} className="mr-1.5" />
                Add trigger
              </Button>
            </div>
          </div>

          <HintBanners onCopyUserName={copyUserName} />

          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">Loading…</p>
          ) : (
            <>
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
                  Schedule
                </p>
                <div className="space-y-4">
                  <ToggleSwitch
                    checked={!!config.enabled}
                    onChange={(v) => setConfig((p) => ({ ...p, enabled: v }))}
                    label="Emails enabled"
                  />
                  <div className="max-w-xs space-y-1.5">
                    <Label className="text-sm font-medium text-gray-800">
                      Notification time (UTC)
                    </Label>
                    <Input
                      type="time"
                      value={config.notification_time || ""}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          notification_time: e.target.value || null,
                        }))
                      }
                      className="rounded-lg border-2 border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <Label className="text-base font-semibold text-primary">Close out text</Label>
                <p className="mt-1 text-xs text-gray-500">
                  Sent when the learner completes the path (single close-out email).
                </p>
                <div className="mt-3">
                  <RichTextArea
                    label="Content"
                    value={config.close_out_text || ""}
                    onChange={(html) => setConfig((p) => ({ ...p, close_out_text: html }))}
                    valueFormat="html"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-gray-900">Triggers</h4>
                  <span className="text-xs text-gray-500">
                    {triggerBlocks.length} configured
                  </span>
                </div>
                {triggerBlocks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-4 py-10 text-center">
                    <p className="text-sm text-gray-600">
                      No triggers yet. Choose a type above and click{" "}
                      <span className="font-medium text-primary">Add trigger</span>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {triggerBlocks.map(({ section, entry, index }) => (
                      <TriggerEntryCard
                        key={`${section.key}-${index}`}
                        sectionKey={section.key}
                        sectionMeta={section}
                        entry={entry}
                        includeSurveyQuestions={includeSurveyQuestions}
                        habitLevelOptions={habitLevelOptions}
                        onChange={(next) => {
                          const arr = [...(config[section.key] || [])];
                          arr[index] = next;
                          updateTriggerArray(section.key, arr);
                        }}
                        onRemove={() => {
                          const arr = (config[section.key] || []).filter((_, i) => i !== index);
                          updateTriggerArray(section.key, arr);
                        }}
                        onChangeTriggerType={(nextKey) =>
                          moveTriggerToSection(section.key, index, nextKey)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="h-1 shrink-0 bg-primary" aria-hidden />
      <div className="flex shrink-0 justify-end border-t border-gray-100 bg-white px-4 py-3 sm:px-6">
        <Button
          onClick={handleSave}
          disabled={loading || saving}
          className="min-w-[120px] bg-primary px-8 hover:bg-primary/90"
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

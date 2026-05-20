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
  CircleCheck,
  CircleX,
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

const PLACEHOLDER_TOKENS =
  "@user_name, @first_name, @path_name, @user_activity, @leaderboard";

const pathEmailInputClass =
  "h-9 min-h-9 rounded-lg border border-[#D5D7DA] bg-white px-3 py-[7.5px] text-sm text-[#181D27] shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus-visible:ring-2 focus-visible:ring-primary/30";

const pathEmailLabelClass = "text-sm font-medium leading-5 text-[#181D27]";

const pathEmailDeleteBtnClass =
  "inline-flex h-9 w-9 min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg bg-[#F04438] text-white transition-colors hover:bg-[#F04438]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F04438]/40";

const pathEmailOutlineButtonClass =
  "h-7 rounded-lg border border-[#7367F0] bg-white px-4 text-sm font-medium leading-5 text-[#7367F0] shadow-none hover:bg-white/90";

const pathEmailSurveyCardClass =
  "rounded-lg bg-[#F5F5F5] shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

function PathEmailOutlineFullButton({ onClick, children, className = "" }) {
  return (
    <button
      type="button"
      className={`flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[#7367F0] bg-white text-sm font-medium leading-5 text-[#7367F0] transition-colors hover:bg-[#F8F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7367F0]/30 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PathEmailDeleteButton({ onClick, label, size = 16 }) {
  return (
    <button
      type="button"
      className={pathEmailDeleteBtnClass}
      onClick={onClick}
      aria-label={label}
    >
      <Trash2 size={size} strokeWidth={1.75} />
    </button>
  );
}

/** Scoped Figma styles for RichTextArea — does not modify shared FormFields. */
function PathEmailRichText(props) {
  return (
    <div className="path-email-rich-text">
      <RichTextArea {...props} />
    </div>
  );
}
const TRIGGER_SECTIONS = [
  {
    key: "days_after_completion",
    label: "Trigger for completion of steps",
    fieldGroup: "days_step",
  },

  {
    key: "inactive_days",
    label: "Trigger for inactive days",
    fieldGroup: "inactive_only",
  },

  {
    key: "active_days",
    label: "Trigger for straight active days",
    fieldGroup: "active_only",
  },

  {
    key: "after_action_commit",
    label: "Trigger for committing to an action",
    fieldGroup: "step_only",
  },

  {
    key: "after_action_complete",
    label: "Trigger for completing action",
    fieldGroup: "step_only",
  },

  {
    key: "after_habit_commit",
    label: "Trigger for committing to habit level",
    fieldGroup: "habit_pair",
  },

  {
    key: "after_habit_complete",
    label: "Trigger for completing habit level",
    fieldGroup: "habit_pair",
  },
];

function TriggerTypePicker({ value, onValueChange }) {
  return (
    <div className="rounded-lg border border-[#D5D7DA] bg-[#F5F5F5] p-2">
      <div className="flex flex-col gap-2 bg-white p-2 rounded-lg">
        <Label className="mb-2 block text-sm font-normal leading-5 text-[#535862]">
          Trigger
        </Label>
        <Select value={value || undefined} onValueChange={onValueChange}>
          <SelectTrigger className={`w-full ${pathEmailInputClass}`}>
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
      </div>
    </div>
  );
}

function TriggerNumberField({ label, hint, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label className={pathEmailLabelClass}>{label}</Label>
      {hint ? <p className="text-xs leading-4 text-[#717680]">{hint}</p> : null}
      <Input
        type="number"
        value={value ?? ""}
        onChange={onChange}
        placeholder="—"
        className={pathEmailInputClass}
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
    composite && habitLevelOptions.some((o) => o.value === composite);

  if (habitLevelOptions.length === 0) {
    return (
      <div className="space-y-3">
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TriggerNumberField
            label="Habit routine number"
            value={entry.routine_info_id}
            onChange={(e) => updateManual("routine_info_id", e.target.value)}
          />
          <TriggerNumberField
            label="Habit level number"
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
        <Label className={pathEmailLabelClass}>Select habit level</Label>
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
          <SelectTrigger className={`w-full ${pathEmailInputClass}`}>
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
          Current routine_info_id / level_id are not on the path outline
          anymore. Pick a new pair or use manual IDs below.
        </p>
      ) : null}
      <details className="rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 text-xs text-gray-600">
        <summary className="cursor-pointer font-medium text-gray-800">
          Manual IDs
        </summary>
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

function TriggerDynamicFields({
  fieldGroup,
  entry,
  onChange,
  habitLevelOptions,
}) {
  const upd = (field, raw) => {
    const v = parseOptionalInt(raw);
    onChange({ ...entry, [field]: v });
  };

  switch (fieldGroup) {
    case "days_step":
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TriggerNumberField
            label="Number of days"
            value={entry.days}
            onChange={(e) => upd("days", e.target.value)}
          />
          <TriggerNumberField
            label="After completing step"
            value={entry.step_no}
            onChange={(e) => upd("step_no", e.target.value)}
          />
        </div>
      );
    case "inactive_only":
      return (
        <div className="max-w-md">
          <TriggerNumberField
            label="Days after inactive Days"
            value={entry.inactive_days}
            onChange={(e) => upd("inactive_days", e.target.value)}
          />
        </div>
      );
    case "active_only":
      return (
        <div className="max-w-md">
          <TriggerNumberField
            label="Days After Straight Active Days"
            value={entry.active_days}
            onChange={(e) => upd("active_days", e.target.value)}
          />
        </div>
      );
    case "step_only":
      return (
        <div className="max-w-md">
          <TriggerNumberField
            label="Action Number"
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
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7367F0] focus:ring-offset-2 ${
          checked ? "bg-[#7367F0]" : "bg-[#D5D7DA]"
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
    <div className="flex flex-col gap-2">
      <div className="rounded-lg bg-[#F1F0FE] px-4 py-4 text-sm font-medium leading-5 text-[#181D27]">
        <span className="text-[#7367F0]">Email content — </span>
        Type{" "}
        <code className="rounded bg-white/80 px-1 py-0.5 text-xs">
          @user_name
        </code>{" "}
        to insert the learner&apos;s name. You can also use {PLACEHOLDER_TOKENS}
        .
      </div>
      <div className="flex flex-col gap-2.5 rounded-lg bg-[#F1F0FE] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium leading-5 text-[#181D27]">
          <span className="text-[#7367F0]">Note — </span>
          use placeholder tokens in the rich text fields so emails stay
          personalized.
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`shrink-0 ${pathEmailOutlineButtonClass}`}
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
      <PathEmailOutlineFullButton onClick={addQuestion}>
        <Plus size={14} strokeWidth={2} />
        Add Question
      </PathEmailOutlineFullButton>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {questions.map((q, qIndex) => (
        <div key={qIndex} className={pathEmailSurveyCardClass}>
          <div className="flex flex-col gap-4 bg-white p-2 rounded-lg">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label className={pathEmailLabelClass}>Question</Label>
                {questions.length > 1 ? (
                  <PathEmailDeleteButton
                    onClick={() => removeQuestion(qIndex)}
                    label="Remove question"
                    size={14}
                  />
                ) : null}
              </div>
              <div className="path-email-survey-question">
                <PathEmailRichText
                  label=""
                  value={q.text || ""}
                  onChange={(html) => updateQuestion(qIndex, { text: html })}
                  valueFormat="html"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label className={pathEmailLabelClass}>Options</Label>

              <div className="flex flex-col gap-2.5">
                {(q.options || []).map((opt, oIndex) => (
                  <div
                    key={opt.id ?? oIndex}
                    className="flex items-center gap-2"
                  >
                    <GripVertical
                      size={18}
                      className="shrink-0 cursor-grab text-[#A4A7AE]"
                      aria-hidden
                    />
                    <span className="inline-flex h-9 w-[52px] shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5] text-sm font-medium text-[#717680]">
                      {oIndex + 1}
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        title="Mark as correct"
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F5] cursor-pointer ${
                          opt.isCorrect ? "bg-green-200" : ""
                        }`}
                        onClick={() =>
                          updateOption(qIndex, oIndex, { isCorrect: true })
                        }
                      >
                        <CircleCheck
                          size={14}
                          className={
                            opt.isCorrect ? "text-green-500" : "text-[#A4A7AE]"
                          }
                          strokeWidth={1.75}
                        />
                      </button>
                      <button
                        type="button"
                        title="Not correct"
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F5] cursor-pointer ${
                          !opt.isCorrect ? "bg-red-200" : ""
                        }`}
                        onClick={() =>
                          updateOption(qIndex, oIndex, { isCorrect: false })
                        }
                      >
                        <CircleX
                          size={14}
                          className={
                            !opt.isCorrect ? "text-red-500" : "text-[#A4A7AE]"
                          }
                          strokeWidth={1.75}
                        />
                      </button>
                    </div>
                    <Input
                      value={opt.text || ""}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, { text: e.target.value })
                      }
                      placeholder=""
                      className={`min-w-0 flex-1 ${pathEmailInputClass}`}
                    />
                    <PathEmailDeleteButton
                      onClick={() => removeOption(qIndex, oIndex)}
                      label="Remove option"
                      size={14}
                    />
                  </div>
                ))}
              </div>

              <PathEmailOutlineFullButton onClick={() => addOption(qIndex)}>
                <Plus size={14} strokeWidth={2} />
                Add Option
              </PathEmailOutlineFullButton>
            </div>
          </div>
        </div>
      ))}

      <PathEmailOutlineFullButton onClick={addQuestion} className="mt-1">
        <Plus size={14} strokeWidth={2} />
        Add Question
      </PathEmailOutlineFullButton>
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
    <div className="flex flex-col gap-2">
      <div className="rounded-2xl bg-[#F5F5F5]">
        <div className="flex flex-col gap-2 rounded-lg bg-white p-4">
          <Label className={pathEmailLabelClass}>Trigger</Label>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <Select
                value={sectionKey}
                onValueChange={(nextKey) => {
                  if (nextKey !== sectionKey) onChangeTriggerType(nextKey);
                }}
              >
                <SelectTrigger className={`w-full ${pathEmailInputClass}`}>
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
                <p className="text-xs leading-5 text-[#717680]">
                  {sectionMeta.helper}
                </p>
              ) : null}
            </div>
            <PathEmailDeleteButton
              onClick={onRemove}
              label="Delete trigger"
              size={16}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#F1F0FE] ">
        <div className="flex flex-col gap-4 rounded-lg bg-white p-4">
          <TriggerDynamicFields
            fieldGroup={sectionMeta.fieldGroup}
            entry={entry}
            onChange={onChange}
            habitLevelOptions={habitLevelOptions}
          />

          <PathEmailRichText
            label="Sub-header text"
            value={entry.subheader || ""}
            onChange={setSubheader}
            valueFormat="html"
          />

          <PathEmailRichText
            label="Body text"
            value={entry.text || ""}
            onChange={setText}
            valueFormat="html"
          />
        </div>

        {includeSurveyQuestions ? (
          <div className="mt-2">
            <SurveyQuestionsEditor
              questions={surveyQuestions}
              onChange={(next) =>
                onChange({ ...entry, survey_questions: next })
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function PathEmailSettingsPanel({
  pathId,
  variant,
  onSaveSuccess,
}) {
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

  /** GET /paths/{path_id}/manager_email or accountability_email — full config including all seven trigger arrays. */
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
  }, [pathId, variant]);

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
      // PUT returns the same shape as GET; keep triggers visible (do not reset to empty).
      setConfig(saved);
      setTriggerKindToAdd("");
      toast.success("Email settings saved successfully");
      onSaveSuccess?.();
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
      const sanitized = sanitizeTriggerEntryForApi(
        merged,
        toKey,
        includeSurveyQuestions,
      );
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
          <p className="text-sm font-medium text-gray-900">
            Published path required
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Email triggers are stored on the published cycle. Publish this cycle
            first, then open this tab again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="path-email-settings flex h-full min-h-0 flex-col bg-white">
      <style>{`
        .path-email-settings .path-email-rich-text > .mb-4 { margin-bottom: 0; }
        .path-email-settings .path-email-rich-text > .mb-4 > .mb-2 {
          margin-bottom: 0;
          padding: 4px 4px 0;
          gap: 6px;
        }
        .path-email-settings .path-email-rich-text label {
          font-size: 14px;
          font-weight: 500;
          line-height: 20px;
          color: #181D27;
        }
        .path-email-settings .path-email-rich-text .bg-gray-100 {
          border-radius: 12px;
          background: #F5F5F5;
          padding: 4px;
        }
        .path-email-settings .path-email-rich-text .bg-gray-100 > div:first-child {
          min-height: 76px;
          height: 76px;
          border: 1px solid #D5D7DA;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .path-email-settings .path-email-rich-text .bg-gray-100 > div:first-child .ql-editor {
          min-height: 76px;
          font-size: 14px;
          line-height: 20px;
          color: #181D27;
        }
        .path-email-settings .path-email-rich-text .rich-text-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          padding: 8px !important;
          gap: 16px !important;
          border: none !important;
        }
        .path-email-settings .path-email-rich-text .rich-text-toolbar button {
          color: #1C274C;
          width: 14px;
          height: 14px;
          padding: 0;
        }
        .path-email-settings .path-email-rich-text .rich-text-toolbar .ql-heading1,
        .path-email-settings .path-email-rich-text .rich-text-toolbar .ql-heading2,
        .path-email-settings .path-email-rich-text .rich-text-toolbar .ql-heading3 {
          width: auto;
          height: auto;
          min-width: 14px;
          min-height: 14px;
          font-size: 12px;
          line-height: 14px;
          color: #1C274C;
        }
        .path-email-settings .path-email-rich-text .rich-text-toolbar .ql-stroke { stroke: #1C274C; }
        .path-email-settings .path-email-rich-text .rich-text-toolbar .ql-fill { fill: #1C274C; }
        .path-email-settings .path-email-survey-question .path-email-rich-text > .mb-4 > .mb-2 {
          display: none;
        }
        .path-email-settings .path-email-survey-question .path-email-rich-text > .mb-4 {
          margin-bottom: 0;
        }
      `}</style>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <div className="max-w-4xl space-y-6 bg-[#F5F5F5] p-2 rounded-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-primary sm:text-xl">
                {title}
              </h3>
              {/* <p className="mt-1 max-w-xl text-xs text-gray-500 sm:text-sm">
                PUT replaces the whole JSONB blob: all seven trigger arrays,{" "}
                <code className="text-[11px]">enabled</code>,{" "}
                <code className="text-[11px]">notification_time</code>,{" "}
                <code className="text-[11px]">close_out_text</code>. Unused fields per trigger are
                sent as <code className="text-[11px]">null</code>.
              </p> */}
            </div>
            <Button
              type="button"
              variant="outline"
              className={`h-9 w-full shrink-0 border-[#7367F0] text-[#7367F0] sm:w-auto sm:min-w-[140px]`}
              onClick={() => addTrigger(triggerKindToAdd)}
              disabled={!triggerKindToAdd}
            >
              <Plus size={16} className="mr-1.5" />
              Add trigger
            </Button>
          </div>
          <div className="flex flex-col gap-2 bg-white p-2 rounded-lg">
            <HintBanners onCopyUserName={copyUserName} />

            {loading ? (
              <p className="py-8 text-center text-sm text-gray-500">Loading…</p>
            ) : (
              <>
                {/* <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5">
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
                    <Label className={pathEmailLabelClass}>
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
                      className={pathEmailInputClass}
                    />
                  </div>
                </div>
              </div> */}

                <TriggerTypePicker
                  value={triggerKindToAdd}
                  onValueChange={setTriggerKindToAdd}
                />
                <div className="flex flex-col">
                  <Label className={pathEmailLabelClass}>Close out text</Label>

                  <div className="mt-3">
                    <PathEmailRichText
                      value={config.close_out_text || ""}
                      onChange={(html) =>
                        setConfig((p) => ({ ...p, close_out_text: html }))
                      }
                      valueFormat="html"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Triggers
                    </h4>
                    <span className="text-xs text-gray-500">
                      {triggerBlocks.length} configured
                    </span>
                  </div>
                  {triggerBlocks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-4 py-10 text-center">
                      <p className="text-sm text-gray-600">
                        No triggers yet. Choose a trigger type and click{" "}
                        <span className="font-medium text-primary">
                          Add trigger
                        </span>
                        .
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {triggerBlocks.map(({ section, entry, index }) => (
                        <React.Fragment key={`${section.key}-${index}`}>
                          <div
                            className="h-[23px] w-full shrink-0  bg-[#7367F0]"
                            aria-hidden
                          />
                          <div className="flex flex-col gap-2 overflow-hidden rounded-2xl bg-[#F5F5F5] p-2">
                            <TriggerEntryCard
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
                                const arr = (config[section.key] || []).filter(
                                  (_, i) => i !== index,
                                );
                                updateTriggerArray(section.key, arr);
                              }}
                              onChangeTriggerType={(nextKey) =>
                                moveTriggerToSection(
                                  section.key,
                                  index,
                                  nextKey,
                                )
                              }
                            />
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
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

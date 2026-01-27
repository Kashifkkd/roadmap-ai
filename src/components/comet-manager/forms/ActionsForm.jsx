import React from "react";
import { TextField, RichTextArea, SectionHeader } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Info } from "lucide-react";
import UploadTool from "@/components/common/UploadTool";

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, label, showInfo = false }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium text-gray-800">{label}</Label>
      {showInfo && (
        <Info
          size={16}
          className="text-gray-500 cursor-help"
          title="Users will be asked a reflection question when they complete this action"
        />
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? "bg-primary" : "bg-gray-300"
        }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${checked ? "translate-x-6" : "translate-x-1"
          }`}
      />
    </button>
  </div>
);

export default function ActionsForm({
  formData,
  updateField,
  askKyperHandlers = {},
  sessionId = "",
  chapterId = "",
  stepId = "",
  screenId = "",
  chapterUuid = "",
  stepUuid = "",
  screenUuid = "",
  screen = {},
}) {
  const {
    onTextFieldSelect,
    onFieldBlur,
    onRichTextSelection,
    onRichTextBlur,
  } = askKyperHandlers;

  console.log("formData >>>", formData);

  // Handle tool upload success
  const handleToolUploadSuccess = (toolData) => {
    if (toolData?.url) {
      updateField("toolLink", toolData.url);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Action" />
      </div>

      <div className="bg-white rounded-lg p-2">
        <div className="mb-6 space-y-4">
          <TextField
            label="Title"
            value={formData.title || ""}
            onChange={(value) => updateField("title", value)}
            inputProps={{
              onSelect: (event) =>
                onTextFieldSelect?.("actionTitle", event, formData.title),
              onBlur: onFieldBlur,
            }}
          />

          <RichTextArea
            label="Description"
            value={formData.text || ""}
            onChange={(value) => updateField("text", value)}
            onSelectionChange={(selectionInfo) =>
              onRichTextSelection?.("actionText", selectionInfo, formData.text)
            }
            onBlur={onRichTextBlur}
          />
        </div>

        {/* Tool Name */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Tool Name
          </Label>
          <Input
            type="text"
            value={formData.toolName || ""}
            onChange={(e) => updateField("toolName", e.target.value)}
            placeholder="Enter tool name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            onSelect={(event) =>
              onTextFieldSelect?.("actionToolName", event, formData.toolName)
            }
            onBlur={onFieldBlur}
          />
        </div>

        {/* Tool Link */}
        <div className="mb-6">
          <UploadTool
            label="Upload Tool File"
            sessionId={sessionId}
            pathId={screen?.pathId || ""}
            chapterId={chapterUuid || chapterId || ""}
            stepId={stepUuid || stepId || ""}
            screenId={screenUuid || screenId || ""}
            screenContentId={screen?.screenContents?.uuid || ""}
            toolName={formData.toolName || formData.title || "Tool"}
            onUploadSuccess={handleToolUploadSuccess}
          />
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Tool Link
          </Label>
          <Input
            type="text"
            value={formData.toolLink || ""}
            onChange={(e) => updateField("toolLink", e.target.value)}
            placeholder="Enter tool URL or link"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            onSelect={(event) =>
              onTextFieldSelect?.("actionToolLink", event, formData.toolLink)
            }
            onBlur={onFieldBlur}
          />
        </div>

        {/* Reflection Prompt - only visible when hasReflectionQuestion is true */}
        {formData.hasReflectionQuestion && (
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Reflection Prompt
            </Label>
            <Textarea
              value={formData.reflectionPrompt || ""}
              onChange={(e) => updateField("reflectionPrompt", e.target.value)}
              rows={4}
              placeholder="Enter reflection prompt..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white resize-none"
              onSelect={(event) =>
                onTextFieldSelect?.(
                  "actionReflectionPrompt",
                  event,
                  formData.reflectionPrompt
                )
              }
              onBlur={onFieldBlur}
            />
          </div>
        )}

        {/* Toggle switches */}
        <div className="mb-4 pt-6 border-t border-gray-300">
          <div className="space-y-4">
            <ToggleSwitch
              checked={formData.canCompleteNow ?? false}
              onChange={(value) => updateField("canCompleteNow", value)}
              label="Users can complete this action immediately"
            />

            <ToggleSwitch
              checked={formData.canSchedule ?? false}
              onChange={(value) => updateField("canSchedule", value)}
              label="Users can schedule this action for later"
            />

            <ToggleSwitch
              checked={formData.hasReflectionQuestion ?? false}
              onChange={(value) => updateField("hasReflectionQuestion", value)}
              label="Users are prompted with a reflection question when completing this action"
              showInfo={true}
            />
          </div>
          {/* {formData.hasReflectionQuestion && (
            <div className="mb-4 mt-4 ml-6">
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Reflection Question
              </Label>
              <Input
                type="text"
                value={formData.reflection_question || ""}
                onChange={(e) =>
                  updateField("reflection_question", e.target.value)
                }
                placeholder="Enter reflection question..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
              />
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

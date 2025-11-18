import React from "react";
import {
  SectionHeader,
  TextField,
  RichTextArea,
  ListField,
} from "./FormFields";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

// Helper to generate unique IDs
const generateId = (prefix) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to extract plain text from Quill delta JSON
const extractPlainTextFromDelta = (value) => {
  if (value == null) return "";
  if (typeof value !== "string") return value;
  if (value.trim() === "") return value;
  
  if (value.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && parsed.ops && Array.isArray(parsed.ops)) {
        return parsed.ops
          .map((op) => (op.insert && typeof op.insert === "string" ? op.insert : ""))
          .join("");
      }
    } catch {
      // Not valid JSON, return as-is
    }
  }
  return value;
};

export default function PollMcqForm({
  formData,
  updateField,
  addListItem,
  updateListItem,
  removeListItem,
  reorderListItem,
  askKyperHandlers = {},
}) {
  const {
    onTextFieldSelect,
    onFieldBlur,
    onRichTextSelection,
    onRichTextBlur,
  } = askKyperHandlers;

  // Normalize options to object format
  const normalizeOptions = (options) => {
    if (!Array.isArray(options)) return [];
    return options.map((opt, index) => {
      if (typeof opt === "string") {
        return {
          option_id: generateId("o"),
          text: opt,
          is_correct: false,
        };
      }
      return {
        option_id: opt.option_id || generateId("o"),
        text: opt.text || opt.label || "",
        is_correct: opt.is_correct !== undefined ? opt.is_correct : false,
        answer_counts: opt.answer_counts || 0,
      };
    });
  };

  const options = normalizeOptions(formData.options || []);

  // Update an option
  const handleUpdateOption = (index, value) => {
    const updatedOptions = [...options];
    if (typeof updatedOptions[index] === "string") {
      updatedOptions[index] = {
        option_id: generateId("o"),
        text: value,
        is_correct: false,
      };
    } else {
      updatedOptions[index] = {
        ...updatedOptions[index],
        text: value,
      };
    }
    updateField("options", updatedOptions);
  };

  // Remove an option
  const handleRemoveOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    updateField("options", updatedOptions);
  };

  // Reorder options
  const handleReorderOptions = (draggedIndex, dropIndex) => {
    if (reorderListItem) {
      reorderListItem("options", draggedIndex, dropIndex);
    } else {
      const updatedOptions = [...options];
      const draggedOption = updatedOptions[draggedIndex];
      updatedOptions.splice(draggedIndex, 1);
      updatedOptions.splice(dropIndex, 0, draggedOption);
      updateField("options", updatedOptions);
    }
  };

  // Toggle correct answer
  const handleToggleCorrect = (index, isCorrect) => {
    const updatedOptions = [...options];
    if (typeof updatedOptions[index] === "string") {
      updatedOptions[index] = {
        option_id: generateId("o"),
        text: updatedOptions[index],
        is_correct: isCorrect,
      };
    } else {
      updatedOptions[index] = {
        ...updatedOptions[index],
        is_correct: isCorrect,
      };
    }
    updateField("options", updatedOptions);
  };

  // Add a new option
  const handleAddOption = () => {
    const newOption = {
      option_id: generateId("o"),
      text: "",
      is_correct: false,
    };
    const updatedOptions = [...options, newOption];
    updateField("options", updatedOptions);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Multiple Choice/Survey" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        <TextField
          label="Title"
          value={formData.title || ""}
          onChange={(value) => updateField("title", value)}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.("mcqTitle", event, formData.title),
            onBlur: onFieldBlur,
          }}
        />
        <RichTextArea
          label="Question"
          value={formData.question || ""}
          onChange={(value) => {
            // RichTextArea provides delta format, but we need to extract plain text for the form field
            const plainText = extractPlainTextFromDelta(value);
            updateField("question", plainText);
          }}
          onSelectionChange={(selectionInfo) =>
            onRichTextSelection?.(
              "mcqQuestion",
              selectionInfo,
              formData.question
            )
          }
          onBlur={onRichTextBlur}
        />
        <ListField
          label="Poll Options"
          items={options}
          onUpdate={handleUpdateOption}
          onRemove={handleRemoveOption}
          onReorder={handleReorderOptions}
          onToggleCorrect={handleToggleCorrect}
          showCorrectAnswer={true}
        />
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={handleAddOption}
            className="flex items-center gap-2 px-3 py-2 text-background rounded-lg w-full"
          >
            <Plus size={16} />
            Add Option
          </Button>

          <Button
            type="button"
            disabled
            className="flex items-center gap-2 px-3 py-2 text-background rounded-lg w-full opacity-50 cursor-not-allowed"
          >
            <Plus size={16} />
            Add Question
          </Button>
        </div>
      </div>
    </div>
  );
}

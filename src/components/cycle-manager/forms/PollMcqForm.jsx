import React from "react";
import {
  SectionHeader,
  TextField,
  TextArea,
  RichTextArea,
  ListField,
} from "./FormFields";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

const toNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

export default function PollMcqForm({
  formData,
  updateField,
  addListItem,
  updateListItem,
  removeListItem,
  reorderListItem,
  askKyperHandlers = {},
  onRequestAutoSave,
}) {
  const {
    onTextFieldSelect,
    onFieldBlur,
    onRichTextSelection,
    onRichTextBlur,
  } = askKyperHandlers;

  // Normalize options to backend schema (camelCase + numeric optionId)
  const normalizeOptions = (options) => {
    if (!Array.isArray(options)) return [];
    const numericIds = options
      .map((opt) => toNumber(opt?.optionId ?? opt?.option_id))
      .filter((id) => id !== null);
    let nextOptionId = numericIds.length ? Math.max(...numericIds) + 1 : 1;

    return options.map((opt, index) => {
      if (typeof opt === "string") {
        return {
          optionId: nextOptionId++,
          text: opt,
          isCorrect: false,
        };
      }

      const existingId = toNumber(opt?.optionId ?? opt?.option_id);
      return {
        optionId: existingId ?? nextOptionId++,
        text: opt.text || opt.label || "",
        isCorrect:
          opt?.isCorrect !== undefined
            ? opt.isCorrect
            : (opt?.is_correct ?? false),
      };
    });
  };

  const ensureAtLeastOneCorrect = (list) => {
    if (!Array.isArray(list) || list.length === 0) return [];
    if (list.some((option) => option?.isCorrect === true)) return list;
    const updated = [...list];
    updated[0] = { ...updated[0], isCorrect: true };
    return updated;
  };

  const options = normalizeOptions(formData.options || []);

  // Update an option
  const handleUpdateOption = (index, value) => {
    const updatedOptions = [...options];
    if (typeof updatedOptions[index] === "string") {
      updatedOptions[index] = {
        optionId: (Math.max(0, ...options.map((o) => o.optionId || 0)) || 0) + 1,
        text: value,
        isCorrect: false,
      };
    } else {
      updatedOptions[index] = {
        ...updatedOptions[index],
        text: value,
      };
    }
    updateField("options", ensureAtLeastOneCorrect(updatedOptions));
  };

  // Remove an option
  const handleRemoveOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    updateField("options", ensureAtLeastOneCorrect(updatedOptions));
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
      updateField("options", ensureAtLeastOneCorrect(updatedOptions));
    }
  };

  // Toggle correct answer
  const handleToggleCorrect = (index, isCorrect) => {
    const updatedOptions = [...options];
    if (typeof updatedOptions[index] === "string") {
      updatedOptions[index] = {
        optionId: (Math.max(0, ...options.map((o) => o.optionId || 0)) || 0) + 1,
        text: updatedOptions[index],
        isCorrect: isCorrect,
      };
    } else {
      updatedOptions[index] = {
        ...updatedOptions[index],
        isCorrect: isCorrect,
      };
    }
    updateField("options", ensureAtLeastOneCorrect(updatedOptions));
  };

  
  const handleAddOption = () => {
    const newOption = {
      optionId: (Math.max(0, ...options.map((o) => o.optionId || 0)) || 0) + 1,
      text: "",
      isCorrect: false,
    };
    const updatedOptions = [...options, newOption];
    updateField("options", ensureAtLeastOneCorrect(updatedOptions));
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
          onRequestAutoSave={onRequestAutoSave}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.("mcqTitle", event, formData.title),
            onBlur: onFieldBlur,
          }}
        />
        <RichTextArea
          label="Question"
          value={formData.question || ""}
          onChange={(value) => updateField("question", value)}
          onRequestAutoSave={onRequestAutoSave}
          onSelectionChange={(selectionInfo) =>
            onRichTextSelection?.(
              "mcqQuestion",
              selectionInfo,
              formData.question
            )
          }
          onBlur={onRichTextBlur}
          valueFormat="html"
        />
        <TextArea
          label="Key Learning"
          value={formData.keyLearning || ""}
          onChange={(value) => updateField("keyLearning", value)}
          onRequestAutoSave={onRequestAutoSave}
          placeholder=""
          rows={3}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.("mcqKeyLearning", event, formData.keyLearning),
            onBlur: onFieldBlur,
          }}
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

          {/* <Button
            type="button"
            disabled
            className="flex items-center gap-2 px-3 py-2 text-background rounded-lg w-full opacity-50 cursor-not-allowed"
          >
            <Plus size={16} />
            Add Question
          </Button> */}
        </div>
      </div>
    </div>
  );
}

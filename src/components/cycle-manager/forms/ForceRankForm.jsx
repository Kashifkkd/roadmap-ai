import React from "react";
import {
  SectionHeader,
  TextField,
  RichTextArea,
  ListField,
} from "./FormFields";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

function maxOptionId(options) {
  return options.reduce((max, o) => {
    const id = o?.optionId ?? o?.option_id;
    const n = typeof id === "number" ? id : Number(id);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
}

/** Keep { optionId, text } so saved content matches API/schema (not bare strings). */
function normalizeForceRankOptions(options) {
  if (!Array.isArray(options)) return [];
  let maxId = 0;
  const staged = options.map((opt) => {
    if (typeof opt === "string") {
      return { __needsId: true, text: opt };
    }
    if (opt && typeof opt === "object") {
      const id = opt.optionId ?? opt.option_id;
      const n = typeof id === "number" ? id : Number(id);
      if (Number.isFinite(n)) maxId = Math.max(maxId, n);
      return {
        optionId: Number.isFinite(n) ? n : null,
        text: opt.text || opt.label || "",
      };
    }
    return { __needsId: true, text: "" };
  });
  let next = maxId;
  return staged.map((o) => {
    if (o.__needsId) {
      next += 1;
      return { optionId: next, text: o.text };
    }
    if (o.optionId == null) {
      next += 1;
      return { optionId: next, text: o.text };
    }
    return { optionId: o.optionId, text: o.text };
  });
}

export default function ForceRankForm({
  formData,
  updateField,
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

  const options = normalizeForceRankOptions(formData.options || []);

  const handleUpdateOption = (index, value) => {
    const updated = [...options];
    updated[index] = { ...updated[index], text: value };
    updateField("options", updated);
  };

  const handleRemoveOption = (index) => {
    updateField(
      "options",
      options.filter((_, i) => i !== index)
    );
  };

  const handleReorderOptions = (draggedIndex, dropIndex) => {
    if (reorderListItem) {
      reorderListItem("options", draggedIndex, dropIndex);
    }
  };

  const handleAddOption = () => {
    const newOption = {
      optionId: maxOptionId(options) + 1,
      text: "",
    };
    updateField("options", [...options, newOption]);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Force Rank" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        <TextField
          label="Title"
          value={formData.title || ""}
          onChange={(value) => updateField("title", value)}
          onRequestAutoSave={onRequestAutoSave}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.("forceRankTitle", event, formData.title),
            onBlur: onFieldBlur,
          }}
        />
        <TextField
          label="Top Label"
          value={formData.highLabel || ""}
          onChange={(value) => updateField("highLabel", value)}
          onRequestAutoSave={onRequestAutoSave}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.(
                "forceRankHighLabel",
                event,
                formData.highLabel
              ),
            onBlur: onFieldBlur,
          }}
        />
        <TextField
          label="Bottom Label"
          value={formData.lowLabel || ""}
          onChange={(value) => updateField("lowLabel", value)}
          onRequestAutoSave={onRequestAutoSave}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.(
                "forceRankLowLabel",
                event,
                formData.lowLabel
              ),
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
              "forceRankQuestion",
              selectionInfo,
              formData.question
            )
          }
          onBlur={onRichTextBlur}
          valueFormat="html"
        />
        <ListField
          label="Options"
          items={options}
          onUpdate={handleUpdateOption}
          onRemove={handleRemoveOption}
          onReorder={handleReorderOptions}
          buttonText="Add Option"
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
            onClick={() => addListItem("question")}
            className="flex items-center gap-2 px-3 py-2 text-background rounded-lg w-full"
          >
            <Plus size={16} />
            Add Question
          </Button> */}
        </div>
      </div>
    </div>
  );
}

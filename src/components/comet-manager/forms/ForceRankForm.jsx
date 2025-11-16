import React from "react";
import {
  SectionHeader,
  TextField,
  RichTextArea,
  ListField,
} from "./FormFields";

export default function ForceRankForm({
  formData,
  updateField,
  addListItem,
  updateListItem,
  removeListItem,
}) {
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
        />
        <TextField
          label="Top Label"
          value={formData.high_label || ""}
          onChange={(value) => updateField("high_label", value)}
        />
        <TextField
          label="Bottom Label"
          value={formData.low_label || ""}
          onChange={(value) => updateField("low_label", value)}
        />
        <RichTextArea
          label="Question"
          value={formData.question || ""}
          onChange={(value) => updateField("question", value)}
        />
        <ListField
          label="Options"
          items={formData.options || []}
          onAdd={() => addListItem("options")}
          onUpdate={(index, value) =>
            updateListItem("options", index, value)
          }
          onRemove={(index) => removeListItem("options", index)}
          buttonText="Add Option"
        />
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={() => addListItem("options")}
            className="flex items-center gap-2 px-3 py-2 text-background rounded-lg w-full"
          >
            <Plus size={16} />
            Add Option
          </Button>
          <Button
            type="button"
            onClick={() => addListItem("question")}
            className="flex items-center gap-2 px-3 py-2 text-background rounded-lg w-full"
          >
            <Plus size={16} />
            Add Question
          </Button>
        </div>
      </div>
    </div>
  );
}

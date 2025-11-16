import React from "react";
import {
  SectionHeader,
  TextField,
  RichTextArea,
  ListField,
} from "./FormFields";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function PollMcqForm({
  formData,
  updateField,
  addListItem,
  updateListItem,
  removeListItem,
}) {
  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Multiple Choice/Survey" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        {/* <SectionHeader title="Multiple Choice/Survey" /> */}
        <TextField
          label="Title"
          value={formData.title || ""}
          onChange={(value) => updateField("title", value)}
        />
        <RichTextArea
          label="Question"
          value={formData.question || ""}
          onChange={(value) => updateField("question", value)}
        />
        <ListField
          label="Poll Options"
          items={formData.options || []}
          // onAdd={() => addListItem("options")}
          onUpdate={(index, value) => updateListItem("options", index, value)}
          onRemove={(index) => removeListItem("options", index)}
          // buttonText="Add Option"
          showCorrectAnswer={true}
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

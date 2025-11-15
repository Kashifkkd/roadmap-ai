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
          label="Title (Question)"
          value={formData.title}
          onChange={(value) => updateField("mcqTitle", value)}
        />
        {/* <TextField
        label="Top Label"
        value={formData.mcqTopLabel}
        onChange={(value) => updateField("mcqTopLabel", value)}
      />
      <TextField
        label="Bottom Label"
        value={formData.mcqBottomLabel}
        onChange={(value) => updateField("mcqBottomLabel", value)}
      /> */}
        {/* <TextArea
        label="Key Learning"
        value={formData.mcqKeyLearning}
        onChange={(value) => updateField("mcqKeyLearning", value)}
      /> */}
        <RichTextArea
          label="Question"
          value={formData.question}
          onChange={(value) => updateField("question", value)}
        />
        <ListField
          label="Poll Options"
          items={formData.mcqOptions || []}
          onAdd={() => addListItem("mcqOptions")}
          onUpdate={(index, value) =>
            updateListItem("mcqOptions", index, value)
          }
          onRemove={(index) => removeListItem("mcqOptions", index)}
          buttonText="Add Option"
        />
        <Button
          type="button"
          onClick={() => addListItem("mcqOptions")}
          className="flex items-center gap-2 px-3 py-2 text-background rounded-lg w-full"
        >
          <Plus size={16} />
          Add Question
        </Button>
      </div>
    </div>
  );
}

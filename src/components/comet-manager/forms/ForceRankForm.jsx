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
          value={formData.pollTitle}
          onChange={(value) => updateField("pollTitle", value)}
        />
        <TextField
          label="Top Label"
          value={formData.topLabel}
          onChange={(value) => updateField("topLabel", value)}
        />
        <TextField
          label="Bottom Label"
          value={formData.bottomLabel}
          onChange={(value) => updateField("bottomLabel", value)}
        />
        {/* <TextArea
        label="Key Learning"
        value={formData.keyLearning}
        onChange={(value) => updateField("keyLearning", value)}
      /> */}
        <RichTextArea
          label="Question "
          value={formData.question}
          onChange={(value) => updateField("question", value)}
        />
        <ListField
          label="Options"
          items={formData.mcqOptions || []}
          onAdd={() => addListItem("mcqOptions")}
          onUpdate={(index, value) =>
            updateListItem("mcqOptions", index, value)
          }
          onRemove={(index) => removeListItem("mcqOptions", index)}
          buttonText="Add Option"
        />
      </div>
    </div>
  );
}

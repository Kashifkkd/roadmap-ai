import React from "react";
import {
  SectionHeader,
  TextField,
  RichTextArea,
  ListField,
} from "./FormFields";

export default function PollMcqForm({
  formData,
  updateField,
  addListItem,
  updateListItem,
  removeListItem,
}) {
  return (
    <>
      <SectionHeader title="Multiple Choice/Survey" />
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
        onUpdate={(index, value) => updateListItem("mcqOptions", index, value)}
        onRemove={(index) => removeListItem("mcqOptions", index)}
        buttonText="Add Option"
      />
    </>
  );
}

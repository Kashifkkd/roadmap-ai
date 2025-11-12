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
    <>
      <SectionHeader title="Force Rank" />
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
        onUpdate={(index, value) => updateListItem("mcqOptions", index, value)}
        onRemove={(index) => removeListItem("mcqOptions", index)}
        buttonText="Add Option"
      />
    </>
  );
}

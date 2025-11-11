import React from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";

export default function ForceRankForm({ formData, updateField }) {
  return (
    <>
      <SectionHeader title="Poll Question/Force Rank" />
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
        label="Key Learning"
        value={formData.keyLearning}
        onChange={(value) => updateField("keyLearning", value)}
      />
    </>
  );
}

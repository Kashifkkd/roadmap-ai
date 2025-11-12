import React from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";

export default function SocialDiscussionForm({ formData, updateField }) {
  return (
    <>
      <SectionHeader title="Social Discussion" />
      <TextField
        label="Title"
        value={formData.socialTitle}
        onChange={(value) => updateField("socialTitle", value)}
      />
      <RichTextArea
        label="Question"
        value={formData.question}
        onChange={(value) => updateField("socialQuestion", value)}
        field="socialQuestion"
      />
    </>
  );
}

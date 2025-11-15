import React from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";

export default function SocialDiscussionForm({ formData, updateField }) {
  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Social Discussion" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        <TextField
          label="Title"
          value={formData.title || ""}
          onChange={(value) => updateField("title", value)}
        />
        <RichTextArea
          label="Question"
          value={formData.question || ""}
          onChange={(value) => updateField("question", value)}
          field="question"
        />
      </div>
    </div>
  );
}

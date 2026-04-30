import React from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";

export default function SocialDiscussionForm({
  formData,
  updateField,
  askKyperHandlers = {},
  onRequestAutoSave,
}) {
  const {
    onTextFieldSelect,
    onFieldBlur,
    onRichTextSelection,
    onRichTextBlur,
  } = askKyperHandlers;

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
          onRequestAutoSave={onRequestAutoSave}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.("socialTitle", event, formData.title),
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
              "socialQuestion",
              selectionInfo,
              formData.question
            )
          }
          onBlur={onRichTextBlur}
          valueFormat="html"
        />
      </div>
    </div>
  );
}

import React from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";

export default function ProfileForm({
  formData,
  updateField,
  askKyperHandlers = {},
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
          <SectionHeader title="Profile" />
        </div>
        <div className="bg-white rounded-lg p-2 align-center">
          <TextField
            label="Heading"
            value={formData.heading || ""}
            onChange={(value) => updateField("heading", value)}
            inputProps={{
              onSelect: (event) =>
                onTextFieldSelect?.("profileHeading", event, formData.heading),
              onBlur: onFieldBlur,
            }}
          />

          <RichTextArea
            label="Body"
            value={formData.body || ""}
            onChange={(value) => updateField("body", value)}
            onSelectionChange={(selectionInfo) =>
              onRichTextSelection?.("profileBody", selectionInfo, formData.body)
            }
            onBlur={onRichTextBlur}
            valueFormat="html"
          />
        </div>
    </div>
  );
}

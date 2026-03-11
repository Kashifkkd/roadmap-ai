"use client";

import React from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";

export default function PathPersonalizationForm({
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
        <SectionHeader title="Path Personalization" />
      </div>
      <div className="bg-white rounded-lg p-2 space-y-4">
        {/* Heading */}
        <TextField
          label="Heading"
          value={formData.heading || ""}
          onChange={(value) => updateField("heading", value)}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.("heading", event, formData.heading),
            onBlur: onFieldBlur,
          }}
        />

        {/* Body (rich text: sent as HTML to backend, displayed with formatting when loaded) */}
        <RichTextArea
          label="Body"
          value={formData.body || ""}
          onChange={(value) => updateField("body", value)}
          onSelectionChange={(selectionInfo) =>
            onRichTextSelection?.("body", selectionInfo, formData.body)
          }
          onBlur={onRichTextBlur}
          valueFormat="html"
        />
      </div>
    </div>
  );
}

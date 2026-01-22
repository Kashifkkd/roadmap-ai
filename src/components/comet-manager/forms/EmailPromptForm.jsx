import React from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";
import ImageUpload from "@/components/common/ImageUpload";

export default function EmailPromptForm({
  formTitle,
  formData,
  updateField,
  updateScreenAssets,
  removeScreenAsset,
  screen,
  askKyperHandlers = {},
  fieldPrefix = "emailPrompt",
  sessionId = "",
  chapterUuid = "",
  stepUuid = "",
  screenUuid = "",
}) {
  const {
    onTextFieldSelect,
    onFieldBlur,
    onRichTextSelection,
    onRichTextBlur,
  } = askKyperHandlers;

  const existingAssets = screen?.assets || [];

  const handleRemoveAsset = (index) => {
    if (removeScreenAsset) removeScreenAsset(index);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title={formTitle} />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        <TextField
          label="Title"
          value={formData.heading || ""}
          onChange={(value) => updateField("heading", value)}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.(
                `${fieldPrefix}Heading`,
                event,
                formData.heading
              ),
            onBlur: onFieldBlur,
          }}
        />
        <RichTextArea
          label="Description"
          value={formData.body || ""}
          onChange={(value) => updateField("body", value)}
          onSelectionChange={(selectionInfo) =>
            onRichTextSelection?.(
              `${fieldPrefix}Body`,
              selectionInfo,
              formData.body
            )
          }
          onBlur={onRichTextBlur}
        />
        <TextField
          label="Email"
          value={formData.email || ""}
          onChange={(value) => updateField("email", value)}
          inputProps={{
            type: "email",
            onSelect: (event) =>
              onTextFieldSelect?.(
                `${fieldPrefix}Email`,
                event,
                formData.email
              ),
            onBlur: onFieldBlur,
          }}
        />
        <div className="mb-6">
          <ImageUpload
            label="Image"
            sessionId={sessionId}
            chapterUid={chapterUuid}
            stepUid={stepUuid}
            screenUid={screenUuid}
            onUploadSuccess={(assetData) => {
              if (updateScreenAssets) updateScreenAssets([assetData]);
            }}
            onAIGenerateSuccess={(assetData) => {
              if (updateScreenAssets) updateScreenAssets([assetData]);
            }}
            existingAssets={existingAssets}
            onRemoveAsset={handleRemoveAsset}
            showSavedImages={true}
          />
        </div>
      </div>
    </div>
  );
}

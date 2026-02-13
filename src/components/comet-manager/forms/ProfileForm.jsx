import React from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";
import ImageUpload from "@/components/common/ImageUpload";

export default function ProfileForm({
  formData,
  updateField,
  updateScreenAssets,
  removeScreenAsset,
  screen,
  askKyperHandlers = {},
  sessionId = "",
  chapterId = "",
  stepId = "",
  screenId = "",
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
    <>
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

          <div className="mb-6">
            <ImageUpload
              label="Profile Photo"
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
    </>
  );
}

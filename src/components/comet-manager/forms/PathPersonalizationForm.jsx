"use client";

import React from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import ImageUpload from "@/components/common/ImageUpload";

export default function PathPersonalizationForm({
  formData,
  updateField,
  updateScreenAssets,
  removeScreenAsset,
  screen,
  askKyperHandlers = {},
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

  // Get existing assets from screen
  const existingAssets = screen?.assets || [];

  const handleRemoveAsset = (index) => {
    if (removeScreenAsset) {
      removeScreenAsset(index);
    }
  };

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

        {/* Media Upload */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Media (Optional)
          </Label>
          <ImageUpload
            label="Upload Image"
            sessionId={sessionId}
            chapterUid={chapterUuid}
            stepUid={stepUuid}
            screenUid={screenUuid}
            onUploadSuccess={(assetData) => {
              if (updateScreenAssets) {
                updateScreenAssets([assetData]);
              }
              if (assetData.ImageUrl) {
                updateField("mediaUrl", assetData.ImageUrl);
                updateField("mediaType", "image");
              }
            }}
            onAIGenerateSuccess={(assetData) => {
              if (updateScreenAssets) {
                updateScreenAssets([assetData]);
              }
              if (assetData.ImageUrl) {
                updateField("mediaUrl", assetData.ImageUrl);
                updateField("mediaType", "image");
              }
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

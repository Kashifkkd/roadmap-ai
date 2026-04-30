import React from "react";
import { SectionHeader, RichTextArea, TextField } from "./FormFields";
import ImageUpload from "@/components/common/ImageUpload";

export default function ReflectionForm({
  formData,
  updateField,
  updateScreenAssets,
  removeScreenAsset,
  screen,
  sessionId = "",
  chapterId = "",
  stepId = "",
  screenId = "",
  chapterUuid = "",
  stepUuid = "",
  screenUuid = "",
  askKyperHandlers = {},
  onRequestAutoSave,
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
  console.log("formData of ReflectionForm>>>>>>>>>>", formData);

  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Reflection" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        <TextField
          label="Title"
          value={formData.title || ""}
          onChange={(value) => updateField("title", value)}
          onRequestAutoSave={onRequestAutoSave}
          inputProps={{
            onSelect: (event) =>
              onTextFieldSelect?.("reflectionTitle", event, formData.title),
            onBlur: onFieldBlur,
          }}
        />
        <RichTextArea
          label="Prompt"
          value={formData.prompt || ""}
          onChange={(value) => updateField("prompt", value)}
          onRequestAutoSave={onRequestAutoSave}
          onSelectionChange={(selectionInfo) =>
            onRichTextSelection?.(
              "reflectionPrompt",
              selectionInfo,
              formData.prompt
            )
          }
          onBlur={onRichTextBlur}
          valueFormat="html"
        />

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
              updateField("reflectionImage", assetData.ImageUrl);
            }
          }}
          onAIGenerateSuccess={(assetData) => {
            if (updateScreenAssets) {
              updateScreenAssets([assetData]);
            }
            if (assetData.ImageUrl) {
              updateField("reflectionImage", assetData.ImageUrl);
            }
          }}
          existingAssets={existingAssets}
          onRemoveAsset={handleRemoveAsset}
          onAfterRemoveImages={() => updateField("reflectionImage", "")}
          showSavedImages={true}
          onRequestAutoSave={onRequestAutoSave}
        />
      </div>
    </div>
  );
}

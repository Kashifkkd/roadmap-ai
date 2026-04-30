import React from "react";
import { SectionHeader, RichTextArea, TextField } from "./FormFields";
import ImageUpload from "@/components/common/ImageUpload";

export default function NotificationsForm({
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
  const shouldShowImageUpload = formData.mediaType !== "none";

  const handleRemoveAsset = (index) => {
    if (removeScreenAsset) {
      removeScreenAsset(index);
    }
  };
  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Notifications" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        <TextField
          label="Title"
          value={formData.title || ""}
          onChange={(value) => updateField("title", value)}
          onRequestAutoSave={onRequestAutoSave}
          inputProps={{
            placeholder: "Enter notification title",
            onSelect: (event) =>
              onTextFieldSelect?.("notificationsTitle", event, formData.title),
            onBlur: onFieldBlur,
          }}
        />

        <RichTextArea
          label="Message"
          value={formData.message || formData.body || ""}
          onChange={(value) => updateField("message", value)}
          onRequestAutoSave={onRequestAutoSave}
          onSelectionChange={(selectionInfo) =>
            onRichTextSelection?.(
              "notificationsMessage",
              selectionInfo,
              formData.message || formData.body
            )
          }
          onBlur={onRichTextBlur}
          valueFormat="html"
        />

        {shouldShowImageUpload && (
          <ImageUpload
            label="Notification Icon/Image"
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
              }
            }}
            onAIGenerateSuccess={(assetData) => {
              if (updateScreenAssets) {
                updateScreenAssets([assetData]);
              }
              if (assetData.ImageUrl) {
                updateField("mediaUrl", assetData.ImageUrl);
              }
            }}
            existingAssets={existingAssets}
            onRemoveAsset={handleRemoveAsset}
            onAfterRemoveImages={() => updateField("mediaUrl", "")}
            showSavedImages={true}
            onRequestAutoSave={onRequestAutoSave}
          />
        )}
      </div>
    </div>
  );
}

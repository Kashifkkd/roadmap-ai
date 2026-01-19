import React from "react";
import { SectionHeader, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
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
  askKyperHandlers = {},
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
  console.log("formData of NotificationsForm>>>>>>>>>>", formData);

  return (
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="p-2">
        <SectionHeader title="Notifications" />
      </div>
      <div className="bg-white rounded-lg p-2 align-center">
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </Label>
          <Input
            type="text"
            value={formData.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Enter notification title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onSelect={(event) =>
              onTextFieldSelect?.("notificationsTitle", event, formData.title)
            }
            onBlur={onFieldBlur}
          />
        </div>

        <RichTextArea
          label="Message"
          value={formData.message || formData.body || ""}
          onChange={(value) => updateField("message", value)}
          onSelectionChange={(selectionInfo) =>
            onRichTextSelection?.(
              "notificationsMessage",
              selectionInfo,
              formData.message || formData.body
            )
          }
          onBlur={onRichTextBlur}
        />

        <ImageUpload
          label="Notification Icon/Image"
          sessionId={sessionId}
          chapterId={chapterId}
          stepId={stepId}
          screenId={screenId}
          onUploadSuccess={(assetData) => {
            if (updateScreenAssets) {
              updateScreenAssets([assetData]);
            }
            if (assetData.ImageUrl) {
              updateField("icon", assetData.ImageUrl);
            }
          }}
          onAIGenerateSuccess={(assetData) => {
            if (updateScreenAssets) {
              updateScreenAssets([assetData]);
            }
            if (assetData.ImageUrl) {
              updateField("icon", assetData.ImageUrl);
            }
          }}
          existingAssets={existingAssets}
          onRemoveAsset={handleRemoveAsset}
          showSavedImages={true}
        />
      </div>
    </div>
  );
}

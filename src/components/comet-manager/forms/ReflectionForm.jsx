import React from "react";
import { SectionHeader, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
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
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </Label>
          <Input
            type="text"
            value={formData.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            onSelect={(event) =>
              onTextFieldSelect?.("reflectionTitle", event, formData.title)
            }
            onBlur={onFieldBlur}
          />
        </div>
        <RichTextArea
          label="Prompt"
          value={formData.prompt || ""}
          onChange={(value) => updateField("prompt", value)}
          onSelectionChange={(selectionInfo) =>
            onRichTextSelection?.(
              "reflectionPrompt",
              selectionInfo,
              formData.prompt
            )
          }
          onBlur={onRichTextBlur}
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
          showSavedImages={true}
        />
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Link as LinkIcon, Check, X, Loader2 } from "lucide-react";
import ImageUpload from "@/components/common/ImageUpload";
import { uploadAssetFile } from "@/api/uploadAssets";

export default function ContentForm({
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
}) {
  const {
    onTextFieldSelect,
    onFieldBlur,
    onRichTextSelection,
    onRichTextBlur,
  } = askKyperHandlers;

  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadErrorMedia, setUploadErrorMedia] = useState(null);

  // Get existing assets from screen
  const existingAssets = screen?.assets || [];

  const handleRemoveAsset = (index) => {
    if (removeScreenAsset) {
      removeScreenAsset(index);
    }
  };

  return (
    <>
      <div className="bg-gray-100 rounded-lg p-2">
        <div className="p-2">
          <SectionHeader title="Content" />
        </div>
        <div className="bg-white rounded-lg p-2 align-center">
          <TextField
            label="Title"
            value={formData.heading || ""}
            onChange={(value) => updateField("heading", value)}
            inputProps={{
              onSelect: (event) =>
                onTextFieldSelect?.("heading", event, formData.heading),
              onBlur: onFieldBlur,
            }}
          />
          <RichTextArea
            label="Description"
            value={formData.body || ""}
            onChange={(value) => updateField("body", value)}
            onSelectionChange={(selectionInfo) =>
              onRichTextSelection?.("body", selectionInfo, formData.body)
            }
            onBlur={onRichTextBlur}
          />

          {/* Upload Image/Icon Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div></div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-700">
                  Full Bleed Image
                </Label>
                <label className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={Boolean(formData.contentFullBleed)}
                    onChange={(e) =>
                      updateField("contentFullBleed", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <span
                    className={`absolute h-6 w-11 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-primary bg-gray-300`}
                  />
                  <span
                    className={`absolute inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out peer-checked:translate-x-6 translate-x-1`}
                  />
                </label>
              </div>
            </div>

            <ImageUpload
              label="Upload Image/Icon"
              sessionId={sessionId}
              chapterId={chapterId}
              stepId={stepId}
              screenId={screenId}
              onUploadSuccess={(assetData) => {
                if (updateScreenAssets) {
                  updateScreenAssets([assetData]);
                }
                if (assetData.image_url) {
                  updateField("contentImageIcon", assetData.image_url);
                }
              }}
              onAIGenerateSuccess={(assetData) => {
                if (updateScreenAssets) {
                  updateScreenAssets([assetData]);
                }
                if (assetData.image_url) {
                  updateField("contentImageIcon", assetData.image_url);
                }
              }}
              existingAssets={existingAssets}
              onRemoveAsset={handleRemoveAsset}
              showSavedImages={true}
            />
          </div>

          {/* Upload Media Section */}
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Media
            </Label>
            <div className="relative p-2 bg-gray-100 rounded-lg hover:border-primary transition-colors mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-2 bg-white">
                <Input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={async (e) => {
                    const file =
                      e.target.files && e.target.files[0]
                        ? e.target.files[0]
                        : null;
                    if (file) {
                      setIsUploadingMedia(true);
                      setUploadErrorMedia(null);
                      // Update form field
                      updateField("contentMediaFile", file);

                      // Determine asset type based on file type
                      const assetType = file.type.startsWith("video/")
                        ? "video"
                        : "audio";

                      // Upload asset with all necessary fields
                      try {
                        await uploadAssetFile(
                          file,
                          assetType,
                          sessionId || "",
                          chapterId || "",
                          stepId || "",
                          screenId || ""
                        );
                        setUploadedMedia(file.name);
                        console.log("Media uploaded successfully");
                      } catch (error) {
                        setUploadErrorMedia("Upload failed. Please try again.");
                        console.error("Error uploading media:", error);
                      } finally {
                        setIsUploadingMedia(false);
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center text-center cursor-pointer">
                  <p className="text-sm text-gray-600 mb-4">
                    Upload Video/Audio
                  </p>
                  <span className="bg-primary text-white hover:bg-primary-700 px-4 py-2 text-sm rounded-lg inline-flex items-center gap-2 cursor-pointer">
                    + Browse
                  </span>
                </div>
              </div>
              {/* File name display */}
              {(uploadedMedia || isUploadingMedia || uploadErrorMedia) && (
                <div className="mb-2 p-2 bg-white rounded-lg border border-gray-200 ">
                  {isUploadingMedia ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : uploadErrorMedia ? (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <X className="h-4 w-4" />
                      <span>{uploadErrorMedia}</span>
                    </div>
                  ) : uploadedMedia ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="font-medium">Uploaded:</span>
                      <span className="text-gray-700">{uploadedMedia}</span>
                    </div>
                  ) : null}
                </div>
              )}
              <div className="mb-2 flex items-center justify-center gap-2">
                <p className="text-sm text-gray-900 font-medium">
                  Or paste your link here
                </p>
              </div>
              <div className="relative">
                <LinkIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  type="url"
                  value={formData.mediaUrl || ""}
                  onChange={(e) => updateField("mediaUrl", e.target.value)}
                  placeholder="Or paste your link here"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

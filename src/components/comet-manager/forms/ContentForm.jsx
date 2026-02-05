import React, { useState, useEffect, useMemo } from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Link as LinkIcon, Check, X, Loader2, Trash2 } from "lucide-react";
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
  chapterUuid = "",
  stepUuid = "",
  screenUuid = "",
}) {
  const {
    onTextFieldSelect,
    onFieldBlur,
    onRichTextSelection,
    onRichTextBlur,
    loadingField,
  } = askKyperHandlers;

  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadErrorMedia, setUploadErrorMedia] = useState(null);

  // Get existing assets from screen
  const existingAssets = screen?.assets || [];

  // Helper function to determine asset type from file
  const getAssetType = (file) => {
    const fileType = file.type.toLowerCase();

    if (fileType.startsWith("image/")) return "image";
    if (fileType.startsWith("video/")) return "video";
    if (fileType.startsWith("audio/")) return "audio";
    if (fileType === "application/pdf") return "pdf";
    if (
      fileType === "application/vnd.ms-powerpoint" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
      return "ppt";
    if (
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
      return "excel";
    if (
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return "doc";
    if (fileType.startsWith("text/")) return "text";
    if (fileType.startsWith("application/")) return "document";

    // Default to "file" for any other type
    return "file";
  };

  const existingMediaAsset = useMemo(() => {
    const mediaUrl = formData.mediaUrl || formData.media?.url;

    if (mediaUrl) {
      return existingAssets.find(
        (asset) =>
          asset.url === mediaUrl ||
          asset.ImageUrl === mediaUrl ||
          asset.videoUrl === mediaUrl ||
          asset.audioUrl === mediaUrl,
      );
    }
    // Find any media asset
    return existingAssets.find(
      (asset) =>
        asset.type === "video" ||
        asset.type === "audio" ||
        asset.type === "image" ||
        asset.type === "pdf" ||
        asset.type === "ppt" ||
        asset.type === "document" ||
        asset.type === "file",
    );
  }, [existingAssets, formData.mediaUrl, formData.media]);

  useEffect(() => {
    const mediaUrl = formData.mediaUrl;
    const mediaType = formData.mediaType;
    if (mediaUrl && mediaType && mediaType !== "link") {
      setUploadedMedia(
        formData.contentMediaFile?.title ||
          mediaUrl.split("/").pop() ||
          "Uploaded media",
      );
    } else {
      setUploadedMedia(null);
    }
  }, [formData.mediaUrl, formData.mediaType, formData.contentMediaFile]);

  const handleRemoveAsset = (index) => {
    if (removeScreenAsset) {
      removeScreenAsset(index);
    }
  };

  // Handle removing uploaded media
  const handleRemoveMedia = () => {
    const mediaIndex = existingAssets.findIndex(
      (asset) =>
        asset.type === "video" ||
        asset.type === "audio" ||
        asset.type === "image" ||
        asset.type === "pdf" ||
        asset.type === "ppt" ||
        asset.type === "document" ||
        asset.type === "file" ||
        asset.url === formData.mediaUrl ||
        asset.ImageUrl === formData.mediaUrl,
    );
    if (mediaIndex >= 0 && removeScreenAsset) {
      removeScreenAsset(mediaIndex);
    }
    // Clear media URL
    updateField("mediaUrl", "");
    updateField("mediaType", "");
    updateField("contentMediaFile", null);
    setUploadedMedia(null);
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
            disabled={loadingField === "heading"}
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
            disabled={loadingField === "body"}
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
                    checked={formData.contentFullBleed === true}
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
              chapterUid={chapterUuid}
              stepUid={stepUuid}
              screenUid={screenUuid}
              onUploadSuccess={(assetData) => {
                if (updateScreenAssets) {
                  updateScreenAssets([assetData]);
                }
                if (assetData.ImageUrl) {
                  updateField("contentImageIcon", assetData.ImageUrl);
                }
              }}
              onAIGenerateSuccess={(assetData) => {
                if (updateScreenAssets) {
                  updateScreenAssets([assetData]);
                }
                if (assetData.ImageUrl) {
                  updateField("contentImageIcon", assetData.ImageUrl);
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
              Upload Media/Files
            </Label>
            <div className="relative p-2 bg-gray-100 rounded-lg hover:border-primary transition-colors mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-2 bg-white">
                <Input
                  type="file"
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
                      const assetType = getAssetType(file);

                      // Upload asset with all necessary fields
                      try {
                        const uploadResponse = await uploadAssetFile(
                          file,
                          assetType,
                          sessionId || "",
                          chapterUuid || chapterId || "",
                          stepUuid || stepId || "",
                          screenUuid || screenId || "",
                        );

                        if (uploadResponse?.response) {
                          const mediaUrl = uploadResponse.response.url;
                          const mediaName =
                            uploadResponse.response.name || file.name;

                          if (mediaUrl) {
                            updateField("mediaUrl", mediaUrl);
                            updateField("mediaType", assetType);
                            updateField("mediaName", mediaName);
                            setUploadedMedia(mediaName);
                          } else {
                            throw new Error("No media URL in response");
                          }
                        } else {
                          throw new Error("Invalid upload response");
                        }
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
                  <p className="text-sm text-gray-600 mb-4">Upload File</p>
                  <span className="bg-primary text-white hover:bg-primary-700 px-4 py-2 text-sm rounded-lg inline-flex items-center gap-2 cursor-pointer">
                    + Browse
                  </span>
                </div>
              </div>
              {/* File name display */}
              {(uploadedMedia || isUploadingMedia || uploadErrorMedia) && (
                <div className="mb-2 p-2 bg-white rounded-lg border border-gray-200">
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
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2 text-green-600 flex-1">
                        <Check className="h-4 w-4 shrink-0" />
                        <span className="font-medium">Uploaded:</span>
                        <span className="text-gray-700 truncate">
                          {uploadedMedia}
                        </span>
                        <span className="text-xs text-gray-500 shrink-0">
                          ({formData.mediaType || "media"})
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveMedia}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors shrink-0"
                        title="Remove media"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    formData.mediaUrl && formData.mediaUrl.trim() !== ""
                      ? "text-primary cursor-pointer hover:text-primary-700 transition-colors"
                      : "text-gray-400"
                  }`}
                  size={18}
                  onClick={() => {
                    const url = formData.mediaUrl?.trim();
                    if (url) {
                      // Ensure URL has a protocol

                      const urlWithProtocol =
                        url.startsWith("http://") || url.startsWith("https://")
                          ? url
                          : `https://${url}`;
                      window.open(
                        urlWithProtocol,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }
                  }}
                  title={
                    formData.mediaUrl && formData.mediaUrl.trim() !== ""
                      ? "Open link in new tab"
                      : ""
                  }
                />
                <Input
                  type="url"
                  value={formData.mediaUrl || ""}
                  onChange={(e) => {
                    const url = e.target.value;
                    updateField("mediaUrl", url);
                    if (url && url.trim() !== "") {
                      updateField("mediaType", "link");
                    } else {
                      updateField("mediaType", "");
                    }
                  }}
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

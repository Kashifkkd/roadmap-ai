import React, { useState, useEffect, useMemo } from "react";
import { SectionHeader, TextField, RichTextArea } from "./FormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Link as LinkIcon, Check, X, Loader2, Trash2, Pencil, FileText, FileVideo, FileAudio, File } from "lucide-react";
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
          asset.audioUrl === mediaUrl
      );
    }
    // When no mediaUrl is set, only look for non-image media (video/audio/pdf/etc).
    // Never use "image" here: the content icon (Upload Image/Icon + AI-Generate) is an image
    // and would otherwise show in both sections. Images only appear in Media when user
    // explicitly uploads/pastes one there (which sets mediaUrl).
    return existingAssets.find(
      (asset) =>
        asset.type === "video" ||
        asset.type === "audio" ||
        asset.type === "pdf" ||
        asset.type === "ppt" ||
        asset.type === "document" ||
        asset.type === "file"
    );
  }, [existingAssets, formData.mediaUrl, formData.media]);

  useEffect(() => {
    const mediaUrl = formData.mediaUrl;
    const mediaType = formData.mediaType;
    if (mediaUrl && mediaType && mediaType !== "link") {
      setUploadedMedia(
        formData.contentMediaFile?.title ||
        mediaUrl.split("/").pop() ||
        "Uploaded media"
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

  // Handle removing uploaded media (exclude content icon so we never remove it as "media")
  const handleRemoveMedia = () => {
    const contentIconUrl = formData.contentImageIcon;
    const mediaIndex = existingAssets.findIndex(
      (asset) => {
        const assetUrl = asset.url || asset.ImageUrl;
        if (contentIconUrl && assetUrl === contentIconUrl) return false;
        return (
          asset.type === "video" ||
          asset.type === "audio" ||
          asset.type === "image" ||
          asset.type === "pdf" ||
          asset.type === "ppt" ||
          asset.type === "document" ||
          asset.type === "file" ||
          asset.url === formData.mediaUrl ||
          asset.ImageUrl === formData.mediaUrl
        );
      }
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
            valueFormat="html"
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
              {/* Show preview or upload area */}
              {existingMediaAsset || uploadedMedia ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-0 mb-2 bg-white overflow-hidden">
                  <div className="relative w-full h-[120px] group/media">
                    {/* Media preview based on type */}
                    {formData.mediaType === "video" || existingMediaAsset?.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <video
                          src={formData.mediaUrl || existingMediaAsset?.url || existingMediaAsset?.videoUrl}
                          className="max-w-full max-h-full object-contain"
                          controls={false}
                        />
                      </div>
                    ) : formData.mediaType === "audio" || existingMediaAsset?.type === "audio" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-2">
                        <FileAudio className="w-12 h-12 text-gray-400" />
                        <span className="text-xs text-gray-500 truncate max-w-[80%]">{uploadedMedia || "Audio file"}</span>
                      </div>
                    ) : formData.mediaType === "image" || existingMediaAsset?.type === "image" ? (
                      <img
                        src={formData.mediaUrl || existingMediaAsset?.url || existingMediaAsset?.ImageUrl}
                        alt="Media preview"
                        className="w-full h-full object-contain bg-gray-50"
                      />
                    ) : formData.mediaType === "pdf" || existingMediaAsset?.type === "pdf" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-2">
                        <FileText className="w-12 h-12 text-red-400" />
                        <span className="text-xs text-gray-500 truncate max-w-[80%]">{uploadedMedia || "PDF file"}</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-2">
                        <File className="w-12 h-12 text-gray-400" />
                        <span className="text-xs text-gray-500 truncate max-w-[80%]">{uploadedMedia || "File"}</span>
                      </div>
                    )}
                    {/* Hover overlay with delete/replace buttons */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/media:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleRemoveMedia}
                        className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors cursor-pointer shadow-sm"
                        title="Delete media"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="relative inline-block">
                        <Input
                          type="file"
                          onChange={async (e) => {
                            const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                            if (file) {
                              handleRemoveMedia();
                              setIsUploadingMedia(true);
                              setUploadErrorMedia(null);
                              updateField("contentMediaFile", file);
                              const assetType = getAssetType(file);
                              try {
                                const uploadResponse = await uploadAssetFile(
                                  file, assetType, sessionId || "", chapterUuid || chapterId || "", stepUuid || stepId || "", screenUuid || screenId || ""
                                );
                                if (uploadResponse?.response) {
                                  const mediaUrl = uploadResponse.response.url;
                                  const mediaName = uploadResponse.response.name || file.name;
                                  if (mediaUrl) {
                                    updateField("mediaUrl", mediaUrl);
                                    updateField("mediaType", assetType);
                                    updateField("mediaName", mediaName);
                                    setUploadedMedia(mediaName);
                                  } else { throw new Error("No media URL in response"); }
                                } else { throw new Error("Invalid upload response"); }
                              } catch (error) {
                                setUploadErrorMedia("Upload failed. Please try again.");
                                console.error("Error uploading media:", error);
                              } finally { setIsUploadingMedia(false); }
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors cursor-pointer shadow-sm">
                          <Pencil className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
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
                            screenUuid || screenId || ""
                          );

                          if (uploadResponse?.response) {
                            const mediaUrl = uploadResponse.response.url;
                            const mediaName = uploadResponse.response.name || file.name;

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
              )}
              {/* Loading/Error display */}
              {(isUploadingMedia || uploadErrorMedia) && (
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
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${formData.mediaUrl && formData.mediaUrl.trim() !== ""
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
                      window.open(urlWithProtocol, "_blank", "noopener,noreferrer");
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

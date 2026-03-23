"use client";

import React, { useMemo, useState } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Plus, X, Loader2, Check, Trash2, Pencil, Upload, Sparkles, Paperclip } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { apiService } from "@/api/apiService";
import { endpoints } from "@/api/endpoint";
import { uploadAssetFile } from "@/api/uploadAssets";
import {
  getImageAttributes,
  setImageAttributes,
  getSuggestPrompt,
} from "@/api/generateStepImages";
import { ART_STYLE_KEYS } from "@/constants/artStyles";

export default function ImageUpload({
  label = "Upload Image/Icon",
  sessionId = "",
  chapterUid = "",
  stepUid = "",
  screenUid = "",
  onUploadSuccess,
  onAIGenerateSuccess,
  existingAssets = [],
  onRemoveAsset,
  showSavedImages = true,
}) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadErrorImage, setUploadErrorImage] = useState(null);
  console.log("Existing assets passed to ImageUpload:", existingAssets);

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiArtStyle, setAiArtStyle] = useState("Editorial Illustration");
  const [imageGuidance, setImageGuidance] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiGenerateError, setAiGenerateError] = useState(null);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [attributesError, setAttributesError] = useState(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [promptError, setPromptError] = useState(null);

  const [assets, setAssets] = useState([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [assetsError, setAssetsError] = useState(null);
  const [isCreatingAsset, setIsCreatingAsset] = useState(false);
  const [createAssetError, setCreateAssetError] = useState(null);
  const [selectedImageAsset, setSelectedImageAsset] = useState(null);

  const getUploadErrorMessage = (uploadResponse, error) => {
    if (uploadResponse?.response) {
      const msg = uploadResponse.response?.message ?? uploadResponse.response?.detail ?? uploadResponse.response?.error;
      if (msg && typeof msg === "string") return msg;
      if (Array.isArray(msg)) return msg.join(". ");
    }
    if (uploadResponse?.message) return uploadResponse.message;
    if (error?.response?.data) {
      const d = error.response.data;
      const msg = d?.message ?? d?.detail ?? d?.error;
      if (msg && typeof msg === "string") return msg;
      if (Array.isArray(msg)) return msg.join(". ");
    }
    const status = uploadResponse?.status ?? error?.response?.status;
    const statusMessages = {
      400: "Bad request. Please check the file format and try again.",
      404: "Upload endpoint not found. Please try again later.",
      413: "File too large. Please choose a smaller file.",
      500: "Server error. Please try again later.",
      502: "Server temporarily unavailable. Please try again.",
      503: "Service unavailable. Please try again later.",
    };
    if (status && statusMessages[status]) return statusMessages[status];
    if (status && status >= 400) return `Upload failed (${status}). Please try again.`;
    return "Upload failed. Please try again.";
  };

  const handleFileUpload = async (file) => {
    setIsUploadingImage(true);
    setUploadErrorImage(null);

    try {
      const uploadResponse = await uploadAssetFile(
        file,
        "image",
        sessionId || "",
        chapterUid || "",
        stepUid || "",
        screenUid || "",
        "", // link parameter (optional, not used for file uploads)
      );

      if (uploadResponse?.success && uploadResponse?.response) {
        const assetData = {
          status: "success",
          ImageUrl:
            uploadResponse.response.s3_url ||
            uploadResponse.response.url ||
            uploadResponse.response.ImageUrl,
          asset_id:
            uploadResponse.response.id || uploadResponse.response.asset_id,
          asset_type: "image",
          title: uploadResponse.response.name || file.name,
          source: "computer",
        };
        setSelectedImageAsset(assetData);
      } else {
        setUploadErrorImage(getUploadErrorMessage(uploadResponse, null));
      }
    } catch (error) {
      setUploadErrorImage(getUploadErrorMessage(null, error));
      console.error("Error uploading image:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Fetch AI attributes for generate tab
  const loadAIAttributes = async () => {
    setIsLoadingAttributes(true);
    setAttributesError(null);
    setAiGenerateError(null);
    setPromptError(null);

    // Debug: Log UUID values to help diagnose why button might be disabled
    console.log("ImageUpload UUID props:", {
      sessionId,
      chapterUid,
      stepUid,
      screenUid,
    });

    try {
      const response = await getImageAttributes({ sessionId });

      if (response?.error) {
        throw new Error(
          response?.error?.message || "Failed to fetch image attributes",
        );
      }

      // Handle different response structures
      const attributes = response?.response || response || {};

      // Set the fields from the API response
      if (attributes.art_style) {
        setAiArtStyle(attributes.art_style);
      }
      if (attributes.image_guidance) {
        setImageGuidance(attributes.image_guidance);
      }
    } catch (error) {
      console.error("Error fetching image attributes:", error);
      setAttributesError(error.message || "Failed to load image attributes");
    } finally {
      setIsLoadingAttributes(false);
    }
  };

  // Handle suggest prompt
  const handleSuggestPrompt = async () => {
    // Validate required parameters
    if (!sessionId || !chapterUid || !stepUid || !screenUid) {
      const missingParams = [];
      if (!sessionId) missingParams.push("sessionId");
      if (!chapterUid) missingParams.push("chapterUid");
      if (!stepUid) missingParams.push("stepUid");
      if (!screenUid) missingParams.push("screenUid");

      setPromptError(
        `Missing required parameters: ${missingParams.join(", ")}`,
      );
      console.error("Missing parameters for getSuggestPrompt:", {
        sessionId: !!sessionId,
        chapterUid: !!chapterUid,
        stepUid: !!stepUid,
        screenUid: !!screenUid,
        values: { sessionId, chapterUid, stepUid, screenUid },
      });
      return;
    }

    setIsLoadingPrompt(true);
    setPromptError(null);

    try {
      console.log("🔵 Calling getSuggestPrompt API with:", {
        sessionId,
        chapterUid,
        stepUid,
        screenUid,
      });

      const apiResponse = await getSuggestPrompt({
        sessionId,
        chapterUid,
        stepUid,
        screenUid,
      });

      console.log("🔵 Raw API response from getSuggestPrompt:", apiResponse);

      // apiService returns: { success: true, response: {...}, status: 200 }
      // or: { success: false, error: true, message: "..." }
      if (!apiResponse?.success || apiResponse?.error) {
        const errorMessage =
          apiResponse?.message ||
          apiResponse?.error?.message ||
          "Failed to get suggested prompt";
        console.error("❌ API returned error:", errorMessage);
        throw new Error(errorMessage);
      }

      // Extract the actual response data
      // apiService wraps it: { success: true, response: { status: "success", prompt: "...", ... } }
      const responseData = apiResponse?.response || {};

      console.log("🔵 Extracted response data:", responseData);

      // The build-prompt API returns: { status: "success", prompt: "...", ... }
      if (responseData.prompt) {
        setAiPrompt(responseData.prompt);
        console.log("✅ Prompt set successfully:", responseData.prompt);
      } else {
        // If prompt is not found, log the full response for debugging
        console.warn(
          "⚠️ Prompt not found in response. Full response structure:",
          {
            responseData,
            keys: Object.keys(responseData),
            hasStatus: !!responseData.status,
          },
        );
        setPromptError(
          "Prompt not found in API response. Check console for details.",
        );
      }
    } catch (error) {
      console.error("❌ Error getting suggested prompt:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      setPromptError(error.message || "Failed to get suggested prompt");
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setAiGenerateError(null);

    try {
      // First, set the image attributes
      const setAttributesResponse = await setImageAttributes({
        sessionId,
        artStyle: aiArtStyle,
        imageGuidance,
      });

      if (setAttributesResponse?.error) {
        throw new Error(
          setAttributesResponse?.error?.message ||
            "Failed to set image attributes",
        );
      }

      // Then, generate the image
      const payload = {
        prompt: aiPrompt?.trim() || "",
        art_style: aiArtStyle,
        session_id: sessionId || "",
        chapter_uid: chapterUid || "",
        step_uid: stepUid || "",
        screen_uid: screenUid || "",
      };

      const { response, error } = await apiService({
        endpoint: endpoints.generateDalleImage,
        method: "POST",
        data: payload,
      });

      if (error) {
        throw new Error("Failed to generate image");
      }

      if (response) {
        // Normalize asset data to always have ImageUrl
        const assetToSave = {
          status: response.status || "success",
          ImageUrl: response.image_url || response.url,
          asset_id: response.asset_id || response.id,
          style: response.style,
          prompt_used: response.prompt_used,
          type: response.type || "image",
          generated_by: response.generated_by || "generative_ai",
          source: "ai_generated",
        };

        setSelectedImageAsset(assetToSave);
      }
    } catch (error) {
      setAiGenerateError(
        error.message || "Failed to generate image. Please try again.",
      );
      console.error("Error generating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Fetch assets from API
  const fetchAssets = async () => {
    if (!sessionId) {
      setAssetsError("Session ID is required");
      setIsLoadingAssets(false);
      return;
    }

    setIsLoadingAssets(true);
    setAssetsError(null);

    try {
      const { response, error } = await apiService({
        endpoint: endpoints.getAssets,
        method: "GET",
        params: {
          session_id: sessionId,
        },
      });

      if (error) {
        throw new Error(response?.error?.message || "Failed to fetch assets");
      }

      if (response) {
        const assetsData = response?.assets || response || [];
        const assetsList = Array.isArray(assetsData) ? assetsData : [];
        setAssets(assetsList);
      } else {
        setAssets([]);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      setAssetsError(error.message || "Failed to load assets");
      setAssets([]);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const openImageDialog = async (tab = "upload") => {
    setActiveTab(tab);
    setIsImageDialogOpen(true);
    setUploadErrorImage(null);
    setAiGenerateError(null);
    setAttributesError(null);
    setAssetsError(null);
    setCreateAssetError(null);

    if (tab === "generate") {
      await loadAIAttributes();
    }

    if (tab === "assets") {
      fetchAssets();
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    setUploadErrorImage(null);
    setAiGenerateError(null);
    setCreateAssetError(null);

    if (tab === "generate" && !isLoadingAttributes) {
      await loadAIAttributes();
    }

    if (tab === "assets" && !isLoadingAssets) {
      fetchAssets();
    }
  };

  // Extract filename from URL
  const getFilenameFromUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    try {
      const urlParts = url.split("/");
      return urlParts[urlParts.length - 1] || "";
    } catch {
      return "";
    }
  };

  // Handle asset selection
  const handleSelectAsset = async (asset) => {
    // Use exact API response fields: asset_url, asset_type, id
    const image_url = asset.asset_url;
    const filename = getFilenameFromUrl(image_url);
    const assetType = asset.asset_type || asset.type || "image";
    const assetName = asset.name || filename || `Image ${asset.id}`;

    setIsCreatingAsset(true);
    setCreateAssetError(null);

    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append("name", assetName);
      formData.append("url", image_url);
      formData.append("asset_type", assetType);

      // Append optional UIDs
      if (sessionId && sessionId !== "") {
        formData.append("session_id", String(sessionId));
      }
      if (chapterUid && chapterUid !== "") {
        formData.append("chapter_uid", String(chapterUid));
      }
      if (stepUid && stepUid !== "") {
        formData.append("step_uid", String(stepUid));
      }
      if (screenUid && screenUid !== "") {
        formData.append("screen_uid", String(screenUid));
      }

      // Call the create_asset API
      const { response, error } = await apiService({
        endpoint: endpoints.createAsset,
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (error || !response) {
        throw new Error(response?.error?.message || "Failed to create asset");
      }

      // Format asset to match outline structure using API response
      const assetToSave = {
        status: "success",
        ImageUrl: response.url || image_url,
        url: response.url || image_url, // Also include url for compatibility
        asset_id: response.id,
        id: response.id,
        asset_type: response.asset_type || assetType,
        alt: response.name || assetName,
        name: response.name || assetName,
        source: response.source || "direct_link",
      };

      // Add the newly selected/created asset to the local assets array so it appears in the assets list
      const assetForList = {
        id: response.id,
        asset_id: response.id,
        asset_url: response.url || image_url,
        asset_type: response.asset_type || assetType,
        name: response.name || assetName,
      };
      setAssets((prev) => {
        const alreadyInList = prev.some(
          (a) => (a.id || a.asset_id) === response.id
        );
        return alreadyInList ? prev : [...prev, assetForList];
      });
      setSelectedImageAsset(assetToSave);
    } catch (error) {
      console.error("Error creating asset:", error);
      setCreateAssetError(
        error.message || "Failed to create asset. Please try again.",
      );
    } finally {
      setIsCreatingAsset(false);
    }
  };

  const isImageAsset = (asset) =>
    asset?.ImageUrl && !asset.audioUrl && !asset.videoUrl;

  const imageAssetEntries = useMemo(
    () =>
      existingAssets.reduce((acc, asset, index) => {
        if (isImageAsset(asset)) {
          acc.push({ asset, index });
        }
        return acc;
      }, []),
    [existingAssets],
  );

  const currentImageEntry =
    imageAssetEntries.length > 0
      ? imageAssetEntries[imageAssetEntries.length - 1]
      : null;
  const currentImageAsset = currentImageEntry?.asset || null;
  const currentImageUrl = currentImageAsset?.ImageUrl || null;
  const currentImageIndices = imageAssetEntries.map(({ index }) => index);
  const previewImageUrl =
    selectedImageAsset?.ImageUrl || currentImageUrl || null;

  const removeExistingImages = () => {
    if (!onRemoveAsset || currentImageIndices.length === 0) return;

    [...currentImageIndices]
      .sort((a, b) => b - a)
      .forEach((assetIndex) => onRemoveAsset(assetIndex));
  };

  const handleSaveImage = () => {
    if (!selectedImageAsset) return;

    removeExistingImages();

    if (
      selectedImageAsset.source === "ai_generated" &&
      onAIGenerateSuccess
    ) {
      onAIGenerateSuccess(selectedImageAsset);
    } else if (onUploadSuccess) {
      onUploadSuccess(selectedImageAsset);
    }

    setIsImageDialogOpen(false);
    setSelectedImageAsset(null);
    setAiPrompt("");
    setAiGenerateError(null);
    setAttributesError(null);
    setPromptError(null);
    setCreateAssetError(null);
  };

  const handleCloseDialog = () => {
    setIsImageDialogOpen(false);
    setSelectedImageAsset(null);
    setAiPrompt("");
    setUploadErrorImage(null);
    setAiGenerateError(null);
    setAttributesError(null);
    setPromptError(null);
    setCreateAssetError(null);
  };

  const handleRemoveCurrentImage = () => {
    removeExistingImages();
    setSelectedImageAsset(null);
  };

  const handleRemovePreviewImage = () => {
    if (selectedImageAsset) {
      setSelectedImageAsset(null);
      return;
    }

    handleRemoveCurrentImage();
  };

  const tabButtonClass = (tab) =>
    `flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      activeTab === tab
        ? "bg-primary text-white shadow-sm"
        : "text-gray-500 hover:text-gray-700"
    }`;

  const hoverOptions = [
    {
      id: "upload",
      label: "Upload",
      icon: Upload,
    },
    {
      id: "generate",
      label: "Generate",
      icon: Sparkles,
    },
    {
      id: "assets",
      label: "Assets",
      icon: Paperclip,
    },
  ];

  // Count image assets
  const imageAssetsCount = assets.filter((asset) => {
    return asset.asset_type === "image";
  }).length;

  return (
    <>
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-4">
          {label}
        </Label>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          {showSavedImages && currentImageUrl ? (
            <div className="relative h-[180px] overflow-hidden rounded-lg bg-white group/current">
              <img
                src={currentImageUrl}
                alt="Selected image"
                className="w-full h-full object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/current:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                <div className="relative group/replace">
                  <button
                    type="button"
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Replace
                  </button>
                  <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-44 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover/replace:pointer-events-auto group-hover/replace:opacity-100">
                    {hoverOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => openImageDialog(option.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Icon className="h-4 w-4 text-primary" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCurrentImage}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-500 shadow-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[120px] flex-col items-center justify-center text-center">
              <p className="text-base text-gray-800">{label}</p>
              <div className="relative mt-4 group/menu">
                <button
                  type="button"
                  className="border border-primary rounded-lg px-5 py-2.5 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-primary text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Browse
                </button>
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-48 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover/menu:pointer-events-auto group-hover/menu:opacity-100">
                  {hoverOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => openImageDialog(option.id)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error display */}
        {uploadErrorImage && (
          <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <X className="h-4 w-4" />
              <span>{uploadErrorImage}</span>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={isImageDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsImageDialogOpen(true);
            return;
          }
          handleCloseDialog();
        }}
      >
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => handleTabChange("upload")}
                className={tabButtonClass("upload")}
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("generate")}
                className={tabButtonClass("generate")}
              >
                <Sparkles className="h-4 w-4" />
                Generate
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("assets")}
                className={tabButtonClass("assets")}
              >
                <Paperclip className="h-4 w-4" />
                Assets
              </button>
            </div>

            {activeTab === "upload" && (
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-3">
                    Add Image
                  </Label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    {previewImageUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <img
                          src={previewImageUrl}
                          alt="Selected preview"
                          className="max-h-[320px] w-auto max-w-full rounded-lg border border-gray-200 object-contain"
                        />
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file =
                                  e.target.files && e.target.files[0]
                                    ? e.target.files[0]
                                    : null;
                                if (file) {
                                  handleFileUpload(file);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-gray-50 transition-colors">
                              Replace
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemovePreviewImage}
                            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : isUploadingImage ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-gray-600">Uploading image...</p>
                      </div>
                    ) : (
                      <div className="relative flex min-h-[280px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-gray-50 text-center">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file =
                              e.target.files && e.target.files[0]
                                ? e.target.files[0]
                                : null;
                            if (file) {
                              handleFileUpload(file);
                            }
                          }}
                          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                        />
                        <Upload className="mb-4 h-10 w-10 text-primary" />
                        <p className="text-sm font-medium text-gray-700">
                          Drag file here or click to upload
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          Supported formats: Images
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {uploadErrorImage && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <X className="h-4 w-4" />
                    <span>{uploadErrorImage}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === "generate" && (
              <>
                {isLoadingAttributes ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-gray-600">
                      Loading image attributes...
                    </p>
                  </div>
                ) : attributesError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                    <div className="rounded-full bg-red-50 p-3">
                      <X className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Unable to load image attributes
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {attributesError}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ai-prompt">Prompt</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSuggestPrompt}
                          disabled={
                            isLoadingPrompt ||
                            !sessionId ||
                            !chapterUid ||
                            !stepUid ||
                            !screenUid
                          }
                          className="text-xs"
                        >
                          {isLoadingPrompt ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Loading...
                            </>
                          ) : (
                            "Suggest Prompt"
                          )}
                        </Button>
                      </div>
                      <Input
                        id="ai-prompt"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Enter a description for the image..."
                        className="w-full"
                      />
                      {promptError && (
                        <div className="flex items-center gap-2 text-xs text-red-600">
                          <X className="h-3 w-3" />
                          <span>{promptError}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ai-art-style">Art Style</Label>
                      <Select value={aiArtStyle} onValueChange={setAiArtStyle}>
                        <SelectTrigger id="ai-art-style" className="w-full">
                          <SelectValue placeholder="Select art style" />
                        </SelectTrigger>
                        <SelectContent>
                          {ART_STYLE_KEYS.map((style) => (
                            <SelectItem key={style} value={style}>
                              {style}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image-guidance">Image Guidance</Label>
                      <Input
                        id="image-guidance"
                        type="text"
                        value={imageGuidance}
                        onChange={(e) => setImageGuidance(e.target.value)}
                        placeholder="Enter image guidance"
                        className="w-full"
                      />
                    </div>

                    {aiGenerateError && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <X className="h-4 w-4" />
                        <span>{aiGenerateError}</span>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        onClick={handleGenerateImage}
                        disabled={
                          isGeneratingImage ||
                          isLoadingAttributes ||
                          !!attributesError
                        }
                      >
                        {isGeneratingImage ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate Image"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "assets" && (
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">
                  Select from Assets
                  {assets && assets.length > 0 ? ` (${imageAssetsCount})` : ""}
                </div>
                {createAssetError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <X className="h-4 w-4" />
                    <span>{createAssetError}</span>
                  </div>
                )}
                <div className="max-h-[360px] overflow-y-auto">
                  {isLoadingAssets ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-gray-600">Loading assets...</p>
                    </div>
                  ) : assetsError ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                      <div className="rounded-full bg-red-50 p-3">
                        <X className="h-6 w-6 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Unable to load assets
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {assetsError}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={fetchAssets}
                        className="text-xs"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : assets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                      <div className="rounded-full bg-gray-50 p-3">
                        <Plus className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        No assets available
                      </p>
                      <p className="text-xs text-gray-500">
                        Upload assets to see them here
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-3">
                      {assets
                        .filter((asset) => asset.asset_type === "image")
                        .map((asset, index) => {
                          const image_url = asset.asset_url;
                          const assetName =
                            getFilenameFromUrl(image_url) || `Image ${index + 1}`;
                          const isSelected =
                            selectedImageAsset?.asset_id ===
                              (asset.id || asset.asset_id) ||
                            selectedImageAsset?.ImageUrl === image_url;

                          return (
                            <div
                              key={asset.id || asset.asset_id || index}
                              className={`relative border-2 rounded-lg overflow-hidden group aspect-square transition-colors ${
                                isCreatingAsset
                                  ? "opacity-50 cursor-not-allowed border-gray-200"
                                  : isSelected
                                    ? "border-primary"
                                    : "border-gray-200 cursor-pointer hover:border-primary"
                              }`}
                              onClick={() => {
                                if (!isCreatingAsset) {
                                  handleSelectAsset(asset);
                                }
                              }}
                            >
                              {typeof image_url === "string" &&
                              image_url.startsWith("http") ? (
                                <img
                                  src={image_url}
                                  alt={assetName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 p-2 text-center">
                                  {assetName}
                                </div>
                              )}
                              {isCreatingAsset ? (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 text-white animate-spin drop-shadow-lg" />
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                  <div
                                    className={`transition-opacity ${
                                      isSelected
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-100"
                                    }`}
                                  >
                                    <Check className="h-6 w-6 text-white drop-shadow-lg" />
                                  </div>
                                </div>
                              )}
                              {assetName && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                                  {assetName}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedImageAsset?.ImageUrl && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="mb-3 text-sm font-medium text-gray-700">
                  Selected image
                </p>
                <img
                  src={selectedImageAsset.ImageUrl}
                  alt="Selected asset"
                  className="max-h-[220px] w-auto max-w-full rounded-lg border border-gray-200 object-contain"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isCreatingAsset || isGeneratingImage || isUploadingImage}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveImage}
              disabled={
                !selectedImageAsset ||
                isCreatingAsset ||
                isGeneratingImage ||
                isUploadingImage
              }
            >
              Save Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

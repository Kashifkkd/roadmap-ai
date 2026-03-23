"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import {
  Plus,
  X,
  Loader2,
  Check,
  Trash2,
  Pencil,
  Upload,
  Sparkles,
  Paperclip,
  CircleX,
} from "lucide-react";
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

  const imageUploadRootRef = useRef(null);
  const [rightPaneBounds, setRightPaneBounds] = useState(null);

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSuggestedPrompt, setAiSuggestedPrompt] = useState("");
  const [aiArtStyle, setAiArtStyle] = useState("");
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
      const msg =
        uploadResponse.response?.message ??
        uploadResponse.response?.detail ??
        uploadResponse.response?.error;
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
    if (status && status >= 400)
      return `Upload failed (${status}). Please try again.`;
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
    setAiSuggestedPrompt("");

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
        // Insert suggestion into the visible prompt input.
        setAiSuggestedPrompt(responseData.prompt);
        setAiPrompt(responseData.prompt);
        console.log("✅ Prompt suggestion received:", responseData.prompt);
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
        prompt: aiPrompt?.trim() || aiSuggestedPrompt?.trim() || "",
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
      setAiPrompt("");
      setAiSuggestedPrompt("");
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

    if (tab === "generate" && !isLoadingAttributes && !isLoadingPrompt) {
      setAiPrompt("");
      setAiSuggestedPrompt("");
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
          (a) => (a.id || a.asset_id) === response.id,
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
  const promptToUse = aiPrompt?.trim() || aiSuggestedPrompt?.trim() || "";

  const getAssetUrl = (asset) => {
    if (!asset) return null;
    return (
      asset.ImageUrl ||
      asset.image_url ||
      asset.url ||
      asset.mediaUrl ||
      asset.s3_url
    );
  };

  const isAIAsset = (asset) => {
    if (!asset) return false;
    return (
      asset.source === "ai_generated" ||
      asset.source === "ai" ||
      asset.generated_by === "generative_ai" ||
      asset.generated_by === "ai" ||
      asset.type === "ai_generated"
    );
  };

  const aiImageAsset = existingAssets.find(
    (asset) =>
      getAssetUrl(asset) &&
      !asset.audioUrl &&
      !asset.videoUrl &&
      isAIAsset(asset),
  );
  const aiImageUrl = getAssetUrl(aiImageAsset);
  const aiImageIndex = aiImageAsset
    ? existingAssets.findIndex((a) => a === aiImageAsset)
    : -1;

  const generateTabPreviewUrl =
    (selectedImageAsset?.source === "ai_generated" &&
      selectedImageAsset?.ImageUrl) ||
    aiImageUrl ||
    null;

  const removeExistingImages = () => {
    if (!onRemoveAsset || currentImageIndices.length === 0) return;

    [...currentImageIndices]
      .sort((a, b) => b - a)
      .forEach((assetIndex) => onRemoveAsset(assetIndex));
  };

  const handleSaveImage = () => {
    if (!selectedImageAsset) return;

    removeExistingImages();

    if (selectedImageAsset.source === "ai_generated" && onAIGenerateSuccess) {
      onAIGenerateSuccess(selectedImageAsset);
    } else if (onUploadSuccess) {
      onUploadSuccess(selectedImageAsset);
    }

    setIsImageDialogOpen(false);
    setSelectedImageAsset(null);
    setAiPrompt("");
    setAiSuggestedPrompt("");
    setAiGenerateError(null);
    setAttributesError(null);
    setPromptError(null);
    setCreateAssetError(null);
  };

  const handleCloseDialog = () => {
    setIsImageDialogOpen(false);
    setSelectedImageAsset(null);
    setAiPrompt("");
    setAiSuggestedPrompt("");
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

  useEffect(() => {
    if (!isImageDialogOpen) {
      setRightPaneBounds(null);
      return;
    }

    const updateBounds = () => {
      const rightPaneEl = imageUploadRootRef.current?.closest(
        "div.flex-1.min-w-0.h-full.overflow-hidden",
      );

      if (!rightPaneEl) {
        setRightPaneBounds({
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        });
        return;
      }

      const r = rightPaneEl.getBoundingClientRect();
      setRightPaneBounds({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    window.addEventListener("scroll", updateBounds, true);
    return () => {
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds, true);
    };
  }, [isImageDialogOpen]);

  const replaceFileInputRef = useRef(null);
  const dropZoneFileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file);
    }
  };

  const tabs = [
    { key: "upload", label: "Upload", icon: <Upload className="h-4 w-4" /> },
    {
      key: "generate",
      label: "Generate",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      key: "assets",
      label: "Assets",
      icon: <Paperclip className="h-4 w-4" />,
    },
  ];

  return (
    <div ref={imageUploadRootRef} className="relative">
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-4">
          {label}
        </Label>
        <div
          className={
            showSavedImages && currentImageUrl
              ? ""
              : "p-2 bg-gray-100 rounded-md"
          }
        >
          <div
            className={`w-full rounded-md flex flex-col items-center justify-center transition-colors relative ${
              showSavedImages && currentImageUrl
                ? ""
                : "border-2 border-dashed border-gray-300 bg-white hover:border-primary/50 cursor-pointer py-2"
            }`}
            style={{
              minHeight:
                showSavedImages && currentImageUrl ? undefined : "80px",
            }}
            onClick={() => {
              if (!(showSavedImages && currentImageUrl)) {
                openImageDialog("upload");
              }
            }}
          >
            {showSavedImages && currentImageUrl ? (
              <div
                className="group relative w-full mx-auto rounded-xl overflow-hidden bg-white flex items-center justify-center min-h-[200px] px-2 py-2 cursor-pointer"
                onClick={() => openImageDialog("upload")}
              >
                <div className="group relative p-2 bg-gray-100 rounded-lg">
                  <img
                    src={currentImageUrl}
                    alt="Uploaded preview"
                    className="max-w-[300px] max-h-[400px] w-auto h-auto object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 rounded-lg flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                    <div className="rounded-md p-2 flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openImageDialog("upload");
                        }}
                        className="rounded-md border border-primary bg-white px-5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary-600 hover:border-none hover:text-white cursor-pointer"
                      >
                        Replace
                      </button>

                      {onRemoveAsset && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCurrentImage();
                        }}
                        className="rounded-md border border-red-400 bg-white px-5 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:border-none hover:text-white cursor-pointer"
                      >
                        Remove
                      </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-3 w-full">
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <div className="flex shrink-0 rounded-lg items-center justify-center bg-white p-1.5 w-full gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openImageDialog(tab.key);
                      }}
                      className="flex cursor-pointer items-center justify-center  rounded-md border border-primary/50 bg-white px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-100 hover:border-none "
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {uploadErrorImage && !isImageDialogOpen && (
          <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <X className="h-4 w-4" />
              <span>{uploadErrorImage}</span>
            </div>
          </div>
        )}
      </div>

      {isImageDialogOpen && (
        <div
          className="fixed z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 overflow-hidden pointer-events-auto"
          style={
            rightPaneBounds
              ? {
                  top: rightPaneBounds.top,
                  left: rightPaneBounds.left,
                  width: rightPaneBounds.width,
                  height: rightPaneBounds.height,
                }
              : undefined
          }
        >
          <div className="absolute inset-0 z-0" />
          <div className="relative z-10 flex h-[min(85vh,720px)] max-h-[85vh] w-full max-w-[95vw] sm:max-w-[700px] flex-col gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl [&>button.absolute]:hidden">
            <div className="flex shrink-0 items-center justify-between bg-white px-4 py-2 sm:px-6">
              <h2 className="text-lg font-bold leading-none text-gray-900">
                Add Image
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (
                    !(isUploadingImage || isGeneratingImage || isCreatingAsset)
                  ) {
                    handleCloseDialog();
                  }
                }}
                className="text-gray-800 hover:text-gray-600"
                aria-label="Close"
              >
                <CircleX size={20} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="mx-2 mb-2 mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-lg bg-gray-50 p-1 sm:p-2">
                <div className="flex shrink-0 rounded-lg bg-white p-1 shadow-sm gap-2 sm:p-1.5">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleTabChange(tab.key)}
                      className={`flex flex-1 cursor-pointer whitespace-nowrap items-center justify-center gap-2 rounded-md px-1.5 py-2 text-xs font-medium sm:text-sm transition-all duration-200 ${
                        activeTab === tab.key
                          ? "bg-primary text-white shadow-sm"
                          : "text-gray-600 hover:bg-primary-100 hover:text-gray-800"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto rounded-t-lg bg-white px-2 py-2">
                  {activeTab === "upload" && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-gray-700">
                        Add Image
                      </p>
                      {previewImageUrl ? (
                        <div className="flex flex-col items-center justify-center rounded-lg p-4">
                          <div className="group relative overflow-hidden rounded-lg bg-gray-100 p-2">
                            <img
                              src={previewImageUrl}
                              alt="Uploaded preview"
                              className="max-h-[250px] w-auto rounded-lg object-contain"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <div className="relative inline-block">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  ref={replaceFileInputRef}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    if (file) handleFileUpload(file);
                                  }}
                                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 "
                                />
                                <button
                                  type="button"
                                  className="rounded-md border border-primary bg-white px-5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary-600 hover:border-none hover:text-white cursor-pointer"
                                >
                                  Replace
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePreviewImage();
                                }}
                                className="rounded-md border border-red-400 bg-white px-5 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:border-none hover:text-white cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full rounded-lg border border-primary p-0.5">
                          <div
                            className={`flex h-full min-h-[240px] sm:min-h-[280px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 sm:p-8 transition-colors ${
                              isDragging
                                ? "border-primary bg-primary/5"
                                : "border-gray-300 bg-gray-50 hover:border-primary/40"
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() =>
                              dropZoneFileInputRef.current?.click()
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <Input
                              type="file"
                              accept="image/*"
                              ref={dropZoneFileInputRef}
                              onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                if (file) handleFileUpload(file);
                              }}
                              className="hidden"
                            />
                            {isUploadingImage ? (
                              <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <span className="text-sm text-gray-600">
                                  Uploading...
                                </span>
                              </div>
                            ) : (
                              <>
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                  <Image
                                    src="/upload.svg"
                                    alt=""
                                    width={42}
                                    height={42}
                                  />
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                  Drag files here or click to upload
                                </p>
                                <p className="mt-1 text-center text-xs text-gray-400">
                                  Supported formats:
                                  <br />
                                  PDFs, Videos, Audio, Images
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      {uploadErrorImage && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <X className="h-4 w-4" />
                          <span>{uploadErrorImage}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "generate" && (
                    <div className="space-y-4 h-full">
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
                            <p className="mt-1 text-xs text-gray-500">
                              {attributesError}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch h-full">
                          <div className="flex h-full flex-col gap-2">
                            <p className="text-sm font-medium text-gray-700">
                              Image Preview
                            </p>

                            <div className="flex min-h-[150px] flex-col items-center justify-center rounded-xl bg-gray-50/50 p-4 transition-all">
                              {generateTabPreviewUrl ? (
                                <div className="group relative overflow-hidden rounded-lg bg-white p-1 shadow-md">
                                  <img
                                    src={generateTabPreviewUrl}
                                    alt="AI Generated preview"
                                    className="max-h-[250px] w-auto rounded-md object-contain"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (
                                          selectedImageAsset?.source ===
                                          "ai_generated"
                                        ) {
                                          setSelectedImageAsset(null);
                                        } else if (
                                          onRemoveAsset &&
                                          aiImageIndex >= 0
                                        ) {
                                          onRemoveAsset(aiImageIndex);
                                        }
                                      }}
                                      className="rounded-md border border-red-400 bg-white px-5 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:border-none hover:text-white cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-3 text-gray-400">
                                  <Sparkles className="h-8 w-8 opacity-20" />
                                  <p className="text-sm italic">
                                    Generated image preview
                                  </p>
                                </div>
                              )}
                            </div>

                            {generateTabPreviewUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    selectedImageAsset?.source ===
                                    "ai_generated"
                                  ) {
                                    setSelectedImageAsset(null);
                                  } else if (
                                    onRemoveAsset &&
                                    aiImageIndex >= 0
                                  ) {
                                    onRemoveAsset(aiImageIndex);
                                  }
                                }}
                                className="md:hidden mx-auto w-fit text-sm font-medium text-primary hover:text-primary/90"
                              >
                                Generate New AI Image
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col justify-between h-full items-stretch">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  selectedImageAsset?.source === "ai_generated"
                                ) {
                                  setSelectedImageAsset(null);
                                } else if (onRemoveAsset && aiImageIndex >= 0) {
                                  onRemoveAsset(aiImageIndex);
                                }
                              }}
                              className="hidden md:block w-full text-left text-sm font-medium text-primary hover:text-primary/90"
                            >
                              Generate New AI Image
                            </button>

                            <div className="flex flex-col gap-2">
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
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
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
                                <Select
                                  value={aiArtStyle}
                                  onValueChange={setAiArtStyle}
                                >
                                  <SelectTrigger
                                    id="ai-art-style"
                                    className="w-full"
                                  >
                                    <SelectValue placeholder="Select" />
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
                                <Label htmlFor="image-guidance">
                                  Image Guidance
                                </Label>
                                <Input
                                  id="image-guidance"
                                  type="text"
                                  value={imageGuidance}
                                  onChange={(e) =>
                                    setImageGuidance(e.target.value)
                                  }
                                  placeholder=""
                                  className="w-full"
                                />
                              </div>
                            </div>

                            <div className="mt-auto pt-2 ">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleGenerateImage}
                                disabled={
                                  isGeneratingImage ||
                                  isLoadingPrompt ||
                                  !!promptError ||
                                  !!aiGenerateError ||
                                  !promptToUse
                                }
                                className="w-full border-primary text-primary hover:bg-primary-100"
                              >
                                {isGeneratingImage ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Image
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "assets" && (
                    <div className="space-y-4">
                      {createAssetError && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                          <X className="h-4 w-4" />
                          <span>{createAssetError}</span>
                        </div>
                      )}
                      {isLoadingAssets ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-gray-600">
                            Loading assets...
                          </p>
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
                            <p className="mt-1 text-xs text-gray-500">
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {assets
                            .filter((asset) => asset.asset_type === "image")
                            .map((asset, index) => {
                              const image_url = asset.asset_url;
                              const assetName =
                                getFilenameFromUrl(image_url) ||
                                `Image ${index + 1}`;
                              const isSelected =
                                image_url === currentImageUrl ||
                                selectedImageAsset?.asset_id ===
                                  (asset.id || asset.asset_id) ||
                                selectedImageAsset?.ImageUrl === image_url;

                              return (
                                <div
                                  key={asset.id || asset.asset_id || index}
                                  className={`group relative rounded-lg p-2 transition-all ${
                                    isSelected
                                      ? "bg-primary/10"
                                      : "hover:bg-gray-50"
                                  } ${
                                    isCreatingAsset
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                  onClick={() => {
                                    if (!isCreatingAsset)
                                      handleSelectAsset(asset);
                                  }}
                                >
                                  <div className="relative mb-2 aspect-video overflow-hidden  bg-gray-100">
                                    {typeof image_url === "string" &&
                                    image_url.startsWith("http") ? (
                                      <img
                                        src={image_url}
                                        alt={assetName}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center break-all p-2 text-center text-[10px] text-gray-500">
                                        {assetName}
                                      </div>
                                    )}
                                    {isCreatingAsset ? (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                                      </div>
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                                        <div className="opacity-0 transition-opacity group-hover:opacity-100">
                                          <Check className="h-6 w-6 text-white drop-shadow-lg" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-0.5 px-0.5">
                                    <p className="truncate text-xs font-bold text-gray-900">
                                      {assetName}
                                    </p>
                                    <p className="text-[10px] font-medium text-gray-500">
                                      {asset.size}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex w-full shrink-0 flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 rounded-b-lg bg-white p-2">
                  <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleCloseDialog();
                        setUploadErrorImage(null);
                        setAiGenerateError(null);
                        setAttributesError(null);
                        setPromptError(null);
                      }}
                      disabled={
                        isGeneratingImage || isUploadingImage || isCreatingAsset
                      }
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
                      className="bg-primary hover:bg-primary/90"
                    >
                      Save Image
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

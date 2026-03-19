"use client";

import React, { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
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
  CloudUpload,
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
import Image from "next/image";

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
  const [uploadedImage, setUploadedImage] = useState(null);
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

  console.log("Existing assets passed to ImageUpload:", existingAssets);

  // AI Generate Image Dialog State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiArtStyle, setAiArtStyle] = useState("Editorial Illustration");
  const [imageGuidance, setImageGuidance] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiGenerateError, setAiGenerateError] = useState(null);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [attributesError, setAttributesError] = useState(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [promptError, setPromptError] = useState(null);

  // Asset Selection State
  const [assets, setAssets] = useState([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [assetsError, setAssetsError] = useState(null);
  const [isCreatingAsset, setIsCreatingAsset] = useState(false);
  const [createAssetError, setCreateAssetError] = useState(null);

  // Unified Dialog State
  const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneFileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  // Staged Upload State
  const [stagedFile, setStagedFile] = useState(null);
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState(null);
  const [stagedAiImage, setStagedAiImage] = useState(null);

  // Cleanup staged preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (stagedPreviewUrl) URL.revokeObjectURL(stagedPreviewUrl);
    };
  }, [stagedPreviewUrl]);

  // Reset staging when dialog opens or closes
  useEffect(() => {
    if (!isMainDialogOpen) {
      setStagedFile(null);
      if (stagedPreviewUrl) URL.revokeObjectURL(stagedPreviewUrl);
      setStagedPreviewUrl(null);
      setStagedAiImage(null);
    }
  }, [isMainDialogOpen]);

  const handleFilePick = (file) => {
    if (!file) return;
    setStagedFile(file);
    if (stagedPreviewUrl) URL.revokeObjectURL(stagedPreviewUrl);
    setStagedPreviewUrl(URL.createObjectURL(file));
    setUploadErrorImage(null);
  };

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
        "",
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
        if (onUploadSuccess) {
          onUploadSuccess(assetData);
        }
        setUploadedImage(file.name);
        return true; // Success
      } else {
        setUploadErrorImage(getUploadErrorMessage(uploadResponse, null));
        return false; // Failed
      }
    } catch (error) {
      setUploadErrorImage(getUploadErrorMessage(null, error));
      console.error("Error uploading image:", error);
      return false; // Failed
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle opening AI dialog - fetch attributes first
  const handleOpenAIDialog = async () => {
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
        const assetToSave = {
          status: response.status || "success",
          ImageUrl: response.image_url || response.url || response.ImageUrl,
          asset_id: response.asset_id || response.id,
          style: response.style,
          prompt_used: response.prompt_used,
          type: response.type || "image",
          generated_by: response.generated_by || "generative_ai",
          source: "ai_generated",
        };

        // Stage the generated image instead of closing immediately
        setStagedAiImage(assetToSave);
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

      if (onUploadSuccess) {
        onUploadSuccess(assetToSave);
      }

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

      // Close dialog on success
      setIsMainDialogOpen(false);
    } catch (error) {
      console.error("Error creating asset:", error);
      setCreateAssetError(
        error.message || "Failed to create asset. Please try again.",
      );
    } finally {
      setIsCreatingAsset(false);
    }
  };

  const imageAssetsCount = assets.filter(
    (asset) => asset.asset_type === "image",
  ).length;

  // First image of any source — for the inline preview area
  const existingImageAsset = existingAssets.find(
    (asset) => getAssetUrl(asset) && !asset.audioUrl && !asset.videoUrl,
  );
  const existingImageUrl = getAssetUrl(existingImageAsset);
  const existingImageIndex = existingImageAsset
    ? existingAssets.findIndex((a) => a === existingImageAsset)
    : -1;

  // Per-source images — for each tab
  const computerImageAsset = existingAssets.find(
    (asset) =>
      getAssetUrl(asset) &&
      !asset.audioUrl &&
      !asset.videoUrl &&
      asset.source === "computer",
  );
  const aiImageAsset = existingAssets.find(
    (asset) =>
      getAssetUrl(asset) &&
      !asset.audioUrl &&
      !asset.videoUrl &&
      isAIAsset(asset),
  );

  const computerImageUrl = getAssetUrl(computerImageAsset);
  const aiImageUrl = getAssetUrl(aiImageAsset);

  const computerImageIndex = computerImageAsset
    ? existingAssets.findIndex((a) => a === computerImageAsset)
    : -1;

  const aiImageIndex = aiImageAsset
    ? existingAssets.findIndex((a) => a === aiImageAsset)
    : -1;

  // Dialog controls
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
      handleFilePick(file);
    }
  };

  const handleOpenMainDialog = () => {
    setIsMainDialogOpen(true);
    setActiveTab("upload");
    setUploadErrorImage(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "generate") {
      handleOpenAIDialog();
    } else if (tab === "assets") {
      fetchAssets();
    }
  };

  const handleSave = async () => {
    if (activeTab === "upload" && stagedFile) {
      // User is in upload tab and has picked a new file
      const success = await handleFileUpload(stagedFile);
      if (success) {
        setIsMainDialogOpen(false);
      }
    } else if (activeTab === "generate" && stagedAiImage) {
      // User generated an AI image and wants to save it
      if (onAIGenerateSuccess) {
        onAIGenerateSuccess(stagedAiImage);
      }
      setIsMainDialogOpen(false);
    } else {
      setIsMainDialogOpen(false);
    }
  };

  // Tab definitions
  const tabs = [
    { key: "upload", label: "Upload", icon: <Upload className="h-4 w-4" /> },
    {
      key: "generate",
      label: "Generate",
      icon: <Sparkles className="h-4 w-4" />,
    },
    { key: "assets", label: "Assets", icon: <Paperclip className="h-4 w-4" /> },
  ];

  return (
    <>
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-4">
          {label}
        </Label>
        {/* ── Inline Upload Area ── */}
        <div className={existingImageUrl ? "" : "p-2 bg-gray-100 rounded-md"}>
          <div
            className={`w-full rounded-md flex flex-col items-center justify-center transition-colors relative ${
              existingImageUrl
                ? ""
                : "border-2 border-dashed border-gray-300 bg-white hover:border-primary/50 cursor-pointer py-2"
            }`}
            style={{ minHeight: "80px" }}
            onClick={() => {
              if (!existingImageUrl) {
                handleOpenMainDialog();
              }
            }}
          >
            {existingImageUrl ? (
              <div className="relative w-full max-w-[500px] mx-auto rounded-xl overflow-hidden group bg-white shadow-sm border border-gray-100 flex items-center justify-center p-1">
                <img
                  src={existingImageUrl}
                  alt="Uploaded preview"
                  className="w-full h-auto max-w-[200px] max-h-[180px] object-cover"
                />

                {/* Black Overlay*/}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 scale-x-50 group-hover:scale-x-100 origin-center transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none" />

                {/* Animated Buttons*/}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-3 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]">
                    <div className="transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] transform translate-x-16 scale-90 opacity-0 group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMainDialog();
                        }}
                        className="flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-md text-gray-800 shadow-md rounded-md px-5 py-2 text-sm font-medium hover:text-white hover:bg-primary-600 hover:shadow-lg active:scale-95 transition-all w-32 hover:cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" /> Replace
                      </button>
                    </div>

                    {onRemoveAsset && (
                      <div className="transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] transform -translate-x-16 scale-90 opacity-0 group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveAsset(existingImageIndex);
                          }}
                          className="flex items-center justify-center gap-1.5 bg-red-500 backdrop-blur-md shadow-md rounded-md px-5 py-2 text-sm font-medium text-white hover:shadow-lg active:scale-95 transition-all w-32 hover:cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-3 w-full">
                <p className="text-sm text-gray-500">{label}</p>
                <div className="border border-primary rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-primary text-sm font-medium cursor-pointer">
                  <Plus className="h-4 w-4" />
                  Browse
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Inline error display */}
        {uploadErrorImage && !isMainDialogOpen && (
          <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <X className="h-4 w-4" />
              <span>{uploadErrorImage}</span>
            </div>
          </div>
        )}
      </div>

      {/* Add Image Dialog */}
      {isMainDialogOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-hidden pointer-events-auto">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => {
              if (!(isUploadingImage || isGeneratingImage || isCreatingAsset)) {
                setIsMainDialogOpen(false);
              }
            }}
          />

          {/* Dialog Panel */}
          <div className="w-full max-w-[600px] h-[80vh] bg-white shadow-2xl rounded-2xl border border-gray-200 flex flex-col relative z-[101] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-2 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-gray-900 line-height-1">
                Add Image
              </h2>
              <button
                onClick={() => {
                  if (
                    !(isUploadingImage || isGeneratingImage || isCreatingAsset)
                  ) {
                    setIsMainDialogOpen(false);
                  }
                }}
                className="text-gray-800 hover:text-gray-600"
              >
                <CircleX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="mx-2 mt-4 mb-6 p-2 bg-gray-50 rounded-lg flex flex-col gap-2 overflow-hidden flex-1">
                {/* Tabs List */}
                <div className="bg-white rounded-lg p-1.5 flex shadow-sm shrink-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleTabChange(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                        activeTab === tab.key
                          ? "bg-primary text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-800 hover:bg-primary-100"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="px-2 py-2 overflow-y-auto bg-white rounded-t-lg -mb-0.5 flex-1 custom-scrollbar">
                  {/*UPLOAD TAB  */}
                  {activeTab === "upload" && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-gray-700">
                        Add Image
                      </p>

                      {stagedPreviewUrl || computerImageUrl ? (
                        <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                          <div className="relative group rounded-lg overflow-hidden">
                            <img
                              src={stagedPreviewUrl || computerImageUrl}
                              alt="Uploaded preview"
                              className="max-h-[250px] w-auto object-contain rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                              <div className="relative inline-block">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  ref={replaceFileInputRef}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    if (file) handleFilePick(file);
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <button
                                  type="button"
                                  className="bg-white text-primary border border-primary rounded-md px-5 py-1.5 text-sm font-medium hover:bg-primary/5 transition-colors"
                                >
                                  Replace
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (stagedFile) {
                                    setStagedFile(null);
                                    if (stagedPreviewUrl)
                                      URL.revokeObjectURL(stagedPreviewUrl);
                                    setStagedPreviewUrl(null);
                                  } else if (
                                    onRemoveAsset &&
                                    computerImageIndex >= 0
                                  ) {
                                    onRemoveAsset(computerImageIndex);
                                  }
                                }}
                                className="bg-white text-red-500 border border-red-400 rounded-md px-5 py-1.5 text-sm font-medium hover:bg-red-50 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Drag & Drop Zone */
                        <div className="h-full border border-primary rounded-lg p-0.5">
                          <div
                            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors h-full ${
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
                            style={{ cursor: "pointer", minHeight: "280px" }}
                          >
                            <Input
                              type="file"
                              accept="image/*"
                              ref={dropZoneFileInputRef}
                              onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                if (file) handleFilePick(file);
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
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                  <Image
                                    src="/upload.svg"
                                    alt="Icon"
                                    width={42}
                                    height={42}
                                  />
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                  Drag files here or click to upload
                                </p>
                                <p className="text-xs text-center text-gray-400 mt-1">
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
                          <X size={16} />
                          <span>{uploadErrorImage}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "generate" && (
                    <div className="space-y-4">
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
                            <X size={24} className="text-red-400" />
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
                        <>
                          {/* Image Review Area */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              Image Preview
                            </p>
                            <div className="rounded-xl p-4 min-h-[150px] flex flex-col items-center justify-center bg-gray-50/50 transition-all">
                              {stagedAiImage?.ImageUrl || aiImageUrl ? (
                                <div className="relative group rounded-lg overflow-hidden shadow-md bg-white p-1">
                                  <img
                                    src={stagedAiImage?.ImageUrl || aiImageUrl}
                                    alt="AI Generated preview"
                                    className="max-h-[250px] w-auto object-contain rounded-md"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (stagedAiImage) {
                                          setStagedAiImage(null);
                                        } else if (
                                          onRemoveAsset &&
                                          aiImageIndex >= 0
                                        ) {
                                          onRemoveAsset(aiImageIndex);
                                        }
                                      }}
                                      className="bg-white text-red-500 border border-red-400 rounded-md px-5 py-1.5 text-sm font-medium hover:bg-red-50 transition-colors"
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
                          </div>

                          {/* Generate form */}
                          <div className="space-y-4">
                            <p className="text-sm font-bold text-primary">
                              Generate AI Image
                            </p>

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
                                placeholder="Enter image guidance"
                                className="w-full"
                              />
                            </div>

                            {aiGenerateError && (
                              <div className="flex items-center gap-2 text-sm text-red-600">
                                <X size={16} />
                                <span>{aiGenerateError}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ASSETS TAB */}
                  {activeTab === "assets" && (
                    <div className="space-y-4">
                      {createAssetError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                          <X size={16} />
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
                            <X size={24} className="text-red-400" />
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
                            <Plus size={24} className="text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">
                            No assets available
                          </p>
                          <p className="text-xs text-gray-500">
                            Upload assets to see them here
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {assets
                            .filter((asset) => asset.asset_type === "image")
                            .map((asset, index) => {
                              const image_url = asset.asset_url;
                              const assetName =
                                getFilenameFromUrl(image_url) ||
                                `Image ${index + 1}`;
                              const isSelected = image_url === existingImageUrl;

                              return (
                                <div
                                  key={asset.id || asset.asset_id || index}
                                  className={`p-2 transition-all relative group  rounded-lg ${
                                    isSelected
                                      ? "bg-primary/10"
                                      : "hover:bg-gray-50"
                                  } ${
                                    isCreatingAsset
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                  onClick={() => {
                                    if (!isCreatingAsset)
                                      handleSelectAsset(asset);
                                  }}
                                >
                                  <div className="aspect-video overflow-hidden mb-2 relative  bg-gray-100">
                                    {typeof image_url === "string" &&
                                    image_url.startsWith("http") ? (
                                      <img
                                        src={image_url}
                                        alt={assetName}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 p-2 text-center break-all">
                                        {assetName}
                                      </div>
                                    )}

                                    {isCreatingAsset ? (
                                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                                      </div>
                                    ) : (
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Check className="h-6 w-6 text-white drop-shadow-lg" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="px-0.5 space-y-0.5">
                                    <p className="text-xs font-bold text-gray-900 truncate">
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

                {/* Footer */}
                <div className="bg-white p-2 rounded-b-lg flex items-center justify-between shrink-0">
                  {/* Generate button (left side) */}
                  <div className="flex-1">
                    {activeTab === "generate" &&
                      !isLoadingAttributes &&
                      !attributesError && (
                        <Button
                          onClick={handleGenerateImage}
                          disabled={isGeneratingImage}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isGeneratingImage ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate Image
                            </>
                          )}
                        </Button>
                      )}
                  </div>

                  {/* Cancel + Save Image (right side) */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsMainDialogOpen(false);
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
                      onClick={handleSave}
                      disabled={
                        isGeneratingImage || isUploadingImage || isCreatingAsset
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
    </>
  );
}

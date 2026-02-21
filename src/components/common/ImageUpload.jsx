"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Plus, X, Loader2, Check, Trash2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const [uploadedImage, setUploadedImage] = useState(null);
  console.log("Existing assets passed to ImageUpload:", existingAssets);

  // AI Generate Image Dialog State
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiArtStyle, setAiArtStyle] = useState("Editorial Illustration");
  const [imageGuidance, setImageGuidance] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiGenerateError, setAiGenerateError] = useState(null);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [attributesError, setAttributesError] = useState(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [promptError, setPromptError] = useState(null);

  // Asset Selection Dialog State
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [assetsError, setAssetsError] = useState(null);
  const [isCreatingAsset, setIsCreatingAsset] = useState(false);
  const [createAssetError, setCreateAssetError] = useState(null);

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

      // console.log(uploadResponse, "uploadResponse")
      if (uploadResponse?.response) {
        // Normalize asset data to always have ImageUrl
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
      }
    } catch (error) {
      setUploadErrorImage("Upload failed. Please try again.");
      console.error("Error uploading image:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle opening AI dialog - fetch attributes first
  const handleOpenAIDialog = async () => {
    setIsAIDialogOpen(true);
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
    if (!aiPrompt.trim()) {
      setAiGenerateError("Please enter a prompt");
      return;
    }

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
        prompt: aiPrompt,
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

        if (onAIGenerateSuccess) {
          onAIGenerateSuccess(assetToSave);
        }

        setIsAIDialogOpen(false);
        setAiPrompt("");
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

  // Handle opening asset dialog
  const handleOpenAssetDialog = () => {
    setIsAssetDialogOpen(true);
    // Always fetch assets to get the latest count
    fetchAssets();
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
          (a) => (a.id || a.asset_id) === response.id
        );
        return alreadyInList ? prev : [...prev, assetForList];
      });

      setIsAssetDialogOpen(false);
    } catch (error) {
      console.error("Error creating asset:", error);
      setCreateAssetError(
        error.message || "Failed to create asset. Please try again.",
      );
    } finally {
      setIsCreatingAsset(false);
    }
  };

  // Count image assets
  const imageAssetsCount = assets.filter((asset) => {
    return asset.asset_type === "image";
  }).length;

  // Get images by source for each section
  const computerImageAsset = existingAssets.find(
    (asset) =>
      asset.ImageUrl &&
      !asset.audioUrl &&
      !asset.videoUrl &&
      asset.source === "computer",
  );
  const assetImageAsset = existingAssets.find(
    (asset) =>
      asset.ImageUrl &&
      !asset.audioUrl &&
      !asset.videoUrl &&
      (asset.source === "direct_link" || asset.source === "assets"),
  );
  const aiImageAsset = existingAssets.find(
    (asset) =>
      asset.ImageUrl &&
      !asset.audioUrl &&
      !asset.videoUrl &&
      (asset.source === "ai_generated" ||
        asset.generated_by === "generative_ai"),
  );

  const computerImageUrl = computerImageAsset?.ImageUrl;
  const assetImageUrl = assetImageAsset?.ImageUrl;
  const aiImageUrl = aiImageAsset?.ImageUrl;

  const computerImageIndex = computerImageAsset
    ? existingAssets.findIndex((a) => a === computerImageAsset)
    : -1;
  const assetImageIndex = assetImageAsset
    ? existingAssets.findIndex((a) => a === assetImageAsset)
    : -1;
  const aiImageIndex = aiImageAsset
    ? existingAssets.findIndex((a) => a === aiImageAsset)
    : -1;

  return (
    <>
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-4">
          {label}
        </Label>

        {/* Three Option Container */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-3 gap-4">
            {/* Option 1: Upload from Computer */}
            <div
              className={`border-2 border-dashed border-gray-300 rounded-lg  bg-white flex flex-col items-center ${computerImageUrl ? "p-0" : "p-4"} relative`}
            >
              {computerImageUrl ? (
                <div className="relative w-full h-[100px] rounded-lg overflow-hidden group/computer bg-gray-50">
                  <img
                    src={computerImageUrl}
                    alt="Computer upload"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/computer:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    {onRemoveAsset && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveAsset(computerImageIndex);
                        }}
                        className="bg-white rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer shadow-sm"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    )}
                    <div className="relative inline-block">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file =
                            e.target.files && e.target.files[0]
                              ? e.target.files[0]
                              : null;
                          if (file) {
                            if (onRemoveAsset && computerImageIndex >= 0) {
                              onRemoveAsset(computerImageIndex);
                            }
                            handleFileUpload(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="bg-white rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer shadow-sm">
                        <Pencil className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                    Upload from Computer
                  </h3>
                  {isUploadingImage ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="relative inline-block">
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
                      <div className="border border-primary rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-primary text-sm font-medium cursor-pointer">
                        <Plus className="h-4 w-4" />
                        Browse
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Option 2: Select from Assets */}
            <div
              className={`border-2 border-dashed border-gray-300 rounded-lg  bg-white flex flex-col items-center ${assetImageUrl ? "p-0" : "p-4"} relative`}
            >
              {assetImageUrl ? (
                <div className="relative w-full h-[100px] rounded-lg overflow-hidden group/asset bg-gray-50">
                  <img
                    src={assetImageUrl}
                    alt="Asset image"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/asset:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    {onRemoveAsset && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveAsset(assetImageIndex);
                        }}
                        className="bg-white rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer shadow-sm"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRemoveAsset && assetImageIndex >= 0) {
                          onRemoveAsset(assetImageIndex);
                        }
                        handleOpenAssetDialog();
                      }}
                      className="bg-white rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer shadow-sm"
                      title="Replace image"
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                    Select from Assets
                  </h3>
                  <button
                    type="button"
                    className="border border-primary rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-primary text-sm font-medium"
                    onClick={handleOpenAssetDialog}
                  >
                    <Plus className="h-4 w-4" />
                    Select
                  </button>
                </>
              )}
            </div>

            {/* Option 3: AI-Generate Image */}
            <div
              className={`border-2 border-dashed border-gray-300 rounded-lg  bg-white flex flex-col items-center ${aiImageUrl ? "p-0" : "p-4"} relative`}
            >
              {aiImageUrl ? (
                <div className="relative w-full h-[100px] rounded-lg overflow-hidden group/ai bg-gray-50">
                  <img
                    src={aiImageUrl}
                    alt="AI generated"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/ai:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    {onRemoveAsset && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveAsset(aiImageIndex);
                        }}
                        className="bg-white rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer shadow-sm"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRemoveAsset && aiImageIndex >= 0) {
                          onRemoveAsset(aiImageIndex);
                        }
                        handleOpenAIDialog();
                      }}
                      className="bg-white rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer shadow-sm"
                      title="Replace image"
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                    AI-Generate Image
                  </h3>
                  <button
                    type="button"
                    className="border border-primary rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-primary text-sm font-medium"
                    onClick={handleOpenAIDialog}
                  >
                    <Plus className="h-4 w-4" />
                    Create
                  </button>
                </>
              )}
            </div>
          </div>
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

      {/* AI Generate Image Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI-Generate Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
              <>
                {/* Prompt Field */}
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
                      title={
                        !sessionId
                          ? "Session ID is required"
                          : !chapterUid
                            ? "Chapter UUID is required"
                            : !stepUid
                              ? "Step UUID is required"
                              : !screenUid
                                ? "Screen UUID is required"
                                : "Get AI-suggested prompt"
                      }
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
                  <Textarea
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Enter a description for the image..."
                    className="w-full min-h-[100px] resize-y"
                    rows={4}
                  />
                  {promptError && (
                    <div className="flex items-center gap-2 text-xs text-red-600">
                      <X className="h-3 w-3" />
                      <span>{promptError}</span>
                    </div>
                  )}
                </div>

                {/* Art Style Field */}
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

                {/* Image Guidance Field */}
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

                {/* Error Message */}
                {aiGenerateError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <X className="h-4 w-4" />
                    <span>{aiGenerateError}</span>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAIDialogOpen(false);
                setAiPrompt("");
                setAiGenerateError(null);
                setAttributesError(null);
                setPromptError(null);
              }}
              disabled={isGeneratingImage || isLoadingAttributes}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateImage}
              disabled={
                isGeneratingImage ||
                isLoadingAttributes ||
                !aiPrompt.trim() ||
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset Selection Dialog */}
      <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
        <DialogContent className="sm:max-w-[900px] h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Select from Assets{" "}
              {assets && assets.length > 0 ? ` (${imageAssetsCount})` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
            {/* Error message for asset creation */}
            {createAssetError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <X className="h-4 w-4" />
                <span>{createAssetError}</span>
              </div>
            )}
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
                  <p className="text-xs text-gray-500 mt-1">{assetsError}</p>
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
              <div className="grid grid-cols-6 gap-2">
                {assets &&
                  assets.length > 0 &&
                  assets
                    .filter((asset) => {
                      // Filter only image assets using exact API response field
                      return asset.asset_type === "image";
                    })
                    .map((asset, index) => {
                      // Use exact API response fields
                      const image_url = asset.asset_url;
                      const assetName =
                        getFilenameFromUrl(image_url) || `Image ${index + 1}`;

                      return (
                        <div
                          key={asset.id || asset.asset_id || index}
                          className={`relative border-2 border-gray-200 rounded-lg overflow-hidden group aspect-square transition-colors ${
                            isCreatingAsset
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:border-primary"
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
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssetDialogOpen(false);
                setAssetsError(null);
                setCreateAssetError(null);
              }}
              disabled={isCreatingAsset}
            >
              Cancel
            </Button>
            {assetsError && (
              <Button onClick={fetchAssets} disabled={isLoadingAssets}>
                {isLoadingAssets ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Retry"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

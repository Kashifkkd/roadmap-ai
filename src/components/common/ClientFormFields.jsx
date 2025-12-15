"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import { uploadProfile } from "@/api/User/uploadProfile";

//function to upload image
const uploadImageFile = async (file) => {
  const uploadResponse = await uploadProfile(file);
  if (uploadResponse?.response?.ImageUrl) {
    return uploadResponse.response.ImageUrl;
  }
  throw new Error("Failed to upload image");
};

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-200">
    <Label className="text-sm font-medium text-gray-700">{label}</Label>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 ${
        checked ? "bg-primary-700" : "bg-gray-300"
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

//function to remove image
const removeImage = (setFile, setPreview, preview) => {
  setFile(null);
  setPreview(null);
  if (preview) {
    URL.revokeObjectURL(preview);
  }
};

const ClientFormFields = forwardRef(({ initialValues, resetKey }, ref) => {
  // Form state
  const [clientName, setClientName] = useState("");
  const [website, setWebsite] = useState("");
  const [selectedColorCode, setSelectedColorCode] = useState("");
  const [enableFoozi, setEnableFoozi] = useState(false);
  const [enableCohorts, setEnableCohorts] = useState(false);

  // Image state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBackgroundImage, setUploadingBackgroundImage] =
    useState(false);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pendingBackgroundImageFile, setPendingBackgroundImageFile] =
    useState(null);
  const [pendingImagePreview, setPendingImagePreview] = useState(null);
  const [pendingBackgroundImagePreview, setPendingBackgroundImagePreview] =
    useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingBackgroundImageUrl, setExistingBackgroundImageUrl] =
    useState("");

  // Refs
  const imageInputRef = useRef(null);
  const backgroundImageInputRef = useRef(null);

  // Initialize form with initialValues when provided
  useEffect(() => {
    if (initialValues) {
      setClientName(initialValues.name || initialValues.client_name || "");
      setWebsite(initialValues.faq_url || "");
      setSelectedColorCode(initialValues.color_code || "");
      setEnableFoozi(initialValues.enable_foozi || false);
      setEnableCohorts(initialValues.enable_cohorts || false);
      setExistingImageUrl(initialValues.ImageUrl || "");
      setExistingBackgroundImageUrl(initialValues.background_image_url || "");
    }
  }, [initialValues]);

  // Reset form when resetKey changes
  useEffect(() => {
    if (resetKey !== undefined && resetKey !== null) {
      setClientName("");
      setWebsite("");
      setSelectedColorCode("");
      setEnableFoozi(false);
      setEnableCohorts(false);
      setPendingImageFile(null);
      setPendingBackgroundImageFile(null);
      setExistingImageUrl("");
      setExistingBackgroundImageUrl("");
      if (pendingImagePreview) {
        URL.revokeObjectURL(pendingImagePreview);
        setPendingImagePreview(null);
      }
      if (pendingBackgroundImagePreview) {
        URL.revokeObjectURL(pendingBackgroundImagePreview);
        setPendingBackgroundImagePreview(null);
      }
    }
  }, [resetKey]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (pendingImagePreview) {
        URL.revokeObjectURL(pendingImagePreview);
      }
      if (pendingBackgroundImagePreview) {
        URL.revokeObjectURL(pendingBackgroundImagePreview);
      }
    };
  }, [pendingImagePreview, pendingBackgroundImagePreview]);

  const handleImageUpload = (event, isBackgroundImage = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (isBackgroundImage) {
      setPendingBackgroundImageFile(file);
      setPendingBackgroundImagePreview(previewUrl);
    } else {
      setPendingImageFile(file);
      setPendingImagePreview(previewUrl);
    }

    event.target.value = "";
  };

  const handleImageClick = (isBackgroundImage = false) => {
    if (isBackgroundImage) {
      backgroundImageInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    // Get form data (uploads images if needed)
    getFormData: async () => {
      // Validate required fields
      if (!clientName.trim()) {
        toast.error("Client name is required");
        return null;
      }

      let finalImageUrl = existingImageUrl;
      let finalBackgroundImageUrl = existingBackgroundImageUrl;

      // Upload pending images if any
      if (pendingImageFile) {
        setUploadingImage(true);
        try {
          finalImageUrl = await uploadImageFile(pendingImageFile);
          setExistingImageUrl(finalImageUrl);
          removeImage(
            setPendingImageFile,
            setPendingImagePreview,
            pendingImagePreview
          );
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Failed to upload image. Please try again.");
          setUploadingImage(false);
          return null;
        } finally {
          setUploadingImage(false);
        }
      }

      if (pendingBackgroundImageFile) {
        setUploadingBackgroundImage(true);
        try {
          finalBackgroundImageUrl = await uploadImageFile(
            pendingBackgroundImageFile
          );
          setExistingBackgroundImageUrl(finalBackgroundImageUrl);
          removeImage(
            setPendingBackgroundImageFile,
            setPendingBackgroundImagePreview,
            pendingBackgroundImagePreview
          );
        } catch (error) {
          console.error("Error uploading color logo:", error);
          toast.error("Failed to upload color logo. Please try again.");
          setUploadingBackgroundImage(false);
          return null;
        } finally {
          setUploadingBackgroundImage(false);
        }
      }

      return {
        name: clientName,
        faq_url: website || "",
        color_code: selectedColorCode || "",
        ImageUrl: finalImageUrl,
        background_image_url: finalBackgroundImageUrl,
        enable_foozi: enableFoozi,
        enable_cohorts: enableCohorts,
      };
    },
    // Check if form is loading (uploading images)
    isLoading: () => {
      return uploadingImage || uploadingBackgroundImage;
    },
    // Validate form
    validate: () => {
      if (!clientName.trim()) {
        toast.error("Client name is required");
        return false;
      }
      return true;
    },
  }));

  // Determine which preview to show (pending or existing)
  const imagePreview = pendingImagePreview || existingImageUrl;
  const backgroundImagePreview =
    pendingBackgroundImagePreview || existingBackgroundImageUrl;

  return (
    <div className="space-y-6">
      {/* Client Name and Website Row */}
      <div className="flex flex-col gap-6">
        <div className="w-full">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Client Name<span className="text-red-500">*</span>
          </Label>
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Website
          </Label>
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* General Image Upload */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Image (Upload PNG)
          </Label>
          <div className="p-2 bg-gray-100 rounded-lg max-w-[322px] max-h-[128px]">
            {imagePreview ? (
              <div className="relative w-full h-[104px] rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pendingImagePreview) {
                      removeImage(
                        setPendingImageFile,
                        setPendingImagePreview,
                        pendingImagePreview
                      );
                    } else {
                      setExistingImageUrl("");
                    }
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => handleImageClick(false)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 gap-2 flex flex-col items-center justify-center bg-gray-50 cursor-pointer relative h-[104px]"
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  className="hidden"
                />
                <div className="text-gray-500 text-sm">
                  {uploadingImage ? "Uploading..." : "Upload PNG"}
                </div>
                <Button
                  type="button"
                  disabled={uploadingImage}
                  className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {uploadingImage ? "Uploading..." : "+ Browse"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Color Logo */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Color Logo (Upload PNG)
          </Label>
          <div className="p-2 bg-gray-100 rounded-lg max-w-[322px] max-h-[128px]">
            {backgroundImagePreview ? (
              <div className="relative w-full h-[104px] rounded-lg overflow-hidden">
                <img
                  src={backgroundImagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pendingBackgroundImagePreview) {
                      removeImage(
                        setPendingBackgroundImageFile,
                        setPendingBackgroundImagePreview,
                        pendingBackgroundImagePreview
                      );
                    } else {
                      setExistingBackgroundImageUrl("");
                    }
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => handleImageClick(true)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 gap-2 flex flex-col items-center justify-center bg-gray-50 cursor-pointer relative h-[104px]"
              >
                <input
                  ref={backgroundImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                />
                <div className="text-gray-500 text-sm">
                  {uploadingBackgroundImage ? "Uploading..." : "Upload PNG"}
                </div>
                <Button
                  type="button"
                  disabled={uploadingBackgroundImage}
                  className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {uploadingBackgroundImage ? "Uploading..." : "+ Browse"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-4 block">
          Brand Colors
        </Label>
        <div className="grid grid-cols-2  gap-4">
          {/* Color Swatch 1 - Purple */}
          <div
            onClick={() => setSelectedColorCode("#7367F0")}
            className={`flex gap-3 p-2 border w-full h-full rounded-lg bg-white cursor-pointer transition-all ${
              selectedColorCode === "#7367F0"
                ? "border-primary-700 border-2 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-16 h-10 rounded-md bg-[#7367F0]"></div>
            <div className="gap-1 flex flex-col">
              <div className="text-sm font-medium text-gray-700">Title</div>
              <div className="text-xs text-gray-500">#7367F0</div>
            </div>
          </div>

          <div
            onClick={() => setSelectedColorCode("#41B3A2")}
            className={`flex items-center gap-3 p-2 border max-h-[54px] rounded-lg bg-white cursor-pointer transition-all ${
              selectedColorCode === "#41B3A2"
                ? "border-primary-700 border-2 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-16 h-10 rounded-lg bg-[#41B3A2]"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">Title</div>
              <div className="text-xs text-gray-500">#41B3A2</div>
            </div>
          </div>

          <div
            onClick={() => setSelectedColorCode("#CF1662")}
            className={`flex gap-3 p-2 border items-center max-h-[54px] rounded-lg bg-white cursor-pointer transition-all ${
              selectedColorCode === "#CF1662"
                ? "border-primary-700 border-2 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-16 h-10 rounded-md bg-[#CF1662]"></div>
            <div className="gap-1 flex flex-col">
              <div className="text-sm font-medium text-gray-700">Title</div>
              <div className="text-xs text-gray-500">#CF1662</div>
            </div>
          </div>

          <div
            onClick={() => setSelectedColorCode("#FFDC2F")}
            className={`flex items-center gap-3 p-2 max-h-[54px] border rounded-lg bg-white cursor-pointer transition-all ${
              selectedColorCode === "#FFDC2F"
                ? "border-primary-700 border-2 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-16 h-10 rounded-md bg-[#FFDC2F]"></div>
            <div className="gap-1 flex flex-col">
              <div className="text-sm font-medium text-gray-700">Title</div>
              <div className="text-xs text-gray-500">#FFDC2F</div>
            </div>
          </div>
          <div
            onClick={() => setSelectedColorCode("#00A885")}
            className={`flex items-center gap-3 p-2 border rounded-lg bg-white cursor-pointer transition-all ${
              selectedColorCode === "#00A885"
                ? "border-primary-700 border-2 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-16 h-10 rounded-lg bg-[#00A885]"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">Title</div>
              <div className="text-xs text-gray-500">#00A885</div>
            </div>
          </div>
          <div
            onClick={() => setSelectedColorCode("#006C55")}
            className={`flex items-center gap-3 max-h-[54px] p-2 border rounded-lg bg-white cursor-pointer transition-all ${
              selectedColorCode === "#006C55"
                ? "border-primary-700 border-2 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-16 h-10 rounded-lg bg-[#006C55]"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">Title</div>
              <div className="text-xs text-gray-500">#006C55</div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-0">
        <ToggleSwitch
          checked={enableFoozi}
          onChange={setEnableFoozi}
          label="Enable Foozi"
        />
        <ToggleSwitch
          checked={enableCohorts}
          onChange={setEnableCohorts}
          label="Enable Cohorts"
        />
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <Label className="text-sm font-medium text-gray-700">
            Cohort List
          </Label>
        </div>
      </div>
    </div>
  );
});

ClientFormFields.displayName = "ClientFormFields";

export default ClientFormFields;

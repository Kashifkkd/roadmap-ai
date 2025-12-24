"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { X, Info, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import { uploadProfile } from "@/api/User/uploadProfile";
import { getCohorts } from "@/api/cohort/getCohorts";
import { createCohort } from "@/api/cohort/createCohort";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

//function to upload image
const uploadImageFile = async (file) => {
  const uploadResponse = await uploadProfile(file);

  // Support both camelCase and snake_case keys from the backend
  const uploadedUrl =
    uploadResponse?.response?.ImageUrl ||
    uploadResponse?.response?.image_url ||
    uploadResponse?.response?.url;

  if (uploadedUrl) {
    return uploadedUrl;
  }

  throw new Error("Failed to upload image");
};

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between py-3 border-t border-gray-200">
    <Label className="text-sm font-medium text-gray-700">{label}</Label>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none  ${
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
  const [secureLinks, setSecureLinks] = useState(false);

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

  // Cohort state
  const [cohorts, setCohorts] = useState([]);
  const [cohortsLoading, setCohortsLoading] = useState(false);
  const [isCohortFormOpen, setIsCohortFormOpen] = useState(false);
  const [newCohortName, setNewCohortName] = useState("");
  const [newCohortDescription, setNewCohortDescription] = useState("");
  const [creatingCohort, setCreatingCohort] = useState(false);

  // Refs
  const imageInputRef = useRef(null);
  const backgroundImageInputRef = useRef(null);

  const getClientId = () => {
    if (!initialValues) return 48;
    return initialValues.id || initialValues.client_id || 48;
  };

  // Initialize form with initialValues when provided
  useEffect(() => {
    if (initialValues) {
      setClientName(initialValues.name || initialValues.client_name || "");
      setWebsite(initialValues.faq_url || "");
      setSelectedColorCode(initialValues.color_code || "");
      setEnableFoozi(initialValues.enable_foozi || false);
      setEnableCohorts(initialValues.enable_cohorts || false);
      setExistingImageUrl(initialValues.image_url || "");
      setExistingBackgroundImageUrl(initialValues.background_image_url || "");
    }
  }, [initialValues]);

  // Fetch cohorts
  useEffect(() => {
    const fetchCohorts = async () => {
      const clientId = getClientId();
      if (!clientId) return;

      setCohortsLoading(true);
      try {
        const res = await getCohorts({ clientId });
        const data = res?.response || [];
        setCohorts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch cohorts for client:", error);
        toast.error("Failed to load cohorts");
        setCohorts([]);
      } finally {
        setCohortsLoading(false);
      }
    };

    fetchCohorts();
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

  const handleCreateCohort = async () => {
    const clientId = getClientId();

    if (!clientId) {
      toast.error("Client id is missing");
      return;
    }

    if (!newCohortName.trim()) {
      toast.error("Cohort name is required");
      return;
    }

    try {
      setCreatingCohort(true);
      await createCohort({
        name: newCohortName.trim(),
        description: newCohortDescription.trim(),
        clientId,
      });
      toast.success("Cohort created successfully");
      setNewCohortName("");
      setNewCohortDescription("");
      setIsCohortFormOpen(false);

      // Refresh cohorts list
      setCohortsLoading(true);
      try {
        const res = await getCohorts({ clientId });
        const data = res?.response || [];
        setCohorts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to refresh cohorts after create:", error);
        toast.error("Failed to refresh cohorts");
      } finally {
        setCohortsLoading(false);
      }
    } catch (error) {
      console.error("Failed to create cohort:", error);
      toast.error("Failed to create cohort");
    } finally {
      setCreatingCohort(false);
    }
  };

  // Only show dialogs for Edit/Delete actions (no data changes)
  const handleEditCohortDialog = (cohort) => {
    console.log("cohort");
  };

  const handleDeleteCohortDialog = (cohort) => {
    console.log("cohort");
  };

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

      const payload = {
        name: clientName.trim(),
        enable_foozi: enableFoozi,
        enable_cohorts: enableCohorts,
      };

      if (website.trim()) payload.faq_url = website.trim();
      if (selectedColorCode) payload.color_code = selectedColorCode;
      if (finalImageUrl) payload.image_url = finalImageUrl;
      if (finalBackgroundImageUrl)
        payload.background_image_url = finalBackgroundImageUrl;

      return payload;
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
            Transparent Image(Upload PNG)
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
        <div className="flex justify-end">
          <Button
            variant="outline"
            type="button"
            className="border-primary-700 text-primary-700 justify-end"
            onClick={() => setIsCohortFormOpen(true)}
          >
            {/* <Plus className="w-4 h-4" /> */}
            Add Cohort
          </Button>
        </div>
        {isCohortFormOpen && (
          <div className="mt-4 border border-gray-200 rounded-lg bg-white p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">
                New Cohort
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCohortFormOpen(false);
                  setNewCohortName("");
                  setNewCohortDescription("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  Cohort Name<span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input
                  value={newCohortName}
                  onChange={(e) => setNewCohortName(e.target.value)}
                  placeholder="Enter cohort name"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  Description
                </Label>
                <Input
                  value={newCohortDescription}
                  onChange={(e) => setNewCohortDescription(e.target.value)}
                  placeholder="Enter short description"
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setIsCohortFormOpen(false);
                  setNewCohortName("");
                  setNewCohortDescription("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-1.5 rounded-lg disabled:opacity-60"
                onClick={handleCreateCohort}
                disabled={creatingCohort}
              >
                {creatingCohort ? "Saving..." : "Save Cohort"}
              </Button>
            </div>
          </div>
        )}
        <Label className="text-sm font-medium text-gray-700 mt-4 block">
          Cohort List
        </Label>

        {/* Cohort table */}
        <div className="mt-2 rounded-md overflow-hidden text-sm text-gray-700">
          {/* Header */}
          <div className="grid grid-cols-3 bg-gray-100 font-medium">
            <div className="px-4 py-2">Cohort Name</div>
            <div className="px-4 py-2">Cohort Id</div>
            <div className="px-4 py-2 text-right">Action</div>
          </div>

          {/* Rows */}
          {cohortsLoading ? (
            <div className="grid grid-cols-3 bg-white">
              <div className="px-4 py-4 text-center text-gray-500 col-span-3">
                Loading cohorts...
              </div>
            </div>
          ) : cohorts.length === 0 ? (
            <div className="grid grid-cols-3 bg-white">
              <div className="px-4 py-4 text-center text-gray-500 col-span-3">
                No cohorts found
              </div>
            </div>
          ) : (
            cohorts.map((cohort, index) => (
              <div
                key={cohort.id || cohort.cohort_id || index}
                className={`grid grid-cols-3 ${
                  index % 2 === 1 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="px-4 py-2 text-gray-700">
                  {cohort.name || cohort.cohort_name || "N/A"}
                </div>
                <div className="px-4 py-2 text-gray-500">
                  {cohort.id || cohort.cohort_id || "N/A"}
                </div>
                <div className="px-6 py-2 text-right flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-32 rounded-lg bg-white border border-gray-200 shadow-lg p-1"
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCohortDialog(cohort);
                        }}
                        className="cursor-pointer px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 rounded-md focus:bg-gray-50"
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCohortDialog(cohort);
                        }}
                        className="cursor-pointer px-3 py-2 text-sm text-black hover:bg-[#574EB6] rounded-md focus:bg-[#574EB6] mt-1"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Secure Links toggle */}
        {/* <div className="mt-4 border-t border-gray-200 pt-3 flex  justify-between"> */}
        {/* <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Secure Links (Open links in default browser)
            </span>
            <Info
              className="w-4 h-4 text-gray-400"
              aria-hidden="true"
              title="When enabled, links open in the user's default browser."
            />
          </div>
          <button
            type="button"
            onClick={() => setSecureLinks(!secureLinks)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              secureLinks ? "bg-primary-700" : "bg-gray-300"
            }`}
            role="switch"
            aria-checked={secureLinks}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                secureLinks ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div> */}
        <ToggleSwitch
          checked={secureLinks}
          onChange={setSecureLinks}
          label="Secure Links (Open links in default browser)"
        />
      </div>
    </div>
    // </div>
  );
});

ClientFormFields.displayName = "ClientFormFields";

export default ClientFormFields;

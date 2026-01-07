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
import { updateCohort } from "@/api/cohort/updateCohort";
import { deleteCohort } from "@/api/cohort/deleteCohort";
import { getCohortPaths } from "@/api/cohort/getCohortPaths";
import { getClientPaths } from "@/api/cohort/getCohortPaths";
import { updateCohortPaths } from "@/api/cohort/updateCohortPaths";
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
  const [brandColors, setBrandColors] = useState({
    stat1: "#7367F0",
    stat2: "#41B3A2",
    stat3: "#CF1662",
    stat4: "#FFDC2F",
    stat5: "#00A885",
    theme: "#006C55",
    header: "#006C57",
    highlight: "#006C58",
    themeheader: "#006C59",
    highlightheader: "#006C56",
  });
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
  const [editingCohort, setEditingCohort] = useState(null);
  const [newCohortName, setNewCohortName] = useState("");
  // const [newCohortDescription, setNewCohortDescription] = useState("");
  const [creatingCohort, setCreatingCohort] = useState(false);
  const [deletingCohort, setDeletingCohort] = useState(false);

  // Cohort paths state
  const [isPathDialogOpen, setIsPathDialogOpen] = useState(false);
  const [pathDialogCohort, setPathDialogCohort] = useState(null);
  const [availablePaths, setAvailablePaths] = useState([]);
  const [selectedPathIds, setSelectedPathIds] = useState(new Set());
  const [pathEnabled, setPathEnabled] = useState(true);
  const [pathIdsError, setPathIdsError] = useState("");
  const [pathsLoading, setPathsLoading] = useState(false);
  const [savingPaths, setSavingPaths] = useState(false);

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

      // Initialize brand colors from initialValues - support both nested and flat structure
      setBrandColors({
        stat1:
          initialValues.stat1 || initialValues.brand_colors?.stat1 || "#7367F0",
        stat2:
          initialValues.stat2 || initialValues.brand_colors?.stat2 || "#41B3A2",
        stat3:
          initialValues.stat3 || initialValues.brand_colors?.stat3 || "#CF1662",
        stat4:
          initialValues.stat4 || initialValues.brand_colors?.stat4 || "#FFDC2F",
        stat5:
          initialValues.stat5 || initialValues.brand_colors?.stat5 || "#00A885",
        theme:
          initialValues.theme || initialValues.brand_colors?.theme || "#006C55",
        header:
          initialValues.header ||
          initialValues.brand_colors?.header ||
          "#006C57",
        highlight:
          initialValues.highlight ||
          initialValues.brand_colors?.highlight ||
          "#006C58",
        themeheader:
          initialValues.themeheader ||
          initialValues.brand_colors?.themeheader ||
          "#006C59",
        highlightheader:
          initialValues.highlightheader ||
          initialValues.brand_colors?.highlightheader ||
          "#006C56",
      });

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
      setBrandColors({
        stat1: "#7367F0",
        stat2: "#41B3A2",
        stat3: "#CF1662",
        stat4: "#FFDC2F",
        stat5: "#00A885",
        theme: "#006C55",
        header: "#006C57",
        highlight: "#006C58",
        themeheader: "#006C59",
        highlightheader: "#006C56",
      });
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

  const refreshCohortsList = async () => {
    const clientId = getClientId();
    if (!clientId) return;

    setCohortsLoading(true);
    try {
      const res = await getCohorts({ clientId });
      const data = res?.response || [];
      setCohorts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to refresh cohorts:", error);
      toast.error("Failed to refresh cohorts");
    } finally {
      setCohortsLoading(false);
    }
  };

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
        // description: newCohortDescription.trim(),
        clientId,
      });
      toast.success("Cohort created successfully");
      setNewCohortName("");
      // setNewCohortDescription("");
      setEditingCohort(null);
      setIsCohortFormOpen(false);

      // Refresh cohorts list
      await refreshCohortsList();
    } catch (error) {
      console.error("Failed to create cohort:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        "Failed to create cohort";
      toast.error(errorMessage);
    } finally {
      setCreatingCohort(false);
    }
  };

  const handleUpdateCohort = async () => {
    if (!editingCohort) {
      toast.error("No cohort selected for editing");
      return;
    }

    const cohortId = editingCohort.id || editingCohort.cohort_id;
    if (!cohortId) {
      toast.error("Cohort ID is missing");
      return;
    }

    if (!newCohortName.trim()) {
      toast.error("Cohort name is required");
      return;
    }

    try {
      setCreatingCohort(true);
      await updateCohort({
        cohortId,
        name: newCohortName.trim(),
        // description: newCohortDescription.trim(),
      });
      toast.success("Cohort updated successfully");
      setNewCohortName("");
      // setNewCohortDescription("");
      setEditingCohort(null);
      setIsCohortFormOpen(false);

      // Refresh cohorts list
      await refreshCohortsList();
    } catch (error) {
      console.error("Failed to update cohort:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        "Failed to update cohort";
      toast.error(errorMessage);
    } finally {
      setCreatingCohort(false);
    }
  };

  const handleAddPathDialog = async (cohort, clientId) => {
    const cohortId = cohort.id || cohort.cohort_id;
    if (!cohortId) {
      toast.error("Cohort ID is missing");
      return;
    }

    setPathDialogCohort(cohort);
    setIsPathDialogOpen(true);
    setPathIdsError("");
    setPathsLoading(true);
    setSelectedPathIds(new Set());
    setPathEnabled(true);

    try {
      const result = await getClientPaths({ clientId });
      const data = result?.response || [];
      const paths = Array.isArray(data) ? data : [];

      setAvailablePaths(paths);

      const initiallySelected = new Set();
      paths.forEach((path) => {
        if (path.enabled || path.selected || path.is_selected) {
          initiallySelected.add(path.id);
        }
      });
      setSelectedPathIds(initiallySelected);
    } catch (error) {
      console.error("Failed to fetch cohort paths:", error);
      toast.error("Failed to load cohort paths");
      setAvailablePaths([]);
    } finally {
      setPathsLoading(false);
    }
  };

  const handleTogglePath = (pathId) => {
    setPathIdsError("");
    setSelectedPathIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pathId)) {
        newSet.delete(pathId);
      } else {
        if (newSet.size >= 25) {
          setPathIdsError("You can select up to 5 paths only");
          toast.error("You can select up to 5 paths only");
          return prev;
        }
        newSet.add(pathId);
      }
      return newSet;
    });
  };

  const handleSavePaths = async () => {
    if (!pathDialogCohort) {
      toast.error("No cohort selected for updating paths");
      return;
    }

    const cohortId = pathDialogCohort.id || pathDialogCohort.cohort_id;
    if (!cohortId) {
      toast.error("Cohort ID is missing");
      return;
    }

    const selectedIds = Array.from(selectedPathIds);

    if (selectedIds.length > 25) {
      setPathIdsError("You can select up to 5 paths only");
      toast.error("You can select up to 5 paths only");
      return;
    }

    setSavingPaths(true);
    try {
      await updateCohortPaths({
        cohortId,
        pathIds: selectedIds,
        enabled: pathEnabled,
      });
      toast.success("Cohort paths updated successfully");
      setIsPathDialogOpen(false);
      setPathDialogCohort(null);
      setAvailablePaths([]);
      setSelectedPathIds(new Set());
      setPathIdsError("");
    } catch (error) {
      console.error("Failed to update cohort paths:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        "Failed to update cohort paths";
      toast.error(errorMessage);
    } finally {
      setSavingPaths(false);
    }
  };

  const handleEditCohortDialog = (cohort) => {
    setEditingCohort(cohort);
    setNewCohortName(cohort.name || cohort.cohort_name || "");
    // setNewCohortDescription(cohort.description || "");
    setIsCohortFormOpen(true);
  };

  const handleDeleteCohortDialog = async (cohort) => {
    const cohortId = cohort.id || cohort.cohort_id;
    if (!cohortId) {
      toast.error("Cohort ID is missing");
      return;
    }

    try {
      setDeletingCohort(true);
      await deleteCohort({ cohortId });
      toast.success("Cohort deleted successfully");

      // Refresh cohorts list
      await refreshCohortsList();
    } catch (error) {
      console.error("Failed to delete cohort:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        "Failed to delete cohort";
      toast.error(errorMessage);
    } finally {
      setDeletingCohort(false);
    }
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
        stat1: brandColors.stat1,
        stat2: brandColors.stat2,
        stat3: brandColors.stat3,
        stat4: brandColors.stat4,
        stat5: brandColors.stat5,
        theme: brandColors.theme,
        header: brandColors.header,
        highlight: brandColors.highlight,
        themeheader: brandColors.themeheader,
        highlightheader: brandColors.highlightheader,
      };

      if (website.trim()) payload.faq_url = website.trim();
      if (finalImageUrl) payload.background_image_url = finalImageUrl;
      if (finalBackgroundImageUrl) payload.image_url = finalBackgroundImageUrl;

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
  const colorCodes = [
    { code: "#7367F0", name: "Stat1", key: "stat1" },
    { code: "#41B3A2", name: "Stat2", key: "stat2" },
    { code: "#CF1662", name: "Stat3", key: "stat3" },
    { code: "#FFDC2F", name: "Stat4", key: "stat4" },
    { code: "#00A885", name: "Stat5", key: "stat5" },
    { code: "#006C55", name: "Theme", key: "theme" },
    { code: "#006C57", name: "Header", key: "header" },
    { code: "#006C58", name: "Highlight", key: "highlight" },
    { code: "#006C59", name: "Theme Header", key: "themeheader" },
    { code: "#006C56", name: "Highlight Header", key: "highlightheader" },
  ];

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
            White-on-transparent Logo (Upload PNG)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {colorCodes.map((color) => {
            const displayColor = brandColors[color.key];

            return (
              <div
                key={color.key}
                className={`flex items-center gap-2 border rounded-lg p-2 cursor-pointer transition-all ${
                  selectedColorCode === color.key
                    ? "border-primary-700 border-2 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => {
                  setSelectedColorCode(color.key);
                }}
              >
                <div className="relative w-12 h-8 sm:w-16 sm:h-10 shrink-0 overflow-hidden">
                  <div className="relative w-16 h-10 rounded-sm overflow-hidden">
                    <input
                      type="color"
                      value={displayColor}
                      onChange={(e) => {
                        setBrandColors((prev) => ({
                          ...prev,
                          [color.key]: e.target.value,
                        }));
                        setSelectedColorCode(color.key);
                      }}
                      className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div
                      className="w-full h-full rounded-sm"
                      style={{ backgroundColor: displayColor }}
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {color.name}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {displayColor}
                  </span>
                </div>
              </div>
            );
          })}
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
        {enableCohorts && (
          <div className="mb-4">
            <div className={`flex justify-end ${!enableCohorts && "mb-4"}`}>
              <Button
                variant="outline"
                type="button"
                className="border-primary-700 text-primary-700 justify-end"
                onClick={() => {
                  setEditingCohort(null);
                  setNewCohortName("");
                  // setNewCohortDescription("");
                  setIsCohortFormOpen(true);
                }}
              >
                {/* <Plus className="w-4 h-4" /> */}
                Add Cohort
              </Button>
            </div>
            {isCohortFormOpen && (
              <div className="mt-4 border border-gray-200 rounded-lg bg-white p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">
                    {editingCohort ? "Edit Cohort" : "New Cohort"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCohortFormOpen(false);
                      setNewCohortName("");
                      // setNewCohortDescription("");
                      setEditingCohort(null);
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
                  {/* <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  Description
                </Label>
                <Input
                  value={newCohortDescription}
                  onChange={(e) => setNewCohortDescription(e.target.value)}
                  placeholder="Enter short description"
                  className="h-9"
                />
              </div> */}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => {
                      setIsCohortFormOpen(false);
                      setNewCohortName("");
                      // setNewCohortDescription("");
                      setEditingCohort(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-1.5 rounded-lg disabled:opacity-60"
                    onClick={
                      editingCohort ? handleUpdateCohort : handleCreateCohort
                    }
                    disabled={creatingCohort}
                  >
                    {creatingCohort
                      ? "Saving..."
                      : editingCohort
                      ? "Update Cohort"
                      : "Save Cohort"}
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
                              handleAddPathDialog(cohort, getClientId());
                            }}
                            className="cursor-pointer px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 rounded-md focus:bg-gray-50"
                          >
                            Add Comet
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCohortDialog(cohort);
                            }}
                            disabled={deletingCohort}
                            className="cursor-pointer px-3 py-2 text-sm text-black hover:bg-[#574EB6] rounded-md focus:bg-[#574EB6] mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingCohort ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Cohort Paths Dialog */}
        {isPathDialogOpen && (
          <div className="mt-4 border border-gray-200 rounded-lg bg-white p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">
                {pathsLoading
                  ? "Loading Comet..."
                  : `Select Comet for ${
                      pathDialogCohort?.name ||
                      pathDialogCohort?.cohort_name ||
                      "Cohort"
                    }`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsPathDialogOpen(false);
                  setPathDialogCohort(null);
                  setAvailablePaths([]);
                  setSelectedPathIds(new Set());
                  setPathIdsError("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Select comets for this cohort. Currently selected:{" "}
              {selectedPathIds.size}
            </p>

            {pathsLoading ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                Loading comets...
              </div>
            ) : availablePaths.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                No comets available
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availablePaths.map((path) => {
                  const pathId = path.id;
                  const isSelected = selectedPathIds.has(pathId);
                  const isDisabled = !isSelected && selectedPathIds.size >= 5;

                  return (
                    <label
                      key={pathId}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary-50 border-primary-500"
                          : isDisabled
                          ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTogglePath(pathId)}
                        disabled={isDisabled || savingPaths}
                        className="w-4 h-4 text-primary-700 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {path.name || `Path ${pathId}`}
                        </div>
                        {path.description && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {path.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-0.5">
                          ID: {pathId}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {pathIdsError && (
              <p className="text-xs text-red-500">{pathIdsError}</p>
            )}

           
            {/* <div className="flex items-center justify-between py-2 border-t border-gray-200">
              <Label className="text-sm font-medium text-gray-700">
                Enable Paths
              </Label>
              <button
                type="button"
                onClick={() => setPathEnabled(!pathEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  pathEnabled ? "bg-primary-700" : "bg-gray-300"
                }`}
                role="switch"
                aria-checked={pathEnabled}
                disabled={savingPaths}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                    pathEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div> */}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-gray-600 hover:text-gray-800 text-sm"
                onClick={() => {
                  setIsPathDialogOpen(false);
                  setPathDialogCohort(null);
                  setAvailablePaths([]);
                  setSelectedPathIds(new Set());
                  setPathIdsError("");
                }}
                disabled={savingPaths}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-1.5 rounded-lg disabled:opacity-60 text-sm"
                onClick={handleSavePaths}
                disabled={savingPaths || pathsLoading}
              >
                {savingPaths ? "Saving..." : "Update Comets"}
              </Button>
            </div>
          </div>
        )}

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

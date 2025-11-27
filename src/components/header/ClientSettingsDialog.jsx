"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  Users,
  MoreVertical,
  CircleX,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { getClientDetails, updateClientDetails } from "@/api/client";
import { uploadProfile } from "@/api/User/uploadProfile";
import { toast } from "sonner";
import { useRefreshData } from "@/hooks/useQueryData";

export default function ClientSettingsDialog({
  open,
  onOpenChange,
  selectedClient,
}) {
  const { refreshClients } = useRefreshData();
  const [activeTab, setActiveTab] = useState("general");
  const [clientName, setClientName] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [selectedColorCode, setSelectedColorCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [backgroundImageFileName, setBackgroundImageFileName] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBackgroundImage, setUploadingBackgroundImage] =
    useState(false);
  const imageInputRef = useRef(null);
  const backgroundImageInputRef = useRef(null);

  // Fetch client details when dialog opens and selectedClient is available
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!open || !selectedClient) return;

      // Get client ID - handle both 'id' and 'client_id' fields
      const clientId = selectedClient.id || selectedClient.client_id;
      if (!clientId) return;

      setLoading(true);
      try {
        const response = await getClientDetails(clientId);
        if (response?.response && !response.error) {
          const fetchedData = response.response;
          // Store full client data
          setClientData(fetchedData);
          // Populate form fields with fetched data
          setClientName(fetchedData.name || fetchedData.client_name || "");
          setWebsite(fetchedData.faq_url || "");
          setSelectedColorCode(fetchedData.color_code || "");
          setImageUrl(fetchedData.image_url || "");
          setBackgroundImageUrl(fetchedData.background_image_url || "");
          // console.log("clientData", fetchedData);
        }
      } catch (error) {
        console.error("Failed to fetch client details:", error);
        toast.error("Failed to load client details");
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [open, selectedClient]);

  const handleImageUpload = async (event, isBackgroundImage = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Store file name
    if (isBackgroundImage) {
      setBackgroundImageFileName(file.name);
      setUploadingBackgroundImage(true);
    } else {
      setImageFileName(file.name);
      setUploadingImage(true);
    }

    try {
      const uploadResponse = await uploadProfile(file);
      if (uploadResponse?.response?.image_url) {
        const url = uploadResponse.response.image_url;
        if (isBackgroundImage) {
          setBackgroundImageUrl(url);
          toast.success("Color logo uploaded successfully");
        } else {
          setImageUrl(url);
          toast.success("Image uploaded successfully");
        }
      } else {
        toast.error("Failed to upload image");

        if (isBackgroundImage) {
          setBackgroundImageFileName("");
        } else {
          setImageFileName("");
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
      // Clear file name on error
      if (isBackgroundImage) {
        setBackgroundImageFileName("");
      } else {
        setImageFileName("");
      }
    } finally {
      if (isBackgroundImage) {
        setUploadingBackgroundImage(false);
      } else {
        setUploadingImage(false);
      }

      event.target.value = "";
    }
  };

  const handleImageClick = (isBackgroundImage = false) => {
    if (isBackgroundImage) {
      backgroundImageInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  const handleSave = async () => {
    if (!selectedClient || !clientData) {
      toast.error("Client data not loaded");
      return;
    }

    // Get client ID
    const clientId = selectedClient.id || selectedClient.client_id;
    if (!clientId) {
      toast.error("Client ID not found");
      return;
    }

    // Validate required fields
    if (!clientName.trim()) {
      toast.error("Client name is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: clientId,
        name: clientName,
        faq_url: website || "",
        color_code: selectedColorCode || "",
        image_url: imageUrl || clientData.image_url || "",
        background_image_url:
          backgroundImageUrl || clientData.background_image_url || "",
      };

      const response = await updateClientDetails(payload);

      if (response?.response && !response.error) {
        toast.success("Client details updated successfully");
        setClientData(response.response);
        // Refresh clients to update Header automatically
        refreshClients();
        setSaving(false);
        onOpenChange(false);
      } else {
        const errorMessage =
          response?.response?.detail ||
          response?.response?.message ||
          "Failed to update client details";
        toast.error(errorMessage);
        setSaving(false);
      }
    } catch (error) {
      console.error("Failed to update client details:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to update client details";
      toast.error(errorMessage);
      setSaving(false);
    }
  };

  const isLoading = uploadingImage || uploadingBackgroundImage || saving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[908px] max-h-[90vh] border-0 bg-transparent p-0 shadow-none overflow-hidden [&>button]:hidden">
        <div className="rounded-[32px] bg-white overflow-hidden flex flex-col max-h-[90vh] relative">
          {/* Loader */}
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center rounded-[32px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
                <p className="text-sm font-medium text-gray-700">
                  {saving
                    ? "Saving..."
                    : uploadingImage || uploadingBackgroundImage
                    ? "Uploading image..."
                    : "Loading..."}
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-semibold text-gray-900">
                Client Settings
              </h2>
              <button onClick={() => onOpenChange(false)}>
                <CircleX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 overflow-hidden gap-2 min-h-0 bg-gray-100 p-2">
              {/* Left Sidebar */}
              <div className="w-[240px] rounded-lg border-gray-200 bg-gray-50 p-4 flex flex-col flex-shrink-0">
                <button
                  onClick={() => setActiveTab("general")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors mb-2 cursor-pointer ${
                    activeTab === "general"
                      ? "bg-primary-700 text-white"
                      : "text-gray-700 hover:bg-primary-100"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-base font-medium">General Info</span>
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer ${
                    activeTab === "users"
                      ? "bg-primary-700 text-white"
                      : "text-gray-700 hover:bg-primary-100"
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-base font-medium">Users</span>
                </button>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 overflow-y-auto p-8 rounded-lg bg-white">
                {activeTab === "general" && (
                  <div className="space-y-6">
                    {/* Client Name and Website Row */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
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
                          <div
                            onClick={() => handleImageClick(false)}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 gap-2 flex flex-col items-center justify-center bg-gray-50 cursor-pointer relative"
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
                        </div>
                        {imageFileName && (
                          <div className="mt-2 text-xs text-gray-600">
                            Selected: {imageFileName}
                          </div>
                        )}
                      </div>

                      {/* Color Logo */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">
                          Color Logo (Upload PNG)
                        </Label>
                        <div className="p-2 bg-gray-100 rounded-lg max-w-[322px] max-h-[128px]">
                          <div
                            onClick={() => handleImageClick(true)}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 gap-2 flex flex-col items-center justify-center bg-gray-50 cursor-pointer relative"
                          >
                            <input
                              ref={backgroundImageInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true)}
                              className="hidden"
                            />
                            <div className="text-gray-500 text-sm">
                              {uploadingBackgroundImage
                                ? "Uploading..."
                                : "Upload PNG"}
                            </div>
                            <Button
                              type="button"
                              disabled={uploadingBackgroundImage}
                              className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                            >
                              {uploadingBackgroundImage
                                ? "Uploading..."
                                : "+ Browse"}
                            </Button>
                          </div>
                        </div>
                        {backgroundImageFileName && (
                          <div className="mt-2 text-xs text-gray-600">
                            Selected: {backgroundImageFileName}
                          </div>
                        )}
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
                            <div className="text-sm font-medium text-gray-700">
                              Title
                            </div>
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
                            <div className="text-sm font-medium text-gray-700">
                              Title
                            </div>
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
                            <div className="text-sm font-medium text-gray-700">
                              Title
                            </div>
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
                            <div className="text-sm font-medium text-gray-700">
                              Title
                            </div>
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
                            <div className="text-sm font-medium text-gray-700">
                              Title
                            </div>
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
                            <div className="text-sm font-medium text-gray-700">
                              Title
                            </div>
                            <div className="text-xs text-gray-500">#006C55</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "users" && (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#E8F4F3]">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              First Name
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              Last Name
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              Current Comet
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: 11 }).map((_, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 text-sm text-gray-600">
                                First Name
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                Last Name
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                Email
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                Current Comet
                              </td>
                              <td className="px-4 py-3">
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-8 py-4 border-t border-gray-200 flex-shrink-0">
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

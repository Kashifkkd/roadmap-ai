"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  Users,
  MoreVertical,
  CircleX,
  Loader2,
  MoreHorizontal,
  Info,
  Trash2,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getClientDetails, updateClientDetails } from "@/api/client";
import { getClients } from "@/api/client";
import { updateCreator } from "@/api/User/updateCreator";
import { getCreatorDetails } from "@/api/User/getCreatorDetails";
import { getCreatorsByClientId } from "@/api/User/getCreatorsByClientId";
import { registerUser } from "@/api/register";
import { uploadProfile } from "@/api/User/uploadProfile";
import { toast } from "sonner";
import { useRefreshData, useUpsertClient } from "@/hooks/useQueryData";
import ClientFormFields from "@/components/common/ClientFormFields";
import UserManagement from "@/components/common/UserManagement";

export default function ClientSettingsDialog({
  open,
  onOpenChange,
  selectedClient,
}) {
  const { refreshClients } = useRefreshData();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const { mutateAsync: upsertClient, isPending: saving } = useUpsertClient();
  const [clientData, setClientData] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const clientFormRef = useRef(null);
  const [creators, setCreators] = useState([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [creatorsError, setCreatorsError] = useState(null);

  // Add Creator form state
  const [showAddCreatorForm, setShowAddCreatorForm] = useState(false);
  const [editingCreator, setEditingCreator] = useState(null);
  const [creatorFirstName, setCreatorFirstName] = useState("");
  const [creatorLastName, setCreatorLastName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [creatorPassword, setCreatorPassword] = useState("");
  const [creatorConfirmPassword, setCreatorConfirmPassword] = useState("");
  const [creatorRole, setCreatorRole] = useState("");
  const [creatorClient, setCreatorClient] = useState("");
  const [creatorImageFile, setCreatorImageFile] = useState(null);
  const [creatorImagePreview, setCreatorImagePreview] = useState(null);
  const [uploadingCreatorImage, setUploadingCreatorImage] = useState(false);
  const creatorImageInputRef = useRef(null);
  const [savingCreator, setSavingCreator] = useState(false);
  const [creatorSearchTerm, setCreatorSearchTerm] = useState("");
  const [clientsList, setClientsList] = useState([]);
  const [clientsListLoading, setClientsListLoading] = useState(false);

  const normalizeSearchTerm = (term) => term.trim().toLowerCase();
  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const textIncludesSearch = (text, search) =>
    text && search ? text.toLowerCase().includes(search) : false;

  const normalizedCreatorSearch = normalizeSearchTerm(creatorSearchTerm);
  const filteredCreators =
    normalizedCreatorSearch && Array.isArray(creators)
      ? creators.filter((creator) => {
        const firstName = creator.first_name || "";
        const lastName = creator.last_name || "";
        const email = creator.email || "";
        const role =
          creator.role ||
          (Array.isArray(creator.roles) && creator.roles[0]) ||
          "";

        return (
          textIncludesSearch(firstName, normalizedCreatorSearch) ||
          textIncludesSearch(lastName, normalizedCreatorSearch) ||
          textIncludesSearch(email, normalizedCreatorSearch) ||
          textIncludesSearch(role, normalizedCreatorSearch)
        );
      })
      : creators;

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
          setClientData(fetchedData);
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

  // Fetch creators for the selected client when Creators tab is active
  useEffect(() => {
    const fetchCreators = async () => {
      if (!open || activeTab !== "creators" || !selectedClient) return;

      const clientId = selectedClient.id || selectedClient.client_id;
      if (!clientId) return;

      setCreatorsLoading(true);
      setCreatorsError(null);
      try {
        const res = await getCreatorsByClientId({ clientId });
        const data = res?.response || [];
        const filteredData = Array.isArray(data)
          ? data.filter((creator) => creator.enabled === true)
          : [];
        setCreators(filteredData);
      } catch (error) {
        console.error("Failed to fetch creators for client:", error);
        setCreatorsError(
          error?.message || "Failed to load creators for this client"
        );
        setCreators([]);
      } finally {
        setCreatorsLoading(false);
      }
    };

    fetchCreators();
  }, [open, activeTab, selectedClient]);

  // Fetch clients list for creator form dropdown
  useEffect(() => {
    const fetchClientsList = async () => {
      if (!open || activeTab !== "creators" || !showAddCreatorForm) return;

      setClientsListLoading(true);
      try {
        const res = await getClients({ limit: 1000, enabledOnly: true });
        const data = res?.response || [];
        setClientsList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        toast.error("Failed to load clients");
        setClientsList([]);
      } finally {
        setClientsListLoading(false);
      }
    };

    fetchClientsList();
  }, [open, activeTab, showAddCreatorForm]);

  // Cleanup creator image preview URL when dialog closes
  useEffect(() => {
    return () => {
      if (creatorImagePreview) {
        URL.revokeObjectURL(creatorImagePreview);
      }
    };
  }, [creatorImagePreview]);

  const handleCreatorImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCreatorImageFile(file);
    setCreatorImagePreview(previewUrl);
    event.target.value = "";
  };

  const handleCreatorImageClick = () => {
    creatorImageInputRef.current?.click();
  };

  const handleEditCreator = async (creator) => {
    const creatorId = creator.id || creator.user_id;
    if (!creatorId) {
      toast.error("Creator ID not found");
      return;
    }

    setShowAddCreatorForm(true);

    // Fetch full creator details from API
    try {
      const response = await getCreatorDetails(creatorId);
      const fullCreatorData = response?.response || response || creator;
      console.log("Fetched creator details:", fullCreatorData);

      setEditingCreator(fullCreatorData);
      setCreatorFirstName(
        fullCreatorData.first_name || fullCreatorData.firstName || ""
      );
      setCreatorLastName(
        fullCreatorData.last_name || fullCreatorData.lastName || ""
      );
      setCreatorEmail(fullCreatorData.email || "");
      setCreatorPassword("");
      setCreatorConfirmPassword("");
      setCreatorRole(fullCreatorData.role || "");
      setCreatorClient(
        fullCreatorData.client_id ? String(fullCreatorData.client_id) : ""
      );
      setCreatorImageFile(null);
      setCreatorImagePreview(null);
    } catch (error) {
      console.error("Failed to fetch creator details:", error);
      toast.error("Failed to load creator details");
      setEditingCreator(creator);
      setCreatorFirstName(creator.first_name || "");
      setCreatorLastName(creator.last_name || "");
      setCreatorEmail(creator.email || "");
      setCreatorRole(creator.role || "");
      setCreatorClient(creator.client_id ? String(creator.client_id) : "");
      setCreatorImageFile(null);
      setCreatorImagePreview(null);
    }
  };

  const resetCreatorForm = () => {
    setEditingCreator(null);
    setCreatorFirstName("");
    setCreatorLastName("");
    setCreatorEmail("");
    setCreatorPassword("");
    setCreatorConfirmPassword("");
    setCreatorRole("");
    setCreatorClient("");
    setCreatorImageFile(null);
    if (creatorImagePreview) {
      URL.revokeObjectURL(creatorImagePreview);
    }
    setCreatorImagePreview(null);
  };

  const handleSaveCreator = async () => {
    if (!selectedClient) {
      toast.error("Client not selected");
      return;
    }

    if (!creatorFirstName || !creatorLastName) {
      toast.error("First name and last name are required");
      return;
    }

    if (!creatorEmail) {
      toast.error("Email is required");
      return;
    }

    if (!editingCreator) {
      if (!creatorPassword || !creatorConfirmPassword) {
        toast.error("Password and confirm password are required");
        return;
      }

      if (creatorPassword.length <= 7) {
        toast.error("Password must be more than 7 characters");
        return;
      }

      if (creatorPassword !== creatorConfirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    } else if (creatorPassword && creatorPassword.length > 0) {
      if (creatorPassword.length <= 7) {
        toast.error("Password must be more than 7 characters");
        return;
      }

      if (creatorPassword !== creatorConfirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    // Use creatorClient if selected, otherwise fall back to selectedClient
    const clientId = creatorClient
      ? Number(creatorClient)
      : selectedClient?.id || selectedClient?.client_id;

    if (!clientId) {
      toast.error("Please select a client");
      return;
    }

    setSavingCreator(true);
    try {
      let imageUrl = null;

      // Upload image if a file was selected
      if (creatorImageFile) {
        setUploadingCreatorImage(true);
        try {
          const uploadResponse = await uploadProfile(creatorImageFile);
          // Support both camelCase and snake_case keys from the backend
          imageUrl =
            uploadResponse?.response?.ImageUrl ||
            uploadResponse?.response?.image_url ||
            uploadResponse?.response?.url;

          if (!imageUrl) {
            throw new Error("Failed to get image URL from upload response");
          }
        } catch (error) {
          console.error("Error uploading creator image:", error);
          toast.error("Failed to upload image. Please try again.");
          setSavingCreator(false);
          setUploadingCreatorImage(false);
          return;
        } finally {
          setUploadingCreatorImage(false);
        }
      }

      let res;
      if (editingCreator) {
        const payload = {
          first_name: creatorFirstName,
          last_name: creatorLastName || "",
          timezone: "UTC",
          enabled: true,
          role: creatorRole || "creator",
          client_id: clientId,
          accessible_client_ids: [clientId],
        };

        if (creatorPassword) {
          payload.password = creatorPassword;
        }

        if (imageUrl) {
          payload.image_url = imageUrl;
        }

        res = await updateCreator(
          editingCreator.id || editingCreator.user_id,
          payload
        );
      } else {
        // Create new creator
        const payload = {
          email: creatorEmail,
          password: creatorPassword,
          first_name: creatorFirstName,
          last_name: creatorLastName || "",
          client_id: clientId,
          role: creatorRole || "creator",
          phone: "",
          timezone: "UTC",
          metadata: {},
        };

        if (imageUrl) {
          payload.image_url = imageUrl;
        }

        res = await registerUser(payload, { useAuthToken: true });
      }
      const status = res?.response?.status ?? res?.status;

      if (status >= 200 && status < 400) {
        toast.success(
          editingCreator
            ? "Creator updated successfully"
            : "Creator added successfully"
        );

        // Refresh creators list for this client
        try {
          const listRes = await getCreatorsByClientId({ clientId });
          const data = listRes?.response || [];
          const filteredData = Array.isArray(data)
            ? data.filter((creator) => creator.enabled === true)
            : [];
          setCreators(filteredData);
        } catch (err) {
          console.error(
            "Failed to refresh creators after saving creator:",
            err
          );
        }

        // Reset form and close
        setShowAddCreatorForm(false);
        resetCreatorForm();
      } else {
        const errorMessage =
          res?.detail ||
          res?.message ||
          (editingCreator
            ? "Failed to update creator"
            : "Failed to add creator");
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to save creator:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        error?.response?.detail ||
        (editingCreator ? "Failed to update creator" : "Failed to add creator");
      toast.error(errorMessage);
    } finally {
      setSavingCreator(false);
    }
  };

  const handleDeleteCreator = async (creator) => {
    if (!selectedClient) {
      toast.error("Client not selected");
      return;
    }
    const clientId = selectedClient.id || selectedClient.client_id;
    if (!clientId) {
      toast.error("Client ID not found");
      return;
    }
    const creatorId = creator.id || creator.user_id;
    if (!creatorId) {
      toast.error("Creator ID not found");
      return;
    }
    try {
      const res = await updateCreator(creatorId, { enabled: false });
      if (res?.success || res?.response) {
        toast.success("Creator deleted successfully");
        // Refresh creators list for this client
        try {
          const listRes = await getCreatorsByClientId({ clientId });
          const data = listRes?.response || [];
          const filteredData = Array.isArray(data)
            ? data.filter((creator) => creator.enabled === true)
            : [];
          setCreators(filteredData);
        } catch (err) {
          console.error(
            "Failed to refresh creators after deleting creator:",
            err
          );
        }
      }
    } catch (error) {
      console.error("Failed to delete creator:", error);
      toast.error("Failed to delete creator");
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

    if (!clientFormRef.current) {
      toast.error("Form not initialized");
      return;
    }

    try {
      const formData = await clientFormRef.current.getFormData();
      if (!formData) return;

      const payload = {
        id: clientId,
        ...formData,
      };

      const response = await upsertClient(payload);

      if (response) {
        toast.success("Client details updated successfully");
        refreshClients();
        onOpenChange(false);

        setTimeout(() => {
          window.location.reload();
      },2000)
        
      } else {
        const errorMessage =
          response?.detail ||
          response?.message ||
          "Failed to update client details";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to update client details:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        error?.response?.detail ||
        "Failed to update client details";
      toast.error(errorMessage);
    }
  };

  const handleDeactivateClient = async () => {
    if (!selectedClient) {
      toast.error("Client not selected");
      return;
    }

    const clientId = selectedClient.id || selectedClient.client_id;
    if (!clientId) {
      toast.error("Client ID not found");
      return;
    }

    setDeactivating(true);
    try {
      const payload = {
        id: clientId,
        name: clientData?.name || selectedClient.name || selectedClient.client_name,
        enabled: false,
      };

      const response = await updateClientDetails(payload);

      if (response?.response || response?.success) {
        toast.success("Client deactivated successfully");
        // Refresh clients to update Header automatically
        refreshClients();
        onOpenChange(false);
      } else {
        const errorMessage =
          response?.detail ||
          response?.message ||
          "Failed to deactivate client";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to deactivate client:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        error?.response?.detail ||
        "Failed to deactivate client";
      toast.error(errorMessage);
    } finally {
      setDeactivating(false);
    }
  };

  const isLoading = clientFormRef.current?.isLoading?.() || false || saving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[1000px] xl:max-w-[1200px] max-h-[90vh] border-0 bg-transparent p-0 shadow-none overflow-hidden [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Settings</DialogTitle>
        </VisuallyHidden>
        <div className="rounded-[32px] bg-white overflow-hidden flex flex-col h-[90vh] max-h-[90vh] relative">
          {/* Loader */}
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center rounded-[32px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
                <p className="text-sm font-medium text-gray-700">
                  {saving ? "Saving..." : "Loading..."}
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 lg:px-10 xl:px-12 pt-6 lg:pt-8 pb-4 lg:pb-5 border-b border-gray-200 shrink-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
                Settings
              </h2>
              <button onClick={() => onOpenChange(false)}>
                <CircleX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 overflow-hidden gap-2 lg:gap-3 min-h-0 bg-gray-100 p-2 lg:p-3">
              {/* Left Sidebar */}
              <div className="w-[240px] lg:w-[260px] xl:w-[280px] rounded-lg border-gray-200 bg-gray-50 p-4 lg:p-5 flex flex-col shrink-0">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3 lg:py-3.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === "users"
                    ? "bg-primary-700 text-white"
                    : "text-gray-700 hover:bg-primary-100"
                    }`}
                >
                  <Users className="w-5 h-5 lg:w-6 lg:h-6" />
                  <span className="text-base lg:text-lg font-medium">
                    Users
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("general")}
                  className={`flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3 lg:py-3.5 rounded-md transition-colors mb-2 cursor-pointer ${
                    activeTab === "general"
                    ? "bg-primary-700 text-white"
                    : "text-gray-700 hover:bg-primary-100"
                    }`}
                >
                  <FileText className="w-5 h-5 lg:w-6 lg:h-6" />
                  <span className="text-base lg:text-lg font-medium">
                    Client
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("creators")}
                  className={`flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3 lg:py-3.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === "creators"
                    ? "bg-primary-700 text-white"
                    : "text-gray-700 hover:bg-primary-100"
                    }`}
                >
                  <Users className="w-5 h-5 lg:w-6 lg:h-6" />
                  <span className="text-base lg:text-lg font-medium">
                    Creators
                  </span>
                </button>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 flex flex-col rounded-lg bg-white overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8">
                  {activeTab === "general" && (
                    <ClientFormFields
                      ref={clientFormRef}
                      initialValues={clientData}
                    />
                  )}

                  {activeTab === "users" && (
                    <UserManagement
                      clientId={
                        selectedClient?.id || selectedClient?.client_id || null
                      }
                      open={open}
                      isActive={activeTab === "users"}
                    />
                  )}
                  {activeTab === "creators" && (
                    <div>
                      {!showAddCreatorForm ? (
                        <div className="h-full flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-medium text-gray-700">
                              Creator List
                            </span>

                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="Search by name, email, or role"
                                className="w-full border border-gray-300 rounded-lg p-1"
                                value={creatorSearchTerm}
                                onChange={(e) =>
                                  setCreatorSearchTerm(e.target.value)
                                }
                              />
                              <Button
                                size="md"
                                variant="default"
                                onClick={() => setShowAddCreatorForm(true)}
                                className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {/* <Plus className="w-5 h-5" /> */}
                                Add Creator
                              </Button>
                            </div>
                          </div>
                          <div className="flex-1 overflow-auto">
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
                                    Role
                                  </th>

                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {creatorsLoading && (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="px-4 py-4 text-center text-sm text-gray-500"
                                    >
                                      Loading creators...
                                    </td>
                                  </tr>
                                )}

                                {creatorsError && !creatorsLoading && (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="px-4 py-4 text-center text-sm text-red-500"
                                    >
                                      {creatorsError}
                                    </td>
                                  </tr>
                                )}

                                {!creatorsLoading &&
                                  !creatorsError &&
                                  creators.length === 0 && (
                                    <tr>
                                      <td
                                        colSpan={5}
                                        className="px-4 py-4 text-center text-sm text-gray-500"
                                      >
                                        No creators found for this client.
                                      </td>
                                    </tr>
                                  )}

                                {!creatorsLoading &&
                                  !creatorsError &&
                                  creators.length > 0 &&
                                  filteredCreators.length === 0 && (
                                    <tr>
                                      <td
                                        colSpan={5}
                                        className="px-4 py-4 text-center text-sm text-gray-500"
                                      >
                                        No creators match your search.
                                      </td>
                                    </tr>
                                  )}

                                {!creatorsLoading &&
                                  !creatorsError &&
                                  filteredCreators.length > 0 &&
                                  filteredCreators.map((creator, index) => (
                                    <tr
                                      key={creator.id || index}
                                      className="border-b border-gray-100 hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {creator.first_name || "-"}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {creator.last_name || "-"}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {creator.email || "-"}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {creator.role ||
                                          (Array.isArray(creator.roles) &&
                                            creator.roles[0]) ||
                                          "-"}
                                      </td>
                                      <td className="px-4 py-3">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <button className="text-gray-400 hover:text-gray-600">
                                              <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent
                                            align="start"
                                            className="w-32 rounded-lg bg-white border border-gray-200 shadow-lg p-1"
                                          >
                                            <DropdownMenuItem
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditCreator(creator);
                                              }}
                                              className="cursor-pointer px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 rounded-md focus:bg-gray-50"
                                            >
                                              Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCreator(creator);
                                              }}
                                              className="cursor-pointer px-3 py-2 text-sm text-black hover:bg-[#574EB6] rounded-md focus:bg-[#574EB6] mt-1"
                                            >
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col overflow-y-auto">
                          <div className="space-y-6">
                            {/* Back Button */}
                            <div className="flex items-center justify-between">
                              <h2 className="text-xl font-semibold text-gray-900">
                                {editingCreator ? "Edit Creator" : "Add Creator"}
                              </h2>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  setShowAddCreatorForm(false);
                                  resetCreatorForm();
                                }}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <X className="w-5 h-5" />
                              </Button>
                            </div>

                            {/* Personal Information */}
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    First Name
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    value={creatorFirstName}
                                    onChange={(e) =>
                                      setCreatorFirstName(e.target.value)
                                    }
                                    className="w-full bg-white border border-gray-300"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Last Name
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    value={creatorLastName}
                                    onChange={(e) =>
                                      setCreatorLastName(e.target.value)
                                    }
                                    className="w-full bg-white border border-gray-300"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Email
                                  </Label>
                                  <Input
                                    type="email"
                                    value={creatorEmail}
                                    onChange={(e) =>
                                      setCreatorEmail(e.target.value)
                                    }
                                    disabled={editingCreator} // Email cannot be changed when editing
                                    className="w-full bg-white border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Role
                                  </Label>
                                  <Select
                                    value={creatorRole}
                                    onValueChange={setCreatorRole}
                                  >
                                    <SelectTrigger className="w-full bg-white border border-gray-300">
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="superadmin">
                                        SuperAdmin
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* Account Details */}
                            <div className="space-y-4">
                              {!editingCreator && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Password
                                      <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      type="password"
                                      value={creatorPassword}
                                      onChange={(e) =>
                                        setCreatorPassword(e.target.value)
                                      }
                                      className="w-full bg-white border border-gray-300"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Confirm Password
                                      <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      type="password"
                                      value={creatorConfirmPassword}
                                      onChange={(e) =>
                                        setCreatorConfirmPassword(e.target.value)
                                      }
                                      className="w-full bg-white border border-gray-300"
                                    />
                                  </div>
                                </div>
                              )}
                              {editingCreator && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Password
                                    </Label>
                                    <Input
                                      type="password"
                                      value={creatorPassword}
                                      onChange={(e) =>
                                        setCreatorPassword(e.target.value)
                                      }
                                      className="w-full bg-white border border-gray-300"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Confirm Password
                                    </Label>
                                    <Input
                                      type="password"
                                      value={creatorConfirmPassword}
                                      onChange={(e) =>
                                        setCreatorConfirmPassword(e.target.value)
                                      }
                                      className="w-full bg-white border border-gray-300 "
                                    />
                                  </div>
                                </div>
                              )}
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Client
                                </Label>
                                <Select
                                  value={creatorClient}
                                  onValueChange={setCreatorClient}
                                  disabled={clientsListLoading}
                                >
                                  <SelectTrigger className="w-full bg-white ">
                                    <SelectValue
                                      placeholder={
                                        clientsListLoading
                                          ? "Loading clients..."
                                          : "Select client"
                                      }
                                    />
                                  </SelectTrigger>
                                  {!clientsListLoading &&
                                    clientsList.length > 0 && (
                                      <SelectContent>
                                        {clientsList.map((client) => (
                                          <SelectItem
                                            key={client.id || client.client_id}
                                            value={String(
                                              client.id || client.client_id
                                            )}
                                          >
                                            {client.name ||
                                              client.client_name ||
                                              "Unnamed Client"}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    )}
                                </Select>
                              </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="space-y-4">
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                Upload Image
                              </Label>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-100">
                                {creatorImagePreview ? (
                                  <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                                    <img
                                      src={creatorImagePreview}
                                      alt="Creator preview"
                                      className="w-full h-full object-contain rounded-lg"
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (creatorImagePreview) {
                                          URL.revokeObjectURL(
                                            creatorImagePreview
                                          );
                                        }
                                        setCreatorImageFile(null);
                                        setCreatorImagePreview(null);
                                      }}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                                      title="Remove image"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    onClick={handleCreatorImageClick}
                                    className="border-2 border-dashed border-gray-300 rounded-lg gap-2 flex flex-col items-center justify-center bg-white cursor-pointer relative min-h-[100px]"
                                  >
                                    <input
                                      ref={creatorImageInputRef}
                                      type="file"
                                      accept="image/*"
                                      onChange={handleCreatorImageUpload}
                                      className="hidden"
                                    />
                                    <div className="text-gray-500 text-sm mb-2">
                                      {uploadingCreatorImage
                                        ? "Uploading..."
                                        : "Upload Image"}
                                    </div>
                                    <Button
                                      type="button"
                                      disabled={uploadingCreatorImage}
                                      className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                    >
                                      {uploadingCreatorImage
                                        ? "Uploading..."
                                        : "+ Browse"}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Save Creator Button */}
                            <div className="flex justify-end pt-4">
                              <Button
                                type="button"
                                onClick={handleSaveCreator}
                                disabled={savingCreator}
                                className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {savingCreator
                                  ? "Saving..."
                                  : editingCreator
                                    ? "Update Creator"
                                    : "Save Creator"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer - inside right content column */}
                {activeTab === "general" && (
                  <div className="flex justify-between px-4 lg:px-6 xl:px-8 py-4 border-t border-gray-200 shrink-0">
                    <Button
                      type="button"
                      onClick={handleDeactivateClient}
                      disabled={deactivating || saving || loading}
                      className="bg-white border border-[#645AD1] text-[#645AD1] hover:bg-gray-100 active:bg-[#645AD1] active:text-white px-6 lg:px-8 py-2 lg:py-2.5 rounded-lg text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deactivating ? "Deactivating..." : "Deactivate Client"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || loading}
                      className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-6 lg:px-8 py-2 lg:py-2.5 rounded-lg text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import { getClientDetails, updateClientDetails } from "@/api/client";
import { toast } from "sonner";
import { useRefreshData } from "@/hooks/useQueryData";
import ClientFormFields from "@/components/common/ClientFormFields";

export default function ClientSettingsDialog({
  open,
  onOpenChange,
  selectedClient,
}) {
  const { refreshClients } = useRefreshData();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientData, setClientData] = useState(null);
  const clientFormRef = useRef(null);

  // Add User form state
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cohort, setCohort] = useState("");
  const [cometAssignments, setCometAssignments] = useState([
    { id: 1, isCurrent: true, cometType: "" },
  ]);
  const [currentCometIndex, setCurrentCometIndex] = useState(0);

  // Add Creator form state
  const [showAddCreatorForm, setShowAddCreatorForm] = useState(false);
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

    setSaving(true);
    try {
      const formData = await clientFormRef.current.getFormData();
      if (!formData) {
        setSaving(false);
        return;
      }

      const payload = {
        id: clientId,
        ...formData,
      };

      const response = await updateClientDetails(payload);

      if (response?.response && !response.error) {
        toast.success("Client details updated successfully");
        setClientData(response.response);
        // Refresh clients to update Header automatically
        refreshClients();
        onOpenChange(false);
      } else {
        const errorMessage =
          response?.response?.detail ||
          response?.response?.message ||
          "Failed to update client details";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to update client details:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to update client details";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const isLoading = clientFormRef.current?.isLoading?.() || false || saving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[908px] max-h-[90vh] border-0 bg-transparent p-0 shadow-none overflow-hidden [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Client Settings</DialogTitle>
        </VisuallyHidden>
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
                <button
                  onClick={() => setActiveTab("general")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors mb-2 cursor-pointer ${
                    activeTab === "general"
                      ? "bg-primary-700 text-white"
                      : "text-gray-700 hover:bg-primary-100"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-base font-medium">Client</span>
                </button>
                <button
                  onClick={() => setActiveTab("creators")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer ${
                    activeTab === "creators"
                      ? "bg-primary-700 text-white"
                      : "text-gray-700 hover:bg-primary-100"
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-base font-medium">Creators</span>
                </button>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 overflow-y-auto p-4 rounded-lg bg-white">
                {activeTab === "general" && (
                  <ClientFormFields
                    ref={clientFormRef}
                    initialValues={clientData}
                  />
                )}

                {activeTab === "users" && (
                  <div>
                    {!showAddUserForm ? (
                      <div className="overflow-x-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-medium text-gray-700">
                            User List
                          </span>

                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Search"
                              className="w-1/2 border border-gray-300 rounded-lg p-1"
                            />
                            <Button
                              size="md"
                              variant="outline"
                              onClick={() => setShowAddUserForm(true)}
                              className="text-primary-700 hover:text-primary-800 px-4 py-2 rounded-lg font-medium disabled:opacity-50 cursor-pointer"
                            >
                              {/* <Plus className="w-5 h-5" /> */}
                              Add User
                            </Button>
                            <Button
                              size="md"
                              variant="outline"
                              className=" text-primary-700 hover:text-primary-800 px-4 py-2 rounded-lg font-medium disabled:opacity-50 cursor-pointer"
                            >
                              User Bulk Upload
                            </Button>
                          </div>
                        </div>
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
                    ) : (
                      <div className="space-y-6">
                        {/* Back Button */}
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-gray-900">
                            Add User
                          </h2>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setShowAddUserForm(false);
                              // Reset form
                              setFirstName("");
                              setLastName("");
                              setEmail("");
                              setPassword("");
                              setConfirmPassword("");
                              setCohort("");
                              setCometAssignments([
                                { id: 1, isCurrent: true, cometType: "" },
                              ]);
                              setCurrentCometIndex(0);
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
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full bg-white border border-gray-300"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                Last Name
                              </Label>
                              <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-white border border-gray-300"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Email
                            </Label>
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-white border border-gray-300"
                            />
                          </div>
                        </div>

                        {/* Account Details */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                Password<span className="text-red-500">*</span>
                              </Label>
                              <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                value={confirmPassword}
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
                                className="w-full bg-white border border-gray-300"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Cohort
                            </Label>
                            <Select value={cohort} onValueChange={setCohort}>
                              <SelectTrigger className="w-full bg-white border border-gray-300">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cohort1">
                                  Cohort 1
                                </SelectItem>
                                <SelectItem value="cohort2">
                                  Cohort 2
                                </SelectItem>
                                <SelectItem value="cohort3">
                                  Cohort 3
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Current Comet Assignment */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-700">
                            Current Comet
                          </h3>
                          <div className="space-y-3">
                            {cometAssignments.map((assignment, index) => (
                              <div
                                key={assignment.id}
                                className="flex items-center gap-3"
                              >
                                {/* Numbered Label */}
                                <button
                                  type="button"
                                  className="w-9 h-9 rounded-lg bg-gray-200 text-gray-600 font-medium text-sm flex items-center justify-center shrink-0"
                                >
                                  {assignment.id}
                                </button>

                                {/* Current Comet Selector */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentCometIndex(index);
                                    setCometAssignments((prev) =>
                                      prev.map((item, idx) => ({
                                        ...item,
                                        isCurrent: idx === index,
                                      }))
                                    );
                                  }}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                                    assignment.isCurrent
                                      ? "bg-green-50 border-green-500"
                                      : "bg-gray-50 border-gray-300"
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded-full ${
                                      assignment.isCurrent
                                        ? "bg-green-500"
                                        : "bg-white border-2 border-gray-400"
                                    }`}
                                  />
                                  <span className="text-sm font-medium text-gray-700">
                                    Current Comet
                                  </span>
                                </button>

                                {/* Comet Type Dropdown */}
                                <Select
                                  value={assignment.cometType}
                                  onValueChange={(value) => {
                                    setCometAssignments((prev) =>
                                      prev.map((item) =>
                                        item.id === assignment.id
                                          ? { ...item, cometType: value }
                                          : item
                                      )
                                    );
                                  }}
                                >
                                  <SelectTrigger className="flex-1 bg-white border border-gray-300">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="comet1">
                                      Comet 1
                                    </SelectItem>
                                    <SelectItem value="comet2">
                                      Comet 2
                                    </SelectItem>
                                    <SelectItem value="comet3">
                                      Comet 3
                                    </SelectItem>
                                  </SelectContent>
                                </Select>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (cometAssignments.length > 1) {
                                      setCometAssignments((prev) =>
                                        prev.filter(
                                          (item) => item.id !== assignment.id
                                        )
                                      );
                                    }
                                  }}
                                  className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center shrink-0"
                                  disabled={cometAssignments.length === 1}
                                >
                                  <Trash2 className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Assign Comet Button */}
                          <Button
                            type="button"
                            onClick={() => {
                              const newId =
                                Math.max(...cometAssignments.map((a) => a.id)) +
                                1;
                              setCometAssignments((prev) => [
                                ...prev,
                                { id: newId, isCurrent: false, cometType: "" },
                              ]);
                            }}
                            variant="outline"
                            className="w-full border-purple-300 text-primary-700 hover:bg-purple-50 flex items-center justify-center gap-2 py-2"
                          >
                            <Plus className="w-4 h-4 text-blue-500" />
                            Assign Comet
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "creators" && (
                  <div>
                    {!showAddCreatorForm ? (
                      <div className="overflow-x-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-medium text-gray-700">
                            Creator List
                          </span>

                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Search"
                              className="w-full border border-gray-300 rounded-lg p-1"
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
                                  Role
                                </td>
                                <td className="px-4 py-3">
                                  <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Back Button */}
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-gray-900">
                            Add Creator
                          </h2>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setShowAddCreatorForm(false);
                              // Reset form
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
                                className="w-full bg-white border border-gray-300"
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
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Account Details */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                Password<span className="text-red-500">*</span>
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
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Client
                            </Label>
                            <Select
                              value={creatorClient}
                              onValueChange={setCreatorClient}
                            >
                              <SelectTrigger className="w-full bg-white border border-gray-300">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="client1">
                                  Client 1
                                </SelectItem>
                                <SelectItem value="client2">
                                  Client 2
                                </SelectItem>
                                <SelectItem value="client3">
                                  Client 3
                                </SelectItem>
                              </SelectContent>
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
                                    removeImage(
                                      setCreatorImageFile,
                                      setCreatorImagePreview,
                                      creatorImagePreview
                                    );
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
                      </div>
                    )}
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

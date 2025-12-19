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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getClientDetails } from "@/api/client";
import { getUserById } from "@/api/User/getUserById";
import { registerClientUser } from "@/api/User/registerClientUser";
import { updateClientUser } from "@/api/User/updateClientUser";
import { updateCreator } from "@/api/User/updateCreator";
import { getCreatorDetails } from "@/api/User/getCreatorDetails";
import { getCreatorsByClientId } from "@/api/User/getCreatorsByClientId";
import { registerUser } from "@/api/register";
import { getCohorts } from "@/api/cohort/getCohorts";
import { toast } from "sonner";
import { useRefreshData, useUpsertClient } from "@/hooks/useQueryData";
import ClientFormFields from "@/components/common/ClientFormFields";
import { getCohortPaths } from "@/api/cohort/getCohortPaths";

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
  const clientFormRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [creators, setCreators] = useState([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [creatorsError, setCreatorsError] = useState(null);

  // Add User form state
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cohort, setCohort] = useState("");
  const [enableSSO, setEnableSSO] = useState(false);
  const [managerEmails, setManagerEmails] = useState([]);
  const [accountabilityEmails, setAccountabilityEmails] = useState([
    { id: 1, value: "" },
  ]);
  const [cometAssignments, setCometAssignments] = useState([
    { id: 1, isCurrent: true, cometType: "" },
  ]);
  const [currentCometIndex, setCurrentCometIndex] = useState(0);
  const [savingUser, setSavingUser] = useState(false);
  const [cohorts, setCohorts] = useState([]);
  const [cohortsLoading, setCohortsLoading] = useState(false);
  const [cohortPaths, setCohortPaths] = useState([]);
  const [cohortPathsLoading, setCohortPathsLoading] = useState(false);

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

  // Fetch users for the selected client when Users tab is active
  useEffect(() => {
    const fetchUsers = async () => {
      if (!open || activeTab !== "users" || !selectedClient) return;

      const clientId = selectedClient.id || selectedClient.client_id;
      if (!clientId) return;

      setUsersLoading(true);
      setUsersError(null);
      try {
        const res = await getUserById({ clientId });
        const data = res?.response || [];
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch users for client:", error);
        setUsersError(error?.message || "Failed to load users for this client");
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [open, activeTab, selectedClient]);

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
        setCreators(Array.isArray(data) ? data : []);
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

  // Fetch cohort paths when cohort is selected
  useEffect(() => {
    const fetchCohortPaths = async () => {
      if (!open || !showAddUserForm || !selectedClient || !cohort) return;

      const cohortId = Number(cohort);
      if (!cohortId || isNaN(cohortId)) return;

      setCohortPathsLoading(true);
      try {
        const result = await getCohortPaths({ cohortId });
        const data = result?.response || [];
        setCohortPaths(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch cohort paths:", error);
        toast.error("Failed to load cohort paths");
        setCohortPaths([]);
      } finally {
        setCohortPathsLoading(false);
      }
    };
    fetchCohortPaths();
  }, [open, showAddUserForm, selectedClient, cohort]);

  // Auto add comet assignments for each item in dropdown
  useEffect(() => {
    if (cohortPaths.length > 0 && !cohortPathsLoading) {
      setCometAssignments((prev) => {
        // Only auto-create if no assignments have values yet
        const hasValues = prev.some((a) => a.cometType);
        if (hasValues) return prev;

        const assignments = cohortPaths.map((path, index) => ({
          id: index + 1,
          isCurrent: index === 0,
          cometType: String(path.id),
        }));

        setCurrentCometIndex(0);
        return assignments;
      });
    }
  }, [cohortPaths, cohortPathsLoading]);

  // const GetCohortPaths = async () => {
  //   try {
  //     const cohortId = 29;
  //     const result = await getCohortPaths({ cohortId });
  //     console.log("Cohort paths result:", result);
  //     return result;
  //   } catch (error) {
  //     console.error("Error fetching cohort paths:", error);
  //     throw error;
  //   }
  // };

  // const cohortPaths = GetCohortPaths();
  // console.log("cohortPaths", cohortPaths);

  // Fetch cohorts for the selected client when Add User form is shown
  useEffect(() => {
    const fetchCohorts = async () => {
      if (!open || !showAddUserForm || !selectedClient) return;

      // const clientId = selectedClient.id || selectedClient.client_id;
      // if (!clientId) return;
      const clientId = 48;

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
  }, [open, showAddUserForm, selectedClient]);

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

    const clientId = selectedClient.id || selectedClient.client_id;
    if (!clientId) {
      toast.error("Client ID not found");
      return;
    }

    setSavingCreator(true);
    try {
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
        res = await registerUser(payload, { useAuthToken: true });
      }

      if (res?.response || res) {
        toast.success(
          editingCreator
            ? "Creator updated successfully"
            : "Creator added successfully"
        );

        // Refresh creators list for this client
        try {
          const listRes = await getCreatorsByClientId({ clientId });
          const data = listRes?.response || [];
          setCreators(Array.isArray(data) ? data : []);
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

  const handleEditUser = (user) => {
    console.log("user", user);
    setEditingUser(user);
    setFirstName(user.first_name || user.firstName || "");
    setLastName(user.last_name || user.lastName || "");
    setEmail(user.email || "");
    setPassword("");
    setConfirmPassword("");
    setCohort(user.cohort || "");
    setEnableSSO(user.is_sso);

    // Set manager emails
    const managerEmailsList = user.manager_emails || user.managerEmails || [];
    if (managerEmailsList.length > 0) {
      setManagerEmails(
        managerEmailsList.map((email, index) => ({
          id: index + 1,
          value: email,
        }))
      );
    } else {
      setManagerEmails([{ id: 1, value: "" }]);
    }

    // Set accountability partner emails
    const accountabilityEmailsList =
      user.accountability_partner_emails ||
      user.accountabilityPartnerEmails ||
      [];
    if (accountabilityEmailsList.length > 0) {
      setAccountabilityEmails(
        accountabilityEmailsList.map((email, index) => ({
          id: index + 1,
          value: email,
        }))
      );
    } else {
      setAccountabilityEmails([{ id: 1, value: "" }]);
    }

    // Set comet assignments (if available)
    const assignments = [];
    let assignmentId = 1;

    // Add active path as current comet
    const activePathId = user.active_path_id;
    if (activePathId) {
      assignments.push({
        id: assignmentId++,
        isCurrent: true,
        cometType: String(activePathId),
      });
    }

    // Add adhoc paths as non-current comets
    const adhocPathsList = user.adhoc_paths;
    if (Array.isArray(adhocPathsList) && adhocPathsList.length > 0) {
      adhocPathsList.forEach((pathId) => {
        if (pathId) {
          assignments.push({
            id: assignmentId++,
            isCurrent: false,
            cometType: String(pathId),
          });
        }
      });
    }

    if (assignments.length === 0) {
      assignments.push({ id: 1, isCurrent: true, cometType: "" });
    }

    setCometAssignments(assignments);
    setCurrentCometIndex(
      assignments.findIndex((a) => a.isCurrent) >= 0
        ? assignments.findIndex((a) => a.isCurrent)
        : 0
    );

    setShowAddUserForm(true);
  };

  const resetUserForm = () => {
    setEditingUser(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setCohort("");
    setEnableSSO(false);
    setManagerEmails([{ id: 1, value: "" }]);
    setAccountabilityEmails([{ id: 1, value: "" }]);
    setCometAssignments([{ id: 1, isCurrent: true, cometType: "" }]);
    setCurrentCometIndex(0);
    setCohortPaths([]);
  };

  const handleSaveUser = async () => {
    if (!selectedClient) {
      toast.error("Client not selected");
      return;
    }

    if (!firstName || !lastName) {
      toast.error("First name and last name are required");
      return;
    }

    if (!email) {
      toast.error("Email is required");
      return;
    }

    if (!editingUser) {
      if (!password) {
        toast.error("Password is required");
        return;
      }
      if (password.length <= 7) {
        toast.error("Password must be more than 7 characters");
        return;
      }
    }

    const clientId = selectedClient.id || selectedClient.client_id;
    if (!clientId) {
      toast.error("Client ID not found");
      return;
    }

    const activeComet = cometAssignments.find((a) => a.isCurrent);
    const activePathId = activeComet?.cometType
      ? Number(activeComet.cometType)
      : null;
    const adhocPaths = cometAssignments
      .filter((a) => !a.isCurrent && a.cometType)
      .map((a) => Number(a.cometType));

    const pathIds = [];
    if (activePathId) {
      pathIds.push(activePathId);
    }
    adhocPaths.forEach((id) => {
      if (id && !pathIds.includes(id)) {
        pathIds.push(id);
      }
    });

    const userData = {
      client_id: clientId,
      access_level: 0,
      first_name: firstName,
      last_name: lastName || "",
      email,
      path_ids: pathIds,
      active_path_id: activePathId || null,
      cohort_id: cohort ? Number(cohort) : null,
      adhoc_paths: adhocPaths.length > 0 ? adhocPaths : [],
      is_sso: enableSSO,
      enable_ai_notifications: false,
      timezone: "UTC",
    };
    if (password) {
      userData.password = password;
    }

    const payload = editingUser ? userData : { user: userData };

    setSavingUser(true);
    try {
      const res = editingUser
        ? await updateClientUser(editingUser.id || editingUser.user_id, payload)
        : await registerClientUser(payload);

      if (res?.response) {
        toast.success(
          editingUser ? "User updated successfully" : "User added successfully"
        );

        // Refresh user list for this client
        try {
          const listRes = await getUserById({ clientId });
          const data = listRes?.response || [];
          setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to refresh users after saving user:", err);
        }

        // Reset form and close
        setShowAddUserForm(false);
        resetUserForm();
      } else {
        const errorMessage =
          res?.detail ||
          res?.message ||
          (editingUser ? "Failed to update user" : "Failed to add user");
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to save user:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        error?.response?.detail ||
        (editingUser ? "Failed to update user" : "Failed to add user");
      toast.error(errorMessage);
    } finally {
      setSavingUser(false);
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
        setClientData(response);
        // Refresh clients to update Header automatically
        refreshClients();
        onOpenChange(false);
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
                  {saving ? "Saving..." : "Loading..."}
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
                      <div className="overflow-x-auto min-h-[400px]">
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
                              onClick={() => {
                                resetUserForm();
                                setShowAddUserForm(true);
                              }}
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
                            {usersLoading && (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-4 py-4 text-center text-sm text-gray-500"
                                >
                                  Loading users...
                                </td>
                              </tr>
                            )}

                            {usersError && !usersLoading && (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-4 py-4 text-center text-sm text-red-500"
                                >
                                  {usersError}
                                </td>
                              </tr>
                            )}

                            {!usersLoading &&
                              !usersError &&
                              users.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className="px-4 py-4 text-center text-sm text-gray-500"
                                  >
                                    No users found for this client.
                                  </td>
                                </tr>
                              )}

                            {!usersLoading &&
                              !usersError &&
                              users.length > 0 &&
                              users.map((user, index) => (
                                <tr
                                  key={user.id || index}
                                  className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {user.first_name || user.firstName || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {user.last_name || user.lastName || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {user.email || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {user.active_path_name || "-"}
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
                                            handleEditUser(user);
                                          }}
                                          className="cursor-pointer px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 rounded-md focus:bg-gray-50"
                                        >
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // TODO: Implement delete functionality
                                            console.log("Delete user:", user);
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
                    ) : (
                      <div className="space-y-6">
                        {/* Back Button */}
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-gray-900">
                            {editingUser ? "Edit User" : "Add User"}
                          </h2>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setShowAddUserForm(false);
                              resetUserForm();
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
                                <span className="text-red-500">*</span>
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
                          {!editingUser && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Password
                                  <span className="text-red-500">*</span>
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
                          )}

                          {/* Enable SSO Toggle */}
                          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-200">
                            <Label className="text-sm font-medium text-gray-700">
                              Enable SSO
                            </Label>
                            <button
                              type="button"
                              onClick={() => setEnableSSO((prev) => !prev)}
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                enableSSO ? "bg-primary-700" : "bg-gray-300"
                              }`}
                              role="switch"
                              aria-checked={enableSSO}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                                  enableSSO ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Manager Email Addresses */}
                          <div className="pt-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium text-gray-700">
                                Manager Email Addresses
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const nextId =
                                    managerEmails.length > 0
                                      ? Math.max(
                                          ...managerEmails.map((m) => m.id)
                                        ) + 1
                                      : 1;
                                  setManagerEmails((prev) => [
                                    ...prev,
                                    { id: nextId, value: "" },
                                  ]);
                                }}
                                className="border-primary-500 text-primary-700 hover:bg-purple-50 px-3 py-1 h-8 text-xs font-medium"
                              >
                                + Add Email
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {managerEmails.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-2"
                                >
                                  <Input
                                    type="email"
                                    value={item.value}
                                    onChange={(e) =>
                                      setManagerEmails((prev) =>
                                        prev.map((row) =>
                                          row.id === item.id
                                            ? { ...row, value: e.target.value }
                                            : row
                                        )
                                      )
                                    }
                                    // placeholder="manager@example.com"
                                    className="flex-1 bg-white border border-gray-300"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setManagerEmails((prev) =>
                                        prev.filter((row) => row.id !== item.id)
                                      )
                                    }
                                    className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Accountability Partner Email Addresses */}
                          <div className="pt-4 space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Accountability Partner Email Addresses
                            </Label>
                            <div className="space-y-2">
                              {accountabilityEmails.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-2"
                                >
                                  <Input
                                    type="email"
                                    value={item.value}
                                    onChange={(e) =>
                                      setAccountabilityEmails((prev) =>
                                        prev.map((row) =>
                                          row.id === item.id
                                            ? { ...row, value: e.target.value }
                                            : row
                                        )
                                      )
                                    }
                                    // placeholder="partner@example.com"
                                    className="flex-1 bg-white border border-gray-300"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAccountabilityEmails((prev) =>
                                        prev.filter((row) => row.id !== item.id)
                                      )
                                    }
                                    className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center shrink-0"
                                    disabled={accountabilityEmails.length === 1}
                                  >
                                    <Trash2 className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const nextId =
                                  accountabilityEmails.length > 0
                                    ? Math.max(
                                        ...accountabilityEmails.map((m) => m.id)
                                      ) + 1
                                    : 1;
                                setAccountabilityEmails((prev) => [
                                  ...prev,
                                  { id: nextId, value: "" },
                                ]);
                              }}
                              className="w-full border-purple-300 text-primary-700 hover:bg-purple-50 flex items-center justify-center gap-1 py-2 text-sm font-medium"
                            >
                              + Add Email
                            </Button>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Cohort
                            </Label>
                            <Select
                              value={cohort}
                              onValueChange={setCohort}
                              disabled={cohortsLoading || cohorts.length === 0}
                            >
                              <SelectTrigger className="w-full bg-white border border-gray-300">
                                <SelectValue
                                  placeholder={
                                    cohortsLoading
                                      ? "Loading..."
                                      : cohorts.length === 0
                                      ? "No cohorts available"
                                      : "Select"
                                  }
                                />
                              </SelectTrigger>
                              {!cohortsLoading && cohorts.length > 0 && (
                                <SelectContent>
                                  {cohorts.map((cohortItem) => {
                                    const value = cohortItem.id;
                                    const label = cohortItem.name;
                                    return (
                                      <SelectItem
                                        key={value}
                                        value={String(value)}
                                      >
                                        {label}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              )}
                            </Select>
                          </div>
                        </div>

                        {/* Current Comet Assignment */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-700">
                            Assigned Comets
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
                                  disabled={
                                    cohortPathsLoading ||
                                    !cohort ||
                                    cohortPaths.length === 0
                                  }
                                >
                                  <SelectTrigger className="flex-1 bg-white border border-gray-300">
                                    <SelectValue
                                      placeholder={
                                        !cohort
                                          ? "Select cohort first"
                                          : cohortPathsLoading
                                          ? "Loading..."
                                          : cohortPaths.length === 0
                                          ? "No paths available"
                                          : "Select"
                                      }
                                    />
                                  </SelectTrigger>
                                  {!cohortPathsLoading &&
                                    cohortPaths.length > 0 && (
                                      <SelectContent
                                        side="bottom"
                                        className="max-h-[150px]"
                                      >
                                        {cohortPaths.map((path) => {
                                          const value = path.id;
                                          const label = path.name;
                                          return (
                                            <SelectItem
                                              key={value}
                                              value={String(value)}
                                            >
                                              {label}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    )}
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

                        {/* Save User Button */}
                        <div className="flex justify-end pt-4">
                          <Button
                            type="button"
                            onClick={handleSaveUser}
                            disabled={savingUser}
                            className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {savingUser
                              ? "Saving..."
                              : editingUser
                              ? "Update User"
                              : "Save User"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "creators" && (
                  <div>
                    {!showAddCreatorForm ? (
                      <div className="overflow-x-auto min-h-[400px]">
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
                              creators.map((creator, index) => (
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
                                            // TODO: Implement delete functionality
                                            console.log("Delete user:", user);
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
                    ) : (
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
                                  <SelectItem value="superAdmin">
                                    SuperAdmin
                                  </SelectItem>
                                  <SelectItem value="user">User</SelectItem>
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
                                  className="w-full bg-white border border-gray-300"
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
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {activeTab === "general" && (
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
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

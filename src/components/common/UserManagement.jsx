"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, MoreHorizontal, Trash2, Plus, ArrowLeft, AlertTriangle } from "lucide-react";
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
import { getUserById } from "@/api/User/getUserById";
import { registerClientUser } from "@/api/User/registerClientUser";
import { updateClientUser } from "@/api/User/updateClientUser";
import { deleteClientUser } from "@/api/User/deleteClientUser";
import { getCohorts, getUserInfo } from "@/api/cohort/getCohorts";
import { getCohortPaths, getClientPaths } from "@/api/cohort/getCohortPaths";
import { bulkUploadUsers } from "@/api/bulkUploadUsers";
import { toast } from "sonner";
import BulkUploadDialog from "./BulkUploadDialog";

export default function UserManagement({ clientId, open, isActive }) {
  // User list state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Bulk upload state
  const bulkUploadInputRef = useRef(null);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);

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
  const [managerEmails, setManagerEmails] = useState(false);
  const [managerEmail, setManagerEmail] = useState("");
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
  const [editLoadingId, setEditLoadingId] = useState(null);

  // Helper functions
  const normalizeSearchTerm = (term) => term.trim().toLowerCase();
  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const textIncludesSearch = (text, search) =>
    text && search ? text.toLowerCase().includes(search) : false;

  const normalizedUserSearch = normalizeSearchTerm(userSearchTerm);
  const filteredUsers =
    normalizedUserSearch && Array.isArray(users)
      ? users.filter((user) => {
        const firstName = user.first_name || user.firstName || "";
        const lastName = user.last_name || user.lastName || "";
        const email = user.email || "";
        const activePathName = user.active_path_name || "";

        return (
          textIncludesSearch(firstName, normalizedUserSearch) ||
          textIncludesSearch(lastName, normalizedUserSearch) ||
          textIncludesSearch(email, normalizedUserSearch) ||
          textIncludesSearch(activePathName, normalizedUserSearch)
        );
      })
      : users;

  // Fetch users when component is active
  useEffect(() => {
    const fetchUsers = async () => {
      if (!open || !isActive || !clientId) return;

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
  }, [open, isActive, clientId]);

  // Fetch cohorts when Add User form is shown
  useEffect(() => {
    const fetchCohorts = async () => {
      if (!open || !showAddUserForm || !clientId) return;

      setCohortsLoading(true);
      try {
        const res = await getCohorts({ clientId });
        // const res1 = await getCommit({ clientId });
        const data = res?.response || [];
        setCohorts(Array.isArray(data) ? data : []);
        // setCometAssignments(Array.isArray(res?.response) ? res?.response.path_ids : []);
      } catch (error) {
        console.error("Failed to fetch cohorts:", error);
        toast.error("Failed to load cohorts");
        setCohorts([]);
      } finally {
        setCohortsLoading(false);
      }
    };

    fetchCohorts();
  }, [open, showAddUserForm, clientId]);

  // Fetch cohort paths when cohort is selected
  useEffect(() => {
    const fetchCohortPaths = async () => {
      // if (!open || !showAddUserForm || !cohort) return;

      // if (!cohortId || isNaN(cohortId)) return;

      setCohortPathsLoading(true);
      let payload = {}
      if (cohort) payload.cohort_id = Number(cohort);
      try {
        const result = await getClientPaths(clientId, payload);
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
  }, [open, showAddUserForm, cohort]);

  const getUserInfoDetail = async (user) => {
    setEditingUser(user);
    try {
      const res = await getUserInfo(user.id)
      handleEditUser(res.response)
    } catch (error) {
      console.log(error)
    }

  }

  // Auto add comet assignments for each item in dropdown
  useEffect(() => {
    if (cohortPaths.length > 0 && !cohortPathsLoading) {
      setCometAssignments((prev) => {
        // Only auto-create if no assignments have values yet
        const hasValues = prev?.some((a) => a.cometType);
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


  const handleEditUser = (user) => {
    setEditingUser(user);
    setFirstName(user.first_name || user.firstName || "");
    setLastName(user.last_name || user.lastName || "");
    setEmail(user.email || "");
    setPassword("");
    setConfirmPassword("");
    setCohort(user.cohort_id ? String(user.cohort_id) : "");
    setEnableSSO(user.is_sso || false);

    // Set manager email
    const managerEmailValue = user.manager_email || user.managerEmail || "";
    if (managerEmailValue) {
      setManagerEmail(managerEmailValue);
    } else {
      setManagerEmail("");
    }

    // Set accountability partner emails
    const accountabilityEmailValue = user.accountability_partner_email || user.accountability_email || user.accountabilityPartnerEmail || "";
    const accountabilityEmailsList =
      user.accountability_emails ||
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
    } else if (accountabilityEmailValue) {
      setAccountabilityEmails([{ id: 1, value: accountabilityEmailValue }]);
    } else {
      setAccountabilityEmails([{ id: 1, value: "" }]);
    }

    // Set comet assignments (if available)
    const assignments = [];
    let assignmentId = 1;

    // Add active path as current comet
    const activePathId = user.active_path_id;
    // if (activePathId) {
    //   assignments.push({
    //     id: assignmentId++,
    //     isCurrent: true,
    //     cometType: String(activePathId),
    //   });
    // }

    // Add adhoc paths as non-current comets
    const adhocPathsList = user.paths;

    if (Array.isArray(adhocPathsList) && adhocPathsList.length > 0) {
      adhocPathsList.forEach((pathId) => {
        if (pathId) {
          assignments.push({
            id: assignmentId++,
            isCurrent: user.active_path_id === pathId ? true : false,
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
    setManagerEmail("");
    setAccountabilityEmails([{ id: 1, value: "" }]);
    setCometAssignments([{ id: 1, isCurrent: true, cometType: "" }]);
    setCurrentCometIndex(0);
    setCohortPaths([]);
  };

  const handleSaveUser = async () => {
    if (!clientId) {
      toast.error("Client ID not found");
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

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
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
      client_id: Number(clientId),
      access_level: 0,
      first_name: firstName,
      last_name: lastName || "",
      email,
      path_ids: pathIds,
      paths: pathIds,
      active_path_id: activePathId || null,
      cohort_id: cohort ? Number(cohort) : null,
      adhoc_paths: pathIds,
      is_sso: enableSSO,
      enable_ai_notifications: false,
      timezone: "UTC",
    };
    if (password) {
      userData.password = password;
    }

    // Add manager email and accountability emails
    const trimmedManagerEmail = managerEmail.trim();
    const accountabilityEmailsList = accountabilityEmails
      .map((a) => a.value.trim())
      .filter((e) => e);

    if (trimmedManagerEmail) {
      userData.manager_email = trimmedManagerEmail;
    }
    if (accountabilityEmailsList.length > 0) {
      userData.accountability_emails = accountabilityEmailsList;
      userData.accountability_emails = accountabilityEmailsList;
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

        // Refresh user list
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

  const handleDeleteUser = async (user) => {
    const userId = user.id || user.user_id;
    if (!userId) {
      toast.error("User ID not found");
      return;
    }
    try {
      const res = await deleteClientUser(userId);

      if (res?.success || res?.response) {
        toast.success("User deleted successfully");

        // Refresh user list
        if (clientId) {
          try {
            const listRes = await getUserById({ clientId });
            const data = listRes?.response || [];
            setUsers(Array.isArray(data) ? data : []);
          } catch (err) {
            console.error("Failed to refresh users after deleting user:", err);
          }
        }
      } else {
        const errorMessage =
          res?.detail ||
          res?.message ||
          res?.error?.message ||
          "Failed to delete user";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        error?.response?.detail ||
        "Failed to delete user";
      toast.error(errorMessage);
    }
  };

  const handleSetCohort = (e) => {
    setCohort(e)
    setCometAssignments([])
  }

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      toast.error("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }

    setBulkUploading(true);
    try {
      toast.info("Uploading users...");
      const response = await bulkUploadUsers(file);

      if (response?.response || response?.success) {
        toast.success("Users uploaded successfully");
        setShowBulkUploadDialog(false);

        // Refresh user list
        if (clientId) {
          try {
            const listRes = await getUserById({ clientId });
            const data = listRes?.response || [];
            setUsers(Array.isArray(data) ? data : []);
          } catch (err) {
            console.error("Failed to refresh users after bulk upload:", err);
          }
        }
      } else {
        const errorMessage = response?.detail || response?.message || "Failed to upload users";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      const errorMessage = error?.message || error?.response?.data?.detail || "Failed to upload users";
      toast.error(errorMessage);
    } finally {
      setBulkUploading(false);
      if (bulkUploadInputRef.current) {
        bulkUploadInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {!showAddUserForm ? (
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium text-gray-700">User List</span>

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Search by name or email"
                  className="w-1/2 border border-gray-300 rounded-lg p-1"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
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
                  Add User
                </Button>
                <Button
                  size="md"
                  variant="outline"
                  onClick={() => setShowBulkUploadDialog(true)}
                  className=" text-primary-700 hover:text-primary-800 px-4 py-2 rounded-lg font-medium disabled:opacity-50 cursor-pointer"
                >
                  User Bulk Upload
                </Button>
                <input
                  ref={bulkUploadInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleBulkUpload}
                  className="hidden"
                />
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

                {!usersLoading && !usersError && users.length === 0 && (
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
                  filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-4 text-center text-sm text-gray-500"
                      >
                        No users match this search.
                      </td>
                    </tr>
                  )}

                {!usersLoading &&
                  !usersError &&
                  filteredUsers.length > 0 &&
                  filteredUsers.map((user, index) => (
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
                                getUserInfoDetail(user);
                              }}
                              className="cursor-pointer px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 rounded-md focus:bg-gray-50"
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user);
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
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Back Button */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <ArrowLeft onClick={() => {
                  setShowAddUserForm(false);
                  resetUserForm();
                }} className="w-5 h-5 cursor-pointer" />
                {editingUser ? "Edit User" : "Add User"}
              </h2>
              {/* <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowAddUserForm(false);
                resetUserForm();
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </Button> */}
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
                  <span className="text-red-500">*</span>
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
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${enableSSO ? "bg-primary-700" : "bg-gray-300"
                    }`}
                  role="switch"
                  aria-checked={enableSSO}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${enableSSO ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>

              {/* Manager Email Address */}
              <div className="pt-4 space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Manager Email Address
                </Label>
                <Input
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300"
                />
              </div>

              {/* Accountability Partner Email Addresses */}
              <div className="pt-4 space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Accountability Partner Email Addresses
                </Label>
                <div className="space-y-2">
                  {accountabilityEmails.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
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
                        ? Math.max(...accountabilityEmails.map((m) => m.id)) + 1
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
                  onValueChange={handleSetCohort}
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
                          <SelectItem key={value} value={String(value)}>
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
                  <div key={assignment.id} className="flex items-center gap-3">
                    {/* Numbered Label */}
                    <button
                      type="button"
                      className="w-9 h-9 rounded-lg bg-gray-200 text-gray-600 font-medium text-sm flex items-center justify-center shrink-0"
                    >
                      {index + 1}
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${assignment.isCurrent
                        ? "bg-green-50 border-green-500"
                        : "bg-gray-50 border-gray-300"
                        }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full ${assignment.isCurrent
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
                    // disabled={
                    //   cohortPathsLoading || !cohort || cohortPaths.length === 0
                    // }
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
                      {!cohortPathsLoading && cohortPaths.length > 0 && (
                        <SelectContent side="bottom" className="max-h-[150px]">
                          {cohortPaths
                            .filter(path =>
                              !cometAssignments.some(
                                (item, i) =>
                                  i !== index && item.cometType == path.id
                              )
                            )
                            .map(path => (
                              <SelectItem key={path.id} value={String(path.id)}>
                                {path.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      )}
                    </Select>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (cometAssignments.length > 0) {
                          setCometAssignments((prev) =>
                            prev.filter((item) => item.id !== assignment.id)
                          );
                        }
                      }}
                      className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center shrink-0"
                      // disabled={cometAssignments.length === 1}
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
                    Math.max(...cometAssignments.map((a) => a.id)) + 1;
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

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={showBulkUploadDialog}
        onClose={() => setShowBulkUploadDialog(false)}
        onUpload={handleBulkUpload}
        isUploading={bulkUploading}
      />
    </>
  );
}

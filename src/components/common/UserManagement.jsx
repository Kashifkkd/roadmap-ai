"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  X,
  MoreHorizontal,
  Trash2,
  Plus,
  ArrowLeft,
  AlertTriangle,
  CircleX,
  PlusIcon,
  XIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { getPathUsers } from "@/api/comet/getPathUsers";
import { getPathById } from "@/api/comet/getPathById";
import { assignPathUsers } from "@/api/comet/assignPathUsers";
import { registerClientUser } from "@/api/User/registerClientUser";
import { updateClientUser } from "@/api/User/updateClientUser";
import { deleteClientUser } from "@/api/User/deleteClientUser";
import { wipeClientUserActions } from "@/api/User/wipeClientUserActions";
import { getCohorts, getUserInfo } from "@/api/cohort/getCohorts";
import { getCohortPaths, getClientPaths } from "@/api/cohort/getCohortPaths";
import { updateCohortPaths } from "@/api/cohort/updateCohortPaths";
import { bulkUploadUsers } from "@/api/bulkUploadUsers";
import { toast } from "@/components/ui/toast";
import BulkUploadDialog from "./BulkUploadDialog";
import { createCohort } from "@/api/cohort/createCohort";
import { updateCohort } from "@/api/cohort/updateCohort";
import { deleteCohort } from "@/api/cohort/deleteCohort";

export default function UserManagement({
  clientId,
  open,
  isActive,
  usePathUsers = false,
  cometStatus,
}) {
  const dropdownRef = useRef(null);
  // User list state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [pathNamesMap, setPathNamesMap] = useState({});
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const isPathUsersMode = !!usePathUsers;

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [enableSSO, setEnableSSO] = useState(false);
  const [managerEmails, setManagerEmails] = useState(false);
  const [managerEmail, setManagerEmail] = useState("");
  const [accountabilityEmails, setAccountabilityEmails] = useState([
    { id: 1, value: "" },
  ]);
  const [cometAssignments, setCometAssignments] = useState([
    { id: 1, isCurrent: false, cometType: "" },
  ]);
  const [currentCometIndex, setCurrentCometIndex] = useState(0);
  const [savingUser, setSavingUser] = useState(false);
  const [wipingUserActions, setWipingUserActions] = useState(false);
  const [showResetActivityConfirm, setShowResetActivityConfirm] =
    useState(false);
  const initialFormSnapshot = useRef(null);
  const [cohorts, setCohorts] = useState([]);
  const [cohortsLoading, setCohortsLoading] = useState(false);
  const [cohortPaths, setCohortPaths] = useState([]);
  const [allPaths, setAllPaths] = useState([]);
  const [cohortPathsLoading, setCohortPathsLoading] = useState(false);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [cometsAvailableTickedIds, setCometsAvailableTickedIds] = useState(new Set());
  const [updatingCohortPaths, setUpdatingCohortPaths] = useState(false);
  const [openAllPath, setOpenAllPath] = useState(false);
  const [pathUserEmails, setPathUserEmails] = useState([]);
  const [currentCycleEmails, setCurrentCycleEmails] = useState(new Set());
  const [savedCurrentCycleEmails, setSavedCurrentCycleEmails] = useState([]);
  const [emailOptions, setEmailOptions] = useState([]);
  const [emailOptionsLoading, setEmailOptionsLoading] = useState(false);
  const [assigningPathUsers, setAssigningPathUsers] = useState(false);
  const [pathUserEmailSearch, setPathUserEmailSearch] = useState("");
  const [showRegularAddForm, setShowRegularAddForm] = useState(false);
  // Cohort management state
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [editingCohortItem, setEditingCohortItem] = useState(null);
  const [newCohortName, setNewCohortName] = useState("");
  const [creatingCohort, setCreatingCohort] = useState(false);
  const [deletingCohort, setDeletingCohort] = useState(false);
  const [cohortManagementList, setCohortManagementList] = useState([]);
  const [cohortModalSelectedPaths, setCohortModalSelectedPaths] = useState(new Set());
  const cohortModalDropdownRef = useRef(null);
  const [openCohortModalPath, setOpenCohortModalPath] = useState(false);
  const [cohortCycleSearch, setCohortCycleSearch] = useState("");

  // ── Dynamic chip overflow ──────────────────────────────────────────────────
  const chipsContainerRef = useRef(null);
  const [visibleChipCount, setVisibleChipCount] = useState(pathUserEmails.length);

  useLayoutEffect(() => {
    if (!chipsContainerRef.current || pathUserEmails.length === 0) return;

    const calculate = () => {
      const container = chipsContainerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const GAP = 8; // gap-2 = 8px
      const BADGE_RESERVED = 72; // approx width of "+N more" badge

      let usedWidth = 0;
      let count = 0;

      const chipEls = Array.from(container.querySelectorAll("[data-chip]"));

      for (let i = 0; i < chipEls.length; i++) {
        const chipWidth = chipEls[i].offsetWidth + GAP;
        const isLast = i === pathUserEmails.length - 1;
        const needsBadgeSpace = !isLast;

        if (
          usedWidth + chipWidth + (needsBadgeSpace ? BADGE_RESERVED : 0) >
          containerWidth
        ) {
          break;
        }
        usedWidth += chipWidth;
        count++;
      }

      setVisibleChipCount(Math.max(count, 1)); // always show at least 1
    };

    // Temporarily reveal all chips so we can measure them
    setVisibleChipCount(pathUserEmails.length);

    // Measure after the DOM has painted all chips
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(calculate);
    });

    const observer = new ResizeObserver(calculate);
    observer.observe(chipsContainerRef.current);

    return () => {
      cancelAnimationFrame(raf1);
      observer.disconnect();
    };
  }, [pathUserEmails, emailOptions]);
  // ──────────────────────────────────────────────────────────────────────────

  // Helper functions
  const normalizeSearchTerm = (term) => term.trim().toLowerCase();
  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const ADD_USER_SUCCESS_TOAST = "User added successfully";
  const ADD_USER_FAILED_TOAST = "Failed to add user. Please try again";
  const UPDATE_USER_SUCCESS_TOAST = "User updated successfully";
  const UPDATE_USER_FAILED_TOAST = "Failed to update user. Please try again";
  const DUPLICATE_EMAIL_TOAST = "User with this email already exists";
  const CONFIRM_PASSWORD_REQUIRED_TOAST = "Confirm Password is required";
  const PASSWORD_REQUIRED_TOAST = "Password is required";
  const PASSWORD_LENGTH_TOAST = "Password must be at least 8 characters";
  const PASSWORD_MISMATCH_INLINE = "Passwords do not match";
  const INVALID_MANAGER_EMAIL_TOAST = "Please enter a valid manager email address";
  const INVALID_ACCOUNTABILITY_EMAIL_TOAST =
    "Please enter valid accountability partner email addresses";
  const normalizeEmail = (value) => (value || "").trim().toLowerCase();

  const clearPasswordErrors = () => {
    setPasswordError("");
    setConfirmPasswordError("");
  };

  const validatePasswordFields = (isEdit) => {
    if (isEdit && !password && !confirmPassword) {
      return { valid: true, passwordError: "", confirmPasswordError: "" };
    }

    if (!password) {
      return {
        valid: false,
        passwordError: PASSWORD_REQUIRED_TOAST,
        confirmPasswordError: "",
      };
    }

    if (!confirmPassword) {
      return {
        valid: false,
        passwordError: "",
        confirmPasswordError: CONFIRM_PASSWORD_REQUIRED_TOAST,
      };
    }

    if (password.length < 8) {
      return {
        valid: false,
        passwordError: PASSWORD_LENGTH_TOAST,
        confirmPasswordError: "",
      };
    }

    if (password !== confirmPassword) {
      return {
        valid: false,
        passwordError: "",
        confirmPasswordError: PASSWORD_MISMATCH_INLINE,
      };
    }

    return { valid: true, passwordError: "", confirmPasswordError: "" };
  };

  const getApiErrorMessage = (res, error) => {
    const data = res?.response;
    if (typeof data === "string") return data;
    if (data?.detail) {
      return typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
          ? data.detail.map((d) => d?.msg || d).join(", ")
          : JSON.stringify(data.detail);
    }
    if (Array.isArray(data?.message)) return data.message.join(", ");
    if (data?.message) return data.message;
    if (res?.message) return res.message;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.detail) return error.response.data.detail;
    if (error?.message) return error.message;
    return "";
  };

  const isDuplicateEmailError = (message) => {
    if (!message) return false;
    const lower = String(message).toLowerCase();
    return (
      lower.includes("user with this email") ||
      (lower.includes("email") &&
        (lower.includes("exist") ||
          lower.includes("already") ||
          lower.includes("duplicate")))
    );
  };

  const resolveSaveUserErrorToast = (res, error, isEdit) => {
    const raw = getApiErrorMessage(res, error);
    if (isDuplicateEmailError(raw)) return DUPLICATE_EMAIL_TOAST;
    if (raw) return raw;
    return isEdit ? UPDATE_USER_FAILED_TOAST : ADD_USER_FAILED_TOAST;
  };

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
      if (!open || !isActive) return;

      setUsersLoading(true);
      setUsersError(null);
      try {
        if (isPathUsersMode) {
          if (typeof window === "undefined") return;

          const sessionDataRaw = localStorage.getItem("sessionData");
          const sessionData = sessionDataRaw
            ? JSON.parse(sessionDataRaw)
            : null;
          const sessionId =
            sessionData?.session_id || localStorage.getItem("sessionId");

          if (!sessionId) {
            throw new Error("No session ID found for cycle users");
          }

          const res = await getPathUsers(sessionId);
          const raw = res?.response;
          const data = Array.isArray(raw?.users) ? raw.users : raw;
          const usersArr = Array.isArray(data) ? data : [];
          setUsers(usersArr);
          const cycleEmails = usersArr
            .filter((u) => u.assignment_type === "active")
            .map((u) => u.email)
            .filter(Boolean);
          setSavedCurrentCycleEmails(cycleEmails);
        } else {
          if (!clientId) return;
          const res = await getUserById({ clientId });
          const data = res?.response || [];
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(
          isPathUsersMode
            ? "Failed to fetch path users:"
            : "Failed to fetch users for client:",
          error,
        );
        setUsersError(
          error?.message ||
          (isPathUsersMode
            ? "Failed to load users for this path"
            : "Failed to load users for this client"),
        );
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [open, isActive, clientId, isPathUsersMode]);

  // Reusable refresh that picks the right fetch based on mode
  const refreshUserList = async () => {
    try {
      if (isPathUsersMode) {
        const sessionDataRaw = localStorage.getItem("sessionData");
        const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
        const sessionId = sessionData?.session_id || localStorage.getItem("sessionId");
        if (sessionId) {
          const res = await getPathUsers(sessionId);
          const raw = res?.response;
          const data = Array.isArray(raw?.users) ? raw.users : raw;
          const usersArr = Array.isArray(data) ? data : [];
          setUsers(usersArr);
          const cycleEmails = usersArr
            .filter((u) => u.assignment_type === "active")
            .map((u) => u.email)
            .filter(Boolean);
          setSavedCurrentCycleEmails(cycleEmails);
        }
      } else if (clientId) {
        const listRes = await getUserById({ clientId });
        const data = listRes?.response || [];
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to refresh user list:", err);
    }
  };

  // Fetch all paths so cycle names resolve in the table (allPaths otherwise only loads when forms open)
  useEffect(() => {
    if (!open || !isActive || !clientId) return;
    const fetchAllPathsForTable = async () => {
      try {
        const res = await getClientPaths(clientId);
        const r = res?.response ?? res;
        const arr = Array.isArray(r) ? r : Array.isArray(r?.results) ? r.results : Array.isArray(r?.data) ? r.data : [];
        setAllPaths(arr);
      } catch (error) {
        console.error("Failed to fetch paths for table:", error);
      }
    };
    fetchAllPathsForTable();
  }, [open, isActive, clientId]);

  // Fetch cycle names for users whose path isn't in allPaths (e.g. deactivated users)
  useEffect(() => {
    if (!users.length) return;
    const collectPathIds = (usersArr) => {
      const ids = new Set();
      usersArr.forEach((u) => {
        if (u.active_path_id) ids.add(Number(u.active_path_id));
        if (Array.isArray(u.paths)) u.paths.forEach((id) => { if (id) ids.add(Number(id)); });
      });
      return ids;
    };
    const knownIds = new Set(allPaths.map((p) => Number(p.id)));
    const missing = [...collectPathIds(users)].filter((id) => !knownIds.has(id));
    if (!missing.length) return;
    const fetchMissingPaths = async () => {
      const entries = await Promise.all(
        missing.map(async (id) => {
          try {
            const res = await getPathById(id);
            const path = res?.response ?? res;
            return [id, path?.name ?? null];
          } catch {
            return [id, null];
          }
        })
      );
      setPathNamesMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    };
    fetchMissingPaths();
  }, [users, allPaths]);

  // Fetch cycle names for assignments whose path isn't in allPaths
  useEffect(() => {
    if (!cometAssignments.length || !allPaths.length) return;
    const knownIds = new Set(allPaths.map((p) => Number(p.id)));
    const missing = cometAssignments
      .map((a) => Number(a.cometType))
      .filter((id) => id && !Number.isNaN(id) && !knownIds.has(id) && !pathNamesMap[id]);
    if (!missing.length) return;
    const fetchMissing = async () => {
      const entries = await Promise.all(
        missing.map(async (id) => {
          try {
            const res = await getPathById(id);
            const path = res?.response ?? res;
            return [id, path?.name ?? null];
          } catch {
            return [id, null];
          }
        })
      );
      setPathNamesMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    };
    fetchMissing();
  }, [cometAssignments, allPaths, pathNamesMap]);

  // Fetch  email for dropdown
  useEffect(() => {
    const fetchEmailOptions = async () => {
      if (!open || !showAddUserForm || !isPathUsersMode || !clientId) return;

      setEmailOptionsLoading(true);
      try {
        const res = await getUserById({ clientId });
        const data = res?.response || [];
        const options = Array.isArray(data) ? data : [];
        setEmailOptions(options);
        if (options.length === 0) {
          toast.error("No users found for this client");
        }
      } catch (error) {
        console.error("Failed to fetch users for email dropdown:", error);
        toast.error("Failed to load emails");
        setEmailOptions([]);
      } finally {
        setEmailOptionsLoading(false);
      }
    };

    fetchEmailOptions();
  }, [open, showAddUserForm, isPathUsersMode, clientId]);

  // Pre-select already-assigned path users in the Select emails dropdown when opening Assign form
  useEffect(() => {
    if (!showAddUserForm || !isPathUsersMode || !Array.isArray(users)) return;
    const emails = users.map((u) => u.email || u.Email).filter(Boolean);
    setPathUserEmails(emails);
    setCurrentCycleEmails(new Set(savedCurrentCycleEmails));
  }, [showAddUserForm, isPathUsersMode, users, savedCurrentCycleEmails]);

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

  // Fetch paths: all client paths for Comets Available; cohort paths when cohort selected for dropdown pool
  useEffect(() => {
    const fetchPaths = async () => {
      setCohortPathsLoading(true);
      try {
        const toPaths = (raw) => {
          const r = raw?.response ?? raw;
          return Array.isArray(r) ? r : Array.isArray(r?.results) ? r.results : Array.isArray(r?.data) ? r.data : [];
        };

        const allRes = await getClientPaths(clientId);
        const allPathsArray = toPaths(allRes);
        setAllPaths(allPathsArray);
        const pathById = new Map(allPathsArray.map((p) => [Number(p.id), p]));

        if (selectedCohort) {
          const cohortRes = await getCohortPaths({ cohortId: Number(selectedCohort.id) });
          const cohortPathObjects = toPaths(cohortRes);
          setCometsAvailableTickedIds(new Set(cohortPathObjects.map((p) => Number(p.id))));
          const resolved = cohortPathObjects.map((p) => {
            const id = Number(p.id);
            return { id, name: pathById.get(id)?.name ?? p.name ?? `Path ${id}` };
          });
          setCohortPaths(resolved);
        } else {
          setCohortPaths([]);
        }
      } catch (error) {
        console.error("Failed to fetch paths:", error);
        toast.error("Failed to load paths");
        setAllPaths([]);
        setCohortPaths([]);
      } finally {
        setCohortPathsLoading(false);
      }
    };
    if (showAddUserForm) fetchPaths();
  }, [open, showAddUserForm, selectedCohort, editingUser?.paths]);

  const getUserInfoDetail = async (user) => {
    const userId = user.id || user.user_id;
    if (!userId) {
      toast.error("User ID not found");
      return;
    }
    setEditingUser(user);
    try {
      const res = await getUserInfo(userId);
      if (res?.response) {
        handleEditUser(res.response);
      } else {
        // Fallback to the data we already have
        handleEditUser(user);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to load user details");
      // Fallback to the data we already have
      handleEditUser(user);
    }
  };

  // Append cohort paths to existing comet assignments (skip duplicates)
  useEffect(() => {
    if (selectedCohort && cohortPaths.length > 0 && !cohortPathsLoading) {
      setCometAssignments((prev) => {
        const existingIds = new Set(
          prev.map((a) => String(a.cometType)).filter(Boolean)
        );
        const newPaths = cohortPaths.filter(
          (path) => !existingIds.has(String(path.id))
        );
        if (newPaths.length === 0) return prev;

        const maxId = Math.max(0, ...prev.map((a) => a.id));
        const newAssignments = newPaths.map((path, idx) => ({
          id: maxId + idx + 1,
          isCurrent: false,
          cometType: String(path.id),
        }));

        // Remove empty placeholder rows, then append new paths
        const meaningful = prev.filter((a) => a.cometType !== "");
        const merged = [...meaningful, ...newAssignments];

        // Ensure at least one assignment is marked current
        const hasCurrent = merged.some((a) => a.isCurrent);
        if (!hasCurrent && merged.length > 0) {
          merged[0] = { ...merged[0], isCurrent: true };
          setCurrentCometIndex(0);
        }

        return merged;
      });
    }
  }, [cohortPaths, cohortPathsLoading, selectedCohort]);

  // Re-match cohort when cohorts load after edit form opens
  useEffect(() => {
    if (!editingUser || !cohorts.length || selectedCohort) return;
    const cohortId = editingUser.cohort_id;
    if (!cohortId) return;
    const matched = cohorts.find((c) => String(c.id) === String(cohortId));
    if (matched) {
      setSelectedCohort({ id: matched.id, name: matched.name });
    }
  }, [cohorts, editingUser, selectedCohort]);

  const handleEditUser = (user) => {
    setEditingUser(user);

    setFirstName(user.first_name || user.firstName || "");
    setLastName(user.last_name || user.lastName || "");
    setEmail(user.email || "");
    setPassword("");
    setConfirmPassword("");
    clearPasswordErrors();
    const matchedCohort = cohorts.find((c) => String(c.id) === String(user.cohort_id));
    setSelectedCohort(matchedCohort ? { id: matchedCohort.id, name: matchedCohort.name } : null);
    setEnableSSO(user.is_sso || false);
    // Set manager email
    const managerEmailValue = user.manager_email || user.managerEmail || "";
    if (managerEmailValue) {
      setManagerEmail(managerEmailValue);
    } else {
      setManagerEmail("");
    }

    // Set accountability partner emails
    const accountabilityEmailValue =
      user.accountability_partner_email ||
      user.accountability_email ||
      user.accountabilityPartnerEmail ||
      "";
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
        })),
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
        : 0,
    );

    // Snapshot initial values for dirty-tracking
    initialFormSnapshot.current = JSON.stringify({
      firstName: user.first_name || user.firstName || "",
      lastName: user.last_name || user.lastName || "",
      email: user.email || "",
      password: "",
      cohortId: String(user.cohort_id || ""),
      enableSSO: user.is_sso || false,
      managerEmail: user.manager_email || user.managerEmail || "",
      accountabilityEmails: (user.accountability_emails || user.accountability_partner_emails || []).filter(Boolean).sort().join(","),
      assignments: assignments.map((a) => `${a.cometType}:${a.isCurrent}`).sort().join("|"),
    });

    setShowAddUserForm(true);
    if (isPathUsersMode) setShowRegularAddForm(true);
  };

  const resetUserForm = () => {
    setEditingUser(null);
    setShowRegularAddForm(false);
    initialFormSnapshot.current = null;
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    clearPasswordErrors();
    setSelectedCohort(null);
    setEnableSSO(false);
    setManagerEmail("");
    setAccountabilityEmails([{ id: 1, value: "" }]);
    setCometAssignments([{ id: 1, isCurrent: false, cometType: "" }]);
    setCurrentCometIndex(0);
    setCohortPaths([]);
    setPathUserEmails([]);
    setCurrentCycleEmails(new Set());
    setCometsAvailableTickedIds(new Set());
  };

  const hasFormChanged = () => {
    if (!editingUser || !initialFormSnapshot.current) return true; // new user — always allow save
    const current = JSON.stringify({
      firstName,
      lastName,
      email,
      password,
      cohortId: String(selectedCohort?.id || ""),
      enableSSO,
      managerEmail,
      accountabilityEmails: accountabilityEmails.map((a) => a.value.trim()).filter(Boolean).sort().join(","),
      assignments: cometAssignments.filter((a) => a.cometType).map((a) => `${a.cometType}:${a.isCurrent}`).sort().join("|"),
    });
    return current !== initialFormSnapshot.current;
  };

  const isAddUserMandatoryFilled =
    !!firstName.trim() &&
    !!lastName.trim() &&
    !!email.trim() &&
    isValidEmail(email.trim()) &&
    !!password &&
    !!confirmPassword;

  const isEditUserMandatoryFilled =
    !!firstName.trim() && !!lastName.trim() && !!email.trim() && isValidEmail(email.trim());

  const isSaveUserDisabled =
    savingUser ||
    wipingUserActions ||
    (editingUser
      ? !isEditUserMandatoryFilled || !hasFormChanged()
      : !isAddUserMandatoryFilled);

  const getEditingUserId = () =>
    Number(editingUser?.id || editingUser?.user_id || 0) || null;

  const hasDuplicateUserEmail = (emailValue) => {
    const targetEmail = normalizeEmail(emailValue);
    if (!targetEmail || !Array.isArray(users)) return false;

    const editingId = getEditingUserId();
    return users.some((u) => {
      const userEmail = normalizeEmail(u?.email);
      if (!userEmail || userEmail !== targetEmail) return false;
      if (!editingId) return true;
      const rowId = Number(u?.id || u?.user_id || 0) || null;
      return rowId !== editingId;
    });
  };

  const handleAddPathUserEmail = (rawEmail) => {
    const value = (rawEmail || "").trim();
    if (!value) return;
    if (!isValidEmail(value)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setPathUserEmails((prev) =>
      prev.includes(value) ? prev : [...prev, value],
    );
  };

  const handleRemovePathUserEmail = (emailToRemove) => {
    setPathUserEmails((prev) => prev.filter((e) => e !== emailToRemove));
    setCurrentCycleEmails((prev) => {
      const next = new Set(prev);
      next.delete(emailToRemove);
      return next;
    });
  };

  const handleTogglePathUserEmail = (emailVal) => {
    if (!emailVal) return;
    if (pathUserEmails.includes(emailVal)) {
      handleRemovePathUserEmail(emailVal);
    } else {
      handleAddPathUserEmail(emailVal);
    }
  };

  const handleAssignPathUsers = async () => {

    if (typeof window === "undefined") {
      toast.error("Session is not available");
      return;
    }

    const sessionDataRaw = localStorage.getItem("sessionData");
    const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
    const sessionId =
      sessionData?.session_id || localStorage.getItem("sessionId");

    if (!sessionId) {
      toast.error("Session ID not found");
      return;
    }

    setAssigningPathUsers(true);
    try {
      const res = await assignPathUsers(sessionId, pathUserEmails, Array.from(currentCycleEmails));

      if (res?.success) {
        const message = pathUserEmails.length === 1 
          ? "User assignments updated successfully"
          : "Users assignments updated successfully";
        toast.success(message);

        // Refresh path users list
        try {
          const listRes = await getPathUsers(sessionId);
          const raw = listRes?.response;
          const data = Array.isArray(raw?.users) ? raw.users : raw;
          const usersArr = Array.isArray(data) ? data : [];
          setUsers(usersArr);
          const cycleEmails = usersArr
            .filter((u) => u.assignment_type === "active")
            .map((u) => u.email)
            .filter(Boolean);
          setSavedCurrentCycleEmails(cycleEmails);
        } catch (err) {
          console.error("Failed to refresh path users after assignment:", err);
        }

        setShowAddUserForm(false);
        resetUserForm();
      } else {
        const errorMessage =
          res?.response?.detail ||
          res?.response?.message ||
          res?.message ||
          "Failed to assign users";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to assign path users:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        error?.response?.detail ||
        "Failed to assign users";
      toast.error(errorMessage);
    } finally {
      setAssigningPathUsers(false);
    }
  };

  const handleSaveUser = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!clientId) {
      toast.error("Client ID not found");
      return;
    }

    if (!trimmedFirstName || !trimmedLastName) {
      toast.error("First name and last name are required");
      return;
    }

    if (!trimmedEmail) {
      toast.error("Email is required");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (hasDuplicateUserEmail(trimmedEmail)) {
      toast.error(DUPLICATE_EMAIL_TOAST);
      return;
    }

    if (!editingUser) {
      const passwordValidation = validatePasswordFields(false);
      if (!passwordValidation.valid) {
        setPasswordError(passwordValidation.passwordError);
        setConfirmPasswordError(passwordValidation.confirmPasswordError);
        return;
      }
    } else if (password || confirmPassword) {
      const passwordValidation = validatePasswordFields(true);
      if (!passwordValidation.valid) {
        setPasswordError(passwordValidation.passwordError);
        setConfirmPasswordError(passwordValidation.confirmPasswordError);
        return;
      }
    }

    clearPasswordErrors();

    const activeComet = cometAssignments.find((a) => a.isCurrent === true);

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
      first_name: trimmedFirstName,
      last_name: trimmedLastName || "",
      email: trimmedEmail,
      path_ids: pathIds,
      paths: pathIds,
      active_path_id: activePathId || null,
      cohort_id: selectedCohort ? Number(selectedCohort.id) : null,
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

    if (trimmedManagerEmail && !isValidEmail(trimmedManagerEmail)) {
      toast.error(INVALID_MANAGER_EMAIL_TOAST);
      return;
    }
    if (accountabilityEmailsList.some((address) => !isValidEmail(address))) {
      toast.error(INVALID_ACCOUNTABILITY_EMAIL_TOAST);
      return;
    }

    if (trimmedManagerEmail) {
      userData.manager_email = trimmedManagerEmail;
    }
    if (accountabilityEmailsList.length > 0) {
      userData.accountability_emails = accountabilityEmailsList;
    }

    const payload = editingUser ? userData : { user: userData };

    setSavingUser(true);
    try {
      const res = editingUser
        ? await updateClientUser(editingUser.id || editingUser.user_id, payload)
        : await registerClientUser(payload);

      if (res?.success) {
        toast.success(
          editingUser ? UPDATE_USER_SUCCESS_TOAST : ADD_USER_SUCCESS_TOAST,
        );

        // Refresh user list (scoped to path or client based on mode)
        await refreshUserList();

        // Reset form and close
        setShowAddUserForm(false);
        setShowRegularAddForm(false);
        resetUserForm();
      } else {
        toast.error(resolveSaveUserErrorToast(res, null, !!editingUser));
      }
    } catch (error) {
      console.error("Failed to save user:", error);
      toast.error(resolveSaveUserErrorToast(null, error, !!editingUser));
    } finally {
      setSavingUser(false);
    }
  };

  const handleWipeUserActions = async () => {
    if (!editingUser) {
      toast.error("User not selected");
      return;
    }

    const userId = editingUser.id || editingUser.user_id;
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    setWipingUserActions(true);
    try {
      const res = await wipeClientUserActions(userId);

      if (res?.success) {
        toast.success("User's activities are resetted successfully");
        setShowAddUserForm(false);
        resetUserForm();
      } else {
        const errorMessage =
          res?.response?.detail ||
          res?.response?.message ||
          res?.message ||
          "Failed to reset user's activity data";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to wipe user actions:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        error?.response?.detail ||
        "Failed to reset user's activity data";
      toast.error(errorMessage);
    } finally {
      setWipingUserActions(false);
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

        // Refresh user list (scoped to path or client based on mode)
        await refreshUserList();
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

  const handleCohortChange = (cohortId) => {
    if (!cohortId || cohortId === "none") {
      setSelectedCohort(null);
      setCometsAvailableTickedIds(new Set());
      return;
    }
    const cohortItem = cohorts.find((c) => String(c.id) === String(cohortId));
    if (cohortItem) {
      setSelectedCohort({ id: cohortItem.id, name: cohortItem.name });
    }
  };

    // cohort management helpers START
    const refreshCohortManagementList = async () => {
      if (!clientId) return;
      try {
        const res = await getCohorts({ clientId });
        const data = res?.response || [];
        setCohortManagementList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to refresh cohorts:", error);
        toast.error("Failed to refresh cohorts");
      }
    };

    // Load cohorts list on mount / when clientId changes
    useEffect(() => {
      refreshCohortManagementList();
    }, [clientId]);

    const handleCreateCohortInUserMgmt = async () => {
      if (!newCohortName.trim()) {
        toast.error("Cohort name is required");
        return;
      }
      if (!clientId) {
        setCohortManagementList((prev) => [...prev, { name: newCohortName.trim() }]);
        setNewCohortName("");
        setEditingCohortItem(null);
        setCohortModalSelectedPaths(new Set());
        setIsCohortModalOpen(false);
        toast.success("Cohort created successfully");
        return;
      }
      try {
        setCreatingCohort(true);
        const res = await createCohort({
          name: newCohortName.trim(),
          clientId,
          pathIds: Array.from(cohortModalSelectedPaths),
        });
        toast.success("Cohort created successfully");
        setNewCohortName("");
        setEditingCohortItem(null);
        setCohortModalSelectedPaths(new Set());
        setIsCohortModalOpen(false);
        await refreshCohortManagementList();
      } catch (error) {
        const errorMessage = error?.message || error?.response?.data?.detail || "Failed to create cohort";
        toast.error(errorMessage);
      } finally {
        setCreatingCohort(false);
      }
    };

    const handleUpdateCohortInUserMgmt = async () => {
      if (!editingCohortItem) return;
      const cohortId = editingCohortItem.id || editingCohortItem.cohort_id;
      if (!cohortId) { toast.error("Cohort ID is missing"); return; }
      if (!newCohortName.trim()) { toast.error("Cohort name is required"); return; }
      try {
        setCreatingCohort(true);
        await updateCohort({
          cohortId,
          name: newCohortName.trim(),
          pathIds: Array.from(cohortModalSelectedPaths),
        });
        toast.success("Cohort updated successfully");
        setNewCohortName("");
        setEditingCohortItem(null);
        setCohortModalSelectedPaths(new Set());
        setIsCohortModalOpen(false);
        await refreshCohortManagementList();
      } catch (error) {
        const errorMessage = error?.message || error?.response?.data?.detail || "Failed to update cohort";
        toast.error(errorMessage);
      } finally {
        setCreatingCohort(false);
      }
    };

    const handleDeleteCohortInUserMgmt = async (cohort) => {
      const cohortId = cohort.id || cohort.cohort_id;
      if (!cohortId) { toast.error("Cohort ID is missing"); return; }
      try {
        setDeletingCohort(true);
        await deleteCohort({ cohortId });
        toast.success("Cohort deleted successfully");
        await refreshCohortManagementList();
      } catch (error) {
        const errorMessage = error?.message || error?.response?.data?.detail || "Failed to delete cohort";
        toast.error(errorMessage);
      } finally {
        setDeletingCohort(false);
      }
    };

    useEffect(() => {
      if (!isCohortModalOpen || !clientId) return;
      const fetchPathsForCohortModal = async () => {
        try {
          const res = await getClientPaths(clientId);
          const r = res?.response ?? res;
          const arr = Array.isArray(r)
            ? r
            : Array.isArray(r?.results)
              ? r.results
              : Array.isArray(r?.data)
                ? r.data
                : [];
          setAllPaths(arr);
        } catch (error) {
          console.error("Failed to fetch paths for cohort modal:", error);
          toast.error("Failed to load cycles");
        }
      };
      fetchPathsForCohortModal();
    }, [isCohortModalOpen, clientId]);

    useEffect(() => {
      if (!editingCohortItem) {
        setCohortModalSelectedPaths(new Set());
        return;
      }
      const cohortId = editingCohortItem.id || editingCohortItem.cohort_id;
      if (!cohortId) return;
      getCohortPaths({ cohortId: Number(cohortId) })
        .then((res) => {
          const r = res?.response ?? res;
          const arr = Array.isArray(r) ? r : Array.isArray(r?.results) ? r.results : Array.isArray(r?.data) ? r.data : [];
          setCohortModalSelectedPaths(new Set(arr.map((p) => Number(p.id))));
        })
        .catch((err) => {
          console.error("Failed to load cohort paths for editing:", err);
        });
    }, [editingCohortItem]);

    // cohort management helpers END

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
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
        toast.error("Failed to upload users");
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        "Failed to upload users";
      toast.error(errorMessage);
    } finally {
      setBulkUploading(false);
      if (bulkUploadInputRef.current) {
        bulkUploadInputRef.current.value = "";
      }
    }
  };

  const handleAllPathChange = async (item) => {
    const pathId = Number(item?.id);
    if (Number.isNaN(pathId)) return;

    if (selectedCohort) {
      const nextSet = new Set(cometsAvailableTickedIds);
      if (nextSet.has(pathId)) nextSet.delete(pathId);
      else nextSet.add(pathId);
      const pathIds = Array.from(nextSet);
      setUpdatingCohortPaths(true);
      try {
        const res = await updateCohortPaths({
          cohortId: Number(selectedCohort.id),
          pathIds,
          enabled: true,
        });
        if (res?.status === 200 || res?.success) {
          toast.success("Cohort cycles updated");
          const cohortRes = await getCohortPaths({ cohortId: Number(selectedCohort.id) });
          const r = cohortRes?.response ?? cohortRes;
          const arr = Array.isArray(r) ? r : Array.isArray(r?.results) ? r.results : Array.isArray(r?.data) ? r.data : [];
          setCometsAvailableTickedIds(new Set(arr.map((p) => Number(p.id))));
          const pathById = new Map(allPaths.map((p) => [Number(p.id), p]));
          let finalCohortPaths = arr.map((p) => {
            const id = Number(p.id);
            return { id, name: pathById.get(id)?.name ?? p.name ?? `Path ${id}` };
          });
          setCohortPaths(finalCohortPaths);
        } else {
          const errorMessage =
            res?.response?.detail || res?.response?.message || res?.detail || res?.message || "Failed to update cohort cycles";
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error("Failed to update cohort paths:", error);
        const errorMessage =
          error?.message || error?.response?.data?.detail || error?.response?.detail || "Failed to update cohort cycles";
        toast.error(errorMessage);
      } finally {
        setUpdatingCohortPaths(false);
      }
    } else {
      const nextSet = new Set(cometsAvailableTickedIds);
      if (nextSet.has(pathId)) nextSet.delete(pathId);
      else nextSet.add(pathId);
      setCometsAvailableTickedIds(nextSet);
      const pathById = new Map(allPaths.map((p) => [Number(p.id), p]));
      const newList = allPaths.filter((p) => nextSet.has(Number(p.id)));
      const base = newList.map((p) => ({ id: Number(p.id), name: p.name ?? `Path ${p.id}` }));
      setCohortPaths(base);
    }
  };

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpenAllPath(false);
    }
    if (cohortModalDropdownRef?.current && !cohortModalDropdownRef.current.contains(event.target)) {
      setOpenCohortModalPath(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  // ── Derived chip values ────────────────────────────────────────────────────
  const visibleChips = pathUserEmails.slice(0, visibleChipCount);
  const hiddenChipCount = pathUserEmails.length - visibleChipCount;
  const hiddenChipNames = pathUserEmails.slice(visibleChipCount).map((emailVal) => {
    const matchedUser = emailOptions.find((u) => u.email === emailVal);
    return matchedUser
      ? [
          matchedUser.first_name || matchedUser.firstName || "",
          matchedUser.last_name || matchedUser.lastName || "",
        ]
          .filter(Boolean)
          .join(" ") || emailVal
      : emailVal;
  });
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="h-full flex flex-col">
        {!showAddUserForm && !isCohortModalOpen ? (
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium text-gray-700">
                Assigned Users
              </span>

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Search by email"
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
                  className="text-primary-700 hover:text-primary-800 px-4 py-2 rounded-lg font-medium disabled:opacity-50 cursor-pointer ms-3"
                >
                  {isPathUsersMode ? "Assign Users" : "Add User"}
                </Button>

               <Button
                size="md"
                variant="outline"
                onClick={() => {
                  setEditingCohortItem(null);
                  setNewCohortName("");
                  setIsCohortModalOpen(true); // open its own modal, nothing else touched
                }}
                disabled={!!cometStatus && cometStatus.toLowerCase() !== "published"}
                className="text-primary-700 hover:text-primary-800 px-4 py-2 rounded-lg font-medium disabled:opacity-50 cursor-pointer"
              >
                Add Cohorts
              </Button>

                {!isPathUsersMode && (
                  <>
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
                  </>
                )}
              </div>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#E9EAEB]">
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
                    Current Cycle
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
               Actions
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
                      <td className="px-4 py-3 text-sm text-[#181D27]">
                        {user.first_name || user.firstName || "-"}
                      </td>
                      <td className="px-4 py-3 text-[#181D27]">
                        {user.last_name || user.lastName || "-"}
                      </td>
                      <td className="px-4 py-3 text-[#181D27]">
                        {user.email || "-"}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {(() => {
                          if (isPathUsersMode) {
                            const isActive = user.assignment_type === "active";
                            const activePathId = user.active_path_id;
                            const activeCycleName = activePathId
                              ? (allPaths.find((p) => Number(p.id) === Number(activePathId))?.name ?? pathNamesMap[Number(activePathId)] ?? null)
                              : null;
                            return activeCycleName ? (
                              <span className="relative group inline-block max-w-full">
                                <span className={`truncate w-full block text-sm font-medium ${isActive ? "text-[#41B3A2]" : "text-[#181D27]"}`}>
                                  {activeCycleName}
                                </span>
                                <span className="absolute z-50 left-0 top-full mt-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                  {activeCycleName}
                                </span>
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            );
                          }
                          const pathId = user.active_path_id ||
                            (Array.isArray(user.paths) && user.paths.length > 0 ? user.paths[0] : null);
                          const cycleName = user.active_path_name || user.activePathName ||
                            (pathId ? (allPaths.find((p) => Number(p.id) === Number(pathId))?.name ?? pathNamesMap[Number(pathId)]) : null) || null;
                          return cycleName ? (
                            <span className="relative group inline-block max-w-full">
                              <span className="truncate w-full block text-sm text-[#181D27]">
                                {cycleName}
                              </span>
                              <span className="absolute z-50 left-0 top-full mt-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                {cycleName}
                              </span>
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-right">
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
        ) : isPathUsersMode && !showRegularAddForm && !isCohortModalOpen ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Header: Back arrow + Title */}
            <div className="flex items-center gap-3 pb-1 border-b-2 border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowAddUserForm(false);
                  resetUserForm();
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                Assign User
              </h2>
            </div>

            {/* Select Users label + chips */}
            <div className="pt-2 pb-2">
              <p className="text-sm font-medium text-gray-800 mb-2">
                Select Users ({pathUserEmails.length})
              </p>

              {pathUserEmails.length > 0 && (
                <div className="flex items-center gap-2">
                  {/* Scrollable chips */}
                  <div
                    ref={chipsContainerRef}
                    className="flex gap-2 max-h-[120px] overflow-y-auto user-list-scrollbar flex-1 pb-2"
                  >
                    {pathUserEmails.map((emailVal) => {
                      const matchedUser = emailOptions.find((u) => u.email === emailVal);
                      const displayName = matchedUser
                        ? [
                            matchedUser.first_name || matchedUser.firstName || "",
                            matchedUser.last_name || matchedUser.lastName || "",
                          ]
                            .filter(Boolean)
                            .join(" ") || emailVal
                        : emailVal;
                      return (
                        <span
                          key={emailVal}
                          data-chip
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-100 text-xs font-medium text-primary-700 border border-primary-200 shrink-0"
                        >
                          {displayName}
                          <button
                            type="button"
                            className="text-primary-500 hover:text-primary-800 transition-colors"
                            onClick={() => handleRemovePathUserEmail(emailVal)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  {/* "+N more" badge — always visible, never scrolls */}
                  {hiddenChipCount > 0 && (
                    <span
                      className="shrink-0 text-xs pl-2 border-l border-[#D5D7DA] text-gray-500 cursor-default"
                      title={hiddenChipNames.join(", ")}
                    >
                      +{hiddenChipCount}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Search input */}
            <div className="flex gap-2 items-center mb-3">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={pathUserEmailSearch}
                  onChange={(e) => setPathUserEmailSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border-1 border-gray-200 rounded-lg outline-none focus:border-primary-400 transition-colors placeholder:text-gray-400"
                />
              </div>
              
              <Button
                size="md"
                variant="outline"
                onClick={() => {
                  resetUserForm();
                  setShowRegularAddForm(true);
                }}
                className="text-primary-700 hover:text-primary-800 px-4 py-2 rounded-lg font-medium disabled:opacity-50 cursor-pointer ms-3"
              >
                Add User
              </Button>
              {/* <Button
                  size="md"
                  variant="outline"
                  className="text-primary-700 hover:text-primary-800 px-4 py-2 rounded-lg font-medium disabled:opacity-50 cursor-pointer border border-primary-300 hover:border-primary-400"
                >
                
              </Button> */}

            </div>
            
            {/* User list */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 user-list-scrollbar">
              {emailOptionsLoading ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  Loading users...
                </div>
              ) : (
                (() => {
                  const search = normalizeSearchTerm(pathUserEmailSearch);
                  const filtered = emailOptions.filter((user) => {
                    if (!search) return true;
                    const fullName = [
                      user.first_name || user.firstName || "",
                      user.last_name || user.lastName || "",
                    ]
                      .filter(Boolean)
                      .join(" ")
                      .toLowerCase();
                    const email = (user.email || "").toLowerCase();
                    return fullName.includes(search) || email.includes(search);
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-8 text-center text-sm text-gray-400">
                        No users found
                      </div>
                    );
                  }

                  return filtered.map((user) => {
                    const fullName =
                      [
                        user.first_name || user.firstName || "",
                        user.last_name || user.lastName || "",
                      ]
                        .filter(Boolean)
                        .join(" ") || "User";
                    const emailVal = user.email || "";
                    const isSelected = pathUserEmails.includes(emailVal);
                    const pathUser = users.find((u) => (u.email || u.Email) === emailVal);
                    const cycleNameFromId = user.active_path_id
                      ? allPaths.find((p) => Number(p.id) === Number(user.active_path_id))?.name
                      : pathUser?.path_name || pathUser?.active_path_name || null;
                    const assignmentLabel = user.active_path_name || user.activePathName || cycleNameFromId || null;

                    return (
                      <div
                        key={user.id || emailVal}
                        onClick={() => handleTogglePathUserEmail(emailVal)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                        currentCycleEmails.has(emailVal)
                          ? "bg-[#B3E1DA] "
                          : isSelected
                          ? "bg-[#E3E1FC]"
                          : "bg-gray-50"
                          }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {emailVal}
                          </p>
                          {/* {assignmentLabel && (
                            <p className="text-xs text-primary-600 truncate">
                              {assignmentLabel}
                            </p>
                          )} */}
                        </div>
                        {isSelected && (
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const isRemoving = currentCycleEmails.has(emailVal);
                                const nextSet = new Set(currentCycleEmails);
                                if (isRemoving) nextSet.delete(emailVal);
                                else nextSet.add(emailVal);
                                setCurrentCycleEmails(nextSet);

                                const sessionDataRaw = localStorage.getItem("sessionData");
                                const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
                                const sessionId = sessionData?.session_id || localStorage.getItem("sessionId");
                                if (!sessionId) {
                                  toast.error("Session ID not found");
                                  return;
                                }

                                try {
                                  const res = await assignPathUsers(sessionId, pathUserEmails, Array.from(nextSet));
                                  if (res?.success) {
                                    try {
                                      const listRes = await getPathUsers(sessionId);
                                      const raw = listRes?.response;
                                      const data = Array.isArray(raw?.users) ? raw.users : raw;
                                      const usersArr = Array.isArray(data) ? data : [];
                                      setUsers(usersArr);
                                      const cycleEmails = usersArr
                                        .filter((u) => u.assignment_type === "active")
                                        .map((u) => u.email)
                                        .filter(Boolean);
                                      setSavedCurrentCycleEmails(cycleEmails);
                                    } catch (refreshErr) {
                                      console.error("Failed to refresh users after cycle update:", refreshErr);
                                    }
                                    toast.success(isRemoving ? "User removed from current cycle successfully" : "User assigned to current cycle successfully");
                                  } else {
                                    setCurrentCycleEmails(currentCycleEmails);
                                    const msg = res?.response?.detail || res?.response?.message || res?.message || "Failed to update current cycle";
                                    toast.error(msg);
                                  }
                                } catch (err) {
                                  setCurrentCycleEmails(currentCycleEmails);
                                  toast.error(err?.message || "Failed to update current cycle");
                                }
                              }}
                              className={`flex items-center text-sm rounded-[8px] border px-3.5 py-1 gap-2 transition-colors bg-[#FFFFFF] ${
                                currentCycleEmails.has(emailVal)
                                  ? "text-[#41B3A2] border-[#41B3A2]"
                                  : "text-[#7367F0] border-[#7367F0]"
                              }`}
                            >
                            {currentCycleEmails.has(emailVal) ? (<XIcon size={16} />) : (<PlusIcon size={16} color={currentCycleEmails.has(emailVal) ? "white" : "#7367F0"} strokeWidth={1.5} />)}

                              {currentCycleEmails.has(emailVal) ? "Remove as Current Cycle" : "Set as Current Cycle"}
                            </button>



                            <button
                              type="button"
                              className="rounded-full transition-colors cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); handleRemovePathUserEmail(emailVal); }}
                            >
                              <CircleX className="h-5 w-5 text-gray-500" color={currentCycleEmails.has(emailVal) ? "#41B3A2" : "#7367F0"} />
                            </button>
                          </div>
                        )}
                        
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 mt-2">
              <Button
                type="button"
                onClick={handleAssignPathUsers}
                // disabled={assigningPathUsers || pathUserEmails.length === 0}
                disabled={assigningPathUsers }
                className="bg-primary hover:bg-primary-600 text-white px-8 py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {assigningPathUsers ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )
        : isCohortModalOpen ? (
          <div className="flex-1 overflow-hidden flex flex-col">

            {/* Header: Back arrow + Title */}
            <div className="flex items-center gap-3 pb-1 border-b-2 border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsCohortModalOpen(false);
                  setNewCohortName("");
                  setEditingCohortItem(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                Add Cohort
              </h2>
            </div>



            {/* Body */}
            <div className="flex-1 overflow-y-auto py-2 space-y-4">
              
              {/* Add form */}
              <div className="space-y-3">
                <span className="text-sm font-semibold text-gray-800">
                  {editingCohortItem ? "Edit Cohort" : "New Cohort"}
                </span>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">
                    Cohort Name<span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    value={newCohortName}
                    onChange={(e) => setNewCohortName(e.target.value)}
                    placeholder="Enter cohort name"
                    className="h-9 bg-white"
                  />
                </div>

                {/* Cycles Available */}
                <div className="space-y-1.5" ref={cohortModalDropdownRef}>
                  <Label className="text-xs font-medium text-gray-700">
                    Assign Cycles
                    {/* <span className="ml-1 text-gray-400 font-normal">
                      ({cohortModalSelectedPaths.size} selected)
                    </span> */}
                  </Label>

                   {/* Search box */}
                  <label className="flex items-center gap-2 border border-[#D5D7DA] rounded-lg px-3 py-2 bg-white mt-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.66602 2.58301C13.5778 2.58301 16.7496 5.7543 16.75 9.66602C16.75 11.3518 16.1593 12.8989 15.1758 14.1152L17.1963 16.1357C17.4892 16.4286 17.4892 16.9034 17.1963 17.1963C16.9034 17.4892 16.4286 17.4892 16.1357 17.1963L14.1152 15.1758C12.8989 16.1593 11.3518 16.75 9.66602 16.75C5.7543 16.7496 2.58301 13.5778 2.58301 9.66602C2.58336 5.75451 5.75451 2.58336 9.66602 2.58301ZM9.66602 4.08301C6.58294 4.08336 4.08336 6.58294 4.08301 9.66602C4.08301 12.7494 6.58273 15.2496 9.66602 15.25C12.7496 15.25 15.25 12.7496 15.25 9.66602C15.2496 6.58273 12.7494 4.08301 9.66602 4.08301ZM2.00977 2.00977H2V2H2.00977V2.00977Z" fill="#535862"/>
                    </svg>
                    <input
                      type="search"
                      placeholder="Search cycles..."
                      value={cohortCycleSearch}
                      onChange={(e) => setCohortCycleSearch(e.target.value)}
                      className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
                    />
                  </label>

                  {/* {openCohortModalPath && ( */}
                    <div className="border-t border-[#D5D7DA] bg-white pt-2">
                      {allPaths.filter((p) =>
                        (p.name ?? "").toLowerCase().includes(cohortCycleSearch.toLowerCase())
                      ).length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-400">
                          No cycles found
                        </div>
                      ) : (
                        allPaths
                        .filter((p) =>
                          (p.name ?? "").toLowerCase().includes(cohortCycleSearch.toLowerCase())
                        )
                        .map((item, index) => {
                          const pathId = Number(item.id);
                          const isSelected = cohortModalSelectedPaths.has(pathId);
                          return (
                            <label
                              onClick={() => {
                                    setCohortModalSelectedPaths((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(pathId)) next.delete(pathId);
                                      else next.add(pathId);
                                      return next;
                                    });
                                  }}
                              key={item.id ?? index}
                              className={`flex items-center gap-1.5 p-2 rounded-[8px] text-sm cursor-pointer transition-colors mb-2 ${
                                isSelected
                                  ? "bg-[#D1FADF] text-[#12B76A]"
                                  : "bg-[#F5F5F5] text-[#181D27]"
                              }`}
                            >
                              {/* <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  setCohortModalSelectedPaths((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(pathId)) next.delete(pathId);
                                    else next.add(pathId);
                                    return next;
                                  });
                                }}
                                className="accent-white rounded-full"
                              /> */}
                              {isSelected ? (
                                <svg width="19" height="19" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="8" cy="8" r="7" fill="white" stroke="#12B76A"/>
                                  <circle cx="8" cy="8" r="4" fill="#12B76A"/>
                                </svg>
                              ) : (
                                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <g filter="url(#filter0_d_40013027_99290)">
                                    <circle cx="9.5" cy="8.5" r="7.5" fill="white"/>
                                    <circle cx="9.5" cy="8.5" r="7" stroke="#D5D7DA"/>
                                  </g>
                                  <defs>
                                    <filter id="filter0_d_40013027_99290" x="0" y="0" width="19" height="19" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                      <feOffset dy="1"/>
                                      <feGaussianBlur stdDeviation="1"/>
                                      <feComposite in2="hardAlpha" operator="out"/>
                                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
                                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_40013027_99290"/>
                                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_40013027_99290" result="shape"/>
                                    </filter>
                                  </defs>
                                </svg>
                              )}


                              

                              <div className="flex flex-col">
                                {/* <span className={isSelected ? "text-[#12B76A]" : "text-[#181D27]"}> */}
                                <span className="text-sm">
                                  {item.name ?? `Path ${item.id}`}
                                </span>
                                <span className="text-[10px]">
                                  ID: {item.id}
                                </span>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  {/* )} */}
                
                </div>

              </div>

              {/* Cohort list */}
              {/* <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 bg-gray-100 text-sm font-medium text-gray-700">
                  <div className="px-4 py-2">Cohort Name</div>
                  <div className="px-4 py-2">Cohort ID</div>
                  <div className="px-4 py-2 text-right">Action</div>
                </div>
                {cohortManagementList.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">
                    No cohorts yet. Add your first cohort above.
                  </div>
                ) : (
                  cohortManagementList.map((cohort, index) => (
                    <div
                      key={cohort.id || cohort.cohort_id || index}
                      className={`grid grid-cols-3 text-sm ${
                        index % 2 === 1 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <div className="px-4 py-2 text-gray-700 truncate">
                        {cohort.name || cohort.cohort_name || "N/A"}
                      </div>
                      <div className="px-4 py-2 text-gray-500 truncate">
                        {cohort.id || cohort.cohort_id || "N/A"}
                      </div>
                      <div className="px-4 py-2 flex items-center justify-end">
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
                                setEditingCohortItem(cohort);
                                setNewCohortName(cohort.name || cohort.cohort_name || "");
                              }}
                              className="cursor-pointer px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 rounded-md"
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCohortInUserMgmt(cohort);
                              }}
                              disabled={deletingCohort}
                              className="cursor-pointer px-3 py-2 text-sm text-black hover:bg-[#574EB6] hover:text-white rounded-md mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingCohort ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div> */}
            </div>

              {/* Footer */}
              {/* <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCohortModalOpen(false);
                  setNewCohortName("");
                  setEditingCohortItem(null);
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Close
              </Button> */}


              <div className="flex justify-end pt-4 border-t border-gray-200 mt-2 gap-2">
                {editingCohortItem && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => {
                      setEditingCohortItem(null);
                      setNewCohortName("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="button"
                  className="bg-primary hover:bg-primary-600 text-white px-8 py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={editingCohortItem ? handleUpdateCohortInUserMgmt : handleCreateCohortInUserMgmt}
                  disabled={creatingCohort}
                >
                  {creatingCohort
                    ? "Saving..."
                    : editingCohortItem
                      ? "Update"
                      : "Save"}
                </Button>


              </div>

          </div>

        )
        : (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-1">
              {/* Back Button */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                  <ArrowLeft
                    onClick={() => {
                      setShowAddUserForm(false);
                      resetUserForm();
                    }}
                    className="w-5 h-5 cursor-pointer"
                  />
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Password
                      {!editingUser && <span className="text-red-500">*</span>}
                      {editingUser && (
                        <span className="text-gray-500 font-normal ml-1">
                          (min 8 characters)
                        </span>
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        type={isPasswordVisible ? "text" : "password"}
                        spellCheck={false}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) setPasswordError("");
                        }}
                        autoComplete="new-password"
                        placeholder={
                          editingUser ? "Leave blank to keep current" : undefined
                        }
                        className="w-full bg-white border border-gray-300 pr-12"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition hover:text-gray-700"
                        onClick={() =>
                          setIsPasswordVisible((current) => !current)
                        }
                      >
                        {isPasswordVisible ? (
                          <EyeOff className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Confirm Password
                      {!editingUser && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        spellCheck={false}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (confirmPasswordError) setConfirmPasswordError("");
                        }}
                        autoComplete="new-password"
                        placeholder={
                          editingUser ? "Confirm new password" : undefined
                        }
                        className="w-full bg-white border border-gray-300 pr-12"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition hover:text-gray-700"
                        onClick={() =>
                          setIsConfirmPasswordVisible((current) => !current)
                        }
                      >
                        {isConfirmPasswordVisible ? (
                          <EyeOff className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </button>
                    </div>
                    {confirmPasswordError && (
                      <p className="mt-1 text-sm text-red-600">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>
                </div>

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
                                  : row,
                              ),
                            )
                          }
                          className="flex-1 bg-white border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setAccountabilityEmails((prev) =>
                              prev.filter((row) => row.id !== item.id),
                            )
                          }
                          className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center shrink-0"
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
                    value={selectedCohort ? String(selectedCohort.id) : "none"}
                    onValueChange={handleCohortChange}
                    disabled={cohortsLoading || cohorts.length === 0}
                  >
                    <SelectTrigger className="w-full bg-white border border-gray-300">
                      <SelectValue
                        placeholder={
                          cohortsLoading
                            ? "Loading..."
                            : cohorts.length === 0
                              ? "No cohorts available"
                              : "Select cohort"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent side="bottom" className="max-h-[200px]">
                      <SelectItem value="none">No cohort</SelectItem>
                      {cohorts.map((cohortItem) => (
                        <SelectItem key={cohortItem.id} value={String(cohortItem.id)}>
                          {cohortItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* <div ref={dropdownRef}>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Cycles Available
                </Label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenAllPath(!openAllPath)}
                    className=" w-full flex justify-between items-center
                          px-3 py-2 bg-white
                          border border-gray-300 rounded-md
                          text-sm text-gray-700
                          outline-none
                          focus:outline-none
                          focus:ring-0
                          focus:border-gray-300
                          focus-visible:ring-0"
                  >
                    <span className="truncate">
                      {cometsAvailableTickedIds.size > 0
                        ? `${cometsAvailableTickedIds.size} selected`
                        : "All Available Comets"}
                    </span>
                    <span className="text-gray-400">⌄</span>
                  </button>

                  {openAllPath && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-56 overflow-auto">
                      {allPaths?.length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-400">
                          No Cycles available
                        </div>
                      )}

                      {allPaths?.map((item, index) => {
                        const checked = cometsAvailableTickedIds.has(Number(item.id));

                        return (
                          <label
                            key={item.id ?? index}
                            className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleAllPathChange(item)}
                              disabled={updatingCohortPaths}
                              className="accent-blue-600"
                            />
                            <span className="text-gray-700">{item.name ?? `Path ${item.id}`}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div> */}
              {/* Current Comet Assignment */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2 block">
                  Assigned Cycles
                </h3>
                <div className="space-y-3">
                  {[...cometAssignments].sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0)).map((assignment, index) => (
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
                          setCometAssignments((prev) =>
                            prev.map((item) => ({
                              ...item,
                              isCurrent: item.id === assignment.id,
                            })),
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
                          Current Cycle
                        </span>

                      </button>

                      {/* Cycle Name or Selector */}
                      {assignment.cometType ? (
                        <span className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 truncate">
                          {allPaths.find((p) => String(p.id) === String(assignment.cometType))?.name || pathNamesMap[Number(assignment.cometType)] || "—"}
                        </span>
                      ) : (
                        <Select
                          value={assignment.cometType}
                          onValueChange={(value) => {
                            setCometAssignments((prev) =>
                              prev.map((item) =>
                                item.id === assignment.id
                                  ? { ...item, cometType: value }
                                  : item,
                              ),
                            );
                          }}
                        >
                          <SelectTrigger className="flex-1 bg-white border border-gray-300">
                            <SelectValue placeholder={cohortPathsLoading ? "Loading..." : "Select cycle"} />
                          </SelectTrigger>
                          <SelectContent side="bottom" className="max-h-[150px]">
                            {allPaths.filter(
                                (path) => !cometAssignments.some(
                                  (item) => String(item.cometType) === String(path.id),
                                ),
                              ).length === 0 ? (
                              <div className="px-3 py-2 text-sm text-gray-400">No cycle available</div>
                            ) : (
                              allPaths
                                .filter(
                                  (path) => !cometAssignments.some(
                                    (item) => String(item.cometType) === String(path.id),
                                  ),
                                )
                                .map((path) => (
                                  <SelectItem key={path.id} value={String(path.id)}>
                                    {path.name}
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (cometAssignments.length > 1) {
                            setCometAssignments((prev) =>
                              prev.filter((item) => item.id !== assignment.id),
                            );
                          } else {
                            setCometAssignments([
                              { id: 1, isCurrent: false, cometType: "" },
                            ]);
                          }
                        }}
                        disabled={!!selectedCohort}
                        className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Assign Comet Button */}
                {!selectedCohort && (
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
                    Assign Cycles
                  </Button>
                )}
              </div>
            </div>

            <div
              className={`flex pt-4 mt-4 border-t border-gray-200 shrink-0 ${editingUser ? "justify-between" : "justify-end"}`}
            >
              {editingUser && (
                <Button
                  type="button"
                  onClick={() => setShowResetActivityConfirm(true)}
                  disabled={wipingUserActions || savingUser}
                  className="bg-white border border-[#645AD1] text-[#645AD1] hover:bg-gray-100 active:bg-[#645AD1] active:text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {wipingUserActions
                    ? "Resetting User's Activity..."
                    : "Reset User's Activity"}
                </Button>
              )}
              <Button
                type="button"
                onClick={handleSaveUser}
                disabled={isSaveUserDisabled}
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

      <Dialog
        open={showResetActivityConfirm}
        onOpenChange={setShowResetActivityConfirm}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will delete this user&apos;s path progress and all in-app
              activity.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowResetActivityConfirm(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowResetActivityConfirm(false);
                handleWipeUserActions();
              }}
              className="bg-[#645AD1] hover:bg-[#574EB6] text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

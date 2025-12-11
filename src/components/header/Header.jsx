"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePreviewMode } from "@/contexts/PreviewModeContext";
import { useCometSettings } from "@/contexts/CometSettingsContext";
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  Menu,
  X,
  UserPlus,
  Pencil,
  Eye,
  Mail,
} from "lucide-react";
import { tokenManager } from "@/lib/api-client";
import Image from "next/image";
import ClientDropdown from "@/components/common/ClientDropdown";
import { useClients, useUser } from "@/hooks/useQueryData";
import { shareComet } from "@/api/shareComet";
import { publishComet } from "@/api/publishComet";
import { downloadDocument } from "@/api/downloadDocument";
import { sendFeedback } from "@/api/sendFeedback";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import LoginForm from "@/components/auth/LoginForm";
import MyAccountDialog from "@/components/header/MyAccountDialog";
import ClientSettingsDialog from "@/components/header/ClientSettingsDialog";

// ---------- Helper: Safe avatar renderer ----------
const UserAvatar = ({ user }) => {
  const raw = user?.ImageUrl?.trim();
  const alt = `${user?.first_name || ""} ${user?.last_name || "User"}`.trim();
  const fallbackInitial =
    user?.first_name?.charAt(0)?.toUpperCase() ||
    user?.last_name?.charAt(0)?.toUpperCase() ||
    "U";

  // No URL at all → show initials
  if (!raw) {
    return (
      <span className="text-sm font-semibold text-primary-700">
        {fallbackInitial}
      </span>
    );
  }

  const isRelative = raw.startsWith("/");
  const isHttp = raw.startsWith("http://") || raw.startsWith("https://");

  // Local path → safe for next/image
  if (isRelative) {
    return (
      <Image
        src={raw}
        alt={alt}
        width={28}
        height={28}
        className="w-full h-full rounded-full object-cover"
      />
    );
  }

  // External URL → use <img> to avoid Next.js domain restriction errors
  if (isHttp) {
    return (
      <img
        src={raw}
        alt={alt}
        className="w-full h-full rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  // Anything else weird → fallback to initials
  return (
    <span className="text-sm font-semibold text-primary-700">
      {fallbackInitial}
    </span>
  );
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isPreviewMode, setIsPreviewMode } = usePreviewMode();
  const { isCometSettingsOpen, setIsCometSettingsOpen } = useCometSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // TanStack Query for clients and user
  const {
    data: clients = [],
    isLoading: clientsLoading,
    isError: clientsError,
  } = useClients(isAuthenticated);
  const { data: user } = useUser(isAuthenticated);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isHomeButtonActive, setIsHomeButtonActive] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeModeButton, setActiveModeButton] = useState("editor");
  const [isFeedbackActive, setIsFeedbackActive] = useState(false);
  const [isDownloadActive, setIsDownloadActive] = useState(false);
  const [isInviteButtonActive, setIsInviteButtonActive] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginButtonPosition, setLoginButtonPosition] = useState(null);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isClientSettingsDialogOpen, setIsClientSettingsDialogOpen] =
    useState(false);
  const loginButtonRef = useRef(null);
  const isHome = pathname === "/";
  const isCometManager = pathname?.startsWith("/comet-manager");
  const [text, setText] = useState("");

  const [subject, setSubject] = useState("Kyper Feedback");
  const to = "hello@1st90.com";

  // Check if user is super admin
  const isSuperAdmin = () => {
    const client = selectedClient || clients[0];
    if (!client) return false;
    return client.role === "Super Admin";
  };

  // Mock client data - replace with actual data fetching
  const mockClients = [
    {
      id: 1,
      name: "Jhon Doe",
      ImageUrl: "/profile.png",
    },
    {
      id: 2,
      name: "Jane Doe",
      ImageUrl: "/profile.png",
    },
  ];

  // Mock collaborators data
  const mockCollaborators = [
    {
      id: 1,
      name: "John Smith",
      ImageUrl: "/profile.png",
    },
    {
      id: 2,
      name: "Jane Doe",
      ImageUrl: "/profile.png",
    },
    {
      id: 3,
      name: "Mike Johnson",
      ImageUrl: "/profile.png",
    },
  ];

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "All Comets", path: "/comets" },
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
  ];
  const userName =
    typeof window !== "undefined" ? localStorage.getItem("user_name") : null;

  useEffect(() => {
    const isAuth = tokenManager.isAuthenticated();
    setIsAuthenticated(isAuth);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleGlobalLoginOpen = (event) => {
      const buttonPositionFromEvent = event?.detail?.buttonPosition ?? null;
      const redirectPath = event?.detail?.redirectPath;

      if (redirectPath) {
        try {
          window.sessionStorage.setItem("postLoginRedirect", redirectPath);
        } catch {}
      }

      setLoginButtonPosition(buttonPositionFromEvent);
      setIsLoginDialogOpen(true);
    };

    window.addEventListener("open-login-dialog", handleGlobalLoginOpen);
    return () => {
      window.removeEventListener("open-login-dialog", handleGlobalLoginOpen);
    };
  }, []);

  useEffect(() => {
    if (!isLoginDialogOpen) {
      const isAuth = tokenManager.isAuthenticated();
      setIsAuthenticated(isAuth);
    }
  }, [isLoginDialogOpen]);

  useEffect(() => {
    if (clients.length > 0) {
      if (!selectedClient) {
        setSelectedClient(clients[0]);
        localStorage.setItem("Client id", clients[0].id);
      } else {
        const updatedClient = clients.find((c) => c.id === selectedClient.id);
        if (updatedClient) {
          setSelectedClient(updatedClient);
        }
      }
    }
  }, [clients]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        // placeholder – add real API later
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  const handleHomeButtonClick = () => {
    setIsHomeButtonActive(!isHomeButtonActive);
  };

  const handleFeedbackClick = () => {
    setIsFeedbackActive(!isFeedbackActive);
    setIsFeedbackDialogOpen(true);
  };

  const handleFeedbackClose = () => {
    setIsFeedbackDialogOpen(false);
    setFeedbackMessage("");
    setIsFeedbackActive(false);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedbackMessage.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      const response = await sendFeedback(feedbackMessage);

      if (response?.response && !response.error) {
        toast.success(
          "Feedback sent successfully! Thank you for your feedback."
        );
        handleFeedbackClose();
      } else {
        toast.error(
          response?.response?.data?.detail ||
            "Failed to send feedback. Please try again."
        );
      }
    } catch (error) {
      console.error("Failed to send feedback:", error);
      toast.error(
        error?.response?.data?.detail ||
          error?.message ||
          "Failed to send feedback. Please try again."
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleDownloadClick = async () => {
    setIsDownloadActive(true);

    try {
      const documentId =
        typeof window !== "undefined"
          ? localStorage.getItem("sessionId")
          : null;

      if (!documentId) {
        toast.error("No document found. Please create or open a comet first.");
        setIsDownloadActive(false);
        return;
      }

      const response = await downloadDocument(documentId);

      if (response && response.success) {
        toast.success("Document downloaded successfully!");
      } else {
        const errorMessage =
          response?.response?.data?.detail ||
          "Failed to download document. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to download document:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to download document. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsDownloadActive(false);
    }
  };

  const handleLoginClick = () => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          "postLoginRedirect",
          pathname || window.location?.pathname || "/"
        );
      } catch {}
    }

    if (loginButtonRef.current) {
      const rect = loginButtonRef.current.getBoundingClientRect();
      const dialogWidth = 350;
      const dialogHeight = 450;
      const spacing = 8;

      let top = rect.bottom + window.scrollY + spacing;
      let left = rect.left + window.scrollX;

      if (left + dialogWidth > window.innerWidth + window.scrollX) {
        left = window.innerWidth + window.scrollX - dialogWidth - 16;
      }

      if (top + dialogHeight > window.innerHeight + window.scrollY) {
        top = rect.top + window.scrollY - dialogHeight - spacing;
        if (top < window.scrollY) {
          top = window.scrollY + 16;
        }
      }

      if (left < window.scrollX) {
        left = window.scrollX + 16;
      }

      setLoginButtonPosition({
        top,
        left,
        width: rect.width,
      });
    }
    setIsLoginDialogOpen(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsUserMenuOpen(false);
    tokenManager.removeToken();
    localStorage.clear();
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem("postLoginRedirect");
      } catch {}
      window.dispatchEvent(new Event("auth-changed"));
    }
    router.push("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);

    localStorage.setItem("Client id", client.id.toString());
    localStorage.setItem("ClientName", client.name.toString());
    window.dispatchEvent(
      new StorageEvent("storage", { key: "Client id", newValue: client.id })
    );
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "ClientName",
        newValue: client.name,
      })
    );
  };

  useEffect(() => {
    const sessionData = JSON.parse(localStorage.getItem("sessionData") || "{}");
    try {
      setText(
        sessionData?.comet_creation_data?.["Basic Information"]?.["Comet Title"]
      );
    } catch {}
  }, []);

  useEffect(() => {
    if (!isPreviewMode && activeModeButton === "preview") {
      setActiveModeButton("editor");
    }
  }, [isPreviewMode, activeModeButton]);

  useEffect(() => {
    if (!isCometSettingsOpen && activeModeButton === "settings") {
      setActiveModeButton("editor");
    }
  }, [isCometSettingsOpen, activeModeButton]);

  useEffect(() => {
    if (!isUserMenuOpen) {
      setActiveButton(null);
    }
  }, [isUserMenuOpen]);

  const handleInviteClick = () => {
    setIsInviteButtonActive(!isInviteButtonActive);
    setIsInviteDialogOpen(true);
  };

  const handleInviteClose = () => {
    setIsInviteDialogOpen(false);
    setInviteEmail("");
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    setIsInviting(true);

    try {
      const sessionId =
        typeof window !== "undefined"
          ? localStorage.getItem("sessionId")
          : null;

      if (!sessionId) {
        alert("No comet session found. Please create or open a comet first.");
        setIsInviting(false);
        return;
      }

      const response = await shareComet(sessionId, inviteEmail);

      if (response && response.response && !response.error) {
        toast.success(`Comet shared with ${inviteEmail}`);
        handleInviteClose();
      } else {
        const errorMessage =
          response?.response?.data?.detail ||
          "Failed to share comet. Please try again.";

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to share comet:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to share comet. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsInviting(false);
    }
  };

  const handleMyAccountClick = () => {
    setIsUserMenuOpen(false);
    handleButtonClick("myAccount");
    setIsAccountDialogOpen(true);
  };

  const handleClientSettingsClick = () => {
    setIsUserMenuOpen(false);
    handleButtonClick("settings");
    setIsClientSettingsDialogOpen(true);
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      const sessionId =
        typeof window !== "undefined"
          ? localStorage.getItem("sessionId")
          : null;

      if (!sessionId) {
        alert("No comet session found. Please create or open a comet first.");
        setIsPublishing(false);
        return;
      }

      const response = await publishComet(sessionId);

      if (response && response.response && !response.error) {
        toast.success("Comet published successfully!");
      } else {
        const errorResponse =
          response?.response?.data?.detail ||
          "Failed to publish comet. Please try again.";
        toast.error(errorResponse);
      }
    } catch (error) {
      console.error("Failed to publish comet:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const getClientInitial = (client) => {
    const name = client?.name || "";
    return name.charAt(0).toUpperCase() || "?";
  };

  const Collaborators = () => (
    <div className="flex items-center">
      {mockCollaborators.map((collaborator, index) => (
        <div
          key={collaborator.id}
          className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border-2 border-white overflow-hidden bg-gray-100"
          style={{
            marginLeft: index > 0 ? "-16px" : "0",
            zIndex: mockCollaborators.length - index,
          }}
          title={collaborator.name}
        >
          <Image
            src={
              collaborator.ImageUrl && collaborator.ImageUrl.trim() !== ""
                ? collaborator.ImageUrl
                : "/profile.png"
            }
            alt={collaborator.name || "Collaborator"}
            width={36}
            height={36}
            className="object-cover w-full h-full"
          />
        </div>
      ))}
    </div>
  );

  const FeedbackButton = ({
    compact = false,
    isActive = false,
    onClick = () => {},
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 sm:gap-2 rounded-md border transition-colors hover:cursor-pointer ${
        isActive
          ? "bg-[#F5F5F5] text-[#399C8D] border-[#399C8D]"
          : "bg-[#ECF7F6] hover:bg-[#D9F0EC] hover:text-[#399C8D] border-transparent"
      } ${compact ? "px-2 py-1" : "px-2 sm:px-3 py-1.5 sm:py-2"}`}
    >
      <Image
        src="/Dialog 2.svg"
        alt="Feedback"
        width={18}
        height={18}
        className="sm:w-5 sm:h-5 h"
        style={{ width: "auto", height: "auto" }}
      />

      {!compact && (
        <span className="hidden sm:inline text-xs sm:text-sm font-medium">
          Feedback
        </span>
      )}
    </button>
  );

  const InviteButton = () => (
    <button
      onClick={handleInviteClick}
      className={`flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 rounded-sm border transition-colors duration-200 cursor-pointer shrink-0 ${
        isInviteButtonActive
          ? "bg-[#E3E1FC] border-[#645AD1] text-primary-600"
          : "bg-[#F5F5F5] border-transparent hover:bg-[#F1F0FE] hover:text-primary-600"
      }`}
    >
      <UserPlus size={16} className="sm:w-[18px] sm:h-[18px] sm:hidden" />
      <span className="hidden sm:inline text-xs sm:text-sm font-medium">
        Invite
      </span>
    </button>
  );

  const RightSectionGeneric = () => (
    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 my-1">
      <div>
        <FeedbackButton
          isActive={isFeedbackActive}
          onClick={handleFeedbackClick}
        />
      </div>
      <button
        onClick={handleDownloadClick}
        className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-sm border transition-colors duration-200 shrink-0 ${
          isDownloadActive
            ? "bg-[#E3E1FC] border-[#645AD1] text-primary-600"
            : "bg-[#F5F5F5] border-transparent hover:bg-[#F1F0FE] hover:text-primary-600 hover:cursor-pointer"
        }`}
      >
        <Image
          src="/download.svg"
          alt="Download"
          width={18}
          height={18}
          className="sm:w-5 sm:h-5"
        />
      </button>
      <div className="hidden lg:flex">
        <Collaborators />
      </div>
      <div>
        <InviteButton />
      </div>
    </div>
  );

  const RightSectionCometManager = () => (
    <div className="flex items-center my-1 gap-0.5 sm:gap-1 md:gap-1 shrink-0">
      <button
        onClick={() => setActiveModeButton("editor")}
        style={{
          transition:
            "width 10s ease-in-out, padding 1.2s ease-in-out, background-color 1.2s ease-in-out, border-color 1.2s ease-in-out, color 1.2s ease-in-out",
          width: activeModeButton === "editor" ? "85px" : undefined,
          willChange: "width",
        }}
        className={`hidden md:flex items-center rounded-md border-2 hover:cursor-pointer shrink-0 overflow-hidden ${
          activeModeButton === "editor"
            ? "bg-primary-50 text-primary border-primary-400 px-1.5 sm:px-2 py-1.5 sm:py-2 h-7 sm:h-8 md:h-9"
            : "bg-gray-50 text-gray-700 border-transparent h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 justify-center p-0 hover:bg-gray-100"
        }`}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            overflow: "hidden",
            justifyContent:
              activeModeButton === "editor" ? "flex-start" : "center",
          }}
          className="flex items-center"
        >
          <Pencil
            style={{
              transition: "all 10s ease-in-out",
              flexShrink: 0,
            }}
            className={`${
              activeModeButton === "editor"
                ? "w-5 h-3 sm:w-5 md:w-5 md:h-4 text-primary"
                : "w-4 h-3 sm:w-5 sm:h-5 md:w-5 md:h-5 text-gray-700"
            }`}
          />
          <span
            style={{
              transition:
                "opacity 10s ease-in-out, max-width 10s ease-in-out, margin-left 10s ease-in-out",
              whiteSpace: "nowrap",
              maxWidth: activeModeButton === "editor" ? "100px" : "0px",
              opacity: activeModeButton === "editor" ? 1 : 0,
              marginLeft: activeModeButton === "editor" ? "0.375rem" : "0",
              overflow: "hidden",
              flexShrink: 0,
            }}
            className="text-xs sm:text-sm md:text-[14px] font-medium"
          >
            Editor
          </span>
        </div>
      </button>

      <button
        onClick={() => {
          setActiveModeButton("preview");
          setIsPreviewMode(!isPreviewMode);
        }}
        className={`flex items-center justify-center rounded-md border-2 hover:cursor-pointer shrink-0 transition-colors h-8 w-8 md:h-9 md:w-9 p-0 ${
          activeModeButton === "preview"
            ? "bg-primary-50 text-primary border-primary-400 hover:bg-primary-100"
            : "bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100"
        }`}
      >
        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
      </button>

      {isCometManager && (
        <button
          onClick={() => {
            setActiveModeButton("settings");
            setIsCometSettingsOpen(true);
          }}
          style={{
            transition:
              "width 10s ease-in-out, padding 10s ease-in-out, background-color 10s ease-in-out, border-color 10s ease-in-out, color 10s ease-in-out",
            width: activeModeButton === "settings" ? "95px" : undefined,
            willChange: "width",
          }}
          className={`hidden sm:flex items-center rounded-md border-2 hover:cursor-pointer shrink-0 overflow-hidden ${
            activeModeButton === "settings"
              ? "bg-primary-50 text-primary border-primary-400 px-1.5 sm:px-2 py-1.5 sm:py-2 h-7 sm:h-8 md:h-9"
              : "bg-gray-50 text-gray-700 border-transparent h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 justify-center p-0 hover:bg-gray-100"
          }`}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              overflow: "hidden",
              justifyContent:
                activeModeButton === "settings" ? "flex-start" : "center",
            }}
            className="flex items-center"
          >
            <Settings
              style={{
                transition: "all 10s ease-in-out",
                flexShrink: 0,
              }}
              className={`${
                activeModeButton === "settings"
                  ? "w-4 sm:w-4 md:w-5 md:h-5 text-primary"
                  : "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-700"
              }`}
            />
            <span
              style={{
                transition:
                  "opacity 10s ease-in-out, max-width 10s ease-in-out, margin-left 10s ease-in-out",
                whiteSpace: "nowrap",
                maxWidth: activeModeButton === "settings" ? "100px" : "0px",
                opacity: activeModeButton === "settings" ? 1 : 0,
                marginLeft: activeModeButton === "settings" ? "0.375rem" : "0",
                overflow: "hidden",
                flexShrink: 0,
              }}
              className="text-xs sm:text-sm md:text-[14px] font-medium"
            >
              Setting
            </span>
          </div>
        </button>
      )}

      <div className="hidden lg:block">
        <FeedbackButton
          isActive={isFeedbackActive}
          onClick={handleFeedbackClick}
        />
      </div>
      <button
        onClick={handleDownloadClick}
        className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-sm border transition-colors duration-200 shrink-0 ${
          isDownloadActive
            ? "bg-[#E3E1FC] border-[#645AD1] text-primary-600"
            : "bg-[#F5F5F5] border-transparent hover:bg-[#F1F0FE] hover:text-primary-600 hover:cursor-pointer"
        }`}
      >
        <Image
          src="/download.svg"
          alt="Download"
          width={18}
          height={18}
          className="sm:w-5 sm:h-5"
        />
      </button>

      <div className="hidden lg:flex">
        <Collaborators />
      </div>
      <div className="hidden md:block">
        <InviteButton />
      </div>
      <button
        onClick={handlePublish}
        disabled={isPublishing}
        className="px-4 py-2 rounded-md bg-primary hover:bg-primary-dark text-white text-sm font-medium hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPublishing ? "Publishing..." : "Publish"}
      </button>
    </div>
  );

  return (
    <>
      <header
        className={`px-1 sm:px-2 pt-2 border-gray-200 w-full ${
          isHome ? "bg-white" : "bg-primary-50"
        }`}
      >
        <div className="bg-white px-3 sm:px-4 md:px-6 py-1 rounded-lg w-full">
          <div className="flex items-center justify-between w-full h-full text-sm sm:text-base gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 shrink-0 min-w-0">
              <div className="relative ">
                <div className="flex cursor-pointer shrink-0 flex-1 gap-2 items-center">
                  <div
                    className="flex items-center gap-1 sm:gap-2"
                    onClick={handleLogoClick}
                  >
                    <Image
                      src="/logo.png"
                      alt="Kyper Logo"
                      width={112}
                      height={52}
                    />
                  </div>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 md:size-6 bg-gray-100 rounded-full shrink-0 cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 shrink-0" />
                  </button>
                  {isUserMenuOpen && (
                    <div
                      className="absolute left-0 top-full mt-3 w-48 bg-white rounded-sm shadow-lg border border-gray-200 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className=" p-2 border-gray-200 border-b">
                        <button
                          className={`px-4 py-1 w-full border-gray-100 flex  gap-2 cursor-pointer rounded-sm transition-all duration-200 items-center justify-start hover:cursor-pointer ${
                            activeButton === "home"
                              ? "bg-primary text-white"
                              : "bg-white text-gray-900 hover:bg-primary-100"
                          } `}
                          onClick={() => handleButtonClick("home")}
                        >
                          <Image
                            src="/home.svg"
                            alt="Profile"
                            width={20}
                            height={20}
                            className={
                              activeButton === "home"
                                ? "brightness-0 invert"
                                : ""
                            }
                          />
                          <span className="text-base ">Back to Home</span>
                        </button>
                      </div>

                      <div className=" p-2 py-1   gap-2 flex flex-col">
                        <button
                          className={`w-full px-4 py-1 flex items-center justify-start gap-2 text-sm text-gray-700 rounded-xs transition-all duration-200 hover:cursor-pointer ${
                            activeButton === "myAccount"
                              ? "bg-primary text-white"
                              : "bg-white text-gray-900 hover:bg-primary-100"
                          }`}
                          onClick={handleMyAccountClick}
                        >
                          <User
                            className={`w-5 h-5 ${
                              activeButton === "myAccount" ? "text-white" : ""
                            }`}
                          />
                          <span className="text-base">My Account</span>
                        </button>
                        <button
                          className={`pl-4 py-1 w-full flex items-center  gap-2 text-sm text-gray-700 rounded-xs transition-all duration-200 hover:cursor-pointer ${
                            activeButton === "settings"
                              ? "bg-primary text-white"
                              : "bg-white text-gray-900 hover:bg-primary-100"
                          }`}
                          onClick={handleClientSettingsClick}
                        >
                          <Settings
                            className={`w-5 h-5 ${
                              activeButton === "settings" ? "text-white" : ""
                            }`}
                          />
                          <span className="text-base ">Client Settings</span>
                        </button>
                      </div>

                      <div className="p-2 border-t border-gray-100 ">
                        <button
                          onClick={() =>
                            handleButtonClick("logout") || handleLogout()
                          }
                          className={`px-4 py-1 w-full flex items-center justify-start gap-2 text-sm text-gray-700 rounded-xs transition-all duration-200 hover:cursor-pointer ${
                            activeButton === "logout"
                              ? "bg-primary text-white"
                              : "bg-white text-gray-900 hover:bg-primary-100"
                          }`}
                        >
                          <Image
                            src="/Logout.svg"
                            alt="Logout"
                            width={20}
                            height={20}
                            className={
                              activeButton === "logout"
                                ? "brightness-0 invert"
                                : ""
                            }
                          />
                          <span className="text-base   ">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-2 shrink-0">
                  <ClientDropdown
                    clients={clients}
                    selectedClient={selectedClient}
                    onClientSelect={handleClientSelect}
                    isLoading={clientsLoading}
                    isError={clientsError}
                  />
                  {!isHome && (
                    <div
                      onClick={handleHomeButtonClick}
                      className={`hidden lg:flex w-9 h-9 cursor-pointer rounded-sm items-center justify-center shrink-0 transition-colors duration-200 border ${
                        isHomeButtonActive
                          ? "bg-[#E3E1FC] border-[#645AD1] text-primary-600"
                          : "bg-[#F5F5F5] border-transparent hover:bg-[#F1F0FE] hover:text-primary-600"
                      }`}
                    >
                      <img
                        src="/home.svg"
                        alt="Home"
                        width={18}
                        height={18}
                        className="sm:w-5 sm:h-5 transition-all duration-200"
                        style={
                          isHomeButtonActive
                            ? {
                                color: "primary-600",
                                opacity: 1,
                              }
                            : {
                                filter: "none",
                                opacity: 1,
                              }
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              {isHome && (
                <nav className="hidden lg:flex items-stretch gap-6 xl:gap-8 h-10">
                  {navItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.path)}
                      className={`relative font-medium text-base tracking-wide h-full transition-colors duration-300 group ${
                        pathname === item.path
                          ? "text-gray-700"
                          : "text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      {item.name}
                      <span className="absolute top-0 h-[3px] bg-blue-600 transition-all duration-300 ease-linear left-1/2 -translate-x-1/2 w-0 group-hover:w-full" />
                    </button>
                  ))}
                </nav>
              )}
            </div>

            {isCometManager && (
              <div className="hidden xl:flex flex-1 items-center min-w-0 px-4">
                <span
                  className="text-[#574EB6] select-none truncate text-2xl font-medium"
                  style={{
                    fontFamily: "Noto Serif",
                  }}
                >
                  {text}
                </span>
              </div>
            )}

            {isHome && (
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 ml-auto shrink-0">
                {isAuthenticated ? (
                  <div className="relative">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 cursor-pointer bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4 text-gray-600" />
                        {notificationCount > 0 && (
                          <span className="absolute -top-[2px] -right-[2px] flex h-[10px] min-w-[10px] items-center justify-center rounded-full bg-red-500 px-[3px] text-[8px] leading-none text-white ring-2 ring-white">
                            {notificationCount > 99 ? "99+" : notificationCount}
                          </span>
                        )}
                        {!isHome && (
                          <div
                            onClick={handleHomeButtonClick}
                            className={`hidden lg:flex w-9 h-9 cursor-pointer rounded-sm items-center justify-center shrink-0 -ml-12 transition-colors duration-200 border ${
                              isHomeButtonActive
                                ? "bg-[#E3E1FC] border-[#645AD1] text-primary-600"
                                : "bg-[#F5F5F5] border-transparent hover:bg-[#F1F0FE] hover:text-primary-600"
                            }`}
                          >
                            <img
                              src="/home.png"
                              alt="Home"
                              width={18}
                              height={18}
                              className="sm:w-5 sm:h-5 transition-all duration-200"
                              style={
                                isHomeButtonActive
                                  ? {
                                      color: "primary-600",
                                      opacity: 1,
                                    }
                                  : {
                                      filter: "none",
                                      opacity: 1,
                                    }
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div
                        className="w-7 h-7 sm:w-7 sm:h-7 md:w-7 md:h-7 rounded-full bg-primary-100 border border-gray-300 flex items-center justify-center text-md sm:text-base font-semibold text-primary-700 shrink-0 cursor-pointer"
                        onClick={handleMyAccountClick}
                      >
                        <UserAvatar user={user} />
                      </div>

                      <div className="hidden sm:flex flex-col justify-start">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                          {user?.first_name || user?.last_name || "User"}
                        </span>
                        {isSuperAdmin() && (
                          <span className="text-[10px] sm:text-xs font-medium text-gray-300 leading-tight">
                            Super Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-3 relative">
                    <button
                      ref={loginButtonRef}
                      onClick={handleLoginClick}
                      className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-primary-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Login
                    </button>
                    {isLoginDialogOpen && (
                      <LoginForm
                        open={isLoginDialogOpen}
                        onOpenChange={setIsLoginDialogOpen}
                        buttonPosition={loginButtonPosition}
                      />
                    )}
                  </div>
                )}

                <button
                  onClick={toggleMobileMenu}
                  className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  ) : (
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  )}
                </button>
              </div>
            )}

            {!isHome && !isCometManager && (
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 ml-auto shrink-0">
                <RightSectionGeneric />
                {isAuthenticated ? (
                  <div className="relative">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-7 h-7 sm:w-7 sm:h-7 md:w-7 md:h-7 rounded-full bg-primary-100 border border-gray-300 flex items-center justify-center text-md sm:text-base font-semibold text-primary-700 shrink-0">
                        <UserAvatar user={user} />
                      </div>

                      <div className="hidden sm:flex flex-col justify-start">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                          {user?.first_name || user?.last_name || "User"}
                        </span>
                        {isSuperAdmin() && (
                          <span className="text-[10px] sm:text-xs font-medium text-gray-300 leading-tight">
                            Super Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-3 relative">
                    <button
                      ref={loginButtonRef}
                      onClick={handleLoginClick}
                      className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-primary-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Login
                    </button>
                    {isLoginDialogOpen && (
                      <LoginForm
                        open={isLoginDialogOpen}
                        onOpenChange={setIsLoginDialogOpen}
                        buttonPosition={loginButtonPosition}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {isCometManager && (
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 ml-auto shrink-0 min-w-0 max-w-full overflow-hidden">
                <RightSectionCometManager />
                {isAuthenticated ? (
                  <div className="relative">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-7 h-7 sm:w-7 sm:h-7 md:w-7 md:h-7 rounded-full bg-primary-100 border border-gray-300 flex items-center justify-center text-md sm:text-base font-semibold text-primary-700 shrink-0">
                        <UserAvatar user={user} />
                      </div>

                      <div className="hidden sm:flex flex-col justify-start">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                          {user?.first_name || user?.last_name || "User"}
                        </span>
                        {isSuperAdmin() && (
                          <span className="text-[10px] sm:text-xs font-medium text-gray-300 leading-tight">
                            Super Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-3 relative">
                    <button
                      ref={loginButtonRef}
                      onClick={handleLoginClick}
                      className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-primary-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Login
                    </button>
                    {isLoginDialogOpen && (
                      <LoginForm
                        open={isLoginDialogOpen}
                        onOpenChange={setIsLoginDialogOpen}
                        buttonPosition={loginButtonPosition}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 mt-1 mx-1 sm:mx-2 rounded-lg">
              <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-2">
                {isAuthenticated && (
                  <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                    <ClientDropdown
                      clients={clients}
                      selectedClient={selectedClient}
                      onClientSelect={handleClientSelect}
                      isLoading={clientsLoading}
                      isError={clientsError}
                    />
                  </div>
                )}

                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 font-medium rounded-lg transition-colors ${
                      pathname === item.path
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isMobileMenuOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-30"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {isUserMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                if (e.target.closest("[data-user-menu]")) {
                  return;
                }
                setIsUserMenuOpen(false);
              }}
            />
          )}

          <Dialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite User</DialogTitle>
                <DialogDescription>
                  Send an invitation to collaborate on this project
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleInviteSubmit}>
                <div className="mb-4">
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email address"
                      required
                      className="w-full pl-10 pr-3 py-2"
                      disabled={isInviting}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleInviteClose}
                    disabled={isInviting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isInviting}>
                    {isInviting ? "Sending..." : "Send Invite"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isFeedbackDialogOpen}
            onOpenChange={(open) => {
              setIsFeedbackDialogOpen(open);
              if (!open) {
                setFeedbackMessage("");
                setIsFeedbackActive(false);

                // clear new fields when dialog closes
                setSubject("Kyper Feedback");
                setCc("");
              }
            }}
          >
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Send Feedback</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    To
                  </Label>
                  <input
                    value={to}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-300 focus:border-transparent"
                  />
                </div>

                {/* Subject */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </Label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-300 focus:border-transparent"
                    required
                    disabled={isSubmittingFeedback}
                  />
                </div>

                {/* Message (body) */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </Label>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Write your message..."
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-300 focus:border-transparent resize-none min-h-[140px]"
                    disabled={isSubmittingFeedback}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFeedbackClose}
                    disabled={isSubmittingFeedback}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      isSubmittingFeedback ||
                      feedbackMessage.trim() === "" ||
                      subject.trim() === ""
                    }
                  >
                    {isSubmittingFeedback ? "Sending..." : "Send Feedback"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <MyAccountDialog
        open={isAccountDialogOpen}
        onOpenChange={setIsAccountDialogOpen}
      />
      <ClientSettingsDialog
        open={isClientSettingsDialogOpen}
        onOpenChange={setIsClientSettingsDialogOpen}
        selectedClient={selectedClient}
      />
    </>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePreviewMode } from "@/contexts/PreviewModeContext";
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
import { getClients } from "@/api/client";
import { shareComet } from "@/api/shareComet";
import { publishComet } from "@/api/publishComet";
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

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isPreviewMode, setIsPreviewMode } = usePreviewMode();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState(false);
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
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginButtonPosition, setLoginButtonPosition] = useState(null);
  const loginButtonRef = useRef(null);
  const isHome = pathname === "/";
  const isCometManager = pathname?.startsWith("/comet-manager");

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
      image_url: "/profile.png",
    },
    {
      id: 2,
      name: "Jane Doe",
      image_url: "/profile.png",
    },
  ];

  // Mock collaborators data
  const mockCollaborators = [
    {
      id: 1,
      name: "John Smith",
      image_url: "/profile.png",
    },
    {
      id: 2,
      name: "Jane Doe",
      image_url: "/profile.png",
    },
    {
      id: 3,
      name: "Mike Johnson",
      image_url: "/profile.png",
    },
  ];

  const navItems = [
    { name: "Dashboard", path: "/" },
    // { name: "Chat", path: "/chat" },
    { name: "All Comets", path: "/comets" },
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
  ];
  const userName =
    typeof window !== "undefined" ? localStorage.getItem("user_name") : null;
 

  useEffect(() => {
    // Check authentication status
    const isAuth = tokenManager.isAuthenticated();
   
    setIsAuthenticated(isAuth);
  }, [pathname]);

  // Re-check authentication when login dialog closes (in case user successfully logged in)
  useEffect(() => {
    if (!isLoginDialogOpen) {
      const isAuth = tokenManager.isAuthenticated();
      setIsAuthenticated(isAuth);
    }
  }, [isLoginDialogOpen]);

  useEffect(() => {
    const load = async () => {
      setClientsLoading(true);
      setClientsError(false);
      try {
        const res = await getClients({ skip: 0, limit: 5, enabledOnly: true });
        if (res?.response && Array.isArray(res.response)) {
          setClients(res.response);
          if (!selectedClient && res.response.length > 0) {
            setSelectedClient(res.response[0]);
          }
        } else {
          setClients([]);
        }
      } catch (error) {
        setClientsError(true);
        setClients([]);
      }
      setClientsLoading(false);
    };
    if (isAuthenticated) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Update selectedClient if clients change (e.g., after fetch)
  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      setSelectedClient(clients[0]);
    }
  }, [clients]);

  // Fetch notification count
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        // TODO: Replace with actual notifications API endpoint
        // Example:
        // const res = await apiService({
        //   endpoint: endpoints.getNotifications,
        //   method: "GET",
        // });
        // if (res?.response?.count !== undefined) {
        //   setNotificationCount(res.response.count);
        // }
        // For now, you can set notificationCount manually:
        // setNotificationCount(4);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    // Optionally set up polling or WebSocket subscription for real-time updates
    // const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    // return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    // setIsUserMenuOpen(false);
  };
  const handleHomeButtonClick = () => {
    setIsHomeButtonActive(!isHomeButtonActive);
  };

  const handleFeedbackClick = () => {
    setIsFeedbackActive(!isFeedbackActive);
  };

  const handleDownloadClick = () => {
    setIsDownloadActive(!isDownloadActive);
  };
  const handleLoginClick = () => {
    if (loginButtonRef.current) {
      const rect = loginButtonRef.current.getBoundingClientRect();
      const dialogWidth = 350; // Approximate dialog width
      const dialogHeight = 450; // Approximate dialog height
      const spacing = 8;

      let top = rect.bottom + window.scrollY + spacing;
      let left = rect.left + window.scrollX;

      // Ensure dialog doesn't go off the right edge
      if (left + dialogWidth > window.innerWidth + window.scrollX) {
        left = window.innerWidth + window.scrollX - dialogWidth - 16;
      }

      // Ensure dialog doesn't go off the bottom edge
      if (top + dialogHeight > window.innerHeight + window.scrollY) {
        top = rect.top + window.scrollY - dialogHeight - spacing;
        // If still off screen, position at top
        if (top < window.scrollY) {
          top = window.scrollY + 16;
        }
      }

      // Ensure dialog doesn't go off the left edge
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
    // localStorage.clear();
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
    
  };

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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    setIsInviting(true);

    try {
      // Get sessionId from localStorage
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
        
        // Check for error details in response
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
  

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      // Get sessionId from localStorage
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

  // Small presentational helpers
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
            src={collaborator.image_url || "/profile.png"}
            alt={collaborator.name}
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
      {/* Editor Button */}
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

      {/* Preview Button */}
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

      {/* Settings Button */}
      <button
        onClick={() => setActiveModeButton("settings")}
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
    <header className="px-1 sm:px-2 pt-2 bg-primary-50 border-gray-200 w-full">
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
                    // className="w-10 h-10"
                  />
                </div>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center gap-1.5 sm:gap-2 md:gap-3 cursor-pointer outline-none hover:opacity-80 transition-opacity relative z-50"
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
                            activeButton === "home" ? "brightness-0 invert" : ""
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
                        onClick={() => handleButtonClick("myAccount")}
                      >
                        <User
                          className={`w-5 h-5 ${
                            activeButton === "myAccount" ? "text-white" : ""
                          }`}
                        />
                        <span className="text-base">My Account</span>
                      </button>
                      <button
                        className={`px-4 py-1 w-full flex items-center  gap-2 text-sm text-gray-700 rounded-xs transition-all duration-200 hover:cursor-pointer ${
                          activeButton === "settings"
                            ? "bg-primary text-white"
                            : "bg-white text-gray-900 hover:bg-primary-100"
                        }`}
                        onClick={() => handleButtonClick("settings")}
                      >
                        <Settings
                          className={`w-5 h-5 ${
                            activeButton === "settings" ? "text-white" : ""
                          }`}
                        />
                        <span className="text-base ">Clients Settings</span>
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
                          src="/logout.svg"
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
                              // filter: "brightness(0) invert(1)",
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
                New Manager Essentials
              </span>
            </div>
          )}

          {isHome && (
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 ml-auto shrink-0">
              {/* User Profile Section */}
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
                                    // filter: "brightness(0) invert(1)",
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

                    <div className="w-7 h-7 sm:w-7 sm:h-7 md:w-7 md:h-7 rounded-full bg-primary-100 border border-gray-300 flex items-center justify-center text-md sm:text-base font-semibold text-primary-700 shrink-0">
                      {userName?.charAt(0).toUpperCase()}
                    </div>

                    <div className="hidden sm:flex flex-col justify-start">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                        {userName?.split(" ")[0]}
                      </span>
                      {isSuperAdmin() && (
                        <span className="text-[10px] sm:text-xs font-medium text-gray-300 leading-tight">
                          Super Admin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {clients[0]?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {clients[0]?.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <CreditCard className="w-4 h-4" />
                          <span>Billing</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <HelpCircle className="w-4 h-4" />
                          <span>Help & Support</span>
                        </button>
                      </div>

                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )} */}
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
              {/* User Profile Section */}
              {isAuthenticated ? (
                <div className="relative">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-7 h-7 sm:w-7 sm:h-7 md:w-7 md:h-7 rounded-full bg-primary-100 border border-gray-300 flex items-center justify-center text-md sm:text-base font-semibold text-primary-700 shrink-0">
                      {userName?.charAt(0).toUpperCase()}
                    </div>

                    <div className="hidden sm:flex flex-col justify-start">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                        {userName?.split(" ")[0]}
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
              {/* User Profile Section */}
              {isAuthenticated ? (
                <div className="relative">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-7 h-7 sm:w-7 sm:h-7 md:w-7 md:h-7 rounded-full bg-primary-100 border border-gray-300 flex items-center justify-center text-md sm:text-base font-semibold text-primary-700 shrink-0">
                      {userName?.charAt(0).toUpperCase()}
                    </div>

                    <div className="hidden sm:flex flex-col justify-start">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                        {userName?.split(" ")[0]}
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
              {/* Mobile Client Dropdown */}
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
              // Don't close if clicking on the button or menu
              if (e.target.closest("[data-user-menu]")) {
                return;
              }
              setIsUserMenuOpen(false);
            }}
          />
        )}

        {/* Invite Dialog */}
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
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
      </div>
    </header>
  );
}

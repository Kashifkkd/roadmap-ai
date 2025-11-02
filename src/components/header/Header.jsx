"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePreviewMode } from "@/contexts/PreviewModeContext";
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  HelpCircle,
  CreditCard,
  Menu,
  X,
  MessageSquare,
  Download,
  UserPlus,
  Users,
  MessagesSquare,
  Pencil,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
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
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const isHome = pathname === "/";
  const isCometManager = pathname?.startsWith("/comet-manager");

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

  useEffect(() => {
    // Mock authentication check - replace with actual auth logic
    setIsAuthenticated(true);
  }, []);

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

  const handleLogoClick = () => {
    router.push("/");
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    router.push("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    console.log("Selected client:", client);
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
      const sessionId = typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

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
        console.log(">>>>>", response)
        // Check for error details in response
        const errorMessage = response?.response?.data?.detail ||
          "Failed to share comet. Please try again.";

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to share comet:", error);
      const errorMessage = error?.response?.data?.detail ||
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
      const sessionId = typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

      if (!sessionId) {
        alert("No comet session found. Please create or open a comet first.");
        setIsPublishing(false);
        return;
      }

      const response = await publishComet(sessionId);

      if (response && response.response && !response.error) {
        toast.success("Comet published successfully!");
      } else {
        const errorResponse = response?.response?.data?.detail || "Failed to publish comet. Please try again."
        toast.error(errorResponse);
      }
    } catch (error) {
      console.error("Failed to publish comet:", error);
    } finally {
      setIsPublishing(false);
    }
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
        src="/Dialog 2.png"
        alt="Feedback"
        width={18}
        height={18}
        className="sm:w-5 sm:h-5"
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
      {/* <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" /> */}
      <span className="hidden sm:inline text-xs sm:text-sm font-medium">
        Invite
      </span>
    </button>
  );

  const RightSectionGeneric = () => (
    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 my-1">
      <div className="hidden sm:block">
        <FeedbackButton
          isActive={isFeedbackActive}
          onClick={handleFeedbackClick}
        />
      </div>
      <button
        onClick={handleDownloadClick}
        className={`hidden md:flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-sm border transition-colors duration-200 shrink-0 ${
          isDownloadActive
            ? "bg-[#E3E1FC] border-[#645AD1] text-primary-600"
            : "bg-[#F5F5F5] border-transparent hover:bg-[#F1F0FE] hover:text-primary-600"
        }`}
      >
        <Image
          src="/download.png"
          alt="Download"
          width={18}
          height={18}
          className="sm:w-5 sm:h-5"
        />
      </button>
      <div className="hidden md:flex">
        <Collaborators />
      </div>
      <InviteButton />
    </div>
  );

  const RightSectionCometManager = () => (
    <div className="flex items-center my-1 gap-1 sm:gap-1.5 md:gap-2 shrink-0">
      {/* Editor Button */}
      <button
        onClick={() => setActiveModeButton("editor")}
        style={{
          transition:
            "width 10s ease-in-out, padding 1.2s ease-in-out, background-color 1.2s ease-in-out, border-color 1.2s ease-in-out, color 1.2s ease-in-out",
          width: activeModeButton === "editor" ? "85px" : "2.8px",
          willChange: "width",
        }}
        className={`hidden md:flex items-center rounded-md border-2 hover:cursor-pointer shrink-0 overflow-hidden ${
          activeModeButton === "editor"
            ? "bg-primary-50 text-primary border-primary-400 px-1.5 sm:px-2 py-1.5 sm:py-2 h-7 sm:h-8 md:h-9"
            : "bg-white text-gray-700 border-transparent h-7 sm:h-8 md:h-9 justify-center p-0 hover:bg-gray-50"
        }`}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            overflow: "hidden",
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
                ? "w-4 sm:w-4 md:w-[16.67px] md:h-[16.67px] text-primary"
                : "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-700"
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
        style={{
          transition:
            "width 10s ease-in-out, padding 10s ease-in-out, background-color 10s ease-in-out, border-color 10s ease-in-out, color 10s ease-in-out",
          width: activeModeButton === "preview" ? "90px" : "28px",
          willChange: "width",
        }}
        className={`flex items-center rounded-md border-2 hover:cursor-pointer shrink-0 overflow-hidden ${
          activeModeButton === "preview"
            ? "bg-primary-50 text-primary border-primary-400 px-1.5 sm:px-2 py-1.5 sm:py-2 h-7 sm:h-8 md:h-9"
            : "bg-gray-50 text-gray-700 border-transparent h-7 sm:h-8 md:h-9 justify-center p-0 hover:bg-gray-100"
        }`}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            overflow: "hidden",
          }}
          className="flex items-center"
        >
          {isPreviewMode ? (
            <Eye
              style={{
                transition: "all 10s ease-in-out",
                flexShrink: 0,
              }}
              className={`${
                activeModeButton === "preview"
                  ? "w-4 sm:w-4 md:w-5 md:h-5 text-primary"
                  : "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-700"
              }`}
            />
          ) : (
            <EyeOff
              style={{
                transition: "all 10s ease-in-out",
                flexShrink: 0,
              }}
              className={`${
                activeModeButton === "preview"
                  ? "w-4 sm:w-4 md:w-5 md:h-5 text-primary"
                  : "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-700"
              }`}
            />
          )}
          <span
            style={{
              transition:
                "opacity 10s ease-in-out, max-width 10s ease-in-out, margin-left 10s ease-in-out",
              whiteSpace: "nowrap",
              maxWidth: activeModeButton === "preview" ? "100px" : "0px",
              opacity: activeModeButton === "preview" ? 1 : 0,
              marginLeft: activeModeButton === "preview" ? "0.375rem" : "0",
              overflow: "hidden",
              flexShrink: 0,
            }}
            className="text-xs sm:text-sm md:text-[14px] font-medium"
          >
            Preview
          </span>
        </div>
      </button>

      {/* Settings Button */}
      <button
        onClick={() => setActiveModeButton("settings")}
        style={{
          transition:
            "width 10s ease-in-out, padding 10s ease-in-out, background-color 10s ease-in-out, border-color 10s ease-in-out, color 10s ease-in-out",
          width: activeModeButton === "settings" ? "95px" : "28px",
          willChange: "width",
        }}
        className={`hidden sm:flex items-center rounded-md border-2 hover:cursor-pointer shrink-0 overflow-hidden ${
          activeModeButton === "settings"
            ? "bg-primary-50 text-primary border-primary-400 px-1.5 sm:px-2 py-1.5 sm:py-2 h-7 sm:h-8 md:h-9"
            : "bg-gray-50 text-gray-700 border-transparent h-7 sm:h-8 md:h-9 justify-center p-0 hover:bg-gray-100"
        }`}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            overflow: "hidden",
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

      <div className="hidden lg:flex">
        <Collaborators />
      </div>
      <InviteButton />
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
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 lg:gap-16 shrink-0 min-w-0">
            <div onClick={handleLogoClick} className="cursor-pointer shrink-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <Image
                  src="/logo.png"
                  alt="Kyper Logo"
                  width={112}
                  height={52}
                // className="w-10 h-10"
                />
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
            )}

            {isHome && (
              <nav className="hidden lg:flex items-stretch gap-6 xl:gap-8 h-10">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.path)}
                    className={`relative font-medium text-base tracking-wide h-full transition-colors duration-300 group ${pathname === item.path
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
            <div className="hidden xl:flex flex-1 items-center justify-center min-w-0 px-2">
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
                      <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-600" />
                      <span className="absolute -top-[2px] -right-[2px] flex h-[10px] min-w-[10px] items-center justify-center rounded-full bg-red-500 px-[3px] text-[8px] leading-none text-white ring-2 ring-white">
                        4
                      </span>
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

                    <div className="w-7 h-7 sm:w-8 sm:h-8 cursor-pointer bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                      <Image
                        src="/profile.png"
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <button
                      onClick={toggleUserMenu}
                      className="flex items-center gap-1.5 sm:gap-2 md:gap-3 cursor-pointer outline-none hover:opacity-80 transition-opacity"
                    >
                      <div className="hidden sm:flex flex-col justify-start">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                          Adam S.
                        </span>
                        <span className="text-[10px] sm:text-xs font-medium text-gray-300 leading-tight">
                          Super Admin
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 shrink-0" />
                    </button>
                  </div>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          Adam S.
                        </p>
                        <p className="text-xs text-gray-500">
                          adam.s@example.com
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
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => router.push("/login")}
                    className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/register")}
                    className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    Sign Up
                  </button>
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
            <div className="ml-auto shrink-0 min-w-0">
              <RightSectionGeneric />
            </div>
          )}

          {isCometManager && (
            <div className="ml-auto shrink-0 min-w-0 max-w-full overflow-hidden">
              <RightSectionCometManager />
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
                  className={`w-full text-left px-3 py-2 font-medium rounded-lg transition-colors ${pathname === item.path
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
            onClick={() => setIsUserMenuOpen(false)}
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

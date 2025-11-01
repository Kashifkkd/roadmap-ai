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
} from "lucide-react";
import Image from "next/image";
import ClientDropdown from "@/components/common/ClientDropdown";
import { getClients } from "@/api/client";

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

  // Small presentational helpers
  const Collaborators = () => (
    <div className="flex items-center">
      {mockCollaborators.map((collaborator, index) => (
        <div
          key={collaborator.id}
          className="relative w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-gray-100"
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
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );

  const FeedbackButton = ({ compact = false }) => (
    <button
      className={`flex items-center gap-2 rounded-md bg-[#ECF7F6] hover:bg-[#E2F2F1] transition-colors text-gray-700 hover:cursor-pointer ${
        compact ? "px-2 py-1" : "px-3 py-2"
      }`}
    >
      <Image src="/Dialog 2.png" alt="" width={20} height={20} />
      {!compact && <span className="text-sm font-medium">Feedback</span>}
    </button>
  );

  const InviteButton = () => (
    <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700">
      <span className="text-sm font-medium">Invite</span>
    </button>
  );

  const RightSectionGeneric = () => (
    <div className="flex items-center gap-3 my-1">
      <FeedbackButton />
      <button className="flex items-center justify-center w-9 h-9 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700">
        {/* <Download className="w-5 h-5" /> */}
        <Image src="/download.png" alt="" width={20} height={20} />
      </button>
      <Collaborators />
      <InviteButton />
    </div>
  );

  const RightSectionCometManager = () => (
    <div className="flex items-center  gap-2 my-1">
      <div
        className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-primary-50 text-primary border-2 border-primary-400 hover:cursor-pointer"
        style={{ width: "80px", height: "36px" }}
      >
        <Pencil className="w-[16.67px] h-[16.67px]" />
        <span className="text-[14px] font-medium">Editor</span>
      </div>
      <button onClick={() => setIsPreviewMode(!isPreviewMode)} className="flex items-center justify-center w-9 h-9 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 hover:cursor-pointer">
        {isPreviewMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
      </button>
      <button className="flex items-center justify-center w-9 h-9 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 hover:cursor-pointer">
        <Settings className="w-5 h-5" />
      </button>
      <div className="hidden md:block">
        <FeedbackButton />
      </div>
      <div className="hidden sm:block">
        <Collaborators />
      </div>
      <InviteButton />
      <button className="px-4 py-2 rounded-md bg-primary hover:bg-primary-dark text-white text-sm font-medium hover:cursor-pointer">
        Publish
      </button>
    </div>
  );

  return (
    <header className="px-2 pt-2 bg-primary-50 border-gray-200 w-full">
      <div className="bg-white px-6 py-1 rounded-lg  w-full">
        <div className="flex items-center justify-between w-full h-full text-base">
          <div className="flex items-center gap-4 sm:gap-8 lg:gap-16">
            {/* Logo */}
            <div onClick={handleLogoClick} className="cursor-pointer">
              <div className="flex items-center gap-2 ml-2">
                <Image
                  src="/logo.png"
                  alt="Kyper Logo"
                  width={112}
                  height={52}
                  // className="w-10 h-10"
                />
              </div>
            </div>

            {/* Client Dropdown */}
            {isAuthenticated && (
              <div className="hidden sm:block">
                <ClientDropdown
                  clients={clients}
                  selectedClient={selectedClient}
                  onClientSelect={handleClientSelect}
                  isLoading={clientsLoading}
                  isError={clientsError}
                />
              </div>
            )}
            {!isHome && (
              <div className=" size-7 cursor-pointer bg-gray-100 rounded-sm flex items-center justify-center -ml-12">
                <Image src="/home.png" alt="" width={20} height={20} />
              </div>
            )}

            {isHome && (
              <nav className="hidden lg:flex items-stretch gap-8 h-10">
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

          {/* Center title for comet-manager */}
          {isCometManager && (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <span
                className="text-primary select-none"
                style={{
                  fontFamily: "Noto Serif",
                  fontWeight: 500,
                  fontSize: "24px",
                  lineHeight: "32px",
                  letterSpacing: "0%",
                }}
              >
                New Manager Essentials
              </span>
            </div>
          )}

          {isHome && (
            <div className="flex items-center gap-2 sm:gap-4 mr-2">
              {/* User Profile Section */}
              {isAuthenticated ? (
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="relative size-6 cursor-pointer bg-gray-100 rounded-full flex items-center justify-center">
                      <Bell className="w-3 h-3 text-gray-600" />
                      <span className="absolute -top-[2px] -right-[2px] flex h-[10px] min-w-[10px] items-center justify-center rounded-full bg-red-500 px-[3px] text-[8px] leading-none text-white ring-2 ring-white">
                        4
                      </span>
                    </div>

                    <div className="size-8 cursor-pointer bg-gray-100 rounded-full flex items-center justify-center">
                      <Image src="/profile.png" alt="" width={32} height={32} />
                    </div>
                    <button
                      onClick={toggleUserMenu}
                      className="flex items-center gap-2 sm:gap-3 cursor-pointer outline-none hover:opacity-80 transition-opacity"
                    >
                      <div className="hidden sm:flex flex-col justify-start">
                        <span className="text-sm font-medium text-gray-700">
                          Adam S.
                        </span>
                        <span className="text-xs font-medium text-gray-300">
                          Super Admin
                        </span>
                      </div>

                      <ChevronDown className="w-4 h-4 text-gray-600" />
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push("/login")}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/register")}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Login
              </button>

              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          )}
          {!isHome && !isCometManager && <RightSectionGeneric />}
          {isCometManager && <RightSectionCometManager />}
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Client Dropdown */}
              {isAuthenticated && (
                <div className="mb-4 pb-4 border-b border-gray-200">
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
            onClick={() => setIsUserMenuOpen(false)}
          />
        )}
      </div>
    </header>
  );
}

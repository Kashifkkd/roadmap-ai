"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import Image from "next/image";
import ClientDropdown from "@/components/common/ClientDropdown";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Mock client data - replace with actual data fetching
  const mockClients = [
    {
      id: 1,
      name: "Jhon Doe",
      image_url: "/logo.png",
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

  // Set default selected client when component mounts
  useEffect(() => {
    if (mockClients.length > 0 && !selectedClient) {
      setSelectedClient(mockClients[0]);
    }
  }, [selectedClient]);

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

  return (
    <header className="px-4 sm:px-6 lg:px-8 bg-white border-b rounded-lg border-gray-200 fixed top-4 left-4 right-4 bottom-10 z-50 h-16">
      <div className="flex items-center justify-between w-full h-full text-base">
        <div className="flex items-center gap-4 sm:gap-8 lg:gap-16">
          {/* Logo */}
          <div onClick={handleLogoClick} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Kyper Logo"
                width={90}
                height={25}
                // className="w-10 h-10"
              />
            </div>
          </div>

          {/* Client Dropdown */}
          {isAuthenticated && (
            <div className="hidden sm:block">
              <ClientDropdown
                clients={mockClients}
                selectedClient={selectedClient}
                onClientSelect={handleClientSelect}
                isLoading={false}
                isError={false}
              />
            </div>
          )}

          {pathname === "/" && (
            <nav className="hidden lg:flex items-stretch gap-8 h-12">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className={`relative font-medium text-sm tracking-wide h-full transition-colors duration-300 group ${
                    pathname === item.path
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {item.name}

                  <span
                    className={`absolute left-1/2 top-0 h-[3px] bg-blue-600 transition-all duration-300 ease-out ${
                      pathname === item.path
                        ? "w-full left-0"
                        : "w-0 group-hover:w-full group-hover:left-0"
                    }`}
                  />
                </button>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Profile Section */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-2 sm:gap-3 cursor-pointer outline-none hover:opacity-80 transition-opacity"
              >
                <div className="hidden sm:flex flex-col justify-start">
                  <span className="text-sm font-medium text-gray-900">
                    Adam S.
                  </span>
                  <span className="text-xs text-gray-500">Super Admin</span>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Adam S.</p>
                    <p className="text-xs text-gray-500">adam.s@example.com</p>
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
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Client Dropdown */}
            {isAuthenticated && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <ClientDropdown
                  clients={mockClients}
                  selectedClient={selectedClient}
                  onClientSelect={handleClientSelect}
                  isLoading={false}
                  isError={false}
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
    </header>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Users,
  Plus,
  ChevronRight,
  Search,
  CircleX,
  Loader2,
  MoreHorizontal,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { isArrayWithValues } from "@/utils/isArrayWithValues";
import ClientSettingsDialog from "@/components/header/ClientSettingsDialog";
import ClientFormFields from "@/components/common/ClientFormFields";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import { useRefreshData, useUpsertClient } from "@/hooks/useQueryData";
import { deleteClient, getClients } from "@/api/client";

function isValidHttpUrl(string) {
  if (!string) return false;
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

export default function ClientDropdown({
  onClientSelect,
  clients = [],
  selectedClient = null,
  isLoading = false,
  isError = false,
}) {
  const { refreshClients } = useRefreshData();
  const [isOpen, setIsOpen] = useState(false);
  const [isAllClientsOpen, setIsAllClientsOpen] = useState(false);
  const [allClients, setAllClients] = useState(clients);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isClientSettingsDialogOpen, setIsClientSettingsDialogOpen] =
    useState(false);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [clientForSettings, setClientForSettings] = useState(null);
  const dropdownRef = useRef(null);
  const allClientsDropdownRef = useRef(null);
  const allClientsButtonRef = useRef(null);

  // track image errors so we can fallback to initials
  const [selectedImageError, setSelectedImageError] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState({}); // { [id]: true }

  // Add Client form ref and state
  const clientFormRef = useRef(null);
  const { mutateAsync: upsertClient, isPending: saving } = useUpsertClient();
  const [formResetKey, setFormResetKey] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsAllClientsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // whenever selected client changes, reset its error
    setSelectedImageError(false);
  }, [selectedClient?.id, selectedClient?.ImageUrl]);

  useEffect(() => {
    setAllClients(clients);
  }, [clients]);

  const handleClientClick = (client) => {
    setIsOpen(false);
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const getClientInitial = (client) => {
    const name = client?.name || "";
    return name.charAt(0).toUpperCase() || "?";
  };

  const handleListImageError = (clientId) => {
    if (!clientId) return;
    setImageErrorMap((prev) => ({
      ...prev,
      [clientId]: true,
    }));
  };

  const handleAllClientsClick = async () => {
    const nextOpenState = !isAllClientsOpen;
    setIsAllClientsOpen(nextOpenState);
    setSearchQuery("");
  };

  const handleAllClientsClientClick = (client) => {
    setIsAllClientsOpen(false);
    setSearchQuery("");
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddClientDialogOpen) {
      setFormResetKey((prev) => prev + 1);
    }
  }, [isAddClientDialogOpen]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (!isAllClientsOpen) return;

    const fetchClients = async () => {
      try {
        const res = await getClients({
          skip: 0,
          limit: 500,
          enabledOnly: true,
          search: debouncedSearchQuery,
        });
        setAllClients(res?.response || []);
      } catch (error) {
        console.error("Failed to load clients", error);
        toast.error("Unable to load clients");
      }
    };

    fetchClients();
  }, [isAllClientsOpen, debouncedSearchQuery]);

  const handleAddClient = async () => {
    if (!clientFormRef.current) return;

    try {
      const formData = await clientFormRef.current.getFormData();
      if (!formData) return;

      // Backend requires an integer id even on create; use 0 for new clients
      const payload = { id: formData.id ?? 0, ...formData };

      const response = await upsertClient(payload);

      if (response) {
        toast.success("Client created successfully");
        refreshClients();
        setIsAddClientDialogOpen(false);
      } else {
        const errorMessage =
          response?.detail || response?.message || "Failed to create client";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to create client:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        error?.response?.detail ||
        "Failed to create client";
      toast.error(errorMessage);
    }
  };
  const handleDeleteClient = async (clientId) => {
    const response = await deleteClient(clientId);
    if (response?.success) {
      toast.success("Client deleted successfully");
      refreshClients();
    } else {
      toast.error("Failed to delete client");
    }
  };

  const isDialogLoading =
    clientFormRef.current?.isLoading?.() || false || saving;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        disabled={isLoading}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 sm:py-2 bg-background border-none shadow-none rounded-lg text-xs sm:text-sm font-medium text-gray-800 hover:bg-background active:bg-background disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <div className="w-7 h-7 sm:w-7 sm:h-7 md:w-7 md:h-7 rounded-full bg-primary-100 border border-gray-300 flex items-center justify-center text-md sm:text-base font-semibold text-primary-700 shrink-0 overflow-hidden">
          {selectedClient &&
          isValidHttpUrl(selectedClient.image_url) &&
          !selectedImageError ? (
            <img
              src={selectedClient.image_url}
              alt={selectedClient?.name || "Client"}
              className="rounded-full object-cover w-full h-full"
              onError={() => setSelectedImageError(true)}
            />
          ) : (
            <span className="text-sm font-semibold text-primary-700">
              {getClientInitial(selectedClient)}
            </span>
          )}
        </div>

        <span className="max-w-[80px] sm:max-w-[100px] md:max-w-[120px] lg:max-w-[150px] text-sm sm:text-base md:text-[18px] font-semibold truncate leading-tight sm:leading-[28px]">
          {selectedClient?.name}
        </span>

        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 md:size-6 bg-gray-100 rounded-full shrink-0 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <ChevronDown
            strokeWidth={1.5}
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-[#1C274C]"
          />
        </div>
      </Button>

      {isOpen && !isLoading && !isError && (
        <div className="absolute top-full mt-2 right-0 w-44 sm:w-48 md:w-56 bg-background rounded-md shadow-xl overflow-visible no-scrollbar z-60">
          <div className="flex flex-col p-1.5 sm:p-2 gap-1.5 sm:gap-2 max-h-80 overflow-y-auto">
            {clients.length === 0 ? (
              <div className="py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground">
                No clients found
              </div>
            ) : (
              isArrayWithValues(clients) &&
              clients.map((client) => {
                const hasImg =
                  client &&
                  isValidHttpUrl(client.image_url) &&
                  !imageErrorMap[client.id];

                return (
                  <Button
                    key={client?.id || client?.name}
                    onClick={() => handleClientClick(client)}
                    className="flex justify-start items-center gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-background border-none shadow-none rounded text-left hover:bg-background active:bg-background cursor-pointer"
                  >
                    <div className="w-7 h-7 sm:w-7 sm:h-7 md:w-7 md:h-7 rounded-full bg-primary-100 border border-gray-300 flex items-center justify-center text-sm sm:text-base font-semibold text-primary-700 shrink-0 overflow-hidden">
                      {hasImg ? (
                        <img
                          src={client.image_url}
                          alt={client?.name || "Client"}
                          className="rounded-full object-cover w-full h-full"
                          onError={() => handleListImageError(client.id)}
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary-700">
                          {getClientInitial(client)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 truncate">
                      {client?.name}
                    </span>
                  </Button>
                );
              })
            )}
          </div>
          <div className="border-t mx-3 py-2 border-gray-200">
            <div
              ref={allClientsButtonRef}
              className="px-4 py-2 hover:bg-primary-50 rounded-md items-center flex justify-between cursor-pointer relative"
              onClick={handleAllClientsClick}
            >
              <button className="w-full flex items-center ">
                <Users className="w-4 h-4 mr-2" />
                All Clients
              </button>
              <ChevronRight className="w-5 h-5" />

              {/* All Clients Dropdown - Opens to the right */}
              {isAllClientsOpen && (
                <div
                  ref={allClientsDropdownRef}
                  className="absolute left-full ml-4 w-64 bg-background rounded-md shadow-xl overflow-hidden z-60"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Search Bar */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <Input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Clients List */}
                  <div className="flex flex-col p-1.5 gap-1.5 max-h-80 overflow-y-auto">
                    {allClients.length === 0 ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        {searchQuery.trim()
                          ? `No clients found matching "${searchQuery}"`
                          : "No clients found"}
                      </div>
                    ) : (
                      isArrayWithValues(allClients) &&
                      allClients.map((client) => {
                        const hasImg =
                          client &&
                          isValidHttpUrl(client.image_url) &&
                          !imageErrorMap[client.id];

                        return (
                          <div
                            key={client?.id || client?.name}
                            className="flex items-center gap-2 px-3 py-2 bg-background border-none shadow-none rounded text-left hover:bg-primary-50 active:bg-gray-100"
                          >
                            <div
                              onClick={() =>
                                handleAllClientsClientClick(client)
                              }
                              className="flex items-center gap-2 flex-1 cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-full bg-primary-100 border border-gray-300 flex items-center justify-center text-sm font-semibold text-primary-700 shrink-0 overflow-hidden ">
                                {hasImg ? (
                                  <img
                                    src={client.image_url}
                                    alt={client?.name || "Client"}
                                    className="rounded-full object-cover w-full h-full"
                                    onError={() =>
                                      handleListImageError(client.id)
                                    }
                                  />
                                ) : (
                                  <span className="text-sm font-semibold text-primary-700">
                                    {getClientInitial(client)}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-semibold text-gray-900 truncate">
                                {client?.name}
                              </span>
                            </div>
                            <div
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-gray-400 hover:text-gray-600 ml-auto"
                                  >
                                    <MoreVertical className="w-5 h-5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="start"
                                  className="w-32 rounded-lg bg-white border border-gray-200 shadow-lg p-1 z-70"
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      console.log(
                                        "Setting onClick fired",
                                        client
                                      );
                                      const selectedClient = client;
                                      setIsAllClientsOpen(false);
                                      setIsOpen(false);
                                      setClientForSettings(selectedClient);
                                      setIsClientSettingsDialogOpen(true);
                                    }}
                                    className="cursor-pointer px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 rounded-md focus:bg-primary-50"
                                  >
                                    Setting
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      console.log(
                                        "Deactivate onClick fired",
                                        client
                                      );
                                      const clientId = client.id;
                                      setIsAllClientsOpen(false);
                                      setIsOpen(false);
                                      handleDeleteClient(clientId);
                                    }}
                                    className="cursor-pointer px-3 py-2 text-sm text-black hover:bg-[#574EB6] rounded-md focus:bg-[#574EB6] mt-1"
                                  >
                                    Deactivate
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-2 hover:bg-primary-50 rounded-md">
              <button
                className="w-full flex items-center gap-2"
                onClick={() => {
                  setIsOpen(false);
                  setIsAddClientDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </button>
            </div>
            <div className="px-4 py-2 hover:bg-primary-50 rounded-md">
              <button
                className="w-full  flex items-center gap-2"
                onClick={() => {
                  setIsOpen(false);
                  setIsClientSettingsDialogOpen(true);
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Client Settings
              </button>
            </div>
          </div>
        </div>
      )}
      <ClientSettingsDialog
        open={isClientSettingsDialogOpen}
        onOpenChange={(open) => {
          setIsClientSettingsDialogOpen(open);
          if (!open) {
            setClientForSettings(null);
          }
        }}
        selectedClient={clientForSettings || selectedClient}
      />

      {/* Add Client Dialog */}
      <Dialog
        open={isAddClientDialogOpen}
        onOpenChange={setIsAddClientDialogOpen}
      >
        <DialogContent className="max-w-[700px] max-h-[85vh] border-0 bg-transparent p-0 shadow-none overflow-hidden [&>button]:hidden ">
          <VisuallyHidden>
            <DialogTitle>Add Client</DialogTitle>
          </VisuallyHidden>
          <div className="rounded-[32px] bg-white overflow-hidden flex flex-col max-h-[85vh] relative">
            {/* Loader */}
            {isDialogLoading && (
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
              <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-gray-200 shrink-0">
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Client
                </h2>
                <button onClick={() => setIsAddClientDialogOpen(false)}>
                  <CircleX className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content Area */}
              <div className="p-2 bg-gray-100 rounded-lg m-2 flex flex-col flex-1 min-h-0">
                <div className="flex-1 p-4 rounded-t-lg bg-white overflow-y-auto">
                  <ClientFormFields
                    ref={clientFormRef}
                    resetKey={formResetKey}
                  />
                </div>
                {/*  Footer */}
                <div className="flex justify-end px-6 py-3 border-t border-gray-200 shrink-0 bg-white rounded-b-[24px]">
                  <Button
                    type="button"
                    onClick={handleAddClient}
                    disabled={saving || isDialogLoading}
                    className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Add Client"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

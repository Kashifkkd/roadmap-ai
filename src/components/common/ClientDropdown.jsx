"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { isArrayWithValues } from "@/utils/isArrayWithValues";

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // track image errors so we can fallback to initials
  const [selectedImageError, setSelectedImageError] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState({}); // { [id]: true }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // whenever selected client changes, reset its error
    setSelectedImageError(false);
  }, [selectedClient?.id, selectedClient?.image_url]);

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
        <div className="absolute top-full mt-2 right-0 w-44 sm:w-48 md:w-56 bg-background rounded-md shadow-xl overflow-hidden no-scrollbar z-50">
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
        </div>
      )}
    </div>
  );
}

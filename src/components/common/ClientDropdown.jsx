"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { isArrayWithValues } from "@/utils/isArrayWithValues";

function isValidHttpUrl(string) {
  if (!string) return false;
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClientClick = (client) => {
    setIsOpen(false);
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const getDisplayText = () => {
    if (selectedClient) return selectedClient?.name;
    if (isLoading) return "Loading...";
    if (isError) return "Error loading clients";
    if (isArrayWithValues(clients)) return clients[0]?.name || "Select Client";
    return "No clients available";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-background border-none shadow-none rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-primary-100"
      >
        {(
          isValidHttpUrl(selectedClient?.image_url)
          || (isArrayWithValues(clients) && isValidHttpUrl(clients[0]?.image_url))
        ) ? (
          <Image
            src={selectedClient?.image_url || clients[0]?.image_url}
            alt={selectedClient?.name || clients[0]?.name || 'Client profile image'}
            width={24}
            height={24}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <Image
            src="/profile.png"
            alt={selectedClient?.name || clients[0]?.name || 'Client profile image'}
            width={24}
            height={24}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-gray-300"
          />
        )}
        <span className="max-w-[80px] sm:max-w-[120px] md:max-w-[150px] text-sm sm:text-base md:text-lg font-bold truncate">
          {getDisplayText()}
        </span>
        <div className="flex items-center justify-center size-5 sm:size-6 bg-gray-100 rounded-full">
          <ChevronDown
            strokeWidth={1.5}
            className="w-3 h-3 sm:w-4 sm:h-4 text-[#1C274C]"
          />
        </div>
      </Button>

      {isOpen && !isLoading && !isError && (
        <div className="absolute top-full mt-2 left-0 w-48 sm:w-56 bg-background rounded-md shadow-xl overflow-hidden no-scrollbar z-50">
          <div className="flex flex-col p-2 gap-2 max-h-80 overflow-y-auto">
            {clients.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No clients found
              </div>
            ) : (
              isArrayWithValues(clients) &&
              clients.map((client) => (
                <Button
                  key={client?.id}
                  onClick={() => handleClientClick(client)}
                  className="flex justify-start items-start gap-2 px-3 sm:px-4 py-2 bg-background border-none shadow-none hover:bg-primary-100 rounded transition-colors text-left"
                >
                  {isValidHttpUrl(client?.image_url) ? (
                    <Image
                      src={client?.image_url}
                      alt={client?.name || 'Client profile image'}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-gray-300 shrink-0"
                      width={24}
                      height={24}
                    />
                  ) : (
                    <Image
                      src="/profile.png"
                      alt={client?.name || 'Client profile image'}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-gray-300 shrink-0"
                      width={24}
                      height={24}
                    />
                  )}
                  <span className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                    {client?.name}
                  </span>
                </Button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

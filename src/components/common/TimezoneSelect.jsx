"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export const MAJOR_TIMEZONES = [
  { id: "UTC", abbr: "UTC", name: "Coordinated Universal Time" },
  { id: "Asia/Kolkata", abbr: "IST", name: "India Standard Time" },
  { id: "Asia/Singapore", abbr: "SGT", name: "Singapore Time" },
  { id: "Europe/Paris", abbr: "CET", name: "Central European Time" },
  { id: "Europe/London", abbr: "GMT", name: "Greenwich Mean Time" },
  { id: "America/New_York", abbr: "EST", name: "Eastern Time" },
  { id: "America/Chicago", abbr: "CST", name: "Central Time" },
  { id: "America/Denver", abbr: "MST", name: "Mountain Time" },
  { id: "America/Los_Angeles", abbr: "PST", name: "Pacific Time" },
  { id: "Asia/Tokyo", abbr: "JST", name: "Japan Standard Time" },
  { id: "Asia/Hong_Kong", abbr: "HKT", name: "Hong Kong Time" },
  { id: "Asia/Dubai", abbr: "GST", name: "Gulf Standard Time" },
  { id: "Australia/Sydney", abbr: "AEST", name: "Australian Eastern Time" },
  { id: "America/Sao_Paulo", abbr: "BRT", name: "Brasília Time" },
  { id: "Africa/Johannesburg", abbr: "SAST", name: "South Africa Standard Time" },
];

export function getUtcOffset(timeZone) {
  try {
    const date = new Date();
    const utc = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
    );
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const get = (type) =>
      Number(parts.find((part) => part.type === type)?.value || 0);
    const tzAsUtc = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
    );
    const diffMinutes = Math.round((tzAsUtc - utc) / 60000);
    const sign = diffMinutes >= 0 ? "+" : "-";
    const abs = Math.abs(diffMinutes);
    const hours = Math.floor(abs / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (abs % 60).toString().padStart(2, "0");
    return `${sign}${hours}:${minutes}`;
  } catch {
    return "+00:00";
  }
}

export function findTimezoneById(id) {
  return (
    MAJOR_TIMEZONES.find((tz) => tz.id === id) || {
      id: id || "UTC",
      abbr: id || "UTC",
      name: id || "Coordinated Universal Time",
    }
  );
}

export function formatTimezoneLabel(tz, { compact = false } = {}) {
  const offset = getUtcOffset(tz.id);
  if (compact) {
    return `${tz.abbr} ${offset}`;
  }
  return `${tz.abbr} - ${tz.name} ${offset}`;
}

export function resolveDefaultTimezone() {
  if (typeof Intl === "undefined") return "UTC";
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (MAJOR_TIMEZONES.some((tz) => tz.id === detected)) {
    return detected;
  }
  if (detected === "Asia/Calcutta") return "Asia/Kolkata";
  return "UTC";
}

export default function TimezoneSelect({ value, onChange, triggerClassName = "" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const selected = findTimezoneById(value || "UTC");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return MAJOR_TIMEZONES;
    return MAJOR_TIMEZONES.filter((tz) => {
      const offset = getUtcOffset(tz.id);
      return (
        tz.abbr.toLowerCase().includes(query) ||
        tz.name.toLowerCase().includes(query) ||
        tz.id.toLowerCase().includes(query) ||
        offset.includes(query)
      );
    });
  }, [search]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-10 w-full items-center justify-between rounded-lg border-2 border-gray-200 bg-white px-3 text-sm text-gray-800 ${triggerClassName}`}
      >
        <span className="truncate text-left">
          {formatTimezoneLabel(selected)}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-200 p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                className="h-9 border-gray-200 pl-9"
                autoFocus
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.map((tz) => (
              <li key={tz.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(tz.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span className="truncate text-left">
                    {tz.abbr} - {tz.name}
                  </span>
                  <span className="shrink-0 text-gray-500">
                    {getUtcOffset(tz.id)}
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

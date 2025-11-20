"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Users,
  BarChart3,
  Info,
  Calendar,
  Clock,
  CircleX,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { graphqlClient } from "@/lib/graphql-client";

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, label, showInfo = false }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium text-gray-800">{label}</Label>
      {showInfo && (
        <Info
          size={16}
          className="text-gray-500 cursor-help"
          title="Information about this field"
        />
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? "bg-primary" : "bg-gray-300"
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

export default function CometSettingsDialog({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("general");
  const [cometTitle, setCometTitle] = useState("");
  const [description, setDescription] = useState("");
  const [learningFrequency, setLearningFrequency] = useState("Daily");
  const [kickOffDate, setKickOffDate] = useState("2025-11-28");
  const [kickOffTime, setKickOffTime] = useState("14:20");
  const [habitEnabled, setHabitEnabled] = useState(true);
  const [habitText, setHabitText] = useState("");
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
  const [colorLogo, setColorLogo] = useState(null);
  const [whiteLogo, setWhiteLogo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("sessionData");
    if (data) {
      const sessionData = JSON.parse(data);
      console.log("sessionData", sessionData);
      setCometTitle(
        sessionData?.comet_creation_data?.["Basic Information"]?.[
          "Comet Title"
        ] || ""
      );
      setDescription(
        sessionData?.comet_creation_data?.["Basic Information"]?.Description ||
          ""
      );
    }

    // Load saved comet settings
    const savedSettings = localStorage.getItem("cometSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setHabitEnabled(settings.habit_enabled ?? true);
      setHabitText(settings.habit_description || "");
      setPersonalizationEnabled(settings.personalization_enabled ?? true);
    }
  }, []); // Empty dependency array means this runs only once when component mounts

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const sessionDataRaw = localStorage.getItem("sessionData");
      if (!sessionDataRaw) {
        console.error("No session data found");
        setIsSaving(false);
        return;
      }

      const sessionData = JSON.parse(sessionDataRaw);
      const sessionId =
        sessionData?.session_id ||
        (typeof window !== "undefined" && localStorage.getItem("sessionId")) ||
        null;

      if (!sessionId) {
        console.error("No session ID available for auto-save");
        setIsSaving(false);
        return;
      }

      // Update comet creation data for the comet settings
      const updatedCometCreationData = {
        ...(sessionData?.comet_creation_data || {}),
        "Basic Information": {
          ...(sessionData?.comet_creation_data?.["Basic Information"] || {}),
          "Comet Title": cometTitle,
          Description: description,
        },
        // Settings: {
        //   ...(sessionData?.comet_creation_data?.Settings || {}),
        //   "Learning Frequency": learningFrequency,
        //   "Kick off Date": kickOffDate,
        //   "Kick off Time": kickOffTime,
        //   Habit: {
        //     enabled: habitEnabled,
        //     text: habitText,
        //   },
        //   Personalization: {
        //     enabled: personalizationEnabled,
        //     colorLogo: colorLogo ? colorLogo.name : null,
        //     whiteLogo: whiteLogo ? whiteLogo.name : null,
        //   },
        // },
      };

      const cometJsonForSave = JSON.stringify({
        session_id: sessionId,
        input_type: "source_material_based_outliner",
        comet_creation_data: updatedCometCreationData,
        response_outline: sessionData?.response_outline || {},
        response_path: sessionData?.response_path || {},
        additional_data: {
          personalization_enabled: personalizationEnabled,
          habit_enabled: habitEnabled,
          habit_description: habitText || "",
        },
        chatbot_conversation: sessionData?.chatbot_conversation || [],
        to_modify: sessionData?.to_modify || {},
      });

      const response = await graphqlClient.autoSaveComet(cometJsonForSave);

      if (response && response?.autoSaveComet) {
        const updatedSessionData = {
          ...sessionData,
          comet_creation_data: updatedCometCreationData,
        };
        localStorage.setItem("sessionData", JSON.stringify(updatedSessionData));

        // Save comet settings
        localStorage.setItem(
          "cometSettings",
          JSON.stringify({
            personalization_enabled: personalizationEnabled,
            habit_enabled: habitEnabled,
            habit_description: habitText,
          })
        );
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving comet settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleColorLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setColorLogo(file);
    }
  };

  const handleWhiteLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setWhiteLogo(file);
    }
  };

  const brandColors = [
    { name: "Title", hex: "#654845", color: "#8B5CF6" }, // Purple
    { name: "Title", hex: "#654845", color: "#EC4899" }, // Pink/Magenta
    { name: "Title", hex: "#654845", color: "#84CC16" }, // Lime Green
    { name: "Title", hex: "#654845", color: "#14B8A6" }, // Teal/Cyan
    { name: "Title", hex: "#654845", color: "#EAB308" }, // Yellow
    { name: "Title", hex: "#654845", color: "#16A34A" }, // Dark Green
  ];

  // Formated time
  const formatTimeForDisplay = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? "PM" : "AM";
    return `${hour12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  };

  // Formated date
  const formatDateForDisplay = (dateStr) => {
    const date = new Date(dateStr);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full max-w-[998px] max-h-[90vh] md:max-h-[580px] p-1.5 sm:p-2 border-0 bg-white rounded-[20px] sm:rounded-[28px] shadow-[0_20px_70px_rgba(30,30,50,0.2)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-5 py-3 sm:py-4 md:py-5 border-gray-200">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
            Comet Settings
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
          >
            <CircleX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden p-1.5 sm:p-2 bg-gray-100 rounded-lg gap-1.5 sm:gap-2">
          {/* Navigation */}
          <div className="md:w-60 bg-white rounded-lg border-gray-200 px-2 sm:px-3 md:px-5 py-3 sm:py-4 md:py-6 space-y-2 overflow-x-auto md:overflow-x-visible">
            <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
              <button
                onClick={() => setActiveTab("general")}
                className={`w-full flex items-center gap-2 md:gap-3 rounded-sm px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-3 text-xs sm:text-sm md:text-[15px] font-medium transition-all whitespace-nowrap ${
                  activeTab === "general"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                <FileText
                  size={18}
                  className={
                    activeTab === "general" ? "text-white" : "text-gray-500"
                  }
                />
                <span className="hidden md:inline">General Info</span>
                <span className="md:hidden">General</span>
              </button>

              <button
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center gap-2 md:gap-3 rounded-sm px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-3 text-xs sm:text-sm md:text-[15px] font-medium transition-all whitespace-nowrap ${
                  activeTab === "users"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                <Users
                  size={18}
                  className={
                    activeTab === "users" ? "text-white" : "text-gray-500"
                  }
                />
                Users
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center gap-2 md:gap-3 rounded-sm px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-3 text-xs sm:text-sm md:text-[15px] font-medium transition-all whitespace-nowrap ${
                  activeTab === "analytics"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                <BarChart3
                  size={18}
                  className={
                    activeTab === "analytics" ? "text-white" : "text-gray-500"
                  }
                />
                Analytics
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white rounded-lg flex flex-col overflow-hidden">
            {activeTab === "general" && (
              <div className="overflow-y-auto h-full flex flex-col">
                <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 lg:px-7 py-3 sm:py-4 md:py-6">
                  <div className="space-y-4 md:space-y-5">
                    {/* Comet Title */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="comet-title"
                        className="text-sm font-medium text-gray-700"
                      >
                        Comet Title<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="comet-title"
                        value={cometTitle}
                        onChange={(e) => setCometTitle(e.target.value)}
                        placeholder="Enter comet title"
                        className="w-full"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium text-gray-700"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description"
                        rows={4}
                        className="w-full resize-none"
                      />
                    </div>

                    {/* Learning Frequency */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4 lg:gap-5">
                      <div className="space-y-2.5">
                        <Label className="text-sm font-medium text-gray-700 block">
                          Learning Frequency
                        </Label>
                        <Select
                          value={learningFrequency}
                          onValueChange={setLearningFrequency}
                        >
                          <SelectTrigger className="w-full h-11 rounded-xl text-sm">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2.5">
                        <Label className="text-sm font-medium text-gray-700 block">
                          Kick off Date
                        </Label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={kickOffDate}
                            onChange={(e) => setKickOffDate(e.target.value)}
                            className="w-full h-11 rounded-xl pr-10 text-sm"
                          />
                          <Calendar
                            size={18}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none hidden sm:block"
                          />
                        </div>
                        {/* <p className="text-xs text-gray-500">
                          {formatDateForDisplay(kickOffDate)}
                        </p> */}
                      </div>

                      <div className="space-y-2.5">
                        <Label className="text-sm font-medium text-gray-700 block">
                          Kick off Time
                        </Label>
                        <div className="relative">
                          <Input
                            type="time"
                            value={kickOffTime}
                            onChange={(e) => setKickOffTime(e.target.value)}
                            className="w-full h-11 rounded-xl pr-10 text-sm"
                          />
                          <Clock
                            size={18}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none hidden sm:block"
                          />
                        </div>
                        {/* <p className="text-xs text-gray-500">
                          {formatTimeForDisplay(kickOffTime)}
                        </p> */}
                      </div>
                    </div>

                    {/* Habit Section */}
                    <div className="space-y-3">
                      <ToggleSwitch
                        checked={habitEnabled}
                        onChange={setHabitEnabled}
                        label="Habit"
                        showInfo={true}
                      />
                      {habitEnabled && (
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                          <Textarea
                            value={habitText}
                            onChange={(e) => setHabitText(e.target.value)}
                            placeholder="Enter habit details..."
                            rows={4}
                            className="w-full resize-none border-gray-200 focus-visible:ring-0"
                          />
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
                            >
                              Generate Habit
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Personalization Section */}
                    <div className="space-y-4">
                      <ToggleSwitch
                        checked={personalizationEnabled}
                        onChange={setPersonalizationEnabled}
                        label="Personalization"
                      />
                      {personalizationEnabled && (
                        <>
                          {/* Logo uploads */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Color Logo (Upload PNG)
                              </Label>
                              <div className="p-2 bg-gray-100 rounded-2xl">
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer bg-white">
                                  <input
                                    type="file"
                                    accept="image/png"
                                    onChange={handleColorLogoUpload}
                                    className="hidden"
                                    id="color-logo-upload"
                                  />
                                  <label
                                    htmlFor="color-logo-upload"
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                  >
                                    {colorLogo ? (
                                      <span className="text-sm text-gray-700">
                                        {colorLogo.name}
                                      </span>
                                    ) : (
                                      <>
                                        <span className="text-sm text-gray-600">
                                          Upload PNG
                                        </span>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="border-primary text-primary hover:bg-primary hover:text-white"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            document
                                              .getElementById(
                                                "color-logo-upload"
                                              )
                                              ?.click();
                                          }}
                                        >
                                          + Browse
                                        </Button>
                                      </>
                                    )}
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                White Logo (Upload PNG)
                              </Label>
                              <div className="p-2 bg-gray-100 rounded-2xl">
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer bg-white">
                                  <input
                                    type="file"
                                    accept="image/png"
                                    onChange={handleWhiteLogoUpload}
                                    className="hidden"
                                    id="white-logo-upload"
                                  />
                                  <label
                                    htmlFor="white-logo-upload"
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                  >
                                    {whiteLogo ? (
                                      <span className="text-sm text-gray-700">
                                        {whiteLogo.name}
                                      </span>
                                    ) : (
                                      <>
                                        <span className="text-sm text-gray-600">
                                          Upload PNG
                                        </span>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="border-primary text-primary hover:bg-primary hover:text-white"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            document
                                              .getElementById(
                                                "white-logo-upload"
                                              )
                                              ?.click();
                                          }}
                                        >
                                          + Browse
                                        </Button>
                                      </>
                                    )}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Brand Colors */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Brand Colors
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
                              {brandColors.map((color, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl"
                                >
                                  <div
                                    className="w-18 h-10 rounded border border-gray-300"
                                    style={{ backgroundColor: color.color }}
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700">
                                      {color.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {color.hex}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="border-t-3 rounded-b-lg border-gray-100 px-3 sm:px-4 md:px-6 lg:px-7 py-2 sm:py-2.5 flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary-dark px-6 sm:px-8 md:px-10 py-2 rounded-lg text-sm font-medium w-full sm:w-auto min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="text-center text-gray-500 py-12">
                Users content will be displayed here
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="text-center text-gray-500 py-12">
                Analytics content will be displayed here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

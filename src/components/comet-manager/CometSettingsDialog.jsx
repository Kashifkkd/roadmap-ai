"use client";

import React, { useState, useEffect } from "react";
import {
  Info,
  Calendar,
  Clock,
  CircleX,
  Plus,
  Trash2,
  FileText,
  Users,
  BarChart3,
  Search,
  MoreVertical,
  ArrowLeft,
  Eye,
  EyeOff,
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
  const [activeTab, setActiveTab] = useState("comet-info");
  const [cometTitle, setCometTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(null);

  // Configuration Settings
  const [learningFrequency, setLearningFrequency] = useState("Daily");
  const [language, setLanguage] = useState("English");
  const [managerEmailEnabled, setManagerEmailEnabled] = useState("Yes");
  const [
    accountabilityPartnersEmailEnabled,
    setAccountabilityPartnersEmailEnabled,
  ] = useState("Yes");
  const [showUserEmail, setShowUserEmail] = useState("Yes");
  const [enableCalendarInvites, setEnableCalendarInvites] = useState("Yes");
  const [leaderboardEnabled, setLeaderboardEnabled] = useState("Yes");
  const [leaderboardEntryAmount, setLeaderboardEntryAmount] = useState("25");
  const [enableCommunity, setEnableCommunity] = useState("Yes");
  const [enableFeedback, setEnableFeedback] = useState("Yes");
  const [secureLinks, setSecureLinks] = useState("No");
  const [enableActionHub, setEnableActionHub] = useState("Yes");

  // Kick Off
  const [kickOffDates, setKickOffDates] = useState([
    { date: "2025-11-12", time: "12:30" },
    { date: "2025-11-12", time: "12:30" },
    { date: "2025-11-12", time: "12:30" },
  ]);
  const [newKickOffDate, setNewKickOffDate] = useState("2025-11-28");
  const [newKickOffTime, setNewKickOffTime] = useState("14:20");

  // Toggles
  const [habitEnabled, setHabitEnabled] = useState(true);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  // Users tab state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [makeAvailableToAll, setMakeAvailableToAll] = useState(true);
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  // Add User form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentComet, setCurrentComet] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john.doe@example.com", kickoff: "Yes" },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      kickoff: "No",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      kickoff: "Yes",
    },
    {
      id: 4,
      name: "Alice Williams",
      email: "alice.williams@example.com",
      kickoff: "No",
    },
    {
      id: 5,
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      kickoff: "Yes",
    },
  ]);

  useEffect(() => {
    if (!open) return;

    const data = localStorage.getItem("sessionData");
    if (data) {
      const sessionData = JSON.parse(data);
      // console.log("sessionData", sessionData);
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
      setPersonalizationEnabled(settings.personalization_enabled ?? true);
    }
  }, [open]); // Reload data when dialog open

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

  const handleCoverImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
    }
  };

  const handleAddKickOff = () => {
    if (newKickOffDate && newKickOffTime) {
      setKickOffDates([
        ...kickOffDates,
        { date: newKickOffDate, time: newKickOffTime },
      ]);
      setNewKickOffDate("2025-11-28");
      setNewKickOffTime("14:20");
    }
  };

  const handleRemoveKickOff = (index) => {
    setKickOffDates(kickOffDates.filter((_, i) => i !== index));
  };

  const brandColors = [
    { name: "Title", hex: "#654845", color: "#8B5CF6" }, // Purple
    { name: "Title", hex: "#654845", color: "#84CC16" }, // Lime Green
    { name: "Title", hex: "#654845", color: "#F97316" }, // Orange
    { name: "Title", hex: "#654845", color: "#14B8A6" }, // Teal
    { name: "Title", hex: "#654845", color: "#EC4899" }, // Magenta
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
          {/* Navigation Panel - Left Side */}
          <div className="md:w-60 bg-white rounded-lg border-gray-200 px-2 sm:px-3 md:px-5 py-3 sm:py-4 md:py-6 space-y-2 overflow-x-auto md:overflow-x-visible">
            <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
              <button
                onClick={() => {
                  setActiveTab("comet-info");
                  setSelectedUser(null);
                  setShowAddUserForm(false);
                }}
                className={`w-full flex items-center gap-2 md:gap-3 rounded-sm px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-3 text-xs sm:text-sm md:text-[15px] font-medium transition-all whitespace-nowrap ${
                  activeTab === "comet-info"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                <FileText
                  size={18}
                  className={
                    activeTab === "comet-info" ? "text-white" : "text-gray-500"
                  }
                />
                <span className="hidden md:inline">Comet Info</span>
                <span className="md:hidden">Info</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("users");
                  setSelectedUser(null);
                  setShowAddUserForm(false);
                }}
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
                onClick={() => {
                  setActiveTab("analytics");
                  setSelectedUser(null);
                  setShowAddUserForm(false);
                }}
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

          {/* Content Area - Right Side */}
          <div className="flex-1 bg-white rounded-lg flex flex-col overflow-hidden">
            {activeTab === "comet-info" && (
              <div className="overflow-y-auto h-full flex flex-col">
                <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 lg:px-7 py-3 sm:py-4 md:py-6">
                  <div className="space-y-4 md:space-y-5">
                    {/* Comet Title */}
                    <div className="space-y-4 flex flex-row gap-2 w-full">
                      <div className="flex flex-col gap-2 w-1/2">
                        <div className="space-y-2 ">
                          <Label
                            htmlFor="comet-title"
                            className="text-sm font-medium text-gray-700"
                          >
                            Comet Title
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            id="comet-title"
                            value={cometTitle}
                            onChange={(e) => setCometTitle(e.target.value)}
                            placeholder="Enter comet title"
                            className="w-full rounded-lg border-gray-300"
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
                            className="w-full resize-none rounded-lg border-gray-300"
                          />
                        </div>
                      </div>

                      {/* Comet Cover Image */}
                      <div className="space-y-2 w-1/2 ">
                        <Label className="text-sm font-medium text-gray-700">
                          Comet Cover Image
                        </Label>
                        <div className="w-full p-2 bg-gray-100 rounded-lg">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverImageUpload}
                              className="hidden"
                              id="cover-image-upload"
                            />
                            <label
                              htmlFor="cover-image-upload"
                              className="cursor-pointer flex flex-col items-center gap-3"
                            >
                              <span className="text-sm text-gray-600">
                                Upload Image
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                className="border-primary text-primary hover:bg-primary hover:text-white"
                                onClick={(e) => {
                                  e.preventDefault();
                                  document
                                    .getElementById("cover-image-upload")
                                    ?.click();
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Browse
                              </Button>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configuration Settings Section */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Learning Frequency
                            </Label>
                            <Select
                              value={learningFrequency}
                              onValueChange={setLearningFrequency}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Daily">Daily</SelectItem>
                                <SelectItem value="Weekly">Weekly</SelectItem>
                                <SelectItem value="Monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Manager Email Enabled?
                            </Label>
                            <Select
                              value={managerEmailEnabled}
                              onValueChange={setManagerEmailEnabled}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>  */}

                          {/* <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Show User Email?
                            </Label>
                            <Select
                              value={showUserEmail}
                              onValueChange={setShowUserEmail}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}

                          {/* <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Leaderboard Enabled?
                            </Label>
                            <Select
                              value={leaderboardEnabled}
                              onValueChange={setLeaderboardEnabled}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}

                          {/* <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Enable Community?
                            </Label>
                            <Select
                              value={enableCommunity}
                              onValueChange={setEnableCommunity}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}

                          {/* <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Secure Links
                            </Label>
                            <Select
                              value={secureLinks}
                              onValueChange={setSecureLinks}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Language
                            </Label>
                            <Select
                              value={language}
                              onValueChange={setLanguage}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Spanish">Spanish</SelectItem>
                                <SelectItem value="French">French</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Accountability Partners Email Enabled?
                            </Label>
                            <Select
                              value={accountabilityPartnersEmailEnabled}
                              onValueChange={
                                setAccountabilityPartnersEmailEnabled
                              }
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}

                          {/* <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Enable Calendar Invites?
                            </Label>
                            <Select
                              value={enableCalendarInvites}
                              onValueChange={setEnableCalendarInvites}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}

                          {/* <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Leaderboard Entry Amount
                            </Label>
                            <Select
                              value={leaderboardEntryAmount}
                              onValueChange={setLeaderboardEntryAmount}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}

                          {/* <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Enable Feedback?
                            </Label>
                            <Select
                              value={enableFeedback}
                              onValueChange={setEnableFeedback}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}

                          {/* <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Enable Action Hub?
                            </Label>
                            <Select
                              value={enableActionHub}
                              onValueChange={setEnableActionHub}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}
                        </div>
                      </div>
                    </div>

                    {/* Kick Off Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Kick Off
                        </h3>
                        <Info size={16} className="text-gray-500 cursor-help" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Existing Kick-off Dates */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="space-y-2">
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
                              <div>Kick off Date</div>
                              <div>Kick off Time</div>
                              <div></div>
                            </div>
                            {kickOffDates.map((item, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-[1fr_1fr_auto] gap-2 text-sm text-gray-600 items-center"
                              >
                                <div>{formatDateForDisplay(item.date)}</div>
                                <div>{formatTimeForDisplay(item.time)}</div>
                                <button
                                  onClick={() => handleRemoveKickOff(index)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Add New Kick-off */}
                        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Kick off Date
                            </Label>
                            <div className="relative">
                              <Input
                                type="date"
                                value={newKickOffDate}
                                onChange={(e) =>
                                  setNewKickOffDate(e.target.value)
                                }
                                className="w-full rounded-lg pr-10"
                              />
                              <Calendar
                                size={18}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Kick off Time
                            </Label>
                            <div className="relative">
                              <Input
                                type="time"
                                value={newKickOffTime}
                                onChange={(e) =>
                                  setNewKickOffTime(e.target.value)
                                }
                                className="w-full rounded-lg pr-10"
                              />
                              <Clock
                                size={18}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              onClick={handleAddKickOff}
                              className="text-primary hover:text-primary-dark rounded-lg px-4 py-2"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Toggles Section */}
                    <div className="space-y-4">
                      <ToggleSwitch
                        checked={habitEnabled}
                        onChange={setHabitEnabled}
                        label="Enable Habits"
                        showInfo={true}
                      />
                      <ToggleSwitch
                        checked={personalizationEnabled}
                        onChange={setPersonalizationEnabled}
                        label="Enable Personalization"
                      />
                    </div>

                    {/* Path Colors Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Path Colors
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {brandColors.map((color, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4 flex items-center gap-3"
                          >
                            <div
                              className="w-12 h-12 rounded border border-gray-300 shrink-0"
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
                            <Info
                              size={16}
                              className="text-gray-500 cursor-help shrink-0"
                            />
                          </div>
                        ))}
                      </div>
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
              <div className="flex flex-col h-full overflow-hidden">
                {showAddUserForm ? (
                  // Add User Form View
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-6">
                      {/* Header with Back Button */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setShowAddUserForm(false);
                            setFirstName("");
                            setLastName("");
                            setEmail("");
                            setCurrentComet("");
                            setPassword("");
                            setConfirmPassword("");
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Add User
                        </h3>
                      </div>

                      {/* Add User Form */}
                      <div className="space-y-4">
                        {/* First Name */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            First Name
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter first name"
                            className="w-full rounded-lg border-gray-300"
                          />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Last Name
                          </Label>
                          <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter last name"
                            className="w-full rounded-lg border-gray-300"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Email
                          </Label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            className="w-full rounded-lg border-gray-300"
                          />
                        </div>

                        {/* Current Comet */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Current Comet
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Select
                            value={currentComet}
                            onValueChange={setCurrentComet}
                          >
                            <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="comet1">Comet 1</SelectItem>
                              <SelectItem value="comet2">Comet 2</SelectItem>
                              <SelectItem value="comet3">Comet 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Password
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter password"
                              className="w-full rounded-lg border-gray-300 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Confirm Password
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              placeholder="Confirm password"
                              className="w-full rounded-lg border-gray-300 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={() => {
                              // TODO: Add user creation logic here
                              console.log("Add user:", {
                                firstName,
                                lastName,
                                email,
                                currentComet,
                                password,
                              });
                              // Reset form
                              setShowAddUserForm(false);
                              setFirstName("");
                              setLastName("");
                              setEmail("");
                              setCurrentComet("");
                              setPassword("");
                              setConfirmPassword("");
                            }}
                            className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg"
                          >
                            Add User
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAddUserForm(false);
                              setFirstName("");
                              setLastName("");
                              setEmail("");
                              setCurrentComet("");
                              setPassword("");
                              setConfirmPassword("");
                            }}
                            className="px-4 py-2 rounded-lg"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedUser ? (
                  // Split view: User list on left, User details on right
                  <div className="flex flex-1 overflow-hidden gap-2">
                    {/* Left: User List */}
                    <div className="w-1/2 flex flex-col border-r border-gray-200 pr-2">
                      <div className="flex-1 overflow-y-auto">
                        <div className="space-y-4 p-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            User List
                          </h3>

                          {/* Search and Controls */}
                          <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                              <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              />
                              <Input
                                type="text"
                                placeholder="Search"
                                value={userSearchQuery}
                                onChange={(e) =>
                                  setUserSearchQuery(e.target.value)
                                }
                                className="pl-10 rounded-lg border-gray-300"
                              />
                            </div>
                            <ToggleSwitch
                              checked={makeAvailableToAll}
                              onChange={setMakeAvailableToAll}
                              label="Make Available to all users"
                            />
                            <Button
                              variant="outline"
                              onClick={() => {
                                setActiveTab("users");
                                setShowAddUserForm(true);
                                setSelectedUser(null);
                              }}
                              className="bg-primary text-white hover:bg-primary-dark border-primary px-4 py-2 rounded-lg whitespace-nowrap"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add User
                            </Button>
                          </div>

                          {/* User Table */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                    User Name
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                    Email
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                    Kickoff
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {users
                                  .filter(
                                    (user) =>
                                      user.name
                                        .toLowerCase()
                                        .includes(
                                          userSearchQuery.toLowerCase()
                                        ) ||
                                      user.email
                                        .toLowerCase()
                                        .includes(userSearchQuery.toLowerCase())
                                  )
                                  .map((user) => (
                                    <tr
                                      key={user.id}
                                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                        selectedUser?.id === user.id
                                          ? "bg-primary/10"
                                          : ""
                                      }`}
                                    >
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => setSelectedUser(user)}
                                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                                        >
                                          {user.name}
                                        </button>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {user.email}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {user.kickoff}
                                      </td>
                                      <td className="px-4 py-3">
                                        <button className="text-gray-400 hover:text-gray-600">
                                          <MoreVertical className="w-5 h-5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: User Details */}
                    <div className="w-1/2 flex flex-col overflow-y-auto">
                      <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            User Details
                          </h3>
                          <button
                            onClick={() => setSelectedUser(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <CircleX className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              User Name
                            </Label>
                            <Input
                              value={selectedUser.name}
                              onChange={(e) =>
                                setSelectedUser({
                                  ...selectedUser,
                                  name: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border-gray-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Email
                            </Label>
                            <Input
                              type="email"
                              value={selectedUser.email}
                              onChange={(e) =>
                                setSelectedUser({
                                  ...selectedUser,
                                  email: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border-gray-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Kickoff
                            </Label>
                            <Select
                              value={selectedUser.kickoff}
                              onValueChange={(value) =>
                                setSelectedUser({
                                  ...selectedUser,
                                  kickoff: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={() => {
                                setUsers(
                                  users.map((u) =>
                                    u.id === selectedUser.id ? selectedUser : u
                                  )
                                );
                                setSelectedUser(null);
                              }}
                              className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg"
                            >
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedUser(null)}
                              className="px-4 py-2 rounded-lg"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Full view: User List only
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-4 p-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        User List
                      </h3>

                      {/* Search and Controls */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
                          <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <Input
                            type="text"
                            placeholder="Search"
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="pl-10 rounded-lg border-gray-300"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium text-gray-800 whitespace-nowrap">
                            Make Available to all users
                          </Label>
                          <button
                            type="button"
                            onClick={() =>
                              setMakeAvailableToAll(!makeAvailableToAll)
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                              makeAvailableToAll ? "bg-primary" : "bg-gray-300"
                            }`}
                            role="switch"
                            aria-checked={makeAvailableToAll}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                                makeAvailableToAll
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActiveTab("users");
                            setShowAddUserForm(true);
                            setSelectedUser(null);
                          }}
                          className="bg-primary text-white hover:bg-primary-dark border-primary px-4 py-2 rounded-lg whitespace-nowrap"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add User
                        </Button>
                      </div>

                      {/* User Table */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                User Name
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                Email
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                Kickoff
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {users
                              .filter(
                                (user) =>
                                  user.name
                                    .toLowerCase()
                                    .includes(userSearchQuery.toLowerCase()) ||
                                  user.email
                                    .toLowerCase()
                                    .includes(userSearchQuery.toLowerCase())
                              )
                              .map((user) => (
                                <tr
                                  key={user.id}
                                  className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3">
                                    <button
                                      onClick={() => setSelectedUser(user)}
                                      className="text-blue-600 hover:text-blue-800  text-sm"
                                    >
                                      {user.name}
                                    </button>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {user.email}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {user.kickoff}
                                  </td>
                                  <td className="px-4 py-3">
                                    <button className="text-gray-400 hover:text-gray-600">
                                      <MoreVertical className="w-5 h-5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
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

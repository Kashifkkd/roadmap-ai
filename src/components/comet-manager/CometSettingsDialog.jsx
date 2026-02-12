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
  Pencil,
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
import { RichTextArea } from "@/components/comet-manager/forms/FormFields";
import { graphqlClient } from "@/lib/graphql-client";
import { uploadAssetFile } from "@/api/uploadAssets";
import { uploadPathImage } from "@/api/uploadPathImage";
import UserManagement from "@/components/common/UserManagement";
import { publishComet } from "@/api/publishComet";

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
  const [pathImageUrl, setPathImageUrl] = useState(null);

  // Configuration Settings
  const [learningFrequency, setLearningFrequency] = useState("");
  const [language, setLanguage] = useState("English");
  const [leaderboardEntryAmount, setLeaderboardEntryAmount] = useState("25");
  const [imageGuidance, setImageGuidance] = useState("");
  const [artStyle, setArtStyle] = useState("");
  const [reminderType, setReminderType] = useState("");
  const [sourceAlignment, setSourceAlignment] = useState("");
  const [duration, setDuration] = useState("");

  // Kick Off
  const [kickOffDates, setKickOffDates] = useState([]);
  const [newKickOffDate, setNewKickOffDate] = useState("");
  const [newKickOffTime, setNewKickOffTime] = useState("");

  // Ad Hoc Notifications
  const [adHocChannelRows, setAdHocChannelRows] = useState([
    { id: 1, name: "" },
  ]);
  const [adHocDraft, setAdHocDraft] = useState({
    channel: "",
    emailSubject: "",
    emailHeader: "",
    emailBody: "",
    sendDate: "",
    sendTime: "",
  });
  const [adHocNotifications, setAdHocNotifications] = useState([]);
  console.log("shdfhgsh");

  // Toggles (all available from backend)
  const [habitEnabled, setHabitEnabled] = useState(false);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(false);
  const [managerEmailEnabled, setManagerEmailEnabled] = useState(false);
  const [
    accountabilityPartnersEmailEnabled,
    setAccountabilityPartnersEmailEnabled,
  ] = useState(false);
  const [showUserEmail, setShowUserEmail] = useState(true);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [enableCommunity, setEnableCommunity] = useState(false);
  const [chapters, setChapters] = useState(true);
  const [actionHub, setActionHub] = useState(true);
  const [checklists, setChecklists] = useState(true);
  const [actionPoints, setActionPoints] = useState(true);
  const [chartTargets, setChartTargets] = useState(true);
  const [calendarInvites, setCalendarInvites] = useState(true);
  const [onboardingSteps, setOnboardingSteps] = useState(true);
  const [dailyHighlighter, setDailyHighlighter] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [feedback, setFeedback] = useState(true);
  const [habits, setHabits] = useState(true);
  const [pathVersion, setPathVersion] = useState(false);

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
      name: "Charlie Browns",
      email: "charlie.brown@example.com",
      kickoff: "Yes",
    },
  ]);

  const [brandColors, setBrandColors] = useState([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [editingColorIndex, setEditingColorIndex] = useState(null);
  const [editingColorHex, setEditingColorHex] = useState("");

  useEffect(() => {
    if (!open) return;

    const data = localStorage.getItem("sessionData");
    if (data) {
      const sessionData = JSON.parse(data);
      setCometTitle(
        sessionData?.comet_creation_data?.["Basic Information"]?.[
          "Comet Title"
        ] || "",
      );
      setDescription(
        sessionData?.comet_creation_data?.["Basic Information"]?.Description ||
          "",
      );

      // Fetch path_image from response_path (exclude fallback images)
      const pathImage = sessionData?.response_path?.path_image;
      if (pathImage && !pathImage.includes("fallbackImage")) {
        setPathImageUrl(pathImage);
      } else {
        setPathImageUrl(null);
        setCoverImage(null);
      }

      // Fetch colours from backend and transform to display format
      const colours =
        sessionData?.response_path?.colours || sessionData?.colours || {};
      if (colours && Object.keys(colours).length > 0) {
        const transformedColors = Object.entries(colours).map(
          ([key, value]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            hex: value,
            color: value,
          }),
        );
        setBrandColors(transformedColors);
      }

      // Fetch toggle switch data from response_path.enabled_attributes
      const enabledAttributes =
        sessionData?.response_path?.enabled_attributes || {};

      const additionalData = sessionData?.additional_data || {};
      if (additionalData.personalization_enabled !== undefined) {
        setPersonalizationEnabled(additionalData.personalization_enabled);
      }
      if (additionalData.habit_enabled !== undefined) {
        setHabitEnabled(additionalData.habit_enabled);
      }
      if (enabledAttributes) {
        // Only update toggles that are present in UI
        if (enabledAttributes.engagement_frequency !== undefined) {
          // Normalize learning frequency to match SelectItem values
          const freq = String(enabledAttributes.engagement_frequency)
            .toLowerCase()
            .trim();
          const validFreqs = ["daily", "weekly", "monthly"];
          const normalizedFreq = validFreqs.includes(freq) ? freq : "";
          setLearningFrequency(normalizedFreq);
          console.log(
            "Learning Frequency loaded:",
            enabledAttributes.engagement_frequency,
            "-> normalized to:",
            normalizedFreq,
          );
        }
        if (enabledAttributes.habit_enabled !== undefined) {
          setHabitEnabled(enabledAttributes.habit_enabled);
        }
        // if (enabledAttributes.path_personalization !== undefined) {
        //   setPersonalizationEnabled(enabledAttributes.path_personalization);
        // }
        if (enabledAttributes.manager_email !== undefined) {
          setManagerEmailEnabled(enabledAttributes.manager_email);
        }
        if (enabledAttributes.accountability_email !== undefined) {
          setAccountabilityPartnersEmailEnabled(
            enabledAttributes.accountability_email,
          );
        }
        if (enabledAttributes.user_email !== undefined) {
          setShowUserEmail(enabledAttributes.user_email);
        }
        if (enabledAttributes.leaderboard !== undefined) {
          setLeaderboardEnabled(enabledAttributes.leaderboard);
        }
        if (enabledAttributes.enable_community !== undefined) {
          setEnableCommunity(enabledAttributes.enable_community);
        }
        // Image attributes - normalize to match SelectItem values
        if (enabledAttributes.image_guidance !== undefined) {
          const guidance = String(enabledAttributes.image_guidance)
            .toLowerCase()
            .trim();
          const validGuidances = [
            "simple",
            "detailed",
            "complex",
            "very_detailed",
          ];
          const normalizedGuidance = validGuidances.includes(guidance)
            ? guidance
            : "";
          setImageGuidance(normalizedGuidance);
          console.log(
            "Image Guidance loaded:",
            enabledAttributes.image_guidance,
            "-> normalized to:",
            normalizedGuidance,
          );
        } else {
          setImageGuidance("");
        }
        if (enabledAttributes.art_style !== undefined) {
          const art = String(enabledAttributes.art_style).trim();
          // Normalize art style - handle case variations
          const artStyleMap = {
            photorealistic: "Photorealistic",
            "hyper-real": "Hyper-real",
            watercolor: "Watercolor",
            "line art": "Line art",
            "pixel art": "Pixel art",
            "flat illustration": "Flat illustration",
            anime: "Anime",
            "3d render": "3D render",
            "oil painting": "Oil painting",
            charcoal: "Charcoal",
            sketch: "Sketch",
            minimalist: "Minimalist",
          };
          const normalizedArt = artStyleMap[art.toLowerCase()] || art;
          // Check if normalized value exists in valid options
          const validArtStyles = [
            "Photorealistic",
            "Hyper-real",
            "Watercolor",
            "Line art",
            "Pixel art",
            "Flat illustration",
            "Anime",
            "3D render",
            "Oil painting",
            "Charcoal",
            "Sketch",
            "Minimalist",
          ];
          const finalArt = validArtStyles.includes(normalizedArt)
            ? normalizedArt
            : "";
          setArtStyle(finalArt);
          console.log(
            "Art Style loaded:",
            enabledAttributes.art_style,
            "-> normalized to:",
            finalArt,
          );
        } else {
          setArtStyle("");
        }

        // Load additional fields
        if (enabledAttributes.reminder_type !== undefined) {
          const reminder = String(enabledAttributes.reminder_type)
            .toLowerCase()
            .trim();
          const validReminders = ["daily", "weekly", "monthly"];
          const normalizedReminder = validReminders.includes(reminder)
            ? reminder
            : "";
          setReminderType(normalizedReminder);
        }

        if (enabledAttributes.source_alignment !== undefined) {
          const source = String(enabledAttributes.source_alignment)
            .toLowerCase()
            .trim();
          const validSources = ["fidelity", "balanced", "extension"];
          const normalizedSource = validSources.includes(source) ? source : "";
          setSourceAlignment(normalizedSource);
        }

        if (enabledAttributes.duration !== undefined) {
          setDuration(String(enabledAttributes.duration));
        }

        if (enabledAttributes.language !== undefined) {
          const lang = String(enabledAttributes.language).trim().toLowerCase();
          // Map full language names to codes if needed
          const langCodeMap = { english: "en", spanish: "es", french: "fr" };
          const validCodes = ["en", "es", "fr"];
          // If it's already a valid code, use it; otherwise try to map from full name
          const normalizedLang = validCodes.includes(lang)
            ? lang
            : langCodeMap[lang] || "en";
          setLanguage(normalizedLang);
        }

        // Load all boolean toggles
        if (enabledAttributes.chapters !== undefined)
          setChapters(enabledAttributes.chapters);
        if (enabledAttributes.action_hub !== undefined)
          setActionHub(enabledAttributes.action_hub);
        if (enabledAttributes.checklists !== undefined)
          setChecklists(enabledAttributes.checklists);
        if (enabledAttributes.action_points !== undefined)
          setActionPoints(enabledAttributes.action_points);
        if (enabledAttributes.chart_targets !== undefined)
          setChartTargets(enabledAttributes.chart_targets);
        if (enabledAttributes.calendar_invites !== undefined)
          setCalendarInvites(enabledAttributes.calendar_invites);
        if (enabledAttributes.onboarding_steps !== undefined)
          setOnboardingSteps(enabledAttributes.onboarding_steps);
        if (enabledAttributes.daily_highlighter !== undefined)
          setDailyHighlighter(enabledAttributes.daily_highlighter);
        if (enabledAttributes.push_notifications !== undefined)
          setPushNotifications(enabledAttributes.push_notifications);
        if (enabledAttributes.email_notifications !== undefined)
          setEmailNotifications(enabledAttributes.email_notifications);
        if (enabledAttributes.feedback !== undefined)
          setFeedback(enabledAttributes.feedback);
        if (enabledAttributes.habits !== undefined)
          setHabits(enabledAttributes.habits);
        if (enabledAttributes.pathVersion !== undefined)
          setPathVersion(enabledAttributes.pathVersion);
        if (enabledAttributes.path_personalization !== undefined)
          setPersonalizationEnabled(enabledAttributes.path_personalization);
      } else {
        // If enabled_attributes doesn't exist, initialize with empty strings
        setImageGuidance("");
        setArtStyle("");
      }

      // Also check comet_creation_data for duration
      const experienceDesign =
        sessionData?.comet_creation_data?.["Experience Design"];
      if (experienceDesign?.Duration && !duration) {
        setDuration(experienceDesign.Duration);
      }
      if (experienceDesign?.["Source Alignment"] && !sourceAlignment) {
        const source = String(experienceDesign["Source Alignment"])
          .toLowerCase()
          .trim();
        const validSources = ["fidelity", "balanced", "extension"];
        const normalizedSource =
          validSources.find((s) => source.includes(s)) || "";
        setSourceAlignment(normalizedSource);
      }
    }

    // Load saved comet settings
    const savedSettings = localStorage.getItem("cometSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setHabitEnabled(settings.habit_enabled ?? true);
      setPersonalizationEnabled(settings.personalization_enabled ?? true);
    }
  }, [open]); // Reload data when dialog open

  useEffect(() => {
    return () => {
      if (pathImageUrl && pathImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pathImageUrl);
      }
    };
  }, [pathImageUrl]);

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

      // Upload cover image
      let uploadedImageUrl = pathImageUrl;
      if (coverImage && coverImage instanceof File) {
        try {
          const uploadResponse = await uploadPathImage(coverImage, sessionId);

          if (uploadResponse?.response) {
            uploadedImageUrl = uploadResponse.response.s3_url;

            if (uploadedImageUrl) {
              setPathImageUrl(uploadedImageUrl);
            }
          }
        } catch (error) {
          console.error("Error uploading cover image:", error);
        }
      }

      // Update comet creation data for the comet settings
      const updatedCometCreationData = {
        ...(sessionData?.comet_creation_data || {}),
        "Basic Information": {
          ...(sessionData?.comet_creation_data?.["Basic Information"] || {}),
          "Comet Title": cometTitle,
          Description: description,
        },
      };

      // Update response_path with enabled_attributes (only attributes present in UI)
      const currentResponsePath = sessionData?.response_path || {};
      const currentEnabledAttributes =
        currentResponsePath?.enabled_attributes || {};

      const updatedEnabledAttributes = {
        ...currentEnabledAttributes, // Preserve other attributes
        // Update all attributes
        engagement_frequency: learningFrequency,
        habit_enabled: habitEnabled,
        path_personalization: personalizationEnabled,
        manager_email: managerEmailEnabled,
        accountability_email: accountabilityPartnersEmailEnabled,
        user_email: showUserEmail,
        leaderboard: leaderboardEnabled,
        enable_community: enableCommunity,
        image_guidance: imageGuidance || "",
        art_style: artStyle || "",
        reminder_type: reminderType || "",
        source_alignment: sourceAlignment || "",
        duration: duration || "",
        language: language || "English",
        chapters: chapters,
        action_hub: actionHub,
        checklists: checklists,
        action_points: actionPoints,
        chart_targets: chartTargets,
        calendar_invites: calendarInvites,
        onboarding_steps: onboardingSteps,
        daily_highlighter: dailyHighlighter,
        push_notifications: pushNotifications,
        email_notifications: emailNotifications,
        feedback: feedback,
        habits: habits,
        pathVersion: pathVersion,
      };

      // Also update Experience Design in comet_creation_data if duration or source_alignment changed
      if (duration || sourceAlignment) {
        updatedCometCreationData["Experience Design"] = {
          ...(sessionData?.comet_creation_data?.["Experience Design"] || {}),
          ...(duration && { Duration: duration }),
          ...(sourceAlignment && {
            "Source Alignment":
              sourceAlignment.charAt(0).toUpperCase() +
              sourceAlignment.slice(1),
          }),
        };
      }

      // Transform brandColors back to the format expected by backend (object with lowercase keys)
      const coloursObject = brandColors.reduce((acc, color) => {
        const key = color.name.toLowerCase();
        acc[key] = color.hex;
        return acc;
      }, {});

      const updatedResponsePath = {
        ...currentResponsePath,
        enabled_attributes: updatedEnabledAttributes,
        colours: coloursObject,
        ...(uploadedImageUrl && !uploadedImageUrl.startsWith("blob:")
          ? { path_image: uploadedImageUrl }
          : pathImageUrl && !pathImageUrl.startsWith("blob:")
            ? { path_image: pathImageUrl }
            : {}),
      };

      const cometJsonForSave = JSON.stringify({
        session_id: sessionId,
        input_type: "source_material_based_outliner",
        comet_creation_data: updatedCometCreationData,
        response_outline: sessionData?.response_outline || {},
        response_path: updatedResponsePath,
        // additional_data: {
        //   personalization_enabled: personalizationEnabled,
        //   habit_enabled: habitEnabled,
        // },
        chatbot_conversation: sessionData?.chatbot_conversation || [],
        to_modify: sessionData?.to_modify || {},
        webpage_url: sessionData?.webpage_url || [],
      });

      const response = await graphqlClient.autoSaveComet(cometJsonForSave);

      if (response && response?.autoSaveComet) {
        const updatedSessionData = {
          ...sessionData,
          comet_creation_data: updatedCometCreationData,
          response_path: updatedResponsePath,
        };
        localStorage.setItem("sessionData", JSON.stringify(updatedSessionData));

        // Save comet settings
        localStorage.setItem(
          "cometSettings",
          JSON.stringify({
            personalization_enabled: personalizationEnabled,
            habit_enabled: habitEnabled,
          }),
        );

        //  publishing the comet
        try {
          await publishComet(sessionId);
        } catch (publishError) {
          console.error(
            "Failed to publish comet from settings dialog:",
            publishError,
          );
          toast.error("Failed to publish comet. Please try again.");
        }
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
      if (pathImageUrl && pathImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pathImageUrl);
      }
      setCoverImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPathImageUrl(imageUrl);
    }
  };

  const handleAddKickOff = () => {
    if (newKickOffDate && newKickOffTime) {
      setKickOffDates([
        ...kickOffDates,
        { date: newKickOffDate, time: newKickOffTime },
      ]);
      setNewKickOffDate("");
      setNewKickOffTime("");
    }
  };

  const handleRemoveKickOff = (index) => {
    setKickOffDates(kickOffDates.filter((_, i) => i !== index));
  };

  const addAdHocChannelRow = () => {
    setAdHocChannelRows((rows) => {
      const nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
      return [...rows, { id: nextId, name: "" }];
    });
  };

  const updateAdHocChannelRowName = (id, name) => {
    setAdHocChannelRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, name } : r)),
    );
  };

  const removeAdHocChannelRow = (id) => {
    setAdHocChannelRows((rows) => {
      const next = rows.filter((r) => r.id !== id);
      return next.length ? next : [{ id: 1, name: "" }];
    });
  };

  const getAdHocChannels = () => {
    const seen = new Set();
    return adHocChannelRows
      .map((r) => String(r.name || "").trim())
      .filter(Boolean)
      .filter((name) => {
        const key = name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };

  const resetAdHocDraft = () => {
    setAdHocDraft({
      channel: "",
      emailSubject: "",
      emailHeader: "",
      emailBody: "",
      sendDate: "",
      sendTime: "",
    });
  };

  const handleSaveAdHocNotification = () => {
    setAdHocNotifications((prev) => [
      ...prev,
      { ...adHocDraft, id: Date.now() },
    ]);
    resetAdHocDraft();
  };

  const handleAddColor = () => {
    if (newColorName.trim() && newColorHex) {
      const colorName = newColorName.trim().toLowerCase();
      // Check if color name already exists
      if (brandColors.some((c) => c.name.toLowerCase() === colorName)) {
        alert("A color with this name already exists");
        return;
      }

      // Normalize hex color
      let normalizedHex = newColorHex.trim();
      if (!normalizedHex.startsWith("#")) {
        normalizedHex = "#" + normalizedHex;
      }
      normalizedHex = normalizedHex.toUpperCase();

      // Validate hex format
      if (!/^#[0-9A-Fa-f]{6}$/.test(normalizedHex)) {
        alert("Please enter a valid hex color (e.g., #FF0000)");
        return;
      }

      const newColor = {
        name:
          newColorName.trim().charAt(0).toUpperCase() +
          newColorName.trim().slice(1),
        hex: normalizedHex,
        color: normalizedHex,
      };
      setBrandColors([...brandColors, newColor]);
      setNewColorName("");
      setNewColorHex("#000000");
    }
  };

  const handleEditColor = (index) => {
    setEditingColorIndex(index);
    setEditingColorHex(brandColors[index].hex);
  };

  const handleSaveColorEdit = (index) => {
    // Normalize hex color - add # if missing, uppercase it
    let normalizedHex = editingColorHex.trim();
    if (!normalizedHex.startsWith("#")) {
      normalizedHex = "#" + normalizedHex;
    }
    normalizedHex = normalizedHex.toUpperCase();

    // Validate hex color format
    if (/^#[0-9A-Fa-f]{6}$/.test(normalizedHex)) {
      const updatedColors = [...brandColors];
      updatedColors[index] = {
        ...updatedColors[index],
        hex: normalizedHex,
        color: normalizedHex,
      };
      setBrandColors(updatedColors);
      setEditingColorIndex(null);
      setEditingColorHex("");
    } else {
      alert("Please enter a valid hex color (e.g., #FF0000)");
    }
  };

  const handleCancelColorEdit = () => {
    setEditingColorIndex(null);
    setEditingColorHex("");
  };

  const handleDeleteColor = (index) => {
    if (
      window.confirm(
        `Are you sure you want to delete the color "${brandColors[index].name}"?`,
      )
    ) {
      setBrandColors(brandColors.filter((_, i) => i !== index));
    }
  };

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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 lg:p-6">
      <div className="w-full max-w-[998px] lg:max-w-[1200px] xl:max-w-[1400px] max-h-[90vh] md:max-h-[75vh] lg:max-h-[80vh] p-1.5 sm:p-2 lg:p-3 border-0 bg-white rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] shadow-[0_20px_70px_rgba(30,30,50,0.2)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-5 lg:py-6 border-gray-200">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">
            Comet Settings
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
          >
            <CircleX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden p-1.5 sm:p-2 lg:p-3 bg-gray-100 rounded-lg gap-1.5 sm:gap-2 lg:gap-3">
          {/* Navigation Panel - Left Side */}
          <div className="md:w-60 lg:w-64 xl:w-72 bg-white rounded-lg border-gray-200 px-2 sm:px-3 md:px-5 lg:px-6 py-3 sm:py-4 md:py-6 lg:py-6 space-y-2 overflow-x-auto md:overflow-x-visible">
            <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
              <button
                onClick={() => {
                  setActiveTab("comet-info");
                  setSelectedUser(null);
                  setShowAddUserForm(false);
                }}
                className={`w-full flex items-center gap-2 md:gap-3 lg:gap-4 rounded-sm px-2.5 sm:px-3 md:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 text-xs sm:text-sm md:text-[15px] lg:text-base font-medium transition-all whitespace-nowrap ${
                  activeTab === "comet-info"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                <FileText
                  size={18}
                  className={`lg:w-5 lg:h-5 ${
                    activeTab === "comet-info" ? "text-white" : "text-gray-500"
                  }`}
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
                className={`w-full flex items-center gap-2 md:gap-3 lg:gap-4 rounded-sm px-2.5 sm:px-3 md:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 text-xs sm:text-sm md:text-[15px] lg:text-base font-medium transition-all whitespace-nowrap ${
                  activeTab === "users"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                <Users
                  size={18}
                  className={`lg:w-5 lg:h-5 ${
                    activeTab === "users" ? "text-white" : "text-gray-500"
                  }`}
                />
                Users
              </button>

              <button
                onClick={() => {
                  setActiveTab("analytics");
                  setSelectedUser(null);
                  setShowAddUserForm(false);
                }}
                className={`w-full flex items-center gap-2 md:gap-3 lg:gap-4 rounded-sm px-2.5 sm:px-3 md:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 text-xs sm:text-sm md:text-[15px] lg:text-base font-medium transition-all whitespace-nowrap ${
                  activeTab === "analytics"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                <BarChart3
                  size={18}
                  className={`lg:w-5 lg:h-5 ${
                    activeTab === "analytics" ? "text-white" : "text-gray-500"
                  }`}
                />
                Analytics
              </button>
            </div>
          </div>

          {/* Content Area - Right Side */}
          <div className="flex-1 bg-white rounded-lg flex flex-col overflow-hidden">
            {activeTab === "comet-info" && (
              <div className="overflow-y-auto h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-2">
                  <div className="space-y-4 md:space-y-5">
                    {/* Comet Title */}
                    <div className="bg-gray-100 px-2  rounded-lg ">
                      <div className="text-md font-bold text-gray-700 py-4 px-2 ">
                        Basic Info
                      </div>
                      <div className="space-y-4 flex flex-row gap-2 w-full bg-white p-2 rounded-t-lg">
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

                          <div className="space-y-2 py-2">
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
                              className="w-full rounded-lg border-gray-300 resize-none overflow-y-auto create-comet-scrollbar focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-primary-300"
                            />
                          </div>
                        </div>

                        {/* Comet Cover Image */}
                        <div className="space-y-2 w-1/2 h-full ">
                          <Label className="text-sm font-medium text-gray-700 ">
                            Comet Cover Image
                          </Label>
                          <div className="w-full max-h-[1600px] p-2 bg-gray-100 rounded-lg">
                            {pathImageUrl ? (
                              <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white group">
                                <img
                                  src={pathImageUrl}
                                  alt="Comet Cover"
                                  className="w-full h-auto max-h-[150px] object-cover"
                                />
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    type="button"
                                    className="w-8 h-8 rounded-full bg-purple-200/80 hover:bg-purple-300/90 flex items-center justify-center transition-colors"
                                    onClick={() => {
                                      document
                                        .getElementById("cover-image-upload")
                                        ?.click();
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 text-gray-800" />
                                  </button>
                                  <button
                                    type="button"
                                    className="w-8 h-8 rounded-full bg-orange-200/80 hover:bg-orange-300/90 flex items-center justify-center transition-colors"
                                    onClick={() => {
                                      setPathImageUrl(null);
                                      setCoverImage(null);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-gray-800" />
                                  </button>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleCoverImageUpload}
                                  className="hidden"
                                  id="cover-image-upload"
                                />
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-11 text-center bg-white">
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
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Configuration Settings Section */}
                      <div className="space-y-4 bg-white p-2 rounded-b-lg">
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                          {/* Left Column */}
                          {/* <div className="space-y-4"> */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Learning Frequency
                            </Label>
                            <Select
                              value={learningFrequency || undefined}
                              onValueChange={setLearningFrequency}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {/* </div> */}

                          {/* Right Column */}
                          {/* <div className="space-y-4"> */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Language
                            </Label>
                            <Select
                              value={language || undefined}
                              onValueChange={setLanguage}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Reminder Type
                            </Label>
                            <Select
                              value={reminderType || undefined}
                              onValueChange={setReminderType}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue placeholder="Select reminder type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Source Alignment
                            </Label>
                            <Select
                              value={sourceAlignment || undefined}
                              onValueChange={setSourceAlignment}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue placeholder="Select source alignment" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fidelity">
                                  Fidelity
                                </SelectItem>
                                <SelectItem value="balanced">
                                  Balanced
                                </SelectItem>
                                <SelectItem value="extension">
                                  Extension
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Duration
                            </Label>
                            <Input
                              type="text"
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                              placeholder="e.g. 4 weeks, 10-15 min/day"
                              className="w-full rounded-lg border-gray-300"
                            />
                          </div>
                          {/* </div> */}
                        </div>
                      </div>
                    </div>
                    {/* Generative AI Settings Section */}
                    <div className="pt-4 pb-2 px-2 bg-gray-100 rounded-lg">
                      <p className=" font-bold mb-4 px-4  text-gray-700">
                        Generative AI Settings
                      </p>
                      <div className="space-y-4 bg-white p-2 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left Column */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Art Style
                            </Label>
                            <Select
                              value={artStyle || undefined}
                              onValueChange={setArtStyle}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue placeholder="Select art style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Photorealistic">
                                  Photorealistic
                                </SelectItem>
                                <SelectItem value="Hyper-real">
                                  Hyper-real
                                </SelectItem>
                                <SelectItem value="Watercolor">
                                  Watercolor
                                </SelectItem>
                                <SelectItem value="Line art">
                                  Line art
                                </SelectItem>
                                <SelectItem value="Pixel art">
                                  Pixel art
                                </SelectItem>
                                <SelectItem value="Flat illustration">
                                  Flat illustration
                                </SelectItem>
                                <SelectItem value="Anime">Anime</SelectItem>
                                <SelectItem value="3D render">
                                  3D render
                                </SelectItem>
                                <SelectItem value="Oil painting">
                                  Oil painting
                                </SelectItem>
                                <SelectItem value="Charcoal">
                                  Charcoal
                                </SelectItem>
                                <SelectItem value="Sketch">Sketch</SelectItem>
                                <SelectItem value="Minimalist">
                                  Minimalist
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Image Guidance
                            </Label>
                            <Input
                              type="text"
                              value={imageGuidance}
                              onChange={(e) => setImageGuidance(e.target.value)}
                              placeholder="Enter image guidance"
                              className="w-full rounded-lg border-gray-300"
                            />
                            {/* <Select
                              value={imageGuidance || undefined}
                              onValueChange={setImageGuidance}
                            >
                              <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                <SelectValue placeholder="Select image guidance" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="simple">Simple</SelectItem>
                                <SelectItem value="detailed">
                                  Detailed
                                </SelectItem>
                                <SelectItem value="complex">Complex</SelectItem>
                                <SelectItem value="very_detailed">
                                  Very Detailed
                                </SelectItem>
                              </SelectContent>
                            </Select> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Toggles Section */}
                    <div className="pt-4 pb-2 px-2 bg-gray-100 rounded-lg">
                      <p className=" font-bold mb-4 px-4  text-gray-700">
                        Experience Design
                      </p>
                      <div className="space-y-4 bg-white p-2 rounded-lg">
                        <div className="border-b-2 border-gray-200 pb-2">
                          <ToggleSwitch
                            checked={habitEnabled}
                            onChange={setHabitEnabled}
                            label="Enable Habits"
                            showInfo={true}
                          />
                        </div>
                        <ToggleSwitch
                          checked={personalizationEnabled}
                          onChange={setPersonalizationEnabled}
                          label="Enable Personalization"
                        />
                      </div>
                    </div>
                    <div className="pt-4 pb-2 px-2 bg-gray-100 rounded-lg">
                      <p className=" font-bold mb-4 px-4  text-gray-700">
                        Stakeholder Engagement
                      </p>
                      <div className="space-y-4 bg-white p-2 rounded-lg">
                        <div className="border-b-2 border-gray-200 pb-2">
                          <ToggleSwitch
                            checked={managerEmailEnabled}
                            onChange={setManagerEmailEnabled}
                            label="Manager Email Enabled?"
                            showInfo={true}
                          />
                        </div>
                        <ToggleSwitch
                          checked={accountabilityPartnersEmailEnabled}
                          onChange={setAccountabilityPartnersEmailEnabled}
                          label="Accountability Partners Email Enabled?"
                        />
                      </div>
                    </div>
                    <div className="pt-4 pb-2 px-2 bg-gray-100 rounded-lg">
                      <p className=" font-bold mb-4 px-4  text-gray-700">
                        Community Settings
                      </p>
                      <div className="space-y-4 bg-white p-2 rounded-lg">
                        <div className="border-b-2 border-gray-200 pb-2">
                          <ToggleSwitch
                            checked={enableCommunity}
                            onChange={setEnableCommunity}
                            label="Enable Community?"
                            showInfo={true}
                          />
                        </div>
                        <ToggleSwitch
                          checked={showUserEmail}
                          onChange={setShowUserEmail}
                          label="Show User Emails"
                        />
                      </div>
                    </div>
                    <div className="pt-4 pb-2 px-2 bg-gray-100 rounded-lg">
                      <p className=" font-bold mb-4 px-4  text-gray-700">
                        Leaderboard Settings
                      </p>
                      <div className="space-y-4 bg-white p-2 rounded-lg">
                        <ToggleSwitch
                          checked={leaderboardEnabled}
                          onChange={setLeaderboardEnabled}
                          label="Enabled Leaderboard"
                          showInfo={true}
                        />
                      </div>
                    </div>

                    {/* Feature Toggles Section */}
                    <div className="pt-4 pb-2 px-2 bg-gray-100 rounded-lg">
                      <p className=" font-bold mb-4 px-4  text-gray-700">
                        Feature Settings
                      </p>
                      <div className="space-y-4 bg-white p-2 rounded-lg">
                        <ToggleSwitch
                          checked={chapters}
                          onChange={setChapters}
                          label="Chapters"
                        />
                        <ToggleSwitch
                          checked={actionHub}
                          onChange={setActionHub}
                          label="Action Hub"
                        />
                        <ToggleSwitch
                          checked={checklists}
                          onChange={setChecklists}
                          label="Checklists"
                        />
                        <ToggleSwitch
                          checked={actionPoints}
                          onChange={setActionPoints}
                          label="Action Points"
                        />
                        <ToggleSwitch
                          checked={chartTargets}
                          onChange={setChartTargets}
                          label="Chart Targets"
                        />
                        <ToggleSwitch
                          checked={calendarInvites}
                          onChange={setCalendarInvites}
                          label="Calendar Invites"
                        />
                        <ToggleSwitch
                          checked={onboardingSteps}
                          onChange={setOnboardingSteps}
                          label="Onboarding Steps"
                        />
                        <ToggleSwitch
                          checked={dailyHighlighter}
                          onChange={setDailyHighlighter}
                          label="Daily Highlighter"
                        />
                        <ToggleSwitch
                          checked={pushNotifications}
                          onChange={setPushNotifications}
                          label="Enable Push Notifications"
                        />
                        <ToggleSwitch
                          checked={emailNotifications}
                          onChange={setEmailNotifications}
                          label="Enable Email Notifications"
                        />
                        <ToggleSwitch
                          checked={feedback}
                          onChange={setFeedback}
                          label="Feedback"
                        />
                        <ToggleSwitch
                          checked={habits}
                          onChange={setHabits}
                          label="Habits"
                        />
                        <ToggleSwitch
                          checked={pathVersion}
                          onChange={setPathVersion}
                          label="Path Version"
                        />
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

                    {/* Ad Hoc Notifications Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Ad Hoc Notifications
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetAdHocDraft}
                          className="text-primary hover:text-primary-dark rounded-lg px-3 py-2 h-auto whitespace-nowrap"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create Ad Hoc Notification
                        </Button>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                        {/* Select Channel */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Select Channel
                          </Label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <Select
                                value={adHocDraft.channel || undefined}
                                onValueChange={(value) =>
                                  setAdHocDraft((d) => ({
                                    ...d,
                                    channel: value,
                                  }))
                                }
                              >
                                <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-300">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAdHocChannels().map((name) => (
                                    <SelectItem key={name} value={name}>
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setAdHocDraft((d) => ({ ...d, channel: "" }))
                              }
                              className="shrink-0 w-9 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                              title="Clear selected channel"
                              aria-label="Clear selected channel"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Email Subject */}
                        <RichTextArea
                          label="Email Subject"
                          value={adHocDraft.emailSubject}
                          onChange={(value) =>
                            setAdHocDraft((d) => ({
                              ...d,
                              emailSubject: value,
                            }))
                          }
                          showToolbar={true}
                          minHeight={64}
                        />

                        {/* Email Header */}
                        <RichTextArea
                          label="Email Header"
                          value={adHocDraft.emailHeader}
                          onChange={(value) =>
                            setAdHocDraft((d) => ({ ...d, emailHeader: value }))
                          }
                          showToolbar={true}
                          minHeight={64}
                        />

                        {/* Email Body Text */}
                        <RichTextArea
                          label="Email Body Text"
                          value={adHocDraft.emailBody}
                          onChange={(value) =>
                            setAdHocDraft((d) => ({ ...d, emailBody: value }))
                          }
                          showToolbar={true}
                          minHeight={120}
                        />

                        {/* Send Date/Time + Save */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Notification Send Date
                            </Label>
                            <div className="relative">
                              <Input
                                type="date"
                                value={adHocDraft.sendDate}
                                onChange={(e) =>
                                  setAdHocDraft((d) => ({
                                    ...d,
                                    sendDate: e.target.value,
                                  }))
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
                              Notification Send Time (UTC)
                            </Label>
                            <div className="relative">
                              <Input
                                type="time"
                                value={adHocDraft.sendTime}
                                onChange={(e) =>
                                  setAdHocDraft((d) => ({
                                    ...d,
                                    sendTime: e.target.value,
                                  }))
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
                              type="button"
                              onClick={handleSaveAdHocNotification}
                              className="bg-primary hover:bg-primary-dark px-6 py-2 rounded-lg text-sm font-medium"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Channel Names */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-gray-700">
                            Channel Name
                          </Label>
                          <button
                            type="button"
                            onClick={addAdHocChannelRow}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            title="Add channel"
                            aria-label="Add channel"
                          >
                            <Plus size={18} className="text-gray-700" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {adHocChannelRows.map((row) => (
                            <div
                              key={row.id}
                              className="flex items-center gap-2 bg-purple-50/40 border border-purple-100 rounded-lg p-2"
                            >
                              <Input
                                value={row.name}
                                onChange={(e) =>
                                  updateAdHocChannelRowName(
                                    row.id,
                                    e.target.value,
                                  )
                                }
                                placeholder="Channel Name"
                                className="w-full rounded-lg border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => removeAdHocChannelRow(row.id)}
                                className="shrink-0 w-9 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                                title="Remove channel"
                                aria-label="Remove channel"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <input
                        type="hidden"
                        value={adHocNotifications.length}
                        readOnly
                      />
                    </div>

                    {/* Path Colors Section */}
                    {/* Path Colors Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Path Colors
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        {brandColors.map((color, index) => {
                          const displayColor = (
                            color?.hex ||
                            color?.color ||
                            "#000000"
                          ).toUpperCase();

                          return (
                            <div
                              key={`${color?.name || "color"}-${index}`}
                              className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 rounded-lg p-2 cursor-pointer transition-all"
                            >
                              {/* Swatch (click opens palette) */}
                              <div className="relative w-12 h-8 sm:w-16 sm:h-10 shrink-0 overflow-hidden">
                                <div className="relative w-16 h-10 rounded-sm overflow-hidden">
                                  <input
                                    type="color"
                                    value={displayColor}
                                    onChange={(e) => {
                                      const newHex = String(
                                        e.target.value || "",
                                      ).toUpperCase();
                                      setBrandColors((prev) => {
                                        const updated = [...prev];
                                        updated[index] = {
                                          ...updated[index],
                                          hex: newHex,
                                          color: newHex,
                                        };
                                        return updated;
                                      });
                                    }}
                                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                                    onClick={(e) => e.stopPropagation()}
                                  />

                                  <div
                                    className="w-full h-full rounded-sm"
                                    style={{ backgroundColor: displayColor }}
                                  />
                                </div>
                              </div>

                              {/* Name + Hex */}
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-gray-700 truncate">
                                  {color?.name || `Color ${index + 1}`}
                                </span>
                                <span className="text-sm font-medium text-gray-700 truncate">
                                  {displayColor}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="border-t-3 rounded-b-lg border-gray-100 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2 sm:py-2.5 lg:py-3 flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary-dark px-6 sm:px-8 md:px-10 lg:px-12 py-2 lg:py-2.5 rounded-lg text-sm lg:text-base font-medium w-full sm:w-auto min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="overflow-y-auto h-full flex flex-col">
                <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-6 lg:py-8">
                  <UserManagement
                    clientId={localStorage.getItem("Client id")}
                    open={open}
                    isActive={activeTab === "users"}
                  />
                </div>
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

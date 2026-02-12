"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import SectionHeader from "@/components/section-header";
import FormCard from "./FormCard";
import SourceMaterialCard from "./SourceMaterialCard";
import CreateCometFooter from "./CreateCometFooter";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import MultipleChoiceField from "./MultipleChoiceField";
import SliderField from "./SliderField";
import AskKyperPopup from "./AskKyperPopup";
import { graphqlClient } from "@/lib/graphql-client";
import { Info, Trash2, Link2, X } from "lucide-react";
import { toast } from "sonner";
import { useSessionSubscription } from "@/hooks/useSessionSubscription";

export default function CreateComet({
  initialData = null,
  suggestion,
  initialInput,
  isNewComet = false,
  cometData,
  sessionData = null,
  prefillData = null,
  onSubmit,
  isLoading = false,
  error = null,
  allMessages = [],
  setAllMessages = () => {},
  onProgressChange = () => {},
  isAskingKyper = false,
  setIsAskingKyper = () => {},
}) {
  const [files, setFiles] = useState([]);
  const [webpageUrls, setWebpageUrls] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [blurTimeout, setBlurTimeout] = useState(null);
  const [fieldPosition, setFieldPosition] = useState(null);
  const [habitEnabled, setHabitEnabled] = useState(false);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const isAskingKyperRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSessionId(localStorage.getItem("sessionId"));
    }
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      cometTitle: "",
      description: "",
      clientOrg: "",
      clientWebsite: "",
      targetAudience: "",
      learningObjectives: [""],
      cometFocus: "",
      sourceMaterialFidelity: "",
      engagementFrequency: "",
      lengthFrequency: "",
      experienceType: "",
      specialInstructions: "",
      habit: "",
      personalization: "",
    },
  });

  // console.log("prefillData", prefillData);

  useEffect(() => {
    return () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
      }
    };
  }, [blurTimeout]);

  // Note: WebSocket cleanup is now handled by SubscriptionManager

  // Track isAskingKyper in ref for subscription callback
  useEffect(() => {
    isAskingKyperRef.current = isAskingKyper;
  }, [isAskingKyper]);

  // Subscribe to session updates - temporary subscription that reuses existing subscription
  // Note: The form is updated via prefillData prop from DashboardLayout, not directly here
  // This subscription is mainly for when asking Kyper to get immediate updates
  useSessionSubscription(
    sessionId,
    (sessionData) => {
      // Only handle updates when actively asking Kyper (for immediate form updates)
      // Otherwise, updates come through prefillData prop which triggers the useEffect below
      if (!isAskingKyperRef.current) {
        return;
      }

      // Update entire form with comet_creation_data when asking Kyper
      if (sessionData.comet_creation_data) {
        // console.log(
        //   "Updating entire form with comet_creation_data:",
        //   sessionData.comet_creation_data
        // );

        const basicInfo = sessionData.comet_creation_data["Basic Information"];
        const audienceObjectives =
          sessionData.comet_creation_data["Audience & Objectives"];
        const experienceDesign =
          sessionData.comet_creation_data["Experience Design"];

        setAllMessages((prev) => {
          const filteredPrev = prev.filter((msg, index) => {
            if (msg.from === "bot" && index === prev.length - 1) {
              return false;
            }
            return true;
          });
          return [
            ...filteredPrev,
            {
              from: "bot",
              content:
                basicInfo["Comet Title"] || basicInfo["Client Organization"],
            },
          ];
        });

        if (basicInfo) {
          if (basicInfo["Comet Title"])
            setValue("cometTitle", basicInfo["Comet Title"]);
          if (basicInfo["Description"])
            setValue("description", basicInfo["Description"]);
          if (basicInfo["Client Organization"])
            setValue("clientOrg", basicInfo["Client Organization"]);
          if (basicInfo["Client Website"])
            setValue("clientWebsite", basicInfo["Client Website"]);
        }

        if (audienceObjectives) {
          if (audienceObjectives["Target Audience"])
            setValue("targetAudience", audienceObjectives["Target Audience"]);
          // Handle both "Learning Objectives" and "Learning and Behaviour Objectives"
          const learningObjectives =
            audienceObjectives["Learning and Behaviour Objectives"] ||
            audienceObjectives["Learning Objectives"];
          if (learningObjectives) {
            const objectivesArray = Array.isArray(learningObjectives)
              ? learningObjectives
              : typeof learningObjectives === "string"
                ? learningObjectives.split("\n").filter((obj) => obj.trim())
                : [learningObjectives];
            setValue("learningObjectives", objectivesArray);
          }
        }

        if (experienceDesign) {
          if (experienceDesign["Focus"]) {
            const focusValue = experienceDesign["Focus"];
            const lowerFocus = focusValue.toLowerCase();
            if (lowerFocus.includes("teaching new things")) {
              setValue("cometFocus", "Teaching new things");
            } else if (lowerFocus.includes("reinforcing")) {
              setValue("cometFocus", "reinforcing_applying");
            } else {
              setValue("cometFocus", focusValue);
            }
          }

          if (experienceDesign["Duration"]) {
            setValue("lengthFrequency", experienceDesign["Duration"]);
          } else if (experienceDesign["Length & Frequency"]) {
            setValue("lengthFrequency", experienceDesign["Length & Frequency"]);
          }

          if (experienceDesign["Engagement Frequency"]) {
            const engagementValue = experienceDesign["Engagement Frequency"];
            if (engagementValue.toLowerCase().includes("weekly")) {
              setValue("engagementFrequency", "weekly");
            } else if (engagementValue.toLowerCase().includes("daily")) {
              setValue("engagementFrequency", "daily");
            } else {
              setValue("engagementFrequency", engagementValue);
            }
          }

          if (experienceDesign["Source Alignment"]) {
            const sourceValue = experienceDesign["Source Alignment"];
            if (sourceValue.toLowerCase().includes("fidelity")) {
              setValue("sourceMaterialFidelity", "fidelity");
            } else if (sourceValue.toLowerCase().includes("balanced")) {
              setValue("sourceMaterialFidelity", "balanced");
            } else if (sourceValue.toLowerCase().includes("extension")) {
              setValue("sourceMaterialFidelity", "extension");
            } else {
              setValue("sourceMaterialFidelity", sourceValue);
            }
          }

          if (experienceDesign["Experience Type"])
            setValue("experienceType", experienceDesign["Experience Type"]);
          if (experienceDesign["Special Instructions"])
            setValue(
              "specialInstructions",
              experienceDesign["Special Instructions"],
            );
        }

        setIsAskingKyper(false);
      }
    },
    (error) => {
      console.error("Subscription error:", error);
      if (isAskingKyperRef.current) {
        setIsAskingKyper(false);
      }
    },
    { forceTemporary: true },
  );

  useEffect(() => {
    if (prefillData) {
      // console.log("CreateComet: Prefilling form with data:", prefillData);

      // Restore webpage URLs from local/session so they show in the UI
      if (prefillData.webpage_url && Array.isArray(prefillData.webpage_url) && prefillData.webpage_url.length > 0) {
        setWebpageUrls(prefillData.webpage_url);
      }

      if (prefillData.comet_creation_data) {
        const basicInfo = prefillData.comet_creation_data["Basic Information"];
        const audienceObjectives =
          prefillData.comet_creation_data["Audience & Objectives"];
        const experienceDesign =
          prefillData.comet_creation_data["Experience Design"];

        if (basicInfo) {
          if (basicInfo["Comet Title"])
            setValue("cometTitle", basicInfo["Comet Title"]);
          if (basicInfo["Description"])
            setValue("description", basicInfo["Description"]);
          if (basicInfo["Client Organization"])
            setValue("clientOrg", basicInfo["Client Organization"]);
          if (basicInfo["Client Website"])
            setValue("clientWebsite", basicInfo["Client Website"]);
        }

        if (audienceObjectives) {
          if (audienceObjectives["Target Audience"])
            setValue("targetAudience", audienceObjectives["Target Audience"]);
          // Handle both "Learning Objectives" and "Learning and Behaviour Objectives"
          const learningObjectives =
            audienceObjectives["Learning and Behaviour Objectives"] ||
            audienceObjectives["Learning Objectives"];
          if (learningObjectives) {
            setValue("learningObjectives", learningObjectives);
          }
        }

        if (experienceDesign) {
          // console.log("Experience Design data:", experienceDesign);
          // Map Focus field to cometFocus
          if (experienceDesign["Focus"]) {
            // Map text values to form values
            const focusValue = experienceDesign["Focus"];
            const lowerFocus = focusValue.toLowerCase();
            if (
              lowerFocus.includes("teaching new things") ||
              lowerFocus.includes("teaching new")
            ) {
              setValue("cometFocus", "Teaching new things");
            } else if (
              lowerFocus.includes("reinforcing") ||
              lowerFocus.includes("applying")
            ) {
              setValue("cometFocus", "reinforcing_applying");
            } else {
              setValue("cometFocus", focusValue);
            }
          }

          // Map Duration field to lengthFrequency
          if (experienceDesign["Duration"]) {
            setValue("lengthFrequency", experienceDesign["Duration"]);
          } else if (experienceDesign["Length & Frequency"]) {
            setValue("lengthFrequency", experienceDesign["Length & Frequency"]);
          }

          // Map Engagement Frequency field
          if (experienceDesign["Engagement Frequency"]) {
            const engagementValue = experienceDesign["Engagement Frequency"];
            if (engagementValue.toLowerCase().includes("weekly")) {
              setValue("engagementFrequency", "weekly");
            } else if (engagementValue.toLowerCase().includes("daily")) {
              setValue("engagementFrequency", "daily");
            } else {
              setValue("engagementFrequency", engagementValue);
            }
          }

          if (experienceDesign["Source Alignment"]) {
            const sourceValue = experienceDesign["Source Alignment"];
            if (sourceValue.toLowerCase().includes("fidelity")) {
              setValue("sourceMaterialFidelity", "fidelity");
            } else if (sourceValue.toLowerCase().includes("balanced")) {
              setValue("sourceMaterialFidelity", "balanced");
            } else if (sourceValue.toLowerCase().includes("extension")) {
              setValue("sourceMaterialFidelity", "extension");
            } else {
              setValue("sourceMaterialFidelity", sourceValue);
            }
          }

          if (experienceDesign["Experience Type"])
            setValue("experienceType", experienceDesign["Experience Type"]);
          if (experienceDesign["Special Instructions"])
            setValue(
              "specialInstructions",
              experienceDesign["Special Instructions"],
            );
        }

        if (prefillData.comet_creation_data["Source Materials"]) {
        }
      } else {
        if (prefillData.cometTitle)
          setValue("cometTitle", prefillData.cometTitle);
        if (prefillData.description)
          setValue("specialInstructions", prefillData.description);
        if (prefillData.specialInstructions)
          setValue("specialInstructions", prefillData.specialInstructions);
        if (prefillData.targetAudience)
          setValue("targetAudience", prefillData.targetAudience);
        if (prefillData.learningObjectives) {
          const objectives = Array.isArray(prefillData.learningObjectives)
            ? prefillData.learningObjectives
            : typeof prefillData.learningObjectives === "string"
              ? prefillData.learningObjectives
                  .split("\n")
                  .filter((obj) => obj.trim())
              : [prefillData.learningObjectives];
          setValue("learningObjectives", objectives);
        }
        if (prefillData.cometFocus)
          setValue("cometFocus", prefillData.cometFocus);
        if (prefillData.sourceMaterialFidelity)
          setValue(
            "sourceMaterialFidelity",
            prefillData.sourceMaterialFidelity,
          );
        if (prefillData.engagementFrequency)
          setValue("engagementFrequency", prefillData.engagementFrequency);
        if (prefillData.lengthFrequency)
          setValue("lengthFrequency", prefillData.duration);
        if (prefillData.clientOrg) setValue("clientOrg", prefillData.clientOrg);
        if (prefillData.clientWebsite)
          setValue("clientWebsite", prefillData.clientWebsite);
      }
    }
  }, [prefillData, setValue]);

  const requiredFields = [
    "cometTitle",
    "clientOrg",
    "targetAudience",
    "learningObjectives",
    "cometFocus",
    "sourceMaterialFidelity",
    "engagementFrequency",
    "lengthFrequency",
    "specialInstructions",
  ];

  const handleFormSubmit = async (data) => {
    try {
      if (typeof window !== "undefined" && window.uploadAllFiles) {
        console.log("Uploading files before creating outline...");
        await window.uploadAllFiles();
        console.log("File upload complete");
      }

      if (onSubmit) {
        // Include toggle states and their associated data
        const formData = {
          ...data,
          habitEnabled,
          habitText: data.habit || "",
          personalizationEnabled,
          webpage_url: webpageUrls.filter((u) => u.trim()),
        };
        await onSubmit(formData);
      }
    } catch (error) {
      console.error("Error saving comet data:", error);
    }
  };
  //progress bar logic
  useEffect(() => {
    const calculateProgress = (values) => {
      if (!requiredFields.length) return 0;
      const filledCount = requiredFields.filter((field) => {
        const value = values[field];
        if (typeof value === "string") {
          return value.trim().length > 0;
        }
        if (Array.isArray(value)) {
          return value.some((item) => item && item.trim().length > 0);
        }
        return Boolean(value);
      }).length;
      return Math.round((filledCount / requiredFields.length) * 100);
    };

    const initialValues = watch();
    onProgressChange(calculateProgress(initialValues));

    const subscription = watch((values) => {
      onProgressChange(calculateProgress(values));
    });

    return () => subscription.unsubscribe();
  }, [watch, onProgressChange]);

  const handleAskKyper = async (query) => {
    try {
      setIsAskingKyper(true);

      const formValues = watch();

      let currentSessionId =
        sessionId ||
        (typeof window !== "undefined"
          ? localStorage.getItem("sessionId")
          : null);

      const formattedCometData = {
        "Basic Information": {
          "Comet Title": formValues.cometTitle || "",
          Description: formValues.description || "",
          "Client Organization": formValues.clientOrg || "",
          "Client Website": formValues.clientWebsite || "",
        },
        "Audience & Objectives": {
          "Target Audience": formValues.targetAudience || "",
          "Learning Objectives": Array.isArray(formValues.learningObjectives)
            ? formValues.learningObjectives.filter((obj) => obj && obj.trim())
            : formValues.learningObjectives || "",
        },
        "Experience Design": {
          "Length & Frequency": formValues.D || "",
          "Experience Type": "",
          "Special Instructions": formValues.specialInstructions || "",
        },
      };

      const fieldLabelMap = {
        cometTitle: "Comet Title",
        description: "Description",
        clientOrg: "Client Organization",
        clientWebsite: "Client Website",
      };

      const fieldLabel = fieldLabelMap[focusedField] || focusedField;
      const currentFieldValue = formValues[focusedField] || "";
      let parsedSessionData = null;
      try {
        const raw = localStorage.getItem("sessionData");
        if (raw) parsedSessionData = JSON.parse(raw);
      } catch {}
      const chatbotConversation = parsedSessionData?.chatbot_conversation || [];

      const conversationMessage = `{ 'field': '${fieldLabel}', 'value': '${currentFieldValue}', 'instruction': '${query}' }`;
      // {
      //   field: fieldLabel,
      //   value: currentFieldValue,
      //   instruction: query,
      // };

      console.log("conversationMessage object:", conversationMessage);
      setAllMessages((prev) => [
        ...prev,
        { from: "user", content: query || "" },
      ]);

      const additionalData = {
        personalization_enabled: personalizationEnabled || false,
        habit_enabled: habitEnabled || false,
        habit_description: formValues.habit || "",
      };

      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: "comet_data_update",
        comet_creation_data: formattedCometData,
        response_outline: {},
        response_path: {},
        additional_data: additionalData,
        chatbot_conversation: [
          ...chatbotConversation,
          { user: conversationMessage },
        ],
        to_modify: {},
        webpage_url: webpageUrls.filter((u) => u.trim()),
      });

      console.log("Final payload:", cometJsonForMessage, {
        session_id: currentSessionId,
        input_type: "comet_data_update",
        comet_creation_data: formattedCometData,
        response_outline: {},
        response_path: {},
        additional_data: additionalData,
        chatbot_conversation: [
          ...chatbotConversation,
          { user: conversationMessage },
        ],
        to_modify: {},
      });
      const messageResponse =
        await graphqlClient.sendMessage(cometJsonForMessage);
      console.log(
        "Message sent, waiting for AI response via WebSocket:",
        messageResponse,
      );

      console.log(
        "messageResponse>>>>>>>>>>>.test",
        messageResponse.sendMessage,
      );
      setAllMessages((prev) => [
        ...prev,
        // { from: "bot", content: messageResponse.sendMessage },
      ]);
      // }
    } catch (error) {
      console.error("Error asking Kyper:", error);
    }
  };

  const handleTextSelection = (fieldName, e) => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      setBlurTimeout(null);
    }

    if (!e?.target) return;

    const input = e.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const hasTextSelected = start !== end && start !== null && end !== null;

    if (hasTextSelected) {
      setFocusedField(fieldName);
      const rect = input.getBoundingClientRect();
      setFieldPosition({
        top: rect.bottom + 10,
        left: rect.left,
      });
    } else {
      setFocusedField(null);
      setFieldPosition(null);
    }
  };

  const handleFieldBlur = (e) => {
    if (e?.target) {
      const input = e.target;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const hasTextSelected = start !== end && start !== null && end !== null;

      // If text is selceted, the close timeout will not statr
      if (hasTextSelected) {
        return;
      }
    }

    const timeout = setTimeout(() => {
      setFocusedField(null);
      setFieldPosition(null);
    }, 500);
    setBlurTimeout(timeout);
  };

  const handlePopupInteract = () => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      setBlurTimeout(null);
    }
  };

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

  const handleAddObjective = () => {
    const current = watch("learningObjectives") || [""];
    setValue("learningObjectives", [...current, ""]);
  };

  const handleDeleteObjective = (index) => {
    const current = watch("learningObjectives") || [""];
    if (current.length > 1) {
      const updated = current.filter((_, i) => i !== index);
      setValue("learningObjectives", updated);
    } else {
      // Keep at least one empty objective
      setValue("learningObjectives", [""]);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col flex-1 w-full h-full bg-background rounded-xl"
      >
        <div className="w-full px-2 pt-2">
          <SectionHeader title="Create New Comet" />
        </div>
        <div className="p-1 sm:p-2 w-full h-full overflow-y-auto create-comet-scrollbar">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 bg-primary-50 rounded-xl h-full p-1 sm:p-2">
            <div className="flex p-1 sm:p-2 w-full lg:w-1/2 bg-background rounded-xl">
              <div className="flex flex-1 flex-col border border-gray-200 rounded-sm h-full space-y-3 sm:space-y-4 p-2 sm:p-4 overflow-y-auto ">
                <FormCard
                  title="Basic Information"
                  className="text-semibold p-0! m-0!"
                  headerClassName="p-0 m-0"
                >
                  <CardContent className="space-y-3 pb-4">
                    <div className="space-y-1">
                      <Label htmlFor="comet-title">Comet Title</Label>
                      <Input
                        id="comet-title"
                        placeholder="Enter comet title"
                        {...register("cometTitle")}
                        onSelect={(e) => handleTextSelection("cometTitle", e)}
                        onBlur={(e) => handleFieldBlur(e)}
                        className="border border-gray-200 rounded-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-primary-300"
                      />
                      {errors.cometTitle && (
                        <p className="text-red-600 text-sm">
                          {errors.cometTitle.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        placeholder="Enter description"
                        {...register("description")}
                        onSelect={(e) => handleTextSelection("description", e)}
                        onBlur={(e) => handleFieldBlur(e)}
                        className="border border-gray-200 rounded-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-primary-300 resize-none overflow-y-auto create-comet-scrollbar"
                      />
                      {errors.description && (
                        <p className="text-red-600 text-sm">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    {/* <div className="space-y-1">
                      <Label htmlFor="client-website">Client Website</Label>
                      <Input
                        id="client-website"
                        placeholder="Enter client website URL"
                        {...register("clientWebsite")}
                        onFocus={(e) => handleFieldFocus("clientWebsite", e)}
                        onBlur={handleFieldBlur}
                      />
                      {errors.clientWebsite && (
                        <p className="text-red-600 text-sm">
                          {errors.clientWebsite.message}
                        </p>
                      )} 
                    </div> */}
                  </CardContent>
                </FormCard>

                <FormCard title="Audience & Objectives">
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="target-audience">Target Audience</Label>
                      <Textarea
                        id="target-audience"
                        rows={3}
                        placeholder="Describe your target audience"
                        {...register("targetAudience")}
                        onSelect={(e) =>
                          handleTextSelection("targetAudience", e)
                        }
                        className="border border-gray-200 rounded-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-primary-300"
                      />
                      {errors.targetAudience && (
                        <p className="text-red-600 text-sm">
                          {errors.targetAudience.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="learning-objectives">
                        Learning and Behavior Objectives
                      </Label>
                      <div className="space-y-2">
                        {(watch("learningObjectives") || [""]).map(
                          (objective, index) => (
                            <div key={index} className="flex gap-2 items-start">
                              <Textarea
                                id={`learning-objective-${index}`}
                                placeholder={`Learning objective ${index + 1}`}
                                value={objective || ""}
                                onChange={(e) => {
                                  const current = watch(
                                    "learningObjectives",
                                  ) || [""];
                                  const updated = [...current];
                                  updated[index] = e.target.value;
                                  setValue("learningObjectives", updated);
                                }}
                                onSelect={(e) =>
                                  handleTextSelection(
                                    `learningObjectives.${index}`,
                                    e,
                                  )
                                }
                                className="border border-gray-200 rounded-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-primary-300 min-h-10 flex-1"
                              />
                              <Button
                                size="sm"
                                type="button"
                                variant="ghost"
                                onClick={() => handleDeleteObjective(index)}
                                className="text-red-600 p-2 shrink-0"
                                title="Delete objective"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          ),
                        )}
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={handleAddObjective}
                          className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
                        >
                          Add
                        </Button>
                      </div>
                      {errors.learningObjectives && (
                        <p className="text-red-600 text-sm">
                          {errors.learningObjectives.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </FormCard>

                <FormCard title="Experience Design">
                  <CardContent className="space-y-4">
                    <MultipleChoiceField
                      label="What's the focus of this Comet?"
                      name="cometFocus"
                      options={[
                        {
                          value: "Teaching new things",
                          label: "Teaching new things",
                        },
                        {
                          value: "reinforcing_applying",
                          label: "Reinforcing & applying",
                        },
                      ]}
                      required={false}
                      value={watch("cometFocus")}
                      onChange={(e) => {
                        setValue("cometFocus", e.target.value);
                      }}
                      orientation="horizontal"
                    />

                    <SliderField
                      label="How closely should this Comet follow your source materials?"
                      name="sourceMaterialFidelity"
                      options={[
                        { value: "fidelity", label: "Fidelity" },
                        { value: "balanced", label: "Balanced" },
                        { value: "extension", label: "Extension" },
                      ]}
                      required={false}
                      value={watch("sourceMaterialFidelity")}
                      onChange={(e) => {
                        setValue("sourceMaterialFidelity", e.target.value);
                      }}
                    />

                    <MultipleChoiceField
                      label="How often should learners engage?"
                      name="engagementFrequency"
                      options={[
                        { value: "daily", label: "Daily" },
                        { value: "weekly", label: "Weekly" },
                      ]}
                      required={false}
                      value={watch("engagementFrequency")}
                      onChange={(e) => {
                        setValue("engagementFrequency", e.target.value);
                      }}
                      orientation="horizontal"
                    />

                    <div className="space-y-1">
                      <Label htmlFor="length-frequency">
                        How long should this Comet be?
                      </Label>
                      <Input
                        id="length-frequency"
                        placeholder=" "
                        {...register("lengthFrequency")}
                        className="border border-gray-200 rounded-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-primary-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="special-instructions">
                        Special Instructions
                      </Label>
                      <Textarea
                        id="special-instructions"
                        rows={3}
                        // placeholder="Focus on practical scenarios for first-time managers. Include at least one interactive quiz and one downloadable tool template"
                        {...register("specialInstructions")}
                        onSelect={(e) =>
                          handleTextSelection("specialInstructions", e)
                        }
                        className="border border-gray-200 rounded-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-primary-300"
                      />
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-300 my-4"></div>

                    {/* Habit Section */}
                    <div className="space-y-3">
                      <ToggleSwitch
                        checked={habitEnabled}
                        onChange={setHabitEnabled}
                        label="Habit"
                        showInfo={true}
                      />

                      {/* <div className="relative bg-gray-100 p-1 rounded-lg">
                        <Textarea
                          id="habit"
                          rows={4}
                          placeholder="Enter habit details..."
                          {...register("habit")}
                          onSelect={(e) => handleTextSelection("habit", e)}
                          className="border border-gray-200 rounded-lg outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-primary-300 resize-none"
                        />
                      </div> */}
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-300 my-4"></div>

                    {/* Personalization Section */}
                    <div className="space-y-3">
                      <ToggleSwitch
                        checked={personalizationEnabled}
                        onChange={setPersonalizationEnabled}
                        label="Personalization"
                        showInfo={false}
                      />
                    </div>
                  </CardContent>
                </FormCard>
              </div>
            </div>

            <div className="flex p-1 sm:p-2 w-full lg:w-1/2 bg-background rounded-xl">
              <div className="flex-1 w-full border rounded-xl overflow-auto h-full create-comet-scrollbar p-2 sm:p-4">
                <SourceMaterialCard
                  files={files}
                  setFiles={setFiles}
                  isNewComet={isNewComet}
                  webpageUrls={webpageUrls}
                  setWebpageUrls={setWebpageUrls}
                />
              </div>
            </div>
          </div>
        </div>

        <CreateCometFooter
          reset={reset}
          handleSubmit={handleSubmit(handleFormSubmit)}
          isFormValid={isValid && !isSubmitting}
          hasChanges={false}
          dirtyCount={0}
          isUpdating={isLoading || isSubmitting}
          error={error}
        />
      </form>

      <AskKyperPopup
        focusedField={focusedField}
        fieldPosition={fieldPosition}
        isLoading={isAskingKyper}
        onClose={() => {
          if (blurTimeout) {
            clearTimeout(blurTimeout);
            setBlurTimeout(null);
          }
          setFocusedField(null);
          setFieldPosition(null);
        }}
        onAskKyper={handleAskKyper}
        onPopupInteract={handlePopupInteract}
      />
    </>
  );
}

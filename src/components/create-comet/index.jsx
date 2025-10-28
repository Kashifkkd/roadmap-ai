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
import MultipleChoiceField from "./MultipleChoiceField";
import SliderField from "./SliderField";
import AskKyperPopup from "./AskKyperPopup";
import { graphqlClient } from "@/lib/graphql-client";

export default function CreateComet({
  initialData = null,
  suggestion,
  initialInput,
  cometData,
  sessionData = null,
  prefillData = null,
  onSubmit,
  isLoading = false,
  error = null,
}) {
  const [files, setFiles] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [blurTimeout, setBlurTimeout] = useState(null);
  const [fieldPosition, setFieldPosition] = useState(null);
  const [isAskingKyper, setIsAskingKyper] = useState(false);
  const subscriptionCleanupRef = useRef(null);

  const sessionId = localStorage.getItem("sessionId");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onSubmit",
    defaultValues: {
      cometTitle: "",
      clientOrg: "",
      clientWebsite: "",
      targetAudience: "",
      learningObjectives: "",
      cometFocus: "",
      sourceMaterialFidelity: "",
      engagementFrequency: "",
      lengthFrequency: "",
      experienceType: "",
      specialInstructions: "",
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

  useEffect(() => {
    return () => {
      graphqlClient.cleanup();
    };
  }, []);

  // Listen for socket response when asking Kyper
  useEffect(() => {
    console.log("sessionId", sessionId);
    console.log("isAskingKyper", isAskingKyper);
    if (!isAskingKyper || !sessionId) return;

    let cleanup;
    const subscribeToUpdates = async () => {
      cleanup = await graphqlClient.subscribeToSessionUpdates(
        sessionId,
        (sessionData) => {
          console.log("AI response received:", sessionData);

          // Update entire form with comet_creation_data like prefill
          if (sessionData.comet_creation_data) {
            console.log("Updating entire form with comet_creation_data:", sessionData.comet_creation_data);
            
            const basicInfo = sessionData.comet_creation_data["Basic Information"];
            const audienceObjectives = sessionData.comet_creation_data["Audience & Objectives"];
            const experienceDesign = sessionData.comet_creation_data["Experience Design"];

            if (basicInfo) {
              if (basicInfo["Comet Title"]) setValue("cometTitle", basicInfo["Comet Title"]);
              if (basicInfo["Client Organization"]) setValue("clientOrg", basicInfo["Client Organization"]);
              if (basicInfo["Client Website"]) setValue("clientWebsite", basicInfo["Client Website"]);
            }

            if (audienceObjectives) {
              if (audienceObjectives["Target Audience"]) setValue("targetAudience", audienceObjectives["Target Audience"]);
              if (audienceObjectives["Learning Objectives"]) setValue("learningObjectives", audienceObjectives["Learning Objectives"]);
            }

            if (experienceDesign) {
              if (experienceDesign["Length & Frequency"]) setValue("lengthFrequency", experienceDesign["Length & Frequency"]);
              if (experienceDesign["Experience Type"]) setValue("experienceType", experienceDesign["Experience Type"]);
              if (experienceDesign["Special Instructions"]) setValue("specialInstructions", experienceDesign["Special Instructions"]);
            }

            setIsAskingKyper(false);
          }

          // Previous approach - update only specific field (commented out for potential revert)
          // if (sessionData.chatbot_conversation) {
          //   const agentMessage = sessionData.chatbot_conversation.find(
          //     (conv) => conv.agent
          //   )?.agent;

          //   if (agentMessage && focusedField) {
          //     try {
          //       const parsedResponse = JSON.parse(agentMessage);
          //       if (parsedResponse.value || parsedResponse.updatedValue) {
          //         setValue(
          //           focusedField,
          //           parsedResponse.value || parsedResponse.updatedValue
          //         );
          //       }
          //     } catch {
          //       setValue(focusedField, agentMessage.trim());
          //     }
          //     setIsAskingKyper(false);
          //   }
          // }
        },
        (error) => {
          console.error("Subscription error:", error);
          setIsAskingKyper(false);
        }
      );
    };

    subscribeToUpdates();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isAskingKyper, sessionId, focusedField, setValue]);


  useEffect(() => {
    if (prefillData) {
      console.log("Prefilling form with data:", prefillData);

      if (prefillData.comet_creation_data) {
        const basicInfo = prefillData.comet_creation_data["Basic Information"];
        const audienceObjectives =
          prefillData.comet_creation_data["Audience & Objectives"];
        const experienceDesign =
          prefillData.comet_creation_data["Experience Design"];

        if (basicInfo) {
          if (basicInfo["Comet Title"])
            setValue("cometTitle", basicInfo["Comet Title"]);
          if (basicInfo["Client Organization"])
            setValue("clientOrg", basicInfo["Client Organization"]);
          if (basicInfo["Client Website"])
            setValue("clientWebsite", basicInfo["Client Website"]);
        }

        if (audienceObjectives) {
          if (audienceObjectives["Target Audience"])
            setValue("targetAudience", audienceObjectives["Target Audience"]);
          if (audienceObjectives["Learning Objectives"])
            setValue(
              "learningObjectives",
              audienceObjectives["Learning Objectives"]
            );
        }

        if (experienceDesign) {
          if (experienceDesign["Length & Frequency"])
            setValue("lengthFrequency", experienceDesign["Length & Frequency"]);
          if (experienceDesign["Experience Type"])
            setValue("experienceType", experienceDesign["Experience Type"]);
          if (experienceDesign["Special Instructions"])
            setValue(
              "specialInstructions",
              experienceDesign["Special Instructions"]
            );
        }

        if (prefillData.comet_creation_data["Source Materials"]) {
          console.log(
            "Source Materials:",
            prefillData.comet_creation_data["Source Materials"]
          );
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
            ? prefillData.learningObjectives.join("\n")
            : prefillData.learningObjectives;
          setValue("learningObjectives", objectives);
        }
        if (prefillData.cometFocus)
          setValue("cometFocus", prefillData.cometFocus);
        if (prefillData.sourceMaterialFidelity)
          setValue(
            "sourceMaterialFidelity",
            prefillData.sourceMaterialFidelity
          );
        if (prefillData.engagementFrequency)
          setValue("engagementFrequency", prefillData.engagementFrequency);
        if (prefillData.lengthFrequency)
          setValue("lengthFrequency", prefillData.lengthFrequency);
        if (prefillData.clientOrg) setValue("clientOrg", prefillData.clientOrg);
        if (prefillData.clientWebsite)
          setValue("clientWebsite", prefillData.clientWebsite);
      }
    }
  }, [prefillData, setValue]);

  const handleFormSubmit = async (data) => {
    console.log("Form submitted:", data);
    console.log("Form validation state:", { isValid, errors });

    try {
      if (typeof window !== "undefined" && window.uploadAllFiles) {
        console.log("Uploading files before creating outline...");
        await window.uploadAllFiles();
        console.log("File upload complete");
      }

      if (onSubmit) {
        await onSubmit(data);
      }
    } catch (error) {
      console.error("Error saving comet data:", error);
    }
  };

  const handleAskKyper = async (query) => {
    console.log("Ask Kyper clicked for field:", focusedField);
    console.log("Query:", query);

    try {
      setIsAskingKyper(true);

      const formValues = watch();
      let currentSessionId =
        localStorage.getItem("sessionId");

      const formattedCometData = {
        "Basic Information": {
          "Comet Title": formValues.cometTitle || "",
          "Client Organization": formValues.clientOrg || "",
          "Client Website": formValues.clientWebsite || "",
        },
        "Audience & Objectives": {
          "Target Audience": formValues.targetAudience || "",
          "Learning Objectives": formValues.learningObjectives || "",
        },
        "Experience Design": {
          "Length & Frequency": formValues.lengthFrequency || "",
          "Experience Type": "",
          "Special Instructions": formValues.specialInstructions || "",
        },
      };

      const fieldLabelMap = {
        cometTitle: "Comet Title",
        clientOrg: "Client Organization",
        clientWebsite: "Client Website",
      };

      const fieldLabel = fieldLabelMap[focusedField] || focusedField;
      const currentFieldValue = formValues[focusedField] || "";

      const conversationMessage = `{ 'field': '${fieldLabel}', 'value': '${currentFieldValue}', 'instruction': '${query}' }`;
      // {
      //   field: fieldLabel,
      //   value: currentFieldValue,
      //   instruction: query,
      // };


      console.log("conversationMessage object:", conversationMessage);

      const cometJsonForMessage = JSON.stringify({
        session_id: currentSessionId,
        input_type: "comet_data_update",
        comet_creation_data: formattedCometData,
        response_outline: {},
        response_path: {},
        chatbot_conversation: [{ user: conversationMessage }],
        to_modify: {},
      });

      console.log("Final payload:", cometJsonForMessage, {
        session_id: currentSessionId,
        input_type: "comet_data_update",
        comet_creation_data: formattedCometData,
        response_outline: {},
        response_path: {},
        chatbot_conversation: [{ user: conversationMessage }],
        to_modify: {},
      });
      const messageResponse = await graphqlClient.sendMessage(
        cometJsonForMessage
      );
      console.log(
        "Message sent, waiting for AI response via WebSocket:",
        messageResponse
      );

    } catch (error) {
      console.error("Error asking Kyper:", error);
    }
  };

  const handleFieldFocus = (fieldName, e) => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      setBlurTimeout(null);
    }
    setFocusedField(fieldName);

    if (e && e.target) {
      const rect = e.target.getBoundingClientRect();
      setFieldPosition({
        top: rect.bottom + 10,
        left: rect.left,
      });
    }
  };

  const handleFieldBlur = () => {
    const timeout = setTimeout(() => {
      setFocusedField(null);
      setFieldPosition(null);
    }, 300);
    setBlurTimeout(timeout);
  };

  const handlePopupInteract = () => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      setBlurTimeout(null);
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
              <div className="flex flex-1 flex-col border rounded-xl h-full space-y-3 sm:space-y-4 p-2 sm:p-4 overflow-y-auto create-comet-scrollbar">
                <FormCard
                  title="Basic Information"
                  className="text-semibold !p-0 !m-0"
                  headerClassName="p-0 m-0"
                >
                  <CardContent className="space-y-3 pb-4">
                    <div className="space-y-1">
                      <Label htmlFor="comet-title">Comet Title *</Label>
                      <Input
                        id="comet-title"
                        placeholder="Enter comet title"
                        {...register("cometTitle")}
                        onFocus={(e) => handleFieldFocus("cometTitle", e)}
                        onBlur={handleFieldBlur}
                      />
                      {errors.cometTitle && (
                        <p className="text-red-600 text-sm">
                          {errors.cometTitle.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="client-org">Description *</Label>
                      <Input
                        id="client-org"
                        placeholder="Enter description"
                        {...register("clientOrg")}
                        onFocus={(e) => handleFieldFocus("clientOrg", e)}
                        onBlur={handleFieldBlur}
                      />
                      {errors.clientOrg && (
                        <p className="text-red-600 text-sm">
                          {errors.clientOrg.message}
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
                      <Label htmlFor="target-audience">Target Audience *</Label>
                      <Textarea
                        id="target-audience"
                        rows={3}
                        placeholder="Describe your target audience"
                        {...register("targetAudience")}
                      />
                      {errors.targetAudience && (
                        <p className="text-red-600 text-sm">
                          {errors.targetAudience.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="learning-objectives">
                        Learning Objectives *
                      </Label>
                      <Textarea
                        id="learning-objectives"
                        rows={3}
                        placeholder="Define learning objectives"
                        {...register("learningObjectives")}
                      />
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
                          value: "learning_new_content",
                          label: "Learning new content",
                        },
                        {
                          value: "reinforcing_applying",
                          label: "Reinforcing & applying",
                        },
                      ]}
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
                      value="balanced"
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
                        placeholder="e.g., 4 weeks - 2 microlearning steps per week"
                        {...register("lengthFrequency")}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="special-instructions">
                        Special Instructions
                      </Label>
                      <Textarea
                        id="special-instructions"
                        rows={3}
                        placeholder="Focus on practical scenarios for first-time managers. Include at least one interactive quiz and one downloadable tool template"
                        {...register("specialInstructions")}
                      />
                    </div>
                  </CardContent>
                </FormCard>
              </div>
            </div>

            <div className="flex p-1 sm:p-2 w-full lg:w-1/2 bg-background rounded-xl">
              <div className="flex-1 w-full border rounded-xl overflow-auto h-full create-comet-scrollbar p-2 sm:p-4">
                <SourceMaterialCard files={files} setFiles={setFiles} />
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

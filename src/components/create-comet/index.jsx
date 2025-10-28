"use client";

import React, { useState, useEffect } from "react";
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

  console.log("prefillData", prefillData);

  // Handle prefillData changes
  useEffect(() => {
    if (prefillData) {
      console.log("Prefilling form with data:", prefillData);

      // Check if data has nested structure from sessionData
      if (prefillData.comet_creation_data) {
        const basicInfo = prefillData.comet_creation_data["Basic Information"];
        const audienceObjectives = prefillData.comet_creation_data["Audience & Objectives"];
        const experienceDesign = prefillData.comet_creation_data["Experience Design"];
        
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
        
        // Handle source materials if present
        if (prefillData.comet_creation_data["Source Materials"]) {
          // You might want to handle this differently based on your needs
          console.log("Source Materials:", prefillData.comet_creation_data["Source Materials"]);
        }
      } else {
        // Handle flat structure (legacy support)
        if (prefillData.cometTitle) setValue("cometTitle", prefillData.cometTitle);
        if (prefillData.description) setValue("specialInstructions", prefillData.description);
        if (prefillData.specialInstructions) setValue("specialInstructions", prefillData.specialInstructions);
        if (prefillData.targetAudience) setValue("targetAudience", prefillData.targetAudience);
        if (prefillData.learningObjectives) {
          const objectives = Array.isArray(prefillData.learningObjectives)
            ? prefillData.learningObjectives.join('\n')
            : prefillData.learningObjectives;
          setValue("learningObjectives", objectives);
        }
        if (prefillData.cometFocus) setValue("cometFocus", prefillData.cometFocus);
        if (prefillData.sourceMaterialFidelity) setValue("sourceMaterialFidelity", prefillData.sourceMaterialFidelity);
        if (prefillData.engagementFrequency) setValue("engagementFrequency", prefillData.engagementFrequency);
        if (prefillData.lengthFrequency) setValue("lengthFrequency", prefillData.lengthFrequency);
        if (prefillData.clientOrg) setValue("clientOrg", prefillData.clientOrg);
        if (prefillData.clientWebsite) setValue("clientWebsite", prefillData.clientWebsite);
      }
    }
  }, [prefillData, setValue]);

  const handleFormSubmit = async (data) => {
    console.log("Form submitted:", data);
    console.log("Form validation state:", { isValid, errors });

    try {
      // Upload files before submitting the form
      if (typeof window !== 'undefined' && window.uploadAllFiles) {
        console.log('Uploading files before creating outline...');
        await window.uploadAllFiles();
        console.log('File upload complete');
      }

      if (onSubmit) {
        await onSubmit(data);
      }
    } catch (error) {
      console.error("Error saving comet data:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col flex-1 w-full h-full bg-background rounded-xl"
    >
      <div className="w-full px-2 pt-2">
        <SectionHeader title="Create New Comet" />
      </div>
      <div
        className="p-1 sm:p-2 w-full h-full overflow-y-auto create-comet-scrollbar"
      >
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 bg-primary-50 rounded-xl h-full p-1 sm:p-2">
          {/* Left Column */}
          <div className="flex p-1 sm:p-2 w-full lg:w-1/2 bg-background rounded-xl">
            <div
              className="flex flex-1 flex-col border rounded-xl h-full space-y-3 sm:space-y-4 p-2 sm:p-4 overflow-y-auto create-comet-scrollbar"
            >
              {/* Basic Information */}
              <FormCard title="Basic Information" className="text-semibold !p-0 !m-0" headerClassName="p-0 m-0">
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="comet-title">Comet Title *</Label>
                    <Input
                      id="comet-title"
                      placeholder="Enter comet title"
                      {...register("cometTitle")}
                      onFocus={() => setFocusedField("cometTitle")}
                      onBlur={() => setFocusedField(null)}
                    />
                    {errors.cometTitle && (
                      <p className="text-red-600 text-sm">
                        {errors.cometTitle.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="client-org">Client Organization *</Label>
                    <Input
                      id="client-org"
                      placeholder="Enter client organization"
                      {...register("clientOrg")}
                      onFocus={() => setFocusedField("clientOrg")}
                      onBlur={() => setFocusedField(null)}
                    />
                    {errors.clientOrg && (
                      <p className="text-red-600 text-sm">
                        {errors.clientOrg.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="client-website">Client Website</Label>
                    <Input
                      id="client-website"
                      placeholder="Enter client website URL"
                      {...register("clientWebsite")}
                      onFocus={() => setFocusedField("clientWebsite")}
                      onBlur={() => setFocusedField(null)}
                    />
                    {errors.clientWebsite && (
                      <p className="text-red-600 text-sm">
                        {errors.clientWebsite.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </FormCard>

              {/* Audience & Objectives */}
              <FormCard title="Audience & Objectives">
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="target-audience">Target Audience *</Label>
                    <Textarea
                      id="target-audience"
                      rows={3}
                      placeholder="Describe your target audience"
                      {...register("targetAudience")}
                      onFocus={() => setFocusedField("targetAudience")}
                      onBlur={() => setFocusedField(null)}
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
                      onFocus={() => setFocusedField("learningObjectives")}
                      onBlur={() => setFocusedField(null)}
                    />
                    {errors.learningObjectives && (
                      <p className="text-red-600 text-sm">
                        {errors.learningObjectives.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </FormCard>

              {/* Experience Design */}
              <FormCard title="Experience Design">
                <CardContent className="space-y-4">
                  {/* Dynamic Multiple Choice Field - Comet Focus */}
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
                    value={""}
                    onChange={(e) => {
                      setValue("cometFocus", e.target.value);
                    }}
                    orientation="horizontal"
                  />

                  {/* Dynamic Slider Field - Source Material Fidelity */}
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

                  {/* Dynamic Multiple Choice Field - Engagement Frequency */}
                  <MultipleChoiceField
                    label="How often should learners engage?"
                    name="engagementFrequency"
                    options={[
                      { value: "daily", label: "Daily" },
                      { value: "weekly", label: "Weekly" },
                    ]}
                    value={""}
                    onChange={(e) => {
                      setValue("engagementFrequency", e.target.value);
                    }}
                    orientation="horizontal"
                  />

                  {/* Length & Frequency Input */}
                  <div className="space-y-1">
                    <Label htmlFor="length-frequency">
                      How long should this Comet be?
                    </Label>
                    <Input
                      id="length-frequency"
                      placeholder="e.g., 4 weeks - 2 microlearning steps per week"
                      {...register("lengthFrequency")}
                      onFocus={() => setFocusedField("lengthFrequency")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>

                  {/* Special Instructions */}
                  <div className="space-y-1">
                    <Label htmlFor="special-instructions">
                      Special Instructions
                    </Label>
                    <Textarea
                      id="special-instructions"
                      rows={3}
                      placeholder="Focus on practical scenarios for first-time managers. Include at least one interactive quiz and one downloadable tool template"
                      {...register("specialInstructions")}
                      onFocus={() => setFocusedField("specialInstructions")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </CardContent>
              </FormCard>
            </div>
          </div>

          <div className="flex p-1 sm:p-2 w-full lg:w-1/2 bg-background rounded-xl">
            <div
              className="flex-1 w-full border rounded-xl overflow-auto h-full create-comet-scrollbar p-2 sm:p-4"
            >
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
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { temp2 } from "./temp2";

export function useCometManager(sessionData = null) {
  const [isLoading, setIsLoading] = useState(false);
  // Single state for the entire outline (response_path)
  const [outline, setOutline] = useState(null);
  const [selectedStepId, setSelectedStepId] = useState(null);

  // Initialize outline from sessionData
  useEffect(() => {
    if (sessionData && sessionData.response_path) {
      setOutline(sessionData.response_path);

      // Set initial selected step
      const pathChapters = sessionData.response_path.chapters || [];
      const firstStepId = pathChapters?.[0]?.steps?.[0]?.step?.uuid ?? null;
      if (firstStepId) {
        setSelectedStepId((prevSelectedStepId) => {
          if (prevSelectedStepId) {
            // Check if previous step still exists
            const stepExists = pathChapters.some((chapter) =>
              chapter.steps?.some(
                (stepItem) => stepItem.step?.uuid === prevSelectedStepId,
              ),
            );
            return stepExists ? prevSelectedStepId : firstStepId;
          }
          return firstStepId;
        });
      }
    }
  }, [sessionData]);

  // Derive chapters from outline
  const chapters = useMemo(() => {
    if (!outline || !outline.chapters) return [];

    const pathChapters = outline.chapters || [];
    return pathChapters.map((chapter, chapterIndex) => {
      const chapterId = chapter.uuid || chapter.id || `chapter-${chapterIndex}`;
      const chapterName = chapter.name || `Chapter ${chapterIndex + 1}`;

      // Transform steps for this chapter
      const transformedSteps = [];
      const chapterSteps = chapter.steps || [];

      chapterSteps.forEach((stepItem, stepIndex) => {
        const step = stepItem.step || {};
        const stepId =
          step.uuid || step.id || `step-${chapterIndex}-${stepIndex}`;
        const stepTitle = step.title || step.name || `Step ${stepIndex + 1}`;
        const stepDescription = step.description || "";

        // Transform screens for this step
        const stepScreens = stepItem.screens || [];

        // Collect content types from all screens in this step
        const contentTypes = new Set();
        stepScreens.forEach((screen) => {
          if (screen.screenContents?.contentType) {
            const contentType = screen.screenContents.contentType;
            if (contentType === "content") {
              const hasImage =
                screen.assets?.some(
                  (asset) => asset.type === "image" || asset.url,
                ) ||
                screen.screenContents.content?.media?.url ||
                screen.screenContents.content?.media?.type === "image";
              if (hasImage) {
                contentTypes.add("content_image");
              } else {
                contentTypes.add("content");
              }
            } else {
              contentTypes.add(contentType);
            }
          } else if (screen.screenType) {
            contentTypes.add(screen.screenType);
          }
        });

        transformedSteps.push({
          id: stepId,
          name: stepTitle,
          description: stepDescription,
          contentTypes: Array.from(contentTypes),
        });
      });

      return {
        id: chapterId,
        name: chapterName,
        order: chapter.position ? chapter.position - 1 : chapterIndex,
        steps: transformedSteps,
      };
    });
  }, [outline]);

  // Derive screens from outline
  const allScreens = useMemo(() => {
    if (!outline || !outline.chapters) return [];

    const transformedScreens = [];
    let screenCounter = 0;
    const pathChapters = outline.chapters || [];

    pathChapters.forEach((chapter, chapterIndex) => {
      const chapterId = chapter.uuid || `chapter-${chapterIndex}`;
      const chapterSteps = chapter.steps || [];

      chapterSteps.forEach((stepItem, stepIndex) => {
        const step = stepItem.step || {};
        const stepId = step.uuid || `step-${chapterIndex}-${stepIndex}`;
        const stepTitle = step.title || step.name || `Step ${stepIndex + 1}`;
        const stepScreens = stepItem.screens || [];

        //  step uuid
        const stepUid = step.uuid || null;
        const stepImageUrl = step.image || null;
        stepScreens.forEach((screen, screenIndex) => {
          const screenId = screen.id || `screen-${screenCounter}`;

          // Extract formData from screenContents
          let formData = {};
          if (screen.screenContents?.content) {
            formData = screen.screenContents.content || {};
          }

          // Get first image asset for thumbnail
          const screenAssets = screen.assets || [];
          const firstImageAsset = screenAssets.find(
            (asset) => asset.type === "image" || asset.url,
          );
          const thumbnail = firstImageAsset?.url || null;

          // Get screen title for display
          const screenTitle =
            formData.heading ||
            formData.title ||
            formData.screen_title ||
            screen.title ||
            `${stepTitle} - Screen ${screenIndex + 1}`;

          // Attach assessment from stepItem if it exists
          const assessmentData = stepItem.assessment || null;

          transformedScreens.push({
            ...screen, // Keep all original screen data
            id: screenId,
            chapterId: chapterId,
            stepId: stepId,
            stepUid: stepUid, // Step uuid
            stepImageUrl: stepImageUrl,
            thumbnail: thumbnail,
            title: screenTitle,
            formData: formData,
            assessment: assessmentData,
            order: screenCounter,
          });
          screenCounter++;
        });
      });
    });

    return transformedScreens;
  }, [outline]);

  // Filter screens based on selected step
  const screens = useMemo(() => {
    if (!selectedStepId) {
      return [];
    }
    return allScreens.filter((screen) => screen.stepId === selectedStepId);
  }, [allScreens, selectedStepId]);

  // Update screen in outline
  const updateScreen = (screenId, updatedScreen) => {
    setOutline((prevOutline) => {
      if (!prevOutline || !prevOutline.chapters) return prevOutline;

      const newOutline = JSON.parse(JSON.stringify(prevOutline));
      const pathChapters = newOutline.chapters || [];

      // Find and update the screen in the outline using latest state
      for (const chapter of pathChapters) {
        for (const stepItem of chapter.steps || []) {
          const screenIndex = stepItem.screens?.findIndex(
            (s) => s.id === screenId,
          );
          if (screenIndex !== undefined && screenIndex >= 0) {
            // Get the current screen from the latest state (prevOutline)
            const currentScreen = stepItem.screens[screenIndex];

            // Deep merge: preserve all existing fields and only update what changed
            // This ensures that even if updatedScreen is missing fields, we preserve them from currentScreen
            stepItem.screens[screenIndex] = {
              ...currentScreen,
              ...updatedScreen,
              // Deep merge screenContents to preserve all nested fields
              screenContents: {
                ...currentScreen.screenContents,
                ...updatedScreen.screenContents,
                // Deep merge content object to preserve all fields
                // Spread currentScreen content first, then updatedScreen content on top
                // This ensures all existing fields are preserved, and only changed fields are updated
                content: {
                  ...(currentScreen.screenContents?.content || {}),
                  ...(updatedScreen.screenContents?.content || {}),
                },
              },
              // Preserve assets
              assets: updatedScreen.assets || currentScreen.assets,
            };

            return newOutline;
          }
        }
      }
      return prevOutline;
    });
  };

  // Add screen to outline
  const addScreen = (newScreen) => {
    setOutline((prevOutline) => {
      if (!prevOutline || !prevOutline.chapters) return prevOutline;

      const newOutline = JSON.parse(JSON.stringify(prevOutline));
      const pathChapters = newOutline.chapters || [];

      // Find the target step and add the screen
      const targetChapterId = newScreen.chapterId;
      const targetStepId = newScreen.stepId;

      for (const chapter of pathChapters) {
        // Match by uuid
        const chapterMatchId = chapter.uuid || chapter.id;
        if (chapterMatchId === targetChapterId) {
          for (const stepItem of chapter.steps || []) {
            // Match step by uuid
            const stepMatchId = stepItem.step?.uuid || stepItem.step?.id;
            if (stepMatchId === targetStepId) {
              if (!stepItem.screens) {
                stepItem.screens = [];
              }
              // Remove computed fields before adding to outline
              const {
                chapterId,
                stepId,
                thumbnail,
                title,
                formData,
                assessment,
                order,
                ...screenData
              } = newScreen;
              stepItem.screens.push(screenData);
              // normalize positions to match array order
              for (let i = 0; i < stepItem.screens.length; i++) {
                stepItem.screens[i].position = i + 1;
              }
              return newOutline;
            }
          }
        }
      }
      return prevOutline;
    });
  };

  // Delete screen from outline
  const deleteScreen = (screenId) => {
    setOutline((prevOutline) => {
      if (!prevOutline || !prevOutline.chapters) return prevOutline;

      const newOutline = JSON.parse(JSON.stringify(prevOutline));
      const pathChapters = newOutline.chapters || [];

      for (const chapter of pathChapters) {
        for (const stepItem of chapter.steps || []) {
          if (stepItem.screens) {
            stepItem.screens = stepItem.screens.filter(
              (s) => s.id !== screenId,
            );
            // Normalize positions to match array order
            for (let i = 0; i < stepItem.screens.length; i++) {
              stepItem.screens[i].position = i + 1;
            }
          }
        }
      }
      return newOutline;
    });
  };

  // Reorder screens in outline
  const reorderScreensList = (newOrder) => {
    setOutline((prevOutline) => {
      if (!prevOutline || !prevOutline.chapters) return prevOutline;

      const newOutline = JSON.parse(JSON.stringify(prevOutline));
      const pathChapters = newOutline.chapters || [];

      // Group screens by stepId to maintain structure
      const screensByStep = {};
      newOrder.forEach((screen) => {
        const stepId = screen.stepId;
        if (!screensByStep[stepId]) {
          screensByStep[stepId] = [];
        }
        // Remove computed fields
        const {
          chapterId,
          stepId: _,
          thumbnail,
          title,
          formData,
          assessment,
          order,
          ...screenData
        } = screen;
        screensByStep[stepId].push(screenData);
      });

      // Update outline with reordered screens
      for (const chapter of pathChapters) {
        for (const stepItem of chapter.steps || []) {
          const stepId = stepItem.step?.id;
          if (stepId && screensByStep[stepId]) {
            stepItem.screens = screensByStep[stepId];
            // Normalize positions to match array order (1-based)
            for (let i = 0; i < stepItem.screens.length; i++) {
              stepItem.screens[i].position = i + 1;
            }
          }
        }
      }

      return newOutline;
    });
  };

  // Insert screen at specific index in outline
  const insertScreenAt = (newScreen, index) => {
    setOutline((prevOutline) => {
      if (!prevOutline || !prevOutline.chapters) return prevOutline;

      const newOutline = JSON.parse(JSON.stringify(prevOutline));
      const pathChapters = newOutline.chapters || [];

      const targetChapterId = newScreen.chapterId;
      const targetStepId = newScreen.stepId;

      // Find the target step
      for (const chapter of pathChapters) {
        // Match by uuid
        const chapterMatchId = chapter.uuid || chapter.id;
        if (chapterMatchId === targetChapterId) {
          for (const stepItem of chapter.steps || []) {
            // Match step by uuid
            const stepMatchId = stepItem.step?.uuid || stepItem.step?.id;
            if (stepMatchId === targetStepId) {
              if (!stepItem.screens) {
                stepItem.screens = [];
              }

              // Insert at the specified index
              if (index >= 0 && index < stepItem.screens.length) {
                // Remove computed fields
                const {
                  chapterId,
                  stepId: _,
                  thumbnail,
                  title,
                  formData,
                  assessment,
                  order,
                  ...screenData
                } = newScreen;
                stepItem.screens.splice(index, 0, screenData);
              } else {
                // Add at end
                const {
                  chapterId,
                  stepId: _,
                  thumbnail,
                  title,
                  formData,
                  assessment,
                  order,
                  ...screenData
                } = newScreen;
                stepItem.screens.push(screenData);
              }

              // normalize positions to match array order
              for (let i = 0; i < stepItem.screens.length; i++) {
                stepItem.screens[i].position = i + 1;
              }

              return newOutline;
            }
          }
        }
      }
      return prevOutline;
    });
  };

  const setSelectedStep = (stepId) => {
    setSelectedStepId(stepId);
  };

  return {
    isLoading,
    screens, // Filtered screens based on selectedStepId
    allScreens, // All screens from outline
    chapters, // Derived from outline
    selectedStepId,
    setSelectedStep,
    updateScreen,
    addScreen,
    deleteScreen,
    reorderScreensList,
    insertScreenAt,
    outline, // Expose outline for direct access if needed
    setOutline, // Expose setter for outline updates
  };
}

"use client";

import { useState, useEffect, useMemo, useRef } from "react";

/** Deep-cloned outline with the given screen removed; screen positions renumbered. */
export function applyScreenDeleteToOutline(prevOutline, screenId) {
  if (!prevOutline || !prevOutline.chapters) return prevOutline;

  const newOutline = JSON.parse(JSON.stringify(prevOutline));
  const pathChapters = newOutline.chapters || [];

  for (const chapter of pathChapters) {
    for (const stepItem of chapter.steps || []) {
      if (stepItem.screens) {
        stepItem.screens = stepItem.screens.filter(
          (s) => !screenMatchesInteractionId(s, screenId),
        );
        for (let i = 0; i < stepItem.screens.length; i++) {
          stepItem.screens[i].position = i + 1;
        }
      }
    }
  }
  return newOutline;
}

/** Stable chapter identifier for UI state and chapter lookups. */
export function getChapterInteractionId(chapter, chapterIndex = 0) {
  if (!chapter || typeof chapter !== "object") {
    return `chapter-${chapterIndex}`;
  }

  if (chapter.uuid !== undefined && chapter.uuid !== null) {
    const uuid = String(chapter.uuid).trim();
    if (uuid) return uuid;
  }

  const chapterDbId = chapter.chapter_id ?? chapter.chapterId;
  if (chapterDbId !== undefined && chapterDbId !== null) {
    const normalizedDbId = String(chapterDbId).trim();
    if (normalizedDbId) return `chapter-db-${normalizedDbId}`;
  }

  if (chapter.id !== undefined && chapter.id !== null) {
    const normalizedId = String(chapter.id).trim();
    if (normalizedId) return `chapter-${normalizedId}-${chapterIndex}`;
  }

  return `chapter-${chapterIndex}`;
}

/** Stable screen identifier for UI interactions and edits. */
function getScreenInteractionId(screen, fallbackIndex = 0) {
  if (!screen || typeof screen !== "object") {
    return `screen-${fallbackIndex}`;
  }

  if (screen.uuid !== undefined && screen.uuid !== null) {
    const normalizedUuid = String(screen.uuid).trim();
    if (normalizedUuid) return normalizedUuid;
  }

  if (screen.id !== undefined && screen.id !== null) {
    const normalizedId = String(screen.id).trim();
    if (normalizedId) return normalizedId;
  }

  return `screen-${fallbackIndex}`;
}

function screenMatchesInteractionId(screen, targetScreenId) {
  if (!screen || targetScreenId === undefined || targetScreenId === null) {
    return false;
  }
  const target = String(targetScreenId);
  const candidateIds = [screen.uuid, screen.id]
    .filter((value) => value !== undefined && value !== null)
    .map((value) => String(value));
  return candidateIds.includes(target);
}

/** Integer for POST …/chapters/{id}/variant — from session chapter fields only. */
function pathChapterIdFromChapter(chapter) {
  if (!chapter || typeof chapter !== "object") return null;
  const cid = chapter.chapter_id ?? chapter.chapterId;
  if (typeof cid === "number" && Number.isFinite(cid) && cid >= 0) {
    return Math.trunc(cid);
  }
  if (typeof cid === "string" && /^\d+$/.test(cid.trim())) {
    return parseInt(cid.trim(), 10);
  }
  if (typeof chapter.id === "number" && Number.isFinite(chapter.id) && chapter.id >= 0) {
    return Math.trunc(chapter.id);
  }
  if (typeof chapter.id === "string" && /^\d+$/.test(chapter.id.trim())) {
    return parseInt(chapter.id.trim(), 10);
  }
  if (typeof chapter.id === "string") {
    const t = chapter.id.trim();
    const m = /^#chapter_(\d+)$/i.exec(t) || /^chapter_(\d+)$/i.exec(t);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

/** Integer for POST …/steps/{id}/variant — from session step / stepItem fields. */
function pathStepIdFromStep(stepItem, step) {
  const s = step && typeof step === "object" ? step : {};
  const sid = s.step_id ?? s.stepId;
  if (typeof sid === "number" && Number.isFinite(sid) && sid >= 0) {
    return Math.trunc(sid);
  }
  if (typeof sid === "string" && /^\d+$/.test(sid.trim())) {
    return parseInt(sid.trim(), 10);
  }
  if (typeof s.id === "number" && Number.isFinite(s.id) && s.id >= 0) {
    return Math.trunc(s.id);
  }
  if (typeof s.id === "string" && /^\d+$/.test(s.id.trim())) {
    return parseInt(s.id.trim(), 10);
  }
  const stepItemId =
    stepItem && typeof stepItem === "object"
      ? stepItem.step_id ?? stepItem.stepId ?? stepItem.id
      : null;
  if (
    typeof stepItemId === "number" &&
    Number.isFinite(stepItemId) &&
    stepItemId >= 0
  ) {
    return Math.trunc(stepItemId);
  }
  if (typeof stepItemId === "string" && /^\d+$/.test(stepItemId.trim())) {
    return parseInt(stepItemId.trim(), 10);
  }
  if (typeof s.id === "string") {
    const t = s.id.trim();
    const m =
      /^#welcome_step_(\d+)$/i.exec(t) ||
      /^#step_(\d+)$/i.exec(t) ||
      /^step_(\d+)$/i.exec(t);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

export function useCometManager(sessionData = null) {
  const [isLoading, setIsLoading] = useState(false);

  const [outline, setOutline] = useState(null);
  const [selectedStepId, setSelectedStepId] = useState(null);

  /** Last response_path JSON we applied from sessionData (server snapshot). Do not compare to local outline — that reintroduced stale server data whenever chat or other fields updated. */
  const lastServerPathJsonRef = useRef(null);
  const lastSessionIdRef = useRef(null);

  // Initialize and sync outline from sessionData only when response_path from the server actually changes
  useEffect(() => {
    const sessionId = sessionData?.session_id;

    if (sessionId !== lastSessionIdRef.current) {
      lastSessionIdRef.current = sessionId;
      lastServerPathJsonRef.current = null;
    }

    if (sessionData?.response_path) {
      const pathJson = JSON.stringify(sessionData.response_path);
      if (lastServerPathJsonRef.current === pathJson) {
        return;
      }
      lastServerPathJsonRef.current = pathJson;

      const newOutline = JSON.parse(pathJson);
      setOutline(newOutline);

      // Set initial selected step when path content from server changes
      const pathChapters = newOutline.chapters || [];
      const firstStepId = pathChapters?.[0]?.steps?.[0]?.step?.uuid ?? null;
      if (firstStepId) {
        setSelectedStepId((prevSelectedStepId) => {
          if (prevSelectedStepId) {
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
    } else if (!sessionData?.response_path) {
      lastServerPathJsonRef.current = null;
      setOutline(null);
    }
  }, [sessionData?.response_path, sessionData?.session_id]);

  // Derive chapters from outline
  const chapters = useMemo(() => {
    if (!outline || !outline.chapters) return [];

    const pathChapters = outline.chapters || [];
    return pathChapters.map((chapter, chapterIndex) => {
      const chapterId = getChapterInteractionId(chapter, chapterIndex);
      const chapterName = chapter?.name || `Chapter ${chapterIndex + 1}`;

      // Transform steps for this chapter
      const transformedSteps = [];
      const chapterSteps = chapter?.steps || [];

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
          numericStepId: pathStepIdFromStep(stepItem, step),
        });
      });

      return {
        id: chapterId,
        name: chapterName,
        order: chapter?.position ? chapter.position - 1 : chapterIndex,
        steps: transformedSteps,
        numericChapterId: pathChapterIdFromChapter(chapter),
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
      const chapterId = getChapterInteractionId(chapter, chapterIndex);
      const chapterSteps = chapter?.steps || [];

      chapterSteps.forEach((stepItem, stepIndex) => {
        const step = stepItem.step || {};
        const stepId = step.uuid || `step-${chapterIndex}-${stepIndex}`;
        const stepTitle = step.title || step.name || `Step ${stepIndex + 1}`;
        const stepScreens = stepItem.screens || [];

        //  step uuid
        const stepUid = step.uuid || null;
        const stepImageUrl = step.image || null;
        const isGeneratingImages = !!step.image_generation_enqueued;
        stepScreens.forEach((screen, screenIndex) => {
          const screenId = getScreenInteractionId(screen, screenCounter);

          // Extract formData from screenContents
          let formData = {};
          if (screen.screenContents?.content) {
            formData = screen.screenContents.content || {};
          }

          // Get first image asset for thumbnail (content icon / upload / AI-generated)
          const screenAssets = screen.assets || [];
          const firstImageAsset = screenAssets.find(
            (asset) => asset.type === "image" || asset.url || asset.ImageUrl,
          );
          const thumbnail =
            formData.contentImageIcon ||
            formData.reflectionImage ||
            formData.ImageUrl ||
            formData.image ||
            // Keep disabled for now; uncomment if backend media URL should drive thumbnail again.
            // formData.media?.url ||
            (typeof formData.habit_image === "string"
              ? formData.habit_image
              : formData.habit_image?.url || formData.habit_image?.ImageUrl) ||
            firstImageAsset?.url ||
            firstImageAsset?.ImageUrl ||
            null;

          // Prefer explicit title over heading: reflection (and similar) may set heading
          // once on first keystroke and never update it, while title stays current.
          const screenTitle =
            formData.title ||
            formData.heading ||
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
            isGeneratingImages: isGeneratingImages,
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
            (s) => screenMatchesInteractionId(s, screenId),
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

      for (let chapterIndex = 0; chapterIndex < pathChapters.length; chapterIndex++) {
        const chapter = pathChapters[chapterIndex];
        // Match by uuid
        const chapterMatchId = getChapterInteractionId(chapter, chapterIndex);
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
    setOutline((prevOutline) =>
      applyScreenDeleteToOutline(prevOutline, screenId),
    );
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
          const stepId = stepItem.step?.uuid || stepItem.step?.id;
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
      for (let chapterIndex = 0; chapterIndex < pathChapters.length; chapterIndex++) {
        const chapter = pathChapters[chapterIndex];
        // Match by uuid
        const chapterMatchId = getChapterInteractionId(chapter, chapterIndex);
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

  // Reorder chapters in outline
  const reorderChapters = (newChapterOrder) => {
    setOutline((prevOutline) => {
      if (!prevOutline || !prevOutline.chapters) return prevOutline;

      const newOutline = JSON.parse(JSON.stringify(prevOutline));
      const oldChapters = newOutline.chapters;

      const reordered = newChapterOrder.map(
        (oldIndex) => oldChapters[oldIndex],
      );

      // Update positions to match new array order
      for (let i = 0; i < reordered.length; i++) {
        reordered[i].position = i + 1;
      }

      newOutline.chapters = reordered;
      return newOutline;
    });
  };

  // Reorder steps inside a chapter in outline
  const reorderSteps = (chapterId, newStepOrder) => {
    setOutline((prevOutline) => {
      if (!prevOutline || !prevOutline.chapters) return prevOutline;

      const newOutline = JSON.parse(JSON.stringify(prevOutline));
      const pathChapters = newOutline.chapters || [];
      const chapterIndex = pathChapters.findIndex((chapter, idx) => {
        const chapterMatchId = getChapterInteractionId(chapter, idx);
        return String(chapterMatchId) === String(chapterId);
      });

      if (chapterIndex < 0) return prevOutline;

      const oldSteps = pathChapters[chapterIndex].steps || [];
      if (!Array.isArray(oldSteps) || oldSteps.length === 0) {
        return prevOutline;
      }

      const reordered = newStepOrder
        .map((oldIndex) => oldSteps[oldIndex])
        .filter(Boolean);

      if (reordered.length !== oldSteps.length) {
        return prevOutline;
      }

      for (let i = 0; i < reordered.length; i++) {
        reordered[i].position = i + 1;
        if (reordered[i].step && typeof reordered[i].step === "object") {
          reordered[i].step.position = i + 1;
        }
      }

      pathChapters[chapterIndex].steps = reordered;
      return newOutline;
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
    reorderChapters,
    reorderSteps,
    insertScreenAt,
    outline, // Expose outline for direct access if needed
    setOutline, // Expose setter for outline updates
  };
}

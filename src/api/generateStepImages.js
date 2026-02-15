import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export const generateStepImages = async ({
  sessionId,
  chapterUid,
  stepUid,
  prompt,
}) => {
  const payload = {
    session_id: sessionId,
    chapter_uid: chapterUid,
    step_uid: stepUid,
    prompt: prompt || "", // Always include prompt, default to empty string if not provided
  };

  const response = await apiService({
    endpoint: endpoints.generateStepImages,
    method: "POST",
    data: payload,
  });

  return response;
};


export const getImageAttributes = async ({
  sessionId
}) => {
  const payload = {
    session_id: sessionId,
  };

  const response = await apiService({
    endpoint: endpoints.getImageAttributes,
    method: "POST",
    data: payload,
  });
  return response;
};

export const setImageAttributes = async ({
  sessionId,
  imageGuidance,
  artStyle,
}) => {
  const payload = {
    session_id: sessionId,
  };

  // Add optional parameters if provided
  if (imageGuidance !== undefined && imageGuidance !== null) {
    payload.image_guidance = imageGuidance;
  }
  if (artStyle !== undefined && artStyle !== null) {
    payload.art_style = artStyle;
  }

  const response = await apiService({
    endpoint: endpoints.setImageAttributes,
    method: "POST",
    data: payload,
  });
  return response;
};

export const getSuggestPrompt = async ({
  sessionId,
  chapterUid,
  stepUid,
  screenUid,
}) => {
  const payload = {
    session_id: sessionId,
    chapter_uid: chapterUid,
    step_uid: stepUid,
    screen_uid: screenUid,
  };

  const response = await apiService({
    endpoint: endpoints.getSuggestPrompt,
    method: "POST",
    data: payload,
  });
  return response;
};

export const getStepPrompts = async ({
  sessionId,
  chapterUid,
  stepUid,
}) => {
  const response = await apiService({
    endpoint: endpoints.getStepPrompts,
    method: "GET",
    params: {
      session_id: sessionId,
      chapter_uid: chapterUid,
      step_uid: stepUid,
    },
  });
  return response;
};
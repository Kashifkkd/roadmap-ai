import { endpoints } from "./endpoint";
import { apiService } from "./apiService";

/**
 * Upload an asset file
 */
export const uploadAssetFile = async (
  file,
  assetType,
  sessionId = "",
  chapterId = "",
  stepId = "",
  screenId = ""
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("asset_type", assetType);
  formData.append("session_id", sessionId);

  
  const normalizeId = (id) => {
    if (id === undefined || id === null || id === "") return null;
    const numeric = Number(id);
    return Number.isNaN(numeric) ? null : numeric;
  };

  const normalizedChapterId = normalizeId(chapterId);
  const normalizedStepId = normalizeId(stepId);
  const normalizedScreenId = normalizeId(screenId);

  if (normalizedChapterId !== null) {
    formData.append("chapter_id", String(normalizedChapterId));
  }
  if (normalizedStepId !== null) {
    formData.append("step_id", String(normalizedStepId));
  }
  if (normalizedScreenId !== null) {
    formData.append("screen_id", String(normalizedScreenId));
  }

  console.log("Uploading asset file with:", {
    sessionId,
    chapterId: normalizedChapterId,
    stepId: normalizedStepId,
    screenId: normalizedScreenId,
  });

  return await apiService({
    endpoint: endpoints.uploadAssets,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

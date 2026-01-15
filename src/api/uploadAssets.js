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
  screenId = "",
  link = ""
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("link", link || "");
  formData.append("asset_type", assetType || "");
  formData.append("session_id", sessionId || "");

  // Append UIDs as strings (API expects string format)
  if (chapterId && chapterId !== "") {
    formData.append("chapter_uid", String(chapterId));
  }
  if (stepId && stepId !== "") {
    formData.append("step_uid", String(stepId));
  }
  if (screenId && screenId !== "") {
    formData.append("screen_uid", String(screenId));
  }

  console.log("Uploading asset file with:", {
    sessionId,
    chapterId,
    stepId,
    screenId,
    link,
    assetType,
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

import { endpoints } from "./endpoint";
import { apiService } from "./apiService";

/**
 * Upload an asset file
 * @param {File|Blob} file - The file to upload
 * @param {string} assetType - The type of asset (e.g., 'pdf')
 * @param {string} [sessionId] - Optional session ID
 * @param {string} [chapterId] - Optional chapter ID
 * @param {string} [stepId] - Optional step ID
 * @param {string} [screenId] - Optional screen ID
 * @returns {Promise} API response
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
  formData.append("chapter_id", chapterId);
  formData.append("step_id", stepId);
  formData.append("screen_id", screenId);

  console.log("Uploading asset file:", formData);

  return await apiService({
    endpoint: endpoints.uploadAssets,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

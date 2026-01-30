import { endpoints } from "./endpoint";
import { apiService } from "./apiService";

/**
 * Upload an asset file without session/chapter/step/screen IDs.
 * Use for profile pictures, account assets, or any upload that doesn't belong to a comet session.
 */
export const uploadAssetFileNoSession = async (file, assetType = "profile", link = "") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("link", link || "");
  formData.append("asset_type", assetType || "profile");
  formData.append("session_id", "");

  const result = await apiService({
    endpoint: endpoints.uploadAssets,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (result?.response) {
    const url =
      result.response.s3_url ||
      result.response.url ||
      result.response.ImageUrl ||
      result.response.image_url;
    return {
      ...result,
      response: {
        ...result.response,
        image_url: url,
      },
    };
  }

  return result;
};

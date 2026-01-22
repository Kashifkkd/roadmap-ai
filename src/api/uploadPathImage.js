import { endpoints } from "./endpoint";
import { apiService } from "./apiService";

/**
 * Upload a comet cover image
 * @param {File} file - The image file to upload
 * @param {string} sessionId - The session ID
 */
export const uploadPathImage = async (file, sessionId) => {
    const formData = new FormData();
    formData.append("file", file);

    return await apiService({
        endpoint: endpoints.uploadPathImage(sessionId),
        method: "POST",
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

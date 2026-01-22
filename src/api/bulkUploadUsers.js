import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

/**
 * Upload file to get URL
 * @param {File} file - The file to upload
 */
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return await apiService({
        endpoint: endpoints.uploadFile,
        method: "POST",
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

/**
 * Bulk upload users via CSV/Excel file
 * @param {File} file - The CSV or Excel file to upload
 */
export const bulkUploadUsers = async (file) => {
    // Step 1: Upload file to get URL
    const uploadResponse = await uploadFile(file);

    if (!uploadResponse?.response?.response?.data?.url) {
        throw new Error("Failed to upload file - no URL returned");
    }

    const fileUrl = uploadResponse.response.response.data.url;

    // Step 2: Send file URL to bulk upload API
    return await apiService({
        endpoint: endpoints.bulkUploadUsers,
        method: "POST",
        data: {
            file_url: fileUrl,
        },
        headers: {
            "Content-Type": "application/json",
        },
    });
};

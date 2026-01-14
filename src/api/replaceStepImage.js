import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export const replaceStepImage = async ({ file, step_uid, sessionId = "" }) => {
  if (!file) {
    throw new Error("File is required");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", sessionId);

  const response = await apiService({
    endpoint: endpoints.replaceStepImage(step_uid),
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
};

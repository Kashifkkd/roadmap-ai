import { endpoints } from "./endpoint";
import { apiService } from "./apiService";

export const uploadToolfile = async (
  file,
  sessionId,
  pathId,
  chapterId,
  stepId,
  screenId,
  screenContentId,
  toolName
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", sessionId);
  formData.append("path_id", pathId);
  formData.append("chapter_id", chapterId);
  formData.append("step_id", stepId);
  formData.append("screen_id", screenId);
  formData.append("screen_content_id", screenContentId);
  formData.append("name", toolName);

  return await apiService({
    endpoint: endpoints.uploadTool,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

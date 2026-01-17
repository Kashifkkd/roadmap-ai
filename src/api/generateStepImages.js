import { apiService } from "./apiService";
import { endpoints } from "./endpoint";

export const generateStepImages = async ({
  sessionId,
  chapterUid,
  stepUid,
}) => {
  const payload = {
    session_id: sessionId,
    chapter_uid: chapterUid,
    step_uid: stepUid,
  };

  const response = await apiService({
    endpoint: endpoints.generateStepImages,
    method: "POST",
    data: payload,
  });

  return response;
};

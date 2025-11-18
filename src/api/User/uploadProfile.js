import { apiService } from "../apiService";
import { endpoints } from "../endpoint";

export const uploadProfile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return await apiService({
    endpoint: endpoints.uploadProfilePicture,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

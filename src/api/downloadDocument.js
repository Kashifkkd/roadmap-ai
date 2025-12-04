import axios from "axios";
import { endpoints } from "./endpoint";

const BACKEND_URL = "https://kyper-stage.1st90.com";

export const downloadDocument = async (documentId) => {
  try {
    const token = localStorage.getItem("access_token");

    // Fetch document as blob
    const response = await axios({
      url: `${BACKEND_URL}/${endpoints.downloadDocument(documentId)}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      responseType: "blob",
    });

    // // Extract filename from header
    // const contentDisposition = response.headers["content-disposition"];
    // console.log("contentDisposition>>>>>>>", contentDisposition);
    // const filename =
    //   contentDisposition?.split("filename=")[1] || "document.docx";

    // Trigger download
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    // link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Download failed:", error);
    return { success: false, error: true, response: error.response };
  }
};

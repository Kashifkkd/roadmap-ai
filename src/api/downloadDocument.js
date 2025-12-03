import axios from "axios";
import { endpoints } from "./endpoint";

const BACKEND_URL = "https://kyper-stage.1st90.com";

export const downloadDocument = async (documentId, customFilename = null) => {
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

    // Extract filename from header
    const contentDisposition = response.headers["content-disposition"];
    let filename = customFilename || "document.docx"; // Default filename

    if (contentDisposition) {
      // Handle different formats
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      );
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, ""); // Remove 
        try {
          filename = decodeURIComponent(filename);
        } catch (e) {
          
        }
      }
    }

    // If no filename from header  get from sessionData
    if (!customFilename && filename === "document.docx") {
      try {
        const sessionDataRaw = localStorage.getItem("sessionData");
        if (sessionDataRaw) {
          const sessionData = JSON.parse(sessionDataRaw);
          const cometTitle =
            sessionData?.comet_creation_data?.["Basic Information"]?.[
              "Comet Title"
            ];
          if (cometTitle) {
            //remove invalid characters
            const sanitizedTitle = cometTitle
              .replace(/[<>:"/\\|?*]/g, "_")
              .trim()
              .replace(/\s+/g, "_");
            filename = `${sanitizedTitle}.docx`;
          }
        }
      } catch (e) {
        
      }
    }

    // Trigger download
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Download failed:", error);
    return { success: false, error: true, response: error.response };
  }
};

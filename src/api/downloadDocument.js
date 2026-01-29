import axios from "axios";
import { endpoints } from "./endpoint";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://kyper-stage.1st90.com";

/** Sanitize a string for use as a filename (remove invalid chars for Windows/filesystem). */
function sanitizeFilename(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .replace(/[/\\:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const downloadDocument = async (documentId, cometTitle = null) => {
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

    // Filename priority: comet title from session > backend content-disposition > documentId
    const contentDisposition =
      response.headers["content-disposition"] ||
      response.headers["Content-Disposition"] ||
      Object.entries(response.headers).find(
        ([k]) => k.toLowerCase() === "content-disposition"
      )?.[1];
    let filename = `${documentId}.docx`;
    const sanitizedCometTitle = sanitizeFilename(cometTitle);
    if (sanitizedCometTitle) {
      filename = sanitizedCometTitle.endsWith(".docx")
        ? sanitizedCometTitle
        : `${sanitizedCometTitle}.docx`;
    } else if (contentDisposition) {
      const starMatch = contentDisposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      if (starMatch?.[1]) {
        try {
          filename = decodeURIComponent(starMatch[1].trim());
        } catch {
          filename = starMatch[1].trim();
        }
      } else {
        const normalMatch = contentDisposition.match(/filename=["']?([^"';]+)["']?/i);
        if (normalMatch?.[1]) {
          filename = normalMatch[1].trim();
        }
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

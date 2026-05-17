import { getSourceMaterials } from "@/api/getSourceMaterials";
import { resolveSourceMaterialLinkUrl } from "@/lib/sourceMaterialLinkUrl";

/** Preload files and web links from a session into remix modal state. */
export async function preloadRemixSourceMaterials(sessionId) {
  if (!sessionId) return { files: [], links: [] };

  const materials = await getSourceMaterials(sessionId);
  if (!Array.isArray(materials) || materials.length === 0) {
    return { files: [], links: [] };
  }

  const files = [];
  const links = [];

  materials.forEach((material) => {
    if (material?.type === "link") {
      const linkUrl = resolveSourceMaterialLinkUrl(material);
      if (!linkUrl) return;
      links.push({
        id: material?.id ?? material?.material_id ?? null,
        url: linkUrl.trim(),
        title: material?.source_name || "",
        comment: material?.comment ?? "",
        isUploaded: true,
      });
      return;
    }

    files.push({
      id: material?.id ?? material?.material_id ?? null,
      name: material?.source_name || "Unknown File",
      comment: material?.comment ?? "",
      isUploaded: true,
      output_presigned_url: material?.output_presigned_url,
    });
  });

  return { files, links };
}

/** Flush pending source material uploads before variant/remix API call. */
export async function uploadPendingRemixSourceMaterials(setIsUploading) {
  if (
    typeof window === "undefined" ||
    typeof window.uploadAllFiles !== "function"
  ) {
    return;
  }
  setIsUploading?.(true);
  try {
    await window.uploadAllFiles();
  } finally {
    setIsUploading?.(false);
  }
}

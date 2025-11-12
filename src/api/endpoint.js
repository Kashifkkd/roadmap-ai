export const endpoints = {
  register: "api/auth/v1/register",
  login: "api/auth/v1/token",
  uploadSourceMaterial: "api/n8n/upload_source_material",
  getSourceMaterials: "api/n8n/source_materials",
  getAssets: "api/n8n/assets",
  getClients: "api/clients/v1/",
  shareComet: (sessionId) => `api/comet/share_comets/${sessionId}`,
  publishComet: (sessionId) => `api/comet/publish_comet/${sessionId}`,
};

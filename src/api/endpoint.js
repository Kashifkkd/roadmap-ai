export const endpoints = {
    register: "api/auth/v1/register",
    login: "api/auth/v1/token",
    uploadSourceMaterial: "api/n8n/upload_source_material",
    getClients: "api/clients/v1/",
    shareComet: (sessionId) => `api/comet/share_comets/${sessionId}`,
    publishComet: (sessionId) => `api/comet/publish_comet/${sessionId}`,
}
export const endpoints = {
  register: "api/auth/v1/register",
  login: "api/auth/v1/token",
  uploadSourceMaterial: "api/n8n/upload_source_material",
  getSourceMaterials: "api/n8n/source_materials",
  getAssets: "api/n8n/assets",
  getClients: "api/clients/v1/",
  uploadAssets: "api/n8n/upload_asset_file",

  getUser: "api/auth/v1/users/me",
  getUserById: (clientId) => `api/auth/v1/users/1st90?client_id=${clientId}`,
  getCreatorsByClientId: (clientId) =>
    `api/auth/v1/users/kyper?client_id=${clientId}`,
  registerClientUser: "api/auth/v1/users/create",
  updateClientUser: (userId) => `api/auth/v1/users/1st90/${userId}`,
  deleteClientUser: (userId) => `api/auth/v1/users/1st90/${userId}`,
  updateCreator: (creatorId) => `api/auth/v1/users/kyper/${creatorId}`,
  uploadProfilePicture: "api/auth/v1/upload-profile-picture",
  updateUser: "api/auth/v1/profile/upsert",
  shareComet: (sessionId) => `api/comet/share_comets/${sessionId}`,
  publishComet: (sessionId) => `api/comet/publish_comet/${sessionId}`,

  generateDalleImage: "api/generative-ai/v1/generate-dalle-image",

  getClientDetails: (clientId) =>
    `api/clients/v1/client_details/?client_id=${clientId}`,
  getRecentClients: "api/clients/v1/recent",
  updateClient: "api/clients/v1/upsert/client/",
  deleteClient:(clientId)=>`api/clients/v1/delete/${clientId}`,

  downloadDocument: (documentId) => `api/documents/download/${documentId}`,
  feedbackEmail: (feedback) => `api/comet/feedback_email?feedback=${feedback}`,
  getCohorts: (clientId) => `api/clients/v1/cohorts?client_id=${clientId}`,
  getCohortPaths: (cohortId) => `api/clients/v1/cohorts/${cohortId}/paths`,
    getClientPaths: (clientId) => `api/clients/v1/clients/${clientId}/paths`,
  createCohort: "api/clients/v1/cohorts",
  updateCohort: (cohortId) => `api/clients/v1/cohorts/${cohortId}`,
  deleteCohort: (cohortId) => `api/clients/v1/cohorts/${cohortId}`,
};

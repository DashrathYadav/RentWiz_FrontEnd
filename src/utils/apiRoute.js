export const API_Route = {
  // Base API URL
  BASE_URL: "http://localhost:5268/api/v1",

  // Authentication
  login: "auth/login",

  // Owner endpoints
  createOwner: "owner/create",
  getOwnerById: "owner",

  // Property endpoints
  createProperty: "property/create",
  getPropertyById: "property",
  getPropertiesByOwner: "property/owner",

  // Room endpoints
  createRoom: "room/create",
  getRoomById: "room",
  getRoomsByProperty: "room/property",
  getRoomsByOwner: "room/owner",

  // Tenant endpoints
  createTenant: "tenant/create",
  getTenantById: "tenant",
  getTenantsByProperty: "tenant/property",
  getTenantsByOwner: "tenant/owner",
  updateTenant: "tenant",

  // Rent endpoints
  createRent: "rent/create",
  getRentById: "rent",
  getRentsByProperty: "rent/property",
  getRentsByTenant: "rent/tenant",
  getRentsByOwner: "rent/owner",

  // Address endpoints
  createAddress: "address/create",
  getAddressById: "address",
  getAllAddresses: "address",
};

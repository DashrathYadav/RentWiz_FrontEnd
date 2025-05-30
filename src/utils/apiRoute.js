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
  searchProperties: "property/search",
  updateProperty: "property",
  deleteProperty: "property",

  // Room endpoints
  createRoom: "room/create",
  getRoomById: "room",
  getRoomsByProperty: "room/property",
  getRoomsByOwner: "room/owner",
  searchRooms: "room/search",
  searchRoomsByProperty: "room/property",
  searchRoomsByOwner: "room/owner",

  // Tenant endpoints
  createTenant: "tenant/create",
  getTenantById: "tenant",
  getTenantsByProperty: "tenant/property",
  getTenantsByOwner: "tenant/owner",
  searchTenants: "tenant/search",
  updateTenant: "tenant",

  // Rent endpoints
  createRent: "rent/create",
  getRentById: "rent",
  getRentsByProperty: "rent/property",
  getRentsByTenant: "rent/tenant",
  getRentsByOwner: "rent/owner",
  searchRents: "rent/search",

  // Address endpoints
  createAddress: "address/create",
  getAddressById: "address",
  getAllAddresses: "address",

  // Lookups endpoints (consolidated approach)
  getAllLookups: "lookups/all",
  getPropertyTypes: "lookups/property-types",
  getCurrencies: "lookups/currencies",
  getAvailabilityStatuses: "lookups/availability-status",
  getRoomTypes: "lookups/room-types",
  getStates: "lookups/states",
  getCountries: "lookups/countries",
};

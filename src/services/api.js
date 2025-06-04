import axios from "axios";
import { API_Route } from "../utils/apiRoute.js";

// Create axios instance
const api = axios.create({
  baseURL: API_Route.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (loginData) => api.post(`/${API_Route.login}`, loginData),
};

// Owner API
export const ownerAPI = {
  create: (ownerData) => api.post(`/${API_Route.createOwner}`, ownerData),
  getById: (id) => api.get(`/${API_Route.getOwnerById}/${id}`),
};

// Property API
export const propertyAPI = {
  create: (propertyData) =>
    api.post(`/${API_Route.createProperty}`, propertyData),
  getById: (id) => api.get(`/${API_Route.getPropertyById}/${id}`),
  getByOwner: (ownerId) =>
    api.get(`/${API_Route.getPropertiesByOwner}/${ownerId}`),
  // New search endpoint with filters and pagination
  search: (searchParams = {}) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const ownerId = user.id || 1;

    // Default search parameters
    const params = {
      pageNumber: 1,
      pageSize: 50,
      ownerId: ownerId,
      ...searchParams,
    };

    const queryString = new URLSearchParams(
      Object.entries(params).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ""
      )
    ).toString();

    return api.get(`/${API_Route.searchProperties}?${queryString}`);
  },
  update: (id, propertyData) =>
    api.put(`/${API_Route.updateProperty}/${id}`, propertyData),
  delete: (id) => api.delete(`/${API_Route.deleteProperty}/${id}`),
};

// Room API
export const roomAPI = {
  create: (roomData) => api.post(`/${API_Route.createRoom}`, roomData),
  getById: (id) => api.get(`/${API_Route.getRoomById}/${id}`),
  getByProperty: (propertyId) =>
    api.get(`/${API_Route.getRoomsByProperty}/${propertyId}`),
  getByOwner: (ownerId) => api.get(`/${API_Route.getRoomsByOwner}/${ownerId}`),
  // New search endpoint with filters and pagination
  search: (searchParams = {}) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const ownerId = user.id || 1;

    // Default search parameters
    const params = {
      pageNumber: 1,
      pageSize: 50,
      ownerId: ownerId,
      ...searchParams,
    };

    const queryString = new URLSearchParams(
      Object.entries(params).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ""
      )
    ).toString();

    return api.get(
      `/${API_Route.searchRoomsByOwner}/${ownerId}/search?${queryString}`
    );
  },
  delete: (id) => api.delete(`/${API_Route.getRoomById}/${id}`),
};

// Tenant API
export const tenantAPI = {
  create: (tenantData) => api.post(`/${API_Route.createTenant}`, tenantData),
  getById: (id) => api.get(`/${API_Route.getTenantById}/${id}`),
  getByProperty: (propertyId) =>
    api.get(`/${API_Route.getTenantsByProperty}/${propertyId}`),
  getByOwner: (ownerId) =>
    api.get(`/${API_Route.getTenantsByOwner}/${ownerId}`),
  update: (id, tenantData) =>
    api.put(`/${API_Route.updateTenant}/${id}`, tenantData),
  // New search endpoint with filters and pagination
  search: (searchParams = {}) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const ownerId = user.id || 1;

    // Default search parameters
    const params = {
      pageNumber: 1,
      pageSize: 50,
      ownerId: ownerId,
      ...searchParams,
    };

    const queryString = new URLSearchParams(
      Object.entries(params).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ""
      )
    ).toString();

    return api.get(`/${API_Route.searchTenants}?${queryString}`);
  },
  delete: (id) => api.delete(`/${API_Route.getTenantById}/${id}`),
};

// Rent API
export const rentAPI = {
  create: (rentData) => api.post(`/${API_Route.createRent}`, rentData),
  getById: (id) => api.get(`/${API_Route.getRentById}/${id}`),
  getByProperty: (propertyId) =>
    api.get(`/${API_Route.getRentsByProperty}/${propertyId}`),
  getByTenant: (tenantId) =>
    api.get(`/${API_Route.getRentsByTenant}/${tenantId}`),
  getByOwner: (ownerId) => api.get(`/${API_Route.getRentsByOwner}/${ownerId}`),
  // New search endpoint with filters and pagination
  search: (searchParams = {}) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const ownerId = user.id || 1;

    // Default search parameters
    const params = {
      pageNumber: 1,
      pageSize: 50,
      ownerId: ownerId,
      ...searchParams,
    };

    return api.post(`/${API_Route.searchRents}`, params);
  },
  delete: (id) => api.delete(`/${API_Route.getRentById}/${id}`),
};

// Address API
export const addressAPI = {
  create: (addressData) => api.post(`/${API_Route.createAddress}`, addressData),
  getById: (id) => api.get(`/${API_Route.getAddressById}/${id}`),
  getAll: () => api.get(`/${API_Route.getAllAddresses}`),
};

// Lookups API (consolidated approach for all lookup data)
export const lookupsAPI = {
  getAll: () => api.get(`/${API_Route.getAllLookups}`),
  getPropertyTypes: () => api.get(`/${API_Route.getPropertyTypes}`),
  getProperties: (ownerId) =>
    api.get(
      `/${API_Route.getProperties}${ownerId ? `?ownerId=${ownerId}` : ""}`
    ),
  getCurrencies: () => api.get(`/${API_Route.getCurrencies}`),
  getAvailabilityStatuses: () =>
    api.get(`/${API_Route.getAvailabilityStatuses}`),
  getRoomTypes: () => api.get(`/${API_Route.getRoomTypes}`),
  getStates: () => api.get(`/${API_Route.getStates}`),
  getCountries: () => api.get(`/${API_Route.getCountries}`),

  // Helper function to extract data from new API response format
  // New format: { status: true, responseCode: 0, message: "...", errors: null, data: { data: [...], totalCount: N, ... } }
  extractData: (response) => {
    try {
      if (response?.data?.status && response.data.responseCode === 0) {
        // The actual array data is nested in response.data.data.data
        const rawData = response.data.data?.data || [];

        // Normalize the data structure to ensure frontend compatibility
        const extractedData = rawData.map((item) => ({
          id: item.id, // Keep ID as string to match API format and avoid type conversion issues
          name: item.value || item.name || item.Name || "", // Map value to name for display
          value: item.value || item.name || item.Name || "", // Keep value for consistency
          description: item.description || item.Description || "",
        }));

        console.log("extractData result:", extractedData);
        return extractedData;
      }

      // Fallback: try to extract data from old format or direct data
      const fallbackData = response?.data?.Data || response?.data?.data || [];
      if (Array.isArray(fallbackData)) {
        console.warn("Using fallback data extraction for API response");
        // Normalize fallback data as well
        const fallbackResult = fallbackData.map((item) => ({
          id: item.id || item.Id, // Keep original ID format
          name: item.name || item.Name || item.value || "",
          value: item.value || item.name || item.Name || "",
          description: item.description || item.Description || "",
        }));

        console.log("fallback extractData result:", fallbackResult);
        return fallbackResult;
      }

      console.error("API Response Format:", response?.data);
      return [];
    } catch (error) {
      console.error("Error extracting data from API response:", error);
      return [];
    }
  },

  // Helper function to check if API response is successful
  isSuccess: (response) => {
    return response?.data?.status && response.data.responseCode === 0;
  },

  // Helper function to get error message from API response
  getErrorMessage: (response) => {
    return response?.data?.message || "An error occurred";
  },
};

export default api;

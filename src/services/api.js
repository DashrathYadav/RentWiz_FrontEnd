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
  // For dashboard, we'll use getByOwner with current user's ID
  getAll: () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const ownerId = user.id || 1; // fallback to 1 for now
    return api.get(`/${API_Route.getPropertiesByOwner}/${ownerId}`);
  },
  delete: (id) => api.delete(`/${API_Route.getPropertyById}/${id}`),
};

// Room API
export const roomAPI = {
  create: (roomData) => api.post(`/${API_Route.createRoom}`, roomData),
  getById: (id) => api.get(`/${API_Route.getRoomById}/${id}`),
  getByProperty: (propertyId) =>
    api.get(`/${API_Route.getRoomsByProperty}/${propertyId}`),
  getByOwner: (ownerId) => api.get(`/${API_Route.getRoomsByOwner}/${ownerId}`),
  // For dashboard, we'll use getByOwner with current user's ID
  getAll: () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const ownerId = user.id || 1; // fallback to 1 for now
    return api.get(`/${API_Route.getRoomsByOwner}/${ownerId}`);
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
  // For dashboard, we'll use getByOwner with current user's ID
  getAll: () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const ownerId = user.id || 1; // fallback to 1 for now
    return api.get(`/${API_Route.getTenantsByOwner}/${ownerId}`);
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
  // For dashboard, we'll use getByOwner with current user's ID
  getAll: () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const ownerId = user.id || 1; // fallback to 1 for now
    return api.get(`/${API_Route.getRentsByOwner}/${ownerId}`);
  },
  delete: (id) => api.delete(`/${API_Route.getRentById}/${id}`),
};

// Address API
export const addressAPI = {
  create: (addressData) => api.post(`/${API_Route.createAddress}`, addressData),
  getById: (id) => api.get(`/${API_Route.getAddressById}/${id}`),
  getAll: () => api.get(`/${API_Route.getAllAddresses}`),
};

export default api;

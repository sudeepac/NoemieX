/**
 * API Helpers - Shared utilities for API calls
 * Handles authentication, error handling, and data scoping
 */

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get authentication headers
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

/**
 * Get user context for data scoping
 */
export const getUserContext = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return {
    accountId: user.accountId,
    agencyId: user.agencyId,
    portalType: user.portalType,
    role: user.role
  };
};

/**
 * Apply data scoping to API endpoints based on user context
 */
export const applyScopeToEndpoint = (endpoint, context = getUserContext()) => {
  const { accountId, agencyId, portalType } = context;
  
  // For superadmin, no scoping needed
  if (portalType === 'superadmin') {
    return endpoint;
  }
  
  // For account portal, scope to account
  if (portalType === 'account' && accountId) {
    return endpoint.includes('?') 
      ? `${endpoint}&accountId=${accountId}`
      : `${endpoint}?accountId=${accountId}`;
  }
  
  // For agency portal, scope to agency
  if (portalType === 'agency' && agencyId) {
    return endpoint.includes('?')
      ? `${endpoint}&agencyId=${agencyId}`
      : `${endpoint}?agencyId=${agencyId}`;
  }
  
  return endpoint;
};

/**
 * Generic API request handler
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${applyScopeToEndpoint(endpoint)}`;
  
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  return apiRequest(url, {
    method: 'GET'
  });
};

/**
 * POST request
 */
export const apiPost = (endpoint, data = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

/**
 * PUT request
 */
export const apiPut = (endpoint, data = {}) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

/**
 * DELETE request
 */
export const apiDelete = (endpoint) => {
  return apiRequest(endpoint, {
    method: 'DELETE'
  });
};

/**
 * Upload file
 */
export const apiUpload = (endpoint, file, additionalData = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });
  
  return apiRequest(endpoint, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: getAuthHeaders().Authorization
      // Don't set Content-Type for FormData, let browser set it
    }
  });
};

/**
 * Error handling utilities
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return defaultMessage;
};

/**
 * Data transformation utilities
 */
export const transformApiResponse = (data, transformer) => {
  if (typeof transformer === 'function') {
    return transformer(data);
  }
  return data;
};

/**
 * Pagination helpers
 */
export const buildPaginationParams = (page = 1, limit = 10, filters = {}) => {
  return {
    page,
    limit,
    ...filters
  };
};

export const extractPaginationInfo = (response) => {
  return {
    data: response.data || [],
    pagination: {
      page: response.page || 1,
      limit: response.limit || 10,
      total: response.total || 0,
      totalPages: response.totalPages || 0,
      hasNext: response.hasNext || false,
      hasPrev: response.hasPrev || false
    }
  };
};
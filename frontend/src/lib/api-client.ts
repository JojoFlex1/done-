import { getAuthHeaders } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  // Auth endpoints
  signup: (data: any) =>
    apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyOtp: (data: any) =>
    apiRequest("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: any) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // User endpoints
  getProfile: () => apiRequest("/user/profile"),

  // Waste endpoints
  submitWaste: (formData: FormData) =>
    apiRequest("/waste/submit", {
      method: "POST",
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    }),

  getWasteCategories: () => apiRequest("/waste/categories"),

  validateQR: (qrCode: string) => apiRequest(`/waste/validate-qr?qr_code=${encodeURIComponent(qrCode)}`),

  // Bins endpoints
  getNearbyBins: (lat: number, lng: number, radius = 5) =>
    apiRequest(`/bins/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),

  // Rewards endpoints
  getRewardHistory: () => apiRequest("/rewards/history"),

  getTotalRewards: () => apiRequest("/rewards/total"),
}

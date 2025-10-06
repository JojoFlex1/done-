export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("auth_token", token)
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

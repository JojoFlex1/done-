import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const response = await fetch(`${backendUrl}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to get profile" }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      user: data,
    })
  } catch (error) {
    console.error("Profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

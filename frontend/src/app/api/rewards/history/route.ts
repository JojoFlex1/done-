import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const response = await fetch(`${backendUrl}/rewards/history`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to get rewards history" }, { status: response.status })
    }

    // ✅ Just return the data directly, not wrapped
    return NextResponse.json(data)
  } catch (error) {
    console.error("Rewards history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
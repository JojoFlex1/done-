import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qrCode = searchParams.get("qr_code")

    // Get JWT token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    if (!qrCode) {
      return NextResponse.json({ error: "QR code parameter is required" }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const response = await fetch(`${backendUrl}/waste/validate-qr?qr_code=${encodeURIComponent(qrCode)}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "QR validation failed" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("QR validation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

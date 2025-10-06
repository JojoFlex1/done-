import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const photo = formData.get("photo") as File
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const binId = formData.get("binId") as string
    const qrCode = formData.get("qrCode") as string
    const weight = formData.get("weight") as string

    // Get JWT token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    // Validate required fields
    if (!photo || !category || (!binId && !qrCode)) {
      return NextResponse.json({ error: "Photo, category, and bin ID or QR code are required" }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    // Create FormData for backend
    const backendFormData = new FormData()
    backendFormData.append("photo", photo)
    backendFormData.append("waste_type", category)
    backendFormData.append("qr_code", qrCode || binId)
    if (description) backendFormData.append("description", description)
    if (weight) backendFormData.append("weight_kg", weight)

    const response = await fetch(`${backendUrl}/waste/submit`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: backendFormData,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Waste submission failed" }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "E-waste submitted successfully",
      submission: data.submission,
      bin: data.bin,
      reward: data.reward,
    })
  } catch (error) {
    console.error("Waste submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

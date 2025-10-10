import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const response = await fetch(`${backendUrl}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "OTP verification failed" }, { status: response.status })
    }

    // ✅ PASS THE WALLET DATA (including mnemonic) TO FRONTEND
    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      token: data.token,
      user: data.user,
      wallet: data.wallet, // ✅ THIS CONTAINS THE MNEMONIC!
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
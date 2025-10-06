import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📝 Received signup data:", body)
    
    const { firstName, lastName, username, email, password } = body

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !password) {
      console.log("❌ Missing fields:", { firstName, lastName, username, email, password: !!password })
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    console.log("🔗 Calling backend at:", `${backendUrl}/auth/signup`)

    const response = await fetch(`${backendUrl}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        username,
        email,
        password,
      }),
    })

    const data = await response.json()
    console.log("🔙 Backend responded with:", { status: response.status, data })

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Signup failed" }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please check your email for verification code.",
      user: data.user,
    })
  } catch (error) {
    console.error("💥 Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

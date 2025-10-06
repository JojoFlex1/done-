import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "5"

    // Get JWT token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const response = await fetch(`${backendUrl}/waste/bins`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to get bins" }, { status: response.status })
    }

    // Calculate distances and filter by radius
    const userLat = Number.parseFloat(lat)
    const userLng = Number.parseFloat(lng)
    const maxRadius = Number.parseFloat(radius)

    const binsWithDistance = data
      .map((bin: any) => {
        const distance = calculateDistance(userLat, userLng, bin.location.latitude, bin.location.longitude)

        return {
          ...bin,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
        }
      })
      .filter((bin: any) => bin.distance <= maxRadius)
      .sort((a: any, b: any) => a.distance - b.distance)

    return NextResponse.json({
      success: true,
      bins: binsWithDistance,
      total: binsWithDistance.length,
    })
  } catch (error) {
    console.error("Nearby bins error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Loader2 } from "lucide-react"

interface Bin {
  id: string
  name: string
  qr_code: string
  address: string
  latitude?: number
  longitude?: number
  distance?: number
  status?: string
}

export function BinFinder() {
  const [bins, setBins] = useState<Bin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    getUserLocation()
  }, [])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          fetchNearbyBins(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
          // If location fails, just fetch all bins
          fetchAllBins()
        }
      )
    } else {
      fetchAllBins()
    }
  }

  const fetchNearbyBins = async (lat: number, lng: number, radius: number = 10) => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please login to view bins")
        return
      }

      const response = await fetch(`/api/bins/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch bins")
      }

      setBins(data.bins || [])
    } catch (err: any) {
      setError(err.message || "Failed to load bins")
    } finally {
      setLoading(false)
    }
  }

  const fetchAllBins = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please login to view bins")
        return
      }

      const response = await fetch("/api/waste/bins", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch bins")
      }

      setBins(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || "Failed to load bins")
    } finally {
      setLoading(false)
    }
  }

  const filteredBins = bins.filter(
    (bin) =>
      bin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.qr_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRefresh = () => {
    if (userLocation) {
      fetchNearbyBins(userLocation.lat, userLocation.lng)
    } else {
      fetchAllBins()
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Find Recycling Bins
          </CardTitle>
          <CardDescription>
            {userLocation ? "Showing bins near you" : "Showing all available bins"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by location or bin ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Loading bins...</p>
            </div>
          ) : filteredBins.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No bins found</p>
              {searchQuery && (
                <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBins.map((bin) => (
                <Card key={bin.id} className="border-border/30">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{bin.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{bin.address}</p>
                        <p className="text-xs text-muted-foreground mt-1">QR Code: {bin.qr_code}</p>
                        {bin.status && (
                          <span
                            className={`text-xs mt-2 inline-block px-2 py-1 rounded ${
                              bin.status === "active"
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {bin.status}
                          </span>
                        )}
                      </div>
                      {bin.distance !== undefined && (
                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary">{bin.distance} km</div>
                          <div className="text-xs text-muted-foreground">away</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Navigation, Search, Clock, Battery } from "lucide-react"

interface Bin {
  id: string
  location: string
  address: string
  distance: number
  capacity: number
  lastEmptied: string
  coordinates: { lat: number; lng: number }
}

interface BinFinderProps {
  userLocation: { lat: number; lng: number } | null
  onBinSelect: (bin: Bin) => void
}

const mockBins: Bin[] = [
  {
    id: "BIN-NYC-001",
    location: "Central Park East",
    address: "1234 Park Avenue, New York, NY 10028",
    distance: 0.1,
    capacity: 45,
    lastEmptied: "2 hours ago",
    coordinates: { lat: 40.7829, lng: -73.9654 },
  },
  {
    id: "BIN-NYC-002",
    location: "Times Square",
    address: "1500 Broadway, New York, NY 10036",
    distance: 0.3,
    capacity: 78,
    lastEmptied: "4 hours ago",
    coordinates: { lat: 40.758, lng: -73.9855 },
  },
  {
    id: "BIN-NYC-003",
    location: "Brooklyn Bridge",
    address: "Brooklyn Bridge, New York, NY 10038",
    distance: 0.5,
    capacity: 23,
    lastEmptied: "1 hour ago",
    coordinates: { lat: 40.7061, lng: -73.9969 },
  },
  {
    id: "BIN-NYC-004",
    location: "High Line Park",
    address: "High Line, New York, NY 10011",
    distance: 0.7,
    capacity: 89,
    lastEmptied: "6 hours ago",
    coordinates: { lat: 40.748, lng: -74.0048 },
  },
  {
    id: "BIN-NYC-005",
    location: "Washington Square Park",
    address: "Washington Square Park, New York, NY 10012",
    distance: 0.8,
    capacity: 34,
    lastEmptied: "3 hours ago",
    coordinates: { lat: 40.7308, lng: -73.9973 },
  },
]

export function BinFinder({ userLocation, onBinSelect }: BinFinderProps) {
  const [bins, setBins] = useState<Bin[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"distance" | "capacity">("distance")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading nearby bins
    const timer = setTimeout(() => {
      setBins(mockBins)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [userLocation])

  const filteredBins = bins
    .filter(
      (bin) =>
        bin.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.id.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "distance") {
        return a.distance - b.distance
      }
      return a.capacity - b.capacity
    })

  const getCapacityColor = (capacity: number) => {
    if (capacity > 80) return "bg-destructive/10 text-destructive border-destructive/20"
    if (capacity > 60) return "bg-warning/10 text-warning border-warning/20"
    return "bg-success/10 text-success border-success/20"
  }

  const getCapacityText = (capacity: number) => {
    if (capacity > 80) return "Nearly Full"
    if (capacity > 60) return "Filling Up"
    return "Available"
  }

  const openDirections = (bin: Bin) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${bin.coordinates.lat},${bin.coordinates.lng}`
    window.open(url, "_blank")
  }

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Finding Nearby Bins
          </CardTitle>
          <CardDescription>Searching for e-waste bins in your area...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading nearby bins...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Nearby E-Waste Bins
        </CardTitle>
        <CardDescription>Find the closest available bins in your area</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by location or bin ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "distance" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("distance")}
            >
              Distance
            </Button>
            <Button
              variant={sortBy === "capacity" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("capacity")}
            >
              Capacity
            </Button>
          </div>
        </div>

        {/* Bins List */}
        <div className="space-y-4">
          {filteredBins.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No bins found matching your search.</p>
            </div>
          ) : (
            filteredBins.map((bin) => (
              <div
                key={bin.id}
                className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{bin.location}</h3>
                      <Badge variant="secondary" className={getCapacityColor(bin.capacity)}>
                        {getCapacityText(bin.capacity)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{bin.address}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {bin.distance} km away
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Emptied {bin.lastEmptied}
                      </span>
                      <span className="flex items-center gap-1">
                        <Battery className="w-3 h-3" />
                        {bin.capacity}% full
                      </span>
                    </div>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Capacity</span>
                    <span>{bin.capacity}%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        bin.capacity > 80 ? "bg-destructive" : bin.capacity > 60 ? "bg-warning" : "bg-success"
                      }`}
                      style={{ width: `${bin.capacity}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDirections(bin)} className="flex-1">
                    <Navigation className="w-3 h-3 mr-1" />
                    Directions
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onBinSelect(bin)}
                    disabled={bin.capacity > 90}
                    className="flex-1 bg-success hover:bg-success/90"
                  >
                    Select Bin
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {!userLocation && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Enable location access for more accurate distance calculations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, QrCode, MapPin, Search, Camera } from "lucide-react"
import { QRCodeScanner } from "@/components/qr/qr-code-scanner"
import { BinFinder } from "@/components/qr/bin-finder"

interface Bin {
  id: string
  location: string
  address: string
  distance: number
  capacity: number
  lastEmptied: string
  coordinates: { lat: number; lng: number }
}

export default function ScanPage() {
  const [mode, setMode] = useState<"scan" | "find" | "manual">("scan")
  const [scannedBin, setScannedBin] = useState<Bin | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [manualBinId, setManualBinId] = useState("")

  useEffect(() => {
    // Get user location for bin finder
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  const handleQRScan = (binId: string) => {
    // Mock bin data lookup
    const mockBin: Bin = {
      id: binId,
      location: "Central Park East",
      address: "1234 Park Avenue, New York, NY 10028",
      distance: 0.1,
      capacity: 85,
      lastEmptied: "2 hours ago",
      coordinates: { lat: 40.7829, lng: -73.9654 },
    }
    setScannedBin(mockBin)
  }

  const handleManualEntry = () => {
    if (manualBinId.trim()) {
      handleQRScan(manualBinId.trim())
    }
  }

  const handleBinSelect = (bin: Bin) => {
    setScannedBin(bin)
    setMode("scan")
  }

  const startWasteSubmission = () => {
    if (scannedBin) {
      // Navigate to submit page with bin info
      window.location.href = `/submit?binId=${scannedBin.id}&location=${encodeURIComponent(scannedBin.location)}`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-2xl">♻️</div>
              <div>
                <h1 className="text-xl font-bold text-foreground">QR Scanner</h1>
                <p className="text-sm text-muted-foreground">Find and scan e-waste bins</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Mode Selection */}
          {!scannedBin && (
            <Card className="border-border/50 bg-card/50 mb-8">
              <CardHeader>
                <CardTitle>How would you like to find a bin?</CardTitle>
                <CardDescription>Choose your preferred method to locate an e-waste bin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={mode === "scan" ? "default" : "outline"}
                    onClick={() => setMode("scan")}
                    className="h-20 flex-col gap-2"
                  >
                    <QrCode className="w-6 h-6" />
                    Scan QR Code
                  </Button>
                  <Button
                    variant={mode === "find" ? "default" : "outline"}
                    onClick={() => setMode("find")}
                    className="h-20 flex-col gap-2"
                  >
                    <Search className="w-6 h-6" />
                    Find Nearby
                  </Button>
                  <Button
                    variant={mode === "manual" ? "default" : "outline"}
                    onClick={() => setMode("manual")}
                    className="h-20 flex-col gap-2"
                  >
                    <MapPin className="w-6 h-6" />
                    Enter Bin ID
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content based on mode */}
          {!scannedBin && mode === "scan" && (
            <QRCodeScanner onScan={handleQRScan} onError={(error) => console.error("QR Scan error:", error)} />
          )}

          {!scannedBin && mode === "find" && <BinFinder userLocation={userLocation} onBinSelect={handleBinSelect} />}

          {!scannedBin && mode === "manual" && (
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Enter Bin ID</CardTitle>
                <CardDescription>Type the bin ID found on the e-waste container</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="binId">Bin ID</Label>
                  <Input
                    id="binId"
                    placeholder="e.g., BIN-NYC-001"
                    value={manualBinId}
                    onChange={(e) => setManualBinId(e.target.value)}
                  />
                </div>
                <Button onClick={handleManualEntry} disabled={!manualBinId.trim()} className="w-full">
                  Find Bin
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Scanned Bin Info */}
          {scannedBin && (
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-success" />
                  Bin Found!
                </CardTitle>
                <CardDescription>Bin information and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <MapPin className="w-4 h-4" />
                  <AlertDescription>
                    Great! You've successfully identified bin <strong>{scannedBin.id}</strong>
                  </AlertDescription>
                </Alert>

                {/* Bin Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="font-medium">{scannedBin.location}</p>
                      <p className="text-sm text-muted-foreground">{scannedBin.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bin ID</label>
                      <code className="block text-sm font-mono bg-muted/50 p-2 rounded mt-1">{scannedBin.id}</code>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Capacity</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-muted/50 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              scannedBin.capacity > 80
                                ? "bg-destructive"
                                : scannedBin.capacity > 60
                                  ? "bg-warning"
                                  : "bg-success"
                            }`}
                            style={{ width: `${scannedBin.capacity}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{scannedBin.capacity}%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Emptied</label>
                      <p className="font-medium">{scannedBin.lastEmptied}</p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center">
                  <Badge
                    variant="secondary"
                    className={
                      scannedBin.capacity > 80
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : scannedBin.capacity > 60
                          ? "bg-warning/10 text-warning border-warning/20"
                          : "bg-success/10 text-success border-success/20"
                    }
                  >
                    {scannedBin.capacity > 80 ? "Nearly Full" : scannedBin.capacity > 60 ? "Filling Up" : "Available"}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setScannedBin(null)} className="flex-1">
                    Scan Another
                  </Button>
                  <Button
                    onClick={startWasteSubmission}
                    disabled={scannedBin.capacity > 90}
                    className="flex-1 bg-success hover:bg-success/90"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Submit E-Waste
                  </Button>
                </div>

                {scannedBin.capacity > 90 && (
                  <Alert>
                    <AlertDescription>
                      This bin is nearly full. Please find another bin or wait for it to be emptied.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

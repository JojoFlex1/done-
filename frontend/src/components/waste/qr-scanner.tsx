"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, MapPin, Scan, Type } from "lucide-react"

interface QRScannerProps {
  onScan: (binId: string, location: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  const [binId, setBinId] = useState("")
  const [scannedData, setScannedData] = useState<{ binId: string; location: string } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startScanning = async () => {
    try {
      setIsScanning(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Simulate QR code detection after 3 seconds
      setTimeout(() => {
        const mockBinData = {
          binId: "BIN-NYC-001",
          location: "Central Park East, New York",
        }
        setScannedData(mockBinData)
        stopScanning()
      }, 3000)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const handleManualSubmit = () => {
    if (binId.trim()) {
      // Mock location lookup based on bin ID
      const mockLocation = "Downtown Recycling Center, Main Street"
      onScan(binId.trim(), mockLocation)
    }
  }

  const confirmScan = () => {
    if (scannedData) {
      onScan(scannedData.binId, scannedData.location)
    }
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          Scan Bin QR Code
        </CardTitle>
        <CardDescription>Scan the QR code on the e-waste bin to confirm your drop-off location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!scannedData && !isScanning && !manualEntry && (
          <div className="space-y-4">
            <Alert>
              <MapPin className="w-4 h-4" />
              <AlertDescription>
                Each bin has a unique QR code that helps us track your contribution and ensure proper waste processing.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={startScanning} className="h-24 flex-col gap-2">
                <Scan className="w-6 h-6" />
                Scan QR Code
              </Button>
              <Button variant="outline" onClick={() => setManualEntry(true)} className="h-24 flex-col gap-2">
                <Type className="w-6 h-6" />
                Enter Bin ID
              </Button>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play()
                  }
                }}
              />
              {/* QR Code overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
                <p className="text-sm">Position QR code within the frame</p>
              </div>
            </div>
            <div className="flex justify-center">
              <Button variant="outline" onClick={stopScanning}>
                Cancel Scan
              </Button>
            </div>
          </div>
        )}

        {manualEntry && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="binId">Bin ID</Label>
              <Input
                id="binId"
                placeholder="Enter bin ID (e.g., BIN-NYC-001)"
                value={binId}
                onChange={(e) => setBinId(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setManualEntry(false)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleManualSubmit} disabled={!binId.trim()} className="flex-1">
                Confirm Bin
              </Button>
            </div>
          </div>
        )}

        {scannedData && (
          <div className="space-y-4">
            <Alert>
              <QrCode className="w-4 h-4" />
              <AlertDescription>QR code scanned successfully!</AlertDescription>
            </Alert>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bin ID:</span>
                <code className="text-sm font-mono bg-background px-2 py-1 rounded">{scannedData.binId}</code>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Location:</span>
                <div className="text-right">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {scannedData.location}
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={confirmScan} className="w-full">
              Confirm Drop-off Location
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

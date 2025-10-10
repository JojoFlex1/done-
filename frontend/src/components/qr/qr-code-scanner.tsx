"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, QrCode, Loader2 } from "lucide-react"

interface QRCodeScannerProps {
  onScan: (qrData: string) => void
  title?: string
  description?: string
}

export function QRCodeScanner({ onScan, title, description }: QRCodeScannerProps) {
  const [manualCode, setManualCode] = useState("")
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")

  const handleManualSubmit = () => {
    const trimmedCode = manualCode.trim()
    
    if (!trimmedCode) {
      setError("Please enter a QR code")
      return
    }

    setError("")
    onScan(trimmedCode)
  }

  const handleCameraClick = () => {
    // For now, show a message that camera scanning is coming soon
    // In production, you'd integrate html5-qrcode or similar library
    setError("Camera QR scanning coming soon! Please enter the code manually for now.")
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          {title || "Scan QR Code"}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Camera Scanner Button */}
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleCameraClick}
          disabled={scanning}
        >
          <Camera className="w-4 h-4 mr-2" />
          {scanning ? "Scanning..." : "Scan with Camera"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or enter manually</span>
          </div>
        </div>

        {/* Manual Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter QR code (e.g., BIN-NYC-001)"
              value={manualCode}
              onChange={(e) => {
                setManualCode(e.target.value)
                setError("")
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleManualSubmit()
                }
              }}
            />
            <Button 
              onClick={handleManualSubmit}
              disabled={!manualCode.trim()}
            >
              Submit
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Find the QR code on the recycling bin and enter it above
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
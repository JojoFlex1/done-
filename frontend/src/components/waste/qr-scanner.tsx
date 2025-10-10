"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, Camera, Loader2, MapPin, CheckCircle } from "lucide-react"

interface BinData {
  id: string
  name: string
  address: string
  qr_code: string
  status?: string
}

interface QRScannerProps {
  onScan: (binId: string, location: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [scannedData, setScannedData] = useState<BinData | null>(null)
  const [manualInput, setManualInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [validating, setValidating] = useState(false)

  const validateQRCode = async (qrCode: string) => {
    setValidating(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please login first")
        return
      }

      const response = await fetch(`/api/waste/validate-qr?qr_code=${encodeURIComponent(qrCode)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid QR code")
      }

      if (data.valid && data.bin) {
        setScannedData(data.bin)
        setError("")
        return data.bin
      } else {
        throw new Error("Bin not found or inactive")
      }
    } catch (err: any) {
      setError(err.message || "Failed to validate QR code")
      setScannedData(null)
      return null
    } finally {
      setValidating(false)
    }
  }

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) {
      setError("Please enter a bin ID")
      return
    }

    const binData = await validateQRCode(manualInput.trim())

    if (binData) {
      onScan(binData.id, binData.address || binData.name)
    }
  }

  const handleScanClick = () => {
    // For now, we'll use manual input
    // In production, you'd integrate a real QR scanner library like html5-qrcode
    setError("Camera QR scanning coming soon! Please use manual input for now.")
  }

  const handleClear = () => {
    setScannedData(null)
    setManualInput("")
    setError("")
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          Scan QR Code
        </CardTitle>
        <CardDescription>Scan the QR code on the recycling bin or enter the bin ID manually</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {scannedData ? (
          <div className="space-y-4">
            <Alert className="border-success bg-success/5">
              <CheckCircle className="w-5 h-5 text-success" />
              <AlertDescription className="ml-2">
                <strong>Bin Verified!</strong>
              </AlertDescription>
            </Alert>

            <Card className="border-success/30 bg-success/5">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-success mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{scannedData.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{scannedData.address}</p>
                    <p className="text-xs text-muted-foreground mt-2">QR Code: {scannedData.qr_code}</p>
                    {scannedData.status && (
                      <span className="text-xs mt-2 inline-block px-2 py-1 rounded bg-success/10 text-success">
                        {scannedData.status}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleClear} variant="outline" className="flex-1">
                Scan Another
              </Button>
              <Button
                onClick={() => onScan(scannedData.id, scannedData.address || scannedData.name)}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Camera Scan Button */}
            <Button onClick={handleScanClick} className="w-full" variant="outline" disabled={loading || validating}>
              <Camera className="w-4 h-4 mr-2" />
              {loading ? "Scanning..." : "Scan with Camera"}
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
                  placeholder="e.g., BIN-NYC-001"
                  value={manualInput}
                  onChange={(e) => {
                    setManualInput(e.target.value)
                    setError("")
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleManualSubmit()
                    }
                  }}
                  disabled={validating}
                />
                <Button onClick={handleManualSubmit} disabled={validating || !manualInput.trim()}>
                  {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Enter the bin ID found on the recycling bin</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
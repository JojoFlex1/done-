"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, MapPin, ArrowRight, Loader2, CheckCircle } from "lucide-react"

interface Bin {
  id: string
  name: string
  qr_code: string
  address: string
  status?: string
}

export default function ScanPage() {
  const router = useRouter()
  const [qrInput, setQrInput] = useState("")
  const [scannedBin, setScannedBin] = useState<Bin | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validateAndFetchBin = async (qrCode: string) => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/waste/validate-qr?qr_code=${encodeURIComponent(qrCode)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate QR code")
      }

      if (data.valid && data.bin) {
        setScannedBin(data.bin)
      } else {
        throw new Error("Invalid or inactive bin")
      }
    } catch (err: any) {
      setError(err.message || "Failed to validate QR code")
      setScannedBin(null)
    } finally {
      setLoading(false)
    }
  }

  const handleScan = () => {
    if (!qrInput.trim()) {
      setError("Please enter a QR code")
      return
    }
    validateAndFetchBin(qrInput.trim())
  }

  const handleContinue = () => {
    if (scannedBin) {
      // Store bin data in localStorage for the submit page
      localStorage.setItem("selectedBin", JSON.stringify(scannedBin))
      router.push("/submit")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">♻️</div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Scan Bin</h1>
                <p className="text-sm text-muted-foreground">Locate your recycling bin</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {!scannedBin ? (
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  Scan or Enter QR Code
                </CardTitle>
                <CardDescription>Enter the QR code found on the recycling bin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., BIN-NYC-001"
                      value={qrInput}
                      onChange={(e) => {
                        setQrInput(e.target.value)
                        setError("")
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleScan()
                        }
                      }}
                      disabled={loading}
                    />
                    <Button onClick={handleScan} disabled={loading || !qrInput.trim()}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Find the QR code sticker on the recycling bin and enter the code
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
                  <h4 className="text-sm font-semibold mb-2">How to find the QR code:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Look for a sticker on the recycling bin</li>
                    <li>• The code usually starts with "BIN-"</li>
                    <li>• Each bin has a unique identifier</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Alert className="border-success bg-success/5">
                <CheckCircle className="w-5 h-5 text-success" />
                <AlertDescription className="ml-2">
                  <strong>Bin Verified Successfully!</strong>
                </AlertDescription>
              </Alert>

              <Card className="border-success/30 bg-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-success" />
                    Bin Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bin Name</label>
                    <p className="text-lg font-semibold">{scannedBin.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-sm">{scannedBin.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">QR Code</label>
                    <p className="text-sm font-mono">{scannedBin.qr_code}</p>
                  </div>
                  {scannedBin.status && (
                    <div>
                      <span className="text-xs px-2 py-1 rounded bg-success/10 text-success">
                        {scannedBin.status.toUpperCase()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setScannedBin(null)
                    setQrInput("")
                  }}
                >
                  Scan Another
                </Button>
                <Button className="flex-1" onClick={handleContinue}>
                  Continue to Submit
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
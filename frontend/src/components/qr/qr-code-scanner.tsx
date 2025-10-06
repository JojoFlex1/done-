"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, Camera, Flashlight, RotateCcw } from "lucide-react"

interface QRCodeScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
}

export function QRCodeScanner({ onScan, onError }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flashlightOn, setFlashlightOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Simulate QR code detection after 3 seconds for demo
      setTimeout(() => {
        const mockQRData = "BIN-NYC-001"
        onScan(mockQRData)
        stopScanning()
      }, 3000)
    } catch (err) {
      console.error("Error accessing camera:", err)
      setHasPermission(false)
      setError("Unable to access camera. Please check permissions.")
      setIsScanning(false)
      onError?.("Camera access denied")
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
    setFlashlightOn(false)
  }

  const toggleFlashlight = async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack && "torch" in videoTrack.getCapabilities()) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ torch: !flashlightOn } as any],
          })
          setFlashlightOn(!flashlightOn)
        } catch (err) {
          console.error("Error toggling flashlight:", err)
        }
      }
    }
  }

  const retryCamera = () => {
    setError(null)
    setHasPermission(null)
    startScanning()
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          QR Code Scanner
        </CardTitle>
        <CardDescription>Point your camera at the QR code on the e-waste bin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isScanning && hasPermission !== false && (
          <div className="space-y-4">
            <Alert>
              <Camera className="w-4 h-4" />
              <AlertDescription>
                Position the QR code within the camera frame. Make sure there's good lighting for best results.
              </AlertDescription>
            </Alert>
            <Button onClick={startScanning} className="w-full h-16 text-lg">
              <QrCode className="w-6 h-6 mr-2" />
              Start Scanning
            </Button>
          </div>
        )}

        {hasPermission === false && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <Camera className="w-4 h-4" />
              <AlertDescription>
                Camera access is required to scan QR codes. Please enable camera permissions and try again.
              </AlertDescription>
            </Alert>
            <Button onClick={retryCamera} variant="outline" className="w-full bg-transparent">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Camera Access
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play()
                  }
                }}
              />

              {/* QR Code Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Scanning frame */}
                  <div className="absolute inset-0 border-2 border-primary/50 rounded-lg">
                    {/* Corner indicators */}
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  </div>

                  {/* Scanning line animation */}
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <div className="absolute w-full h-0.5 bg-primary animate-pulse" style={{ top: "50%" }} />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
                <p className="text-sm font-medium mb-2">Position QR code in the frame</p>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleFlashlight}
                    className="bg-black/50 hover:bg-black/70"
                  >
                    <Flashlight className={`w-4 h-4 ${flashlightOn ? "text-yellow-400" : ""}`} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={stopScanning}
                    className="bg-black/50 hover:bg-black/70"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <QrCode className="w-4 h-4" />
              <AlertDescription>Scanning for QR code... Hold steady and ensure good lighting.</AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

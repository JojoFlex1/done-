"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, RotateCcw, Check } from "lucide-react"

interface WastePhotoCaptureProps {
  onPhotoCapture: (photo: File) => void
}

export function WastePhotoCapture({ onPhotoCapture }: WastePhotoCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      setIsCapturing(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsCapturing(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCapturing(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "ewaste-photo.jpg", { type: "image/jpeg" })
              setCapturedPhoto(file)
              setPreviewUrl(URL.createObjectURL(file))
              stopCamera()
            }
          },
          "image/jpeg",
          0.8,
        )
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setCapturedPhoto(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onPhotoCapture(capturedPhoto)
    }
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Take Photo of E-Waste
        </CardTitle>
        <CardDescription>
          Capture a clear photo of your electronic waste item for accurate categorization and rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!capturedPhoto && !isCapturing && (
          <div className="space-y-4">
            <Alert>
              <Camera className="w-4 h-4" />
              <AlertDescription>
                Take a clear, well-lit photo showing the entire item. This helps us verify the type and condition of
                your e-waste.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={startCamera} className="h-24 flex-col gap-2">
                <Camera className="w-6 h-6" />
                Use Camera
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-24 flex-col gap-2">
                <Upload className="w-6 h-6" />
                Upload Photo
              </Button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        )}

        {isCapturing && (
          <div className="space-y-4">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
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
              <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button onClick={capturePhoto} size="lg" className="rounded-full w-16 h-16">
                  <Camera className="w-6 h-6" />
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Button variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {capturedPhoto && previewUrl && (
          <div className="space-y-4">
            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Captured e-waste"
                className="w-full h-full object-cover"
              />
            </div>

            <Alert>
              <Check className="w-4 h-4" />
              <AlertDescription>
                Photo captured successfully! Make sure the item is clearly visible and well-lit.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button variant="outline" onClick={retakePhoto} className="flex-1 bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button onClick={confirmPhoto} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Smartphone, Laptop, Battery, Cpu, CheckCircle, ArrowLeft } from "lucide-react"
import { WastePhotoCapture } from "@/components/waste/waste-photo-capture"
import { QRScanner } from "@/components/waste/qr-scanner"

interface WasteSubmission {
  photo: File | null
  category: string
  description: string
  binId: string
  location: string
  estimatedReward: number
}

const wasteCategories = [
  { id: "smartphone", name: "Smartphone", icon: Smartphone, reward: { min: 10, max: 25 } },
  { id: "laptop", name: "Laptop/Computer", icon: Laptop, reward: { min: 50, max: 150 } },
  { id: "battery", name: "Battery", icon: Battery, reward: { min: 5, max: 15 } },
  { id: "component", name: "Component", icon: Cpu, reward: { min: 15, max: 40 } },
]

export default function SubmitWastePage() {
  const [step, setStep] = useState<"photo" | "details" | "scan" | "confirm" | "success">("photo")
  const [submission, setSubmission] = useState<WasteSubmission>({
    photo: null,
    category: "",
    description: "",
    binId: "",
    location: "",
    estimatedReward: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handlePhotoCapture = (photo: File) => {
    setSubmission((prev) => ({ ...prev, photo }))
    setStep("details")
  }

  const handleCategoryChange = (category: string) => {
    const categoryData = wasteCategories.find((c) => c.id === category)
    const estimatedReward = categoryData ? (categoryData.reward.min + categoryData.reward.max) / 2 : 0
    setSubmission((prev) => ({ ...prev, category, estimatedReward }))
  }

  const handleQRScan = (binId: string, location: string) => {
    setSubmission((prev) => ({ ...prev, binId, location }))
    setStep("confirm")
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Simulate API call to submit waste
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStep("success")
    } catch (error) {
      console.error("Submission failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetSubmission = () => {
    setSubmission({
      photo: null,
      category: "",
      description: "",
      binId: "",
      location: "",
      estimatedReward: 0,
    })
    setStep("photo")
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
                <h1 className="text-xl font-bold text-foreground">Submit E-Waste</h1>
                <p className="text-sm text-muted-foreground">Turn your waste into rewards</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {["photo", "details", "scan", "confirm"].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === stepName
                        ? "bg-primary text-primary-foreground"
                        : ["photo", "details", "scan", "confirm"].indexOf(step) > index
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {["photo", "details", "scan", "confirm"].indexOf(step) > index ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${
                        ["photo", "details", "scan", "confirm"].indexOf(step) > index ? "bg-success" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold capitalize">{step === "photo" ? "Take Photo" : step}</h2>
            </div>
          </div>

          {/* Step Content */}
          {step === "photo" && <WastePhotoCapture onPhotoCapture={handlePhotoCapture} />}

          {step === "details" && (
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Waste Details</CardTitle>
                <CardDescription>Help us categorize your e-waste for accurate rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Photo Preview */}
                {submission.photo && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Photo Preview</label>
                    <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(submission.photo) || "/placeholder.svg"}
                        alt="E-waste preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={submission.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select waste category" />
                    </SelectTrigger>
                    <SelectContent>
                      {wasteCategories.map((category) => {
                        const IconComponent = category.icon
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              <span>{category.name}</span>
                              <Badge variant="secondary" className="ml-auto">
                                {category.reward.min}-{category.reward.max} ADA
                              </Badge>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Estimated Reward */}
                {submission.category && (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                      Estimated reward: <strong>{submission.estimatedReward} ADA</strong> (final amount determined after
                      verification)
                    </AlertDescription>
                  </Alert>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    placeholder="Add any additional details about the item..."
                    value={submission.description}
                    onChange={(e) => setSubmission((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button className="w-full" onClick={() => setStep("scan")} disabled={!submission.category}>
                  Continue to QR Scan
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "scan" && <QRScanner onScan={handleQRScan} />}

          {step === "confirm" && (
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Confirm Submission</CardTitle>
                <CardDescription>Review your e-waste submission before finalizing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Photo */}
                {submission.photo && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Photo</label>
                    <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(submission.photo) || "/placeholder.svg"}
                        alt="E-waste"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Details Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="font-medium">{wasteCategories.find((c) => c.id === submission.category)?.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Estimated Reward</label>
                    <p className="font-medium text-success">{submission.estimatedReward} ADA</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Bin Location</label>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {submission.location}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Bin ID</label>
                    <p className="font-medium font-mono text-sm">{submission.binId}</p>
                  </div>
                </div>

                {submission.description && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm bg-muted/50 p-3 rounded">{submission.description}</p>
                  </div>
                )}

                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    Your submission will be verified within 24 hours. Rewards will be automatically credited to your
                    wallet upon approval.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
                    Edit Details
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                    {isLoading ? "Submitting..." : "Submit E-Waste"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "success" && (
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <CardTitle className="text-success">Submission Successful!</CardTitle>
                <CardDescription>Your e-waste has been submitted for verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-success">{submission.estimatedReward} ADA</div>
                      <p className="text-sm text-muted-foreground">Estimated Reward</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">24h</div>
                      <p className="text-sm text-muted-foreground">Verification Time</p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    We'll send you a notification once your submission is verified and rewards are credited to your
                    wallet.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={resetSubmission} className="flex-1 bg-transparent">
                    Submit Another
                  </Button>
                  <Button onClick={() => (window.location.href = "/dashboard")} className="flex-1">
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

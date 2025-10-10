"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, User, Wallet, Copy, Eye, EyeOff, AlertTriangle } from "lucide-react"

interface SignupFormData {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
}

interface WalletData {
  address: string
  mnemonic: string
}

export function SignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"form" | "otp" | "success">("form")
  const [otp, setOtp] = useState("")
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [mnemonicSaved, setMnemonicSaved] = useState(false)

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create account")
        return
      }

      setStep("otp")
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Invalid OTP")
        return
      }

      // ✅ STORE TOKEN
      if (data.token) {
        localStorage.setItem("token", data.token)
      }

      // ✅ STORE WALLET DATA (INCLUDING MNEMONIC!)
      if (data.wallet) {
        setWalletData(data.wallet)
        // Store wallet address in localStorage for dashboard
        localStorage.setItem("walletAddress", data.wallet.address)
      }

      setStep("success")
    } catch (err) {
      setError("OTP verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You can add a toast notification here
  }

  const copyMnemonic = () => {
    if (walletData?.mnemonic) {
      copyToClipboard(walletData.mnemonic)
      alert("Recovery phrase copied to clipboard!")
    }
  }

  if (step === "success" && walletData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-success" />
          </div>
          <CardTitle className="text-success">Welcome to Reloop!</CardTitle>
          <CardDescription>Your account and Cardano wallet have been created successfully</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CRITICAL WARNING */}
          <Alert className="border-warning bg-warning/5">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <AlertDescription className="ml-2">
              <strong>IMPORTANT:</strong> Save your 24-word recovery phrase below. This is the ONLY way to recover your
              wallet if you lose access. Never share it with anyone!
            </AlertDescription>
          </Alert>

          {/* WALLET ADDRESS */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Your Wallet Address</Label>
            <div className="flex gap-2">
              <code className="flex-1 text-xs bg-muted p-3 rounded-md break-all font-mono">
                {walletData.address}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(walletData.address)}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 24-WORD RECOVERY PHRASE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">24-Word Recovery Phrase</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMnemonic(!showMnemonic)}
                className="h-8 gap-2"
              >
                {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showMnemonic ? "Hide" : "Show"}
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border-2 border-warning/20">
              {showMnemonic ? (
                <div className="grid grid-cols-3 gap-3">
                  {walletData.mnemonic.split(" ").map((word, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                      <span className="text-sm font-mono bg-background px-2 py-1 rounded flex-1">{word}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click "Show" to reveal your recovery phrase</p>
                </div>
              )}
            </div>

            {showMnemonic && (
              <Button variant="outline" className="w-full" onClick={copyMnemonic}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Recovery Phrase
              </Button>
            )}
          </div>

          {/* CONFIRMATION CHECKBOX */}
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <input
              type="checkbox"
              id="saved"
              checked={mnemonicSaved}
              onChange={(e) => setMnemonicSaved(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="saved" className="text-sm cursor-pointer">
              I have saved my 24-word recovery phrase in a secure location. I understand that losing it means I will
              lose access to my wallet forever.
            </label>
          </div>

          {/* CONTINUE BUTTON */}
          <Button
            className="w-full"
            size="lg"
            disabled={!mnemonicSaved}
            onClick={() => (window.location.href = "/dashboard")}
          >
            Continue to Dashboard
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            💡 Tip: Write down your recovery phrase on paper and store it in a safe place
          </p>
        </CardContent>
      </Card>
    )
  }

  if (step === "otp") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>We've sent a verification code to {formData.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOtpVerification} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Create Account
        </CardTitle>
        <CardDescription>Join Reloop and start earning rewards for your e-waste</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            A Cardano wallet will be automatically created and secured for you
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
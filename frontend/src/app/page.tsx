"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Recycle, Wallet, Camera, QrCode, Trophy, Leaf } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl animate-float">♻️</div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Reloop</h1>
                <p className="text-sm text-muted-foreground">E-Waste to Rewards</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
              <Leaf className="w-3 h-3 mr-1" />
              Eco-Friendly
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold mb-6 text-balance">
              Turn Your <span className="text-primary">E-Waste</span> Into{" "}
              <span className="text-success">ADA Rewards</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Join the circular economy revolution. Drop your electronic waste at our smart bins and earn Cardano (ADA)
              tokens automatically. No crypto knowledge required.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Snap & Drop</h3>
                    <p className="text-sm text-muted-foreground">
                      Take a photo of your e-waste and drop it in our smart bins
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="w-6 h-6 text-success" />
                    </div>
                    <h3 className="font-semibold mb-2">Auto Wallet</h3>
                    <p className="text-sm text-muted-foreground">
                      We create and manage your Cardano wallet automatically
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-6 h-6 text-warning" />
                    </div>
                    <h3 className="font-semibold mb-2">Earn Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      Get ADA tokens based on the type and value of your e-waste
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Section - Now with redirect buttons */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Recycle className="w-5 h-5 text-primary" />
                  Get Started
                </CardTitle>
                <CardDescription>Create your account and start earning rewards today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  size="lg"
                  onClick={() => router.push('/signup')}
                >
                  Create Account
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  A Cardano wallet will be automatically created for you
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Why Choose Reloop?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make e-waste recycling rewarding and accessible to everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <QrCode className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-semibold mb-2">Smart Bins</h4>
                <p className="text-sm text-muted-foreground">QR-enabled bins track your contributions automatically</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <Wallet className="w-8 h-8 text-success mb-4" />
                <h4 className="font-semibold mb-2">Crypto Made Simple</h4>
                <p className="text-sm text-muted-foreground">No need to understand blockchain - we handle everything</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <Trophy className="w-8 h-8 text-warning mb-4" />
                <h4 className="font-semibold mb-2">Tiered Rewards</h4>
                <p className="text-sm text-muted-foreground">Different e-waste types earn different reward levels</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <Leaf className="w-8 h-8 text-success mb-4" />
                <h4 className="font-semibold mb-2">Environmental Impact</h4>
                <p className="text-sm text-muted-foreground">Track your positive impact on the environment</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-2xl">♻️</div>
            <span className="font-semibold">Reloop</span>
          </div>
          <p className="text-sm text-muted-foreground">Making e-waste recycling rewarding for everyone</p>
        </div>
      </footer>
    </div>
  )
}

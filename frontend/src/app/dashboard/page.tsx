"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownLeft, Coins, Recycle, Camera, QrCode, Trophy, TrendingUp } from "lucide-react"
import { WalletCard } from "@/components/wallet/wallet-card"
import { TransactionHistory } from "@/components/wallet/transaction-history"
import { RewardsOverview } from "@/components/rewards/rewards-overview"

interface UserWallet {
  address: string
  balance: number
  mnemonic: string
  transactions: Transaction[]
}

interface Transaction {
  id: string
  type: "reward" | "withdrawal"
  amount: number
  date: string
  description: string
  status: "completed" | "pending"
}

export default function DashboardPage() {
  const [wallet, setWallet] = useState<UserWallet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMnemonic, setShowMnemonic] = useState(false)

  useEffect(() => {
    // Simulate fetching user wallet data
    const fetchWalletData = async () => {
      try {
        // This would be replaced with actual API call
        const mockWallet: UserWallet = {
          address:
            "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a6gtmk4l3aq4s3gf8",
          balance: 125.75,
          mnemonic: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
          transactions: [
            {
              id: "1",
              type: "reward",
              amount: 15.5,
              date: "2024-01-15",
              description: "E-waste submission - Smartphone",
              status: "completed",
            },
            {
              id: "2",
              type: "reward",
              amount: 8.25,
              date: "2024-01-14",
              description: "E-waste submission - Laptop Battery",
              status: "completed",
            },
            {
              id: "3",
              type: "withdrawal",
              amount: -50.0,
              date: "2024-01-12",
              description: "Withdrawal to external wallet",
              status: "completed",
            },
          ],
        }
        setWallet(mockWallet)
      } catch (error) {
        console.error("Failed to fetch wallet data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">♻️</div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">♻️</div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Reloop Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your e-waste rewards</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                <Coins className="w-3 h-3 mr-1" />
                {wallet?.balance.toFixed(2)} ADA
              </Badge>
              <Button variant="outline" size="sm">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Submit E-Waste
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors cursor-pointer"
                onClick={() => (window.location.href = "/submit")}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Submit E-Waste</h3>
                      <p className="text-sm text-muted-foreground">Take photo & earn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors cursor-pointer"
                onClick={() => (window.location.href = "/scan")}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Scan QR Code</h3>
                      <p className="text-sm text-muted-foreground">Find nearby bins</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <h3 className="font-semibold">View Rewards</h3>
                      <p className="text-sm text-muted-foreground">Track earnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-success" />
                        This Month
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">E-Waste Submitted</span>
                          <span className="font-semibold">12 items</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">ADA Earned</span>
                          <span className="font-semibold text-success">+23.75 ADA</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Environmental Impact</span>
                          <span className="font-semibold text-primary">2.4 kg CO₂ saved</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {wallet?.transactions.slice(0, 3).map((tx) => (
                          <div key={tx.id} className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                tx.type === "reward" ? "bg-success/10" : "bg-muted"
                              }`}
                            >
                              {tx.type === "reward" ? (
                                <ArrowDownLeft className="w-4 h-4 text-success" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{tx.description}</p>
                              <p className="text-xs text-muted-foreground">{tx.date}</p>
                            </div>
                            <span
                              className={`text-sm font-semibold ${
                                tx.type === "reward" ? "text-success" : "text-muted-foreground"
                              }`}
                            >
                              {tx.type === "reward" ? "+" : ""}
                              {tx.amount} ADA
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transactions">
                {wallet && <TransactionHistory transactions={wallet.transactions} />}
              </TabsContent>

              <TabsContent value="rewards">
                <RewardsOverview />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {wallet && <WalletCard wallet={wallet} />}

            {/* Environmental Impact */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Recycle className="w-5 h-5 text-success" />
                  Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">15.2 kg</div>
                  <p className="text-sm text-muted-foreground">CO₂ emissions prevented</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">47</div>
                    <p className="text-xs text-muted-foreground">Items recycled</p>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">8.3 kg</div>
                    <p className="text-xs text-muted-foreground">E-waste processed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

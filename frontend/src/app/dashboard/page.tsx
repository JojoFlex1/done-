"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  mnemonic: string | null
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

interface UserProfile {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  walletAddress: string
  totalPoints: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<UserWallet | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        router.push("/login")
        return
      }

      // ✅ FETCH REAL USER PROFILE FROM BACKEND
      const profileResponse = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!profileResponse.ok) {
        if (profileResponse.status === 401) {
          localStorage.removeItem("token")
          router.push("/login")
          return
        }
        throw new Error("Failed to fetch profile")
      }

      const profileData = await profileResponse.json()
      setProfile(profileData.user)

      // ✅ FETCH REAL TRANSACTIONS FROM BACKEND
      const transactionsResponse = await fetch("/api/rewards/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      let transactions: Transaction[] = []
      
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        
        // Transform backend transactions to frontend format
        transactions = transactionsData.map((tx: any) => ({
          id: tx.id,
          type: tx.transaction_type === "earned" ? "reward" : "withdrawal",
          amount: tx.ada_amount,
          date: new Date(tx.created_at).toLocaleDateString(),
          description: tx.description,
          status: tx.status,
        }))
      }

      // ✅ CALCULATE BALANCE FROM TOTAL POINTS
      const balanceInAda = (profileData.user.totalPoints || 0) / 1000000

      // ✅ SET REAL WALLET DATA
      setWallet({
        address: profileData.user.walletAddress,
        balance: balanceInAda,
        mnemonic: null, // Don't fetch mnemonic from backend for security
        transactions,
      })

    } catch (error) {
      console.error("Failed to fetch user data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push("/login")}>Back to Login</Button>
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
                <p className="text-sm text-muted-foreground">Welcome, {profile?.firstName}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                <Coins className="w-3 h-3 mr-1" />
                {wallet?.balance.toFixed(2)} ADA
              </Badge>
              <Button variant="outline" size="sm" onClick={() => router.push("/submit")}>
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
                onClick={() => router.push("/submit")}
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
                onClick={() => router.push("/scan")}
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
                        Your Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Points</span>
                          <span className="font-semibold">{profile?.totalPoints.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">ADA Balance</span>
                          <span className="font-semibold text-success">{wallet?.balance.toFixed(2)} ADA</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Submissions</span>
                          <span className="font-semibold">{wallet?.transactions.length || 0}</span>
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
                        {wallet?.transactions.slice(0, 3).length ? (
                          wallet.transactions.slice(0, 3).map((tx) => (
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
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No transactions yet. Submit e-waste to start earning!
                          </p>
                        )}
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
                  <div className="text-3xl font-bold text-success mb-2">
                    {((wallet?.transactions.length || 0) * 0.32).toFixed(1)} kg
                  </div>
                  <p className="text-sm text-muted-foreground">CO₂ emissions prevented</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">{wallet?.transactions.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Items recycled</p>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      {((wallet?.transactions.length || 0) * 0.18).toFixed(1)} kg
                    </div>
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
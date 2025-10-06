"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Trophy, TrendingUp, Calendar, Users, Star, Target } from "lucide-react"
import { RewardsChart } from "@/components/rewards/rewards-chart"
import { Leaderboard } from "@/components/rewards/leaderboard"
import { AchievementsList } from "@/components/rewards/achievements-list"

interface RewardStats {
  totalEarned: number
  thisMonth: number
  thisWeek: number
  rank: number
  level: string
  nextLevelProgress: number
  itemsSubmitted: number
  co2Saved: number
}

export default function RewardsPage() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month")

  const stats: RewardStats = {
    totalEarned: 342.75,
    thisMonth: 89.25,
    thisWeek: 23.5,
    rank: 47,
    level: "Eco Champion",
    nextLevelProgress: 75,
    itemsSubmitted: 156,
    co2Saved: 45.2,
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
                <h1 className="text-xl font-bold text-foreground">Rewards Center</h1>
                <p className="text-sm text-muted-foreground">Track your earnings and achievements</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold text-success">{stats.totalEarned} ADA</p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-primary">{stats.thisMonth} ADA</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Global Rank</p>
                  <p className="text-2xl font-bold text-warning">#{stats.rank}</p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Items Recycled</p>
                  <p className="text-2xl font-bold text-foreground">{stats.itemsSubmitted}</p>
                </div>
                <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="border-border/50 bg-card/50 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-warning" />
                  Current Level: {stats.level}
                </CardTitle>
                <CardDescription>Keep recycling to reach the next level and unlock higher rewards</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                Level 4
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress to Eco Master</span>
                <span>{stats.nextLevelProgress}%</span>
              </div>
              <Progress value={stats.nextLevelProgress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Current: +15% reward bonus</span>
                <span>Next: +25% reward bonus</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Rewards */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle>Recent Rewards</CardTitle>
                  <CardDescription>Your latest e-waste submissions and earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { item: "iPhone 12", reward: 22.5, date: "2 hours ago", status: "verified" },
                      { item: "Laptop Battery", reward: 8.25, date: "1 day ago", status: "verified" },
                      { item: "Old Router", reward: 12.0, date: "2 days ago", status: "pending" },
                      { item: "Tablet", reward: 18.75, date: "3 days ago", status: "verified" },
                    ].map((reward, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">{reward.item}</p>
                          <p className="text-xs text-muted-foreground">{reward.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success">+{reward.reward} ADA</p>
                          <Badge
                            variant={reward.status === "verified" ? "secondary" : "outline"}
                            className={`text-xs ${
                              reward.status === "verified"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-warning/10 text-warning border-warning/20"
                            }`}
                          >
                            {reward.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Environmental Impact */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-success" />
                    Environmental Impact
                  </CardTitle>
                  <CardDescription>Your contribution to a cleaner planet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-success mb-2">{stats.co2Saved} kg</div>
                      <p className="text-sm text-muted-foreground">CO₂ emissions prevented</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary">156</div>
                        <p className="text-xs text-muted-foreground">Items Recycled</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-warning">28.3 kg</div>
                        <p className="text-xs text-muted-foreground">E-waste Processed</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Monthly Goal</span>
                        <span>15/20 items</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-muted-foreground">5 more items to unlock bonus rewards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <RewardsChart timeframe={timeframe} onTimeframeChange={setTimeframe} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

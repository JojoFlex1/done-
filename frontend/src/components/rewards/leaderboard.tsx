"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Crown } from "lucide-react"

const leaderboardData = [
  {
    rank: 1,
    username: "EcoWarrior2024",
    rewards: 1247.5,
    items: 312,
    level: "Eco Master",
    isCurrentUser: false,
  },
  {
    rank: 2,
    username: "GreenTechGuru",
    rewards: 1156.25,
    items: 289,
    level: "Eco Master",
    isCurrentUser: false,
  },
  {
    rank: 3,
    username: "RecycleKing",
    rewards: 1089.75,
    items: 267,
    level: "Eco Champion",
    isCurrentUser: false,
  },
  {
    rank: 4,
    username: "PlanetSaver",
    rewards: 987.5,
    items: 245,
    level: "Eco Champion",
    isCurrentUser: false,
  },
  {
    rank: 5,
    username: "WasteNinja",
    rewards: 876.25,
    items: 223,
    level: "Eco Champion",
    isCurrentUser: false,
  },
  // ... more users
  {
    rank: 47,
    username: "You",
    rewards: 342.75,
    items: 156,
    level: "Eco Champion",
    isCurrentUser: true,
  },
]

export function Leaderboard() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/20"
      case 2:
        return "bg-gray-400/10 border-gray-400/20"
      case 3:
        return "bg-amber-600/10 border-amber-600/20"
      default:
        return "bg-muted/30 border-border/50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Top Recyclers
          </CardTitle>
          <CardDescription>The most dedicated e-waste recyclers this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboardData.slice(0, 3).map((user) => (
              <div
                key={user.rank}
                className={`p-6 rounded-lg border text-center ${getRankColor(user.rank)} ${
                  user.rank === 1 ? "md:order-2" : user.rank === 2 ? "md:order-1" : "md:order-3"
                }`}
              >
                <div className="flex justify-center mb-4">{getRankIcon(user.rank)}</div>
                <Avatar className="w-16 h-16 mx-auto mb-4">
                  <AvatarFallback className="text-lg font-bold">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold mb-2">{user.username}</h3>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-success">{user.rewards} ADA</p>
                  <p className="text-sm text-muted-foreground">{user.items} items</p>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {user.level}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full Leaderboard */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Global Leaderboard</CardTitle>
          <CardDescription>See how you rank against other recyclers worldwide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboardData.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  user.isCurrentUser
                    ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20"
                    : "bg-muted/30 border-border/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10">
                  {user.rank <= 3 ? getRankIcon(user.rank) : <span className="font-bold">#{user.rank}</span>}
                </div>

                <Avatar className="w-10 h-10">
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${user.isCurrentUser ? "text-primary" : ""}`}>{user.username}</h3>
                    {user.isCurrentUser && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.level}</p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-success">{user.rewards} ADA</p>
                  <p className="text-sm text-muted-foreground">{user.items} items</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Your Stats */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Your Performance
          </CardTitle>
          <CardDescription>How you're doing compared to other users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">#47</div>
              <p className="text-sm text-muted-foreground">Global Rank</p>
              <p className="text-xs text-success mt-1">↑ 3 positions this week</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">342.75</div>
              <p className="text-sm text-muted-foreground">Total ADA Earned</p>
              <p className="text-xs text-success mt-1">↑ 89.25 this month</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning mb-2">156</div>
              <p className="text-sm text-muted-foreground">Items Recycled</p>
              <p className="text-xs text-success mt-1">↑ 28 this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

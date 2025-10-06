"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, Trophy, Target, Zap, Shield, Crown, Gift, Flame } from "lucide-react"

const achievements = [
  {
    id: "first_drop",
    name: "First Drop",
    description: "Submit your first e-waste item",
    icon: Star,
    reward: "5 ADA",
    earned: true,
    earnedDate: "2024-01-10",
    rarity: "common",
  },
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Join Reloop in the first month",
    icon: Shield,
    reward: "25 ADA",
    earned: true,
    earnedDate: "2024-01-10",
    rarity: "rare",
  },
  {
    id: "eco_warrior",
    name: "Eco Warrior",
    description: "Submit 25 items in a month",
    icon: Trophy,
    reward: "50 ADA",
    earned: true,
    earnedDate: "2024-01-28",
    rarity: "epic",
  },
  {
    id: "battery_master",
    name: "Battery Master",
    description: "Submit 10 batteries",
    icon: Zap,
    reward: "15 ADA",
    earned: true,
    earnedDate: "2024-01-20",
    rarity: "uncommon",
  },
  {
    id: "tech_recycler",
    name: "Tech Recycler",
    description: "Submit items from all categories",
    icon: Target,
    reward: "75 ADA",
    earned: false,
    progress: 75,
    maxProgress: 100,
    rarity: "epic",
  },
  {
    id: "century_club",
    name: "Century Club",
    description: "Submit 100 items total",
    icon: Crown,
    reward: "100 ADA",
    earned: true,
    earnedDate: "2024-02-15",
    rarity: "legendary",
  },
  {
    id: "streak_master",
    name: "Streak Master",
    description: "Submit items for 30 consecutive days",
    icon: Flame,
    reward: "200 ADA",
    earned: false,
    progress: 18,
    maxProgress: 30,
    rarity: "legendary",
  },
  {
    id: "generous_giver",
    name: "Generous Giver",
    description: "Refer 5 friends to Reloop",
    icon: Gift,
    reward: "150 ADA",
    earned: false,
    progress: 2,
    maxProgress: 5,
    rarity: "epic",
  },
]

const rarityColors = {
  common: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  uncommon: "bg-green-500/10 text-green-500 border-green-500/20",
  rare: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  epic: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  legendary: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
}

export function AchievementsList() {
  const earnedAchievements = achievements.filter((a) => a.earned)
  const unearned = achievements.filter((a) => !a.earned)
  const totalRewards = earnedAchievements.reduce((sum, a) => sum + Number.parseInt(a.reward.split(" ")[0]), 0)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Achievement Summary
          </CardTitle>
          <CardDescription>Your progress and unlocked rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">{earnedAchievements.length}</div>
              <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning mb-2">{totalRewards}</div>
              <p className="text-sm text-muted-foreground">Bonus ADA Earned</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {Math.round((earnedAchievements.length / achievements.length) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Unlocked Achievements</CardTitle>
          <CardDescription>Congratulations on these accomplishments!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earnedAchievements.map((achievement) => {
              const IconComponent = achievement.icon
              return (
                <div
                  key={achievement.id}
                  className="p-4 rounded-lg border border-success/20 bg-success/5 hover:bg-success/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center shrink-0">
                      <IconComponent className="w-6 h-6 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm">{achievement.name}</h3>
                        <Badge variant="secondary" className={rarityColors[achievement.rarity]}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                          +{achievement.reward}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Earned {new Date(achievement.earnedDate!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* In Progress Achievements */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>In Progress</CardTitle>
          <CardDescription>Keep going to unlock these achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {unearned.map((achievement) => {
              const IconComponent = achievement.icon
              const progress = achievement.progress || 0
              const maxProgress = achievement.maxProgress || 100
              const progressPercent = (progress / maxProgress) * 100

              return (
                <div
                  key={achievement.id}
                  className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shrink-0">
                      <IconComponent className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm">{achievement.name}</h3>
                        <Badge variant="outline" className={rarityColors[achievement.rarity]}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{achievement.description}</p>
                      {achievement.progress !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>
                              {progress}/{maxProgress}
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          +{achievement.reward}
                        </Badge>
                        {achievement.progress !== undefined && (
                          <span className="text-xs text-muted-foreground">{maxProgress - progress} more to go</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

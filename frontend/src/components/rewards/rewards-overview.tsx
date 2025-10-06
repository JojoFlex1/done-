"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Smartphone, Laptop, Battery, Cpu, Star } from "lucide-react"

const wasteCategories = [
  {
    id: "smartphones",
    name: "Smartphones",
    icon: Smartphone,
    reward: "10-25 ADA",
    submitted: 8,
    description: "Mobile phones, tablets, smartwatches",
  },
  {
    id: "laptops",
    name: "Laptops & Computers",
    icon: Laptop,
    reward: "50-150 ADA",
    submitted: 3,
    description: "Laptops, desktops, monitors",
  },
  {
    id: "batteries",
    name: "Batteries",
    icon: Battery,
    reward: "5-15 ADA",
    submitted: 12,
    description: "Phone batteries, laptop batteries, power banks",
  },
  {
    id: "components",
    name: "Components",
    icon: Cpu,
    reward: "15-40 ADA",
    submitted: 5,
    description: "CPUs, RAM, hard drives, graphics cards",
  },
]

const achievements = [
  {
    id: "first_submission",
    name: "First Drop",
    description: "Submit your first e-waste item",
    earned: true,
    reward: "5 ADA bonus",
  },
  {
    id: "eco_warrior",
    name: "Eco Warrior",
    description: "Submit 25 items in a month",
    earned: true,
    reward: "25 ADA bonus",
  },
  {
    id: "battery_master",
    name: "Battery Master",
    description: "Submit 10 batteries",
    earned: true,
    reward: "15 ADA bonus",
  },
  {
    id: "tech_recycler",
    name: "Tech Recycler",
    description: "Submit items from all categories",
    earned: false,
    reward: "50 ADA bonus",
  },
]

export function RewardsOverview() {
  return (
    <div className="space-y-6">
      {/* Reward Categories */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Reward Categories</CardTitle>
          <CardDescription>Different e-waste types earn different rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wasteCategories.map((category) => {
              const IconComponent = category.icon
              return (
                <div
                  key={category.id}
                  className="p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{category.name}</h3>
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                          {category.reward}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Submitted:</span>
                        <span className="text-xs font-medium">{category.submitted} items</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Achievements
          </CardTitle>
          <CardDescription>Unlock bonuses by reaching milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border transition-colors ${
                  achievement.earned ? "border-success/20 bg-success/5" : "border-border/50 bg-card/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.earned ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {achievement.earned ? <Star className="w-5 h-5 fill-current" /> : <Star className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm">{achievement.name}</h3>
                      <Badge
                        variant={achievement.earned ? "secondary" : "outline"}
                        className={achievement.earned ? "bg-success/10 text-success border-success/20" : ""}
                      >
                        {achievement.reward}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress to Next Level */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Progress to Next Level</CardTitle>
          <CardDescription>Keep submitting to unlock higher rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Current Level: Eco Enthusiast</span>
            <span>Next: Eco Champion</span>
          </div>
          <Progress value={75} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>28/40 items submitted</span>
            <span>+20% reward bonus at next level</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

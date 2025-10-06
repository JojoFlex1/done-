"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, Calendar, Coins } from "lucide-react"

interface RewardsChartProps {
  timeframe: "week" | "month" | "year"
  onTimeframeChange: (timeframe: "week" | "month" | "year") => void
}

const weeklyData = [
  { name: "Mon", rewards: 12.5, items: 3 },
  { name: "Tue", rewards: 8.25, items: 2 },
  { name: "Wed", rewards: 15.75, items: 4 },
  { name: "Thu", rewards: 22.0, items: 5 },
  { name: "Fri", rewards: 18.5, items: 4 },
  { name: "Sat", rewards: 25.25, items: 6 },
  { name: "Sun", rewards: 19.75, items: 4 },
]

const monthlyData = [
  { name: "Week 1", rewards: 89.25, items: 18 },
  { name: "Week 2", rewards: 76.5, items: 15 },
  { name: "Week 3", rewards: 102.75, items: 22 },
  { name: "Week 4", rewards: 94.0, items: 19 },
]

const yearlyData = [
  { name: "Jan", rewards: 245.5, items: 52 },
  { name: "Feb", rewards: 198.25, items: 41 },
  { name: "Mar", rewards: 312.75, items: 67 },
  { name: "Apr", rewards: 289.0, items: 58 },
  { name: "May", rewards: 356.25, items: 74 },
  { name: "Jun", rewards: 298.5, items: 61 },
]

export function RewardsChart({ timeframe, onTimeframeChange }: RewardsChartProps) {
  const getData = () => {
    switch (timeframe) {
      case "week":
        return weeklyData
      case "month":
        return monthlyData
      case "year":
        return yearlyData
      default:
        return monthlyData
    }
  }

  const data = getData()
  const totalRewards = data.reduce((sum, item) => sum + item.rewards, 0)
  const totalItems = data.reduce((sum, item) => sum + item.items, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
                <p className="text-2xl font-bold text-success">{totalRewards.toFixed(2)} ADA</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items Submitted</p>
                <p className="text-2xl font-bold text-primary">{totalItems}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Item</p>
                <p className="text-2xl font-bold text-warning">{(totalRewards / totalItems).toFixed(2)} ADA</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rewards Chart */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Rewards Earned</CardTitle>
                <CardDescription>ADA tokens earned over time</CardDescription>
              </div>
              <div className="flex gap-2">
                {(["week", "month", "year"] as const).map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTimeframeChange(period)}
                    className="capitalize"
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="rewards" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Items Chart */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Items Submitted</CardTitle>
            <CardDescription>Number of e-waste items recycled</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="items"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Rewards by Category</CardTitle>
          <CardDescription>Breakdown of earnings by e-waste type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { category: "Smartphones", rewards: 187.5, items: 12, color: "bg-blue-500" },
              { category: "Laptops", rewards: 450.0, items: 6, color: "bg-green-500" },
              { category: "Batteries", rewards: 82.5, items: 15, color: "bg-yellow-500" },
              { category: "Components", rewards: 165.0, items: 8, color: "bg-purple-500" },
            ].map((item) => (
              <div key={item.category} className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <h3 className="font-medium text-sm">{item.category}</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-success">{item.rewards} ADA</p>
                  <p className="text-xs text-muted-foreground">{item.items} items</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

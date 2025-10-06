"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"

interface Transaction {
  id: string
  type: "reward" | "withdrawal"
  amount: number
  date: string
  description: string
  status: "completed" | "pending"
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>All your e-waste rewards and withdrawals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground">Start submitting e-waste to earn your first rewards!</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/30"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === "reward" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {transaction.type === "reward" ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{transaction.description}</h4>
                    <Badge
                      variant={transaction.status === "completed" ? "secondary" : "outline"}
                      className={`text-xs ${
                        transaction.status === "completed"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }`}
                    >
                      {transaction.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                </div>

                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      transaction.type === "reward" ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {transaction.type === "reward" ? "+" : ""}
                    {transaction.amount} ADA
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

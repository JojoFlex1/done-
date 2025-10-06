"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Copy, Eye, EyeOff, ArrowUpRight, Shield } from "lucide-react"

interface UserWallet {
  address: string
  balance: number
  mnemonic: string
}

interface WalletCardProps {
  wallet: UserWallet
}

export function WalletCard({ wallet }: WalletCardProps) {
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Your Cardano Wallet
        </CardTitle>
        <CardDescription>Automatically created and managed for you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance */}
        <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-success/5 rounded-lg border border-border/50">
          <div className="text-3xl font-bold text-foreground mb-2">{wallet.balance.toFixed(2)} ADA</div>
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <Badge variant="secondary" className="mt-2 bg-success/10 text-success border-success/20">
            <Shield className="w-3 h-3 mr-1" />
            Secured
          </Badge>
        </div>

        {/* Wallet Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Wallet Address</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted/50 p-3 rounded border font-mono break-all">
              {formatAddress(wallet.address)}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(wallet.address, "address")}
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          {copied === "address" && <p className="text-xs text-success">Address copied to clipboard!</p>}
        </div>

        {/* Recovery Phrase */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Recovery Phrase</label>
            <Button variant="ghost" size="sm" onClick={() => setShowMnemonic(!showMnemonic)} className="text-xs">
              {showMnemonic ? (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Show
                </>
              )}
            </Button>
          </div>

          {showMnemonic ? (
            <div className="space-y-2">
              <div className="bg-muted/50 p-3 rounded border">
                <code className="text-xs font-mono break-all">{wallet.mnemonic}</code>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(wallet.mnemonic, "mnemonic")}
                  className="text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Phrase
                </Button>
                {copied === "mnemonic" && <p className="text-xs text-success">Recovery phrase copied!</p>}
              </div>
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  Keep your recovery phrase safe and never share it with anyone. It's the only way to recover your
                  wallet.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="bg-muted/30 p-3 rounded border border-dashed">
              <p className="text-xs text-muted-foreground text-center">Click "Show" to reveal your recovery phrase</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button className="w-full bg-transparent" variant="outline">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Withdraw ADA
          </Button>
          <p className="text-xs text-muted-foreground text-center">Minimum withdrawal: 10 ADA</p>
        </div>
      </CardContent>
    </Card>
  )
}

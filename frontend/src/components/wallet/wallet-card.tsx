"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Copy, Eye, EyeOff, ArrowUpRight, Shield, AlertTriangle } from "lucide-react"

interface UserWallet {
  address: string
  balance: number
  mnemonic: string | null
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
    if (!address) return ""
    return `${address.slice(0, 12)}...${address.slice(-12)}`
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
          <div className="text-3xl font-bold text-foreground mb-2">{wallet.balance.toFixed(6)} ADA</div>
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
            {wallet.mnemonic && (
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
            )}
          </div>

          {wallet.mnemonic ? (
            showMnemonic ? (
              <div className="space-y-2">
                <div className="bg-muted/50 p-3 rounded border">
                  <div className="grid grid-cols-2 gap-2">
                    {wallet.mnemonic.split(" ").map((word, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                        <span className="text-xs font-mono">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(wallet.mnemonic!, "mnemonic")}
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
                <p className="text-xs text-muted-foreground text-center">
                  Click "Show" to reveal your recovery phrase
                </p>
              </div>
            )
          ) : (
            <Alert className="border-warning/50 bg-warning/5">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <AlertDescription className="text-xs ml-2">
                Your recovery phrase was shown during account creation. For security, it cannot be retrieved again.
                Make sure you saved it in a secure location.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button className="w-full bg-transparent" variant="outline" disabled={wallet.balance < 10}>
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Withdraw ADA
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {wallet.balance < 10
              ? `Earn ${(10 - wallet.balance).toFixed(2)} more ADA to withdraw`
              : "Minimum withdrawal: 10 ADA"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
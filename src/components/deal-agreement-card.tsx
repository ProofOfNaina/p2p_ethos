import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EthosScoreBadge } from "@/components/ui/ethos-score-badge";
import { DealAgreement } from "@/types";
import { Shield, CheckCircle2, Clock, Copy, ExternalLink, Twitter, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DealAgreementCardProps {
  deal: DealAgreement;
  compact?: boolean;
}

export function DealAgreementCard({ deal, compact = false }: DealAgreementCardProps) {
  const { toast } = useToast();

  const handleCopyRef = () => {
    navigator.clipboard.writeText(deal.referenceHash);
    toast({
      title: "Copied!",
      description: "Reference hash copied to clipboard.",
    });
  };

  const buyerTwitter = deal.buyer.socials.find(s => s.platform === 'twitter')?.username;
  const sellerTwitter = deal.seller.socials.find(s => s.platform === 'twitter')?.username;

  if (compact) {
    return (
      <Card className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                deal.status === 'completed' ? "bg-success/20" : "bg-warning/20"
              )}>
                {deal.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Clock className="w-5 h-5 text-warning" />
                )}
              </div>
              <div>
                <p className="font-medium">{deal.asset} Trade</p>
                <p className="text-sm text-muted-foreground">
                  ${deal.amount.toLocaleString()} • {deal.region}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={deal.status === 'completed' ? 'default' : 'secondary'}>
                {deal.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {deal.completedAt 
                  ? new Date(deal.completedAt).toLocaleDateString()
                  : new Date(deal.createdAt).toLocaleDateString()
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50 overflow-hidden">
      {/* Header with gradient stripe */}
      <div className={cn(
        "h-2",
        deal.status === 'completed' ? "bg-gradient-hero" : "bg-gradient-warning"
      )} />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Deal Agreement</h3>
              <p className="text-sm text-muted-foreground font-mono">
                #{deal.id}
              </p>
            </div>
          </div>
          <Badge 
            variant={deal.status === 'completed' ? 'default' : 'secondary'}
            className="text-sm px-3 py-1"
          >
            {deal.status === 'completed' ? (
              <><CheckCircle2 className="w-3 h-3 mr-1" />Completed</>
            ) : (
              <><Clock className="w-3 h-3 mr-1" />{deal.status}</>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Parties */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Buyer</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {buyerTwitter && (
                  <span className="text-sm flex items-center gap-1">
                    <Twitter className="w-3 h-3 text-[#1DA1F2]" />
                    @{buyerTwitter}
                  </span>
                )}
              </div>
              <EthosScoreBadge score={deal.buyer.ethosScore} size="sm" showLabel={false} />
            </div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Seller</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sellerTwitter && (
                  <span className="text-sm flex items-center gap-1">
                    <Twitter className="w-3 h-3 text-[#1DA1F2]" />
                    @{sellerTwitter}
                  </span>
                )}
              </div>
              <EthosScoreBadge score={deal.seller.ethosScore} size="sm" showLabel={false} />
            </div>
          </div>
        </div>

        {/* Deal Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-secondary/20 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Asset</p>
            <p className="font-display font-bold text-lg">{deal.asset}</p>
          </div>
          <div className="bg-secondary/20 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="font-display font-bold text-lg">${deal.amount.toLocaleString()}</p>
          </div>
          <div className="bg-secondary/20 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-display font-bold text-lg">{deal.price}</p>
          </div>
          <div className="bg-secondary/20 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Currency</p>
            <p className="font-display font-bold text-lg">{deal.currency}</p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div>
            <span className="opacity-60">Created:</span>{' '}
            {new Date(deal.createdAt).toLocaleString()}
          </div>
          {deal.completedAt && (
            <div>
              <span className="opacity-60">Completed:</span>{' '}
              {new Date(deal.completedAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Reference Hash */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Reference Hash (Proof ID)</p>
              <p className="font-mono text-sm break-all">{deal.referenceHash}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCopyRef}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

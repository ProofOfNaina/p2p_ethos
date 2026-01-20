import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EthosScoreBadge } from "@/components/ui/ethos-score-badge";
import { Order } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { Twitter, MessageCircle, Send, Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FulfillmentDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestSubmit: (orderId: string, amount: number) => void;
}

export function FulfillmentDialog({ order, open, onOpenChange, onRequestSubmit }: FulfillmentDialogProps) {
  const { user, trustTier } = useUser();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order || !user) return null;

  const maxAmount = Math.min(order.amount, trustTier?.maxTrade || 0);
  const requestedAmount = parseFloat(amount) || 0;
  const isValid = requestedAmount > 0 && requestedAmount <= maxAmount;

  const handleSubmit = async () => {
    if (!isValid) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onRequestSubmit(order.id, requestedAmount);
    toast({
      title: "Request Sent",
      description: "The order creator will review your request.",
    });
    
    setIsSubmitting(false);
    setAmount("");
    onOpenChange(false);
  };

  const twitterHandle = order.creator.socials.find(s => s.platform === 'twitter')?.username;
  const discordHandle = order.creator.socials.find(s => s.platform === 'discord')?.username;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Request to Fulfill</DialogTitle>
          <DialogDescription>
            Submit a request to trade with this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Creator Info */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Order Creator</p>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {twitterHandle && (
                  <div className="flex items-center gap-2 text-sm">
                    <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                    <span>@{twitterHandle}</span>
                  </div>
                )}
                {discordHandle && (
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="w-4 h-4 text-[#5865F2]" />
                    <span>{discordHandle}</span>
                  </div>
                )}
              </div>
              <EthosScoreBadge score={order.creator.ethosScore} size="md" />
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{order.type}</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Asset</p>
              <p className="font-medium">{order.asset}</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="font-medium">{order.amount.toLocaleString()}</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-medium">{order.price} {order.currency}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Amount to Trade</Label>
              <span className="text-xs text-muted-foreground">
                Max: ${maxAmount.toLocaleString()} (based on your Ethos tier)
              </span>
            </div>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={maxAmount}
            />
            {requestedAmount > maxAmount && (
              <p className="text-xs text-destructive">
                Amount exceeds your maximum trade limit
              </p>
            )}
          </div>

          {/* Your Info */}
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Your Profile (Visible to Creator)</p>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {user.socials.map(social => (
                  <div key={social.platform} className="flex items-center gap-2 text-sm">
                    {social.platform === 'twitter' ? (
                      <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-[#5865F2]" />
                    )}
                    <span>@{social.username}</span>
                  </div>
                ))}
              </div>
              <EthosScoreBadge score={user.ethosScore} size="md" />
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full bg-gradient-hero text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Fulfillment Request
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Component for order creator to accept/deny requests
interface RequestReviewDialogProps {
  request: {
    id: string;
    requester: {
      ethosScore: number;
      socials: { platform: string; username: string }[];
      totalDeals: number;
    };
    requestedAmount: number;
  } | null;
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onDeny: () => void;
}

export function RequestReviewDialog({ 
  request, 
  order, 
  open, 
  onOpenChange, 
  onAccept, 
  onDeny 
}: RequestReviewDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  if (!request || !order) return null;

  const handleAccept = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onAccept();
    toast({
      title: "Request Accepted",
      description: "A private chat has been opened with the trader.",
    });
    setIsProcessing(false);
    onOpenChange(false);
  };

  const handleDeny = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onDeny();
    toast({
      title: "Request Denied",
      description: "The requester has been notified.",
    });
    setIsProcessing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Review Fulfillment Request</DialogTitle>
          <DialogDescription>
            Review this trader's request and decide whether to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Requester Profile</p>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {request.requester.socials.map((social, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {social.platform === 'twitter' ? (
                      <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-[#5865F2]" />
                    )}
                    <span>@{social.username}</span>
                  </div>
                ))}
              </div>
              <EthosScoreBadge score={request.requester.ethosScore} size="md" />
            </div>
            <div className="text-sm text-muted-foreground">
              {request.requester.totalDeals} completed deals
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-2">Requested Trade</p>
            <p className="text-2xl font-display font-bold">
              ${request.requestedAmount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.asset} at {order.price} {order.currency}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="destructive"
              onClick={handleDeny}
              disabled={isProcessing}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Deny
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isProcessing}
              className="gap-2 bg-gradient-hero text-primary-foreground"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Accept
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

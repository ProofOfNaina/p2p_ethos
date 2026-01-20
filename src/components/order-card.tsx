import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EthosScoreBadge } from "@/components/ui/ethos-score-badge";
import { Order } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { Twitter, MessageCircle, MapPin, Clock, ArrowUpRight, ArrowDownLeft, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: Order;
  onRequestFulfill?: (order: Order) => void;
}

export function OrderCard({ order, onRequestFulfill }: OrderCardProps) {
  const { user, trustTier } = useUser();
  
  const twitterHandle = order.creator.socials.find(s => s.platform === 'twitter')?.username;
  const discordHandle = order.creator.socials.find(s => s.platform === 'discord')?.username;
  
  const canFulfill = user && 
    user.ethosScore >= order.minEthosRequired && 
    user.id !== order.creatorId &&
    order.status === 'open';

  const isBuy = order.type === 'buy';

  return (
    <Card className={cn(
      "bg-gradient-card border-border/50 overflow-hidden transition-all duration-300 hover:border-primary/30",
      order.status === 'open' && "hover:shadow-glow"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              isBuy ? "bg-success/20" : "bg-info/20"
            )}>
              {isBuy ? (
                <ArrowDownLeft className="w-6 h-6 text-success" />
              ) : (
                <ArrowUpRight className="w-6 h-6 text-info" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg">
                  {isBuy ? 'Buying' : 'Selling'} {order.asset}
                </span>
                <Badge variant={order.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {twitterHandle && (
                  <span className="flex items-center gap-1">
                    <Twitter className="w-3 h-3" />@{twitterHandle}
                  </span>
                )}
                {discordHandle && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />{discordHandle}
                  </span>
                )}
              </div>
            </div>
          </div>
          <EthosScoreBadge score={order.creator.ethosScore} size="sm" showLabel={false} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Amount</p>
            <p className="font-display font-bold text-xl">{order.amount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{order.asset}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Price</p>
            <p className="font-display font-bold text-xl flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {order.price.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">{order.currency}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {order.region}
          </Badge>
          {order.paymentMethod && (
            <Badge variant="outline">{order.paymentMethod}</Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(order.createdAt).toLocaleDateString()}
          </Badge>
        </div>

        {order.notes && (
          <p className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">
            {order.notes}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Min. Ethos Required</p>
            <p className="font-medium text-primary">{order.minEthosRequired}+</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Max per Trade</p>
            <p className="font-medium">${order.maxTradeAmount.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {order.status === 'open' && (
          <Button
            className={cn(
              "w-full",
              canFulfill ? "bg-gradient-hero text-primary-foreground" : ""
            )}
            disabled={!canFulfill}
            onClick={() => onRequestFulfill?.(order)}
          >
            {!user 
              ? "Connect to Trade" 
              : user.id === order.creatorId 
                ? "Your Order"
                : user.ethosScore < order.minEthosRequired 
                  ? `Requires ${order.minEthosRequired}+ Ethos`
                  : "Request to Fulfill"
            }
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

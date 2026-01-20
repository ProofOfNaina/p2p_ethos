import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EthosScoreBadge } from "@/components/ui/ethos-score-badge";
import { DealAgreement, ChatMessage } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { Send, Check, CheckCheck, Clock, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DealChatProps {
  deal: DealAgreement;
  onSendMessage: (message: string) => void;
  onMarkDone: () => void;
  onClose: () => void;
}

export function DealChat({ deal, onSendMessage, onMarkDone, onClose }: DealChatProps) {
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [deal.messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  const isBuyer = user?.id === deal.buyerId;
  const otherUser = isBuyer ? deal.seller : deal.buyer;
  const myConfirmed = isBuyer ? deal.buyerConfirmed : deal.sellerConfirmed;
  const otherConfirmed = isBuyer ? deal.sellerConfirmed : deal.buyerConfirmed;

  return (
    <Card className="glass border-border/50 flex flex-col h-[600px]">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Deal #{deal.id.slice(-8)}
                <Badge variant={deal.status === 'completed' ? 'default' : 'secondary'}>
                  {deal.status}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Trading with</span>
                <EthosScoreBadge score={otherUser.ethosScore} size="sm" showLabel={false} />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Deal Summary */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center bg-secondary/30 rounded-lg p-3">
          <div>
            <p className="text-xs text-muted-foreground">Asset</p>
            <p className="font-medium">{deal.asset}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="font-medium">${deal.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-medium">{deal.price} {deal.currency}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* System message */}
        <div className="flex justify-center">
          <div className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full">
            Deal started • Both parties must confirm completion
          </div>
        </div>

        {deal.messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={cn(
                "flex",
                isMe ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2",
                  isMe 
                    ? "bg-primary text-primary-foreground rounded-br-sm" 
                    : "bg-secondary rounded-bl-sm"
                )}
              >
                <p className="text-sm">{msg.content}</p>
                <div className={cn(
                  "flex items-center gap-1 mt-1",
                  isMe ? "justify-end" : "justify-start"
                )}>
                  <span className="text-xs opacity-60">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && <CheckCheck className="w-3 h-3 opacity-60" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </CardContent>

      {deal.status !== 'completed' && (
        <>
          {/* Confirmation Status */}
          <div className="px-4 py-2 border-t border-border/50 bg-secondary/30">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {myConfirmed ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={myConfirmed ? "text-success" : "text-muted-foreground"}>
                  {myConfirmed ? "You confirmed" : "Your confirmation pending"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {otherConfirmed ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={otherConfirmed ? "text-success" : "text-muted-foreground"}>
                  {otherConfirmed ? "Partner confirmed" : "Partner pending"}
                </span>
              </div>
            </div>
          </div>

          <CardFooter className="flex-col gap-3 p-4 border-t border-border/50">
            <div className="flex gap-2 w-full">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon" disabled={!message.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {!myConfirmed && (
              <Button 
                onClick={onMarkDone}
                className="w-full bg-success hover:bg-success/90 text-success-foreground"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark as Done
              </Button>
            )}
          </CardFooter>
        </>
      )}

      {deal.status === 'completed' && (
        <CardFooter className="p-4 border-t border-border/50">
          <div className="w-full text-center py-4">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
              <CheckCheck className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-display font-bold text-lg text-success">Deal Completed!</h3>
            <p className="text-sm text-muted-foreground">
              A deal agreement card has been generated.
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

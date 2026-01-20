import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/contexts/UserContext";
import { Order, OrderType, Region, Currency } from "@/types";
import { getTrustTier } from "@/lib/ethos-api";
import { Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const REGIONS: Region[] = ['Nigeria', 'India', 'Pakistan', 'Vietnam'];
const CURRENCIES: Currency[] = ['NGN', 'INR', 'PKR', 'VND', 'USD', 'USDT'];

interface CreateOrderDialogProps {
  defaultType?: OrderType;
  onOrderCreated?: (order: Order) => void;
}

export function CreateOrderDialog({ defaultType = 'buy', onOrderCreated }: CreateOrderDialogProps) {
  const { user, trustTier, setOrders } = useUser();
  const [open, setOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(defaultType);
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [region, setRegion] = useState<Region | "">("");
  const [currency, setCurrency] = useState<Currency | "">("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [minEthos, setMinEthos] = useState("1400");

  const handleSubmit = () => {
    if (!user || !region || !currency || !amount || !price) return;

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      type: orderType,
      creatorId: user.id,
      creator: user,
      asset,
      amount: parseFloat(amount),
      price: parseFloat(price),
      currency: currency as Currency,
      region: region as Region,
      paymentMethod: paymentMethod || undefined,
      notes: notes || undefined,
      minEthosRequired: parseInt(minEthos),
      maxTradeAmount: trustTier?.maxTrade || 500,
      status: 'open',
      createdAt: new Date(),
      fulfillmentRequests: []
    };

    setOrders(prev => [newOrder, ...prev]);
    onOrderCreated?.(newOrder);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setAsset("USDT");
    setAmount("");
    setPrice("");
    setRegion("");
    setCurrency("");
    setPaymentMethod("");
    setNotes("");
    setMinEthos("1400");
  };

  const isValid = asset && amount && price && region && currency;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-hero text-primary-foreground gap-2">
          <Plus className="w-4 h-4" />
          Create Order
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create New Order</DialogTitle>
          <DialogDescription>
            Set up your buy or sell order with the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Tabs value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="buy" className="gap-2">
                <ArrowDownLeft className="w-4 h-4" />
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="gap-2">
                <ArrowUpRight className="w-4 h-4" />
                Sell
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={asset} onValueChange={setAsset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                placeholder="1.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Currency *</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Region *</Label>
            <Select value={region} onValueChange={(v) => setRegion(v as Region)}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment Method (optional)</Label>
            <Input
              placeholder="Bank Transfer, PayPal, etc."
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Min. Ethos Required</Label>
            <Select value={minEthos} onValueChange={setMinEthos}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1400">1400+ (Basic)</SelectItem>
                <SelectItem value="1600">1600+ (Trusted)</SelectItem>
                <SelectItem value="1800">1800+ (Verified)</SelectItem>
                <SelectItem value="2000">2000+ (Elite)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any additional information for traders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!isValid}
            className="w-full bg-gradient-hero text-primary-foreground"
          >
            Create {orderType === 'buy' ? 'Buy' : 'Sell'} Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

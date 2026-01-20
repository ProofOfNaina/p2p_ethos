import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { OrderCard } from "@/components/order-card";
import { CreateOrderDialog } from "@/components/create-order-dialog";
import { FulfillmentDialog, RequestReviewDialog } from "@/components/fulfillment-dialog";
import { DealChat } from "@/components/deal-chat";
import { DealAgreementCard } from "@/components/deal-agreement-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { Order, DealAgreement, FulfillmentRequest, ChatMessage } from "@/types";
import { ArrowDownLeft, ArrowUpRight, Filter, Clock, MessageSquare, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock orders for demo
const mockOrders: Order[] = [
  {
    id: 'order_1',
    type: 'sell',
    creatorId: 'mock_user_1',
    creator: {
      id: 'mock_user_1',
      ethosScore: 1850,
      socials: [{ platform: 'twitter', username: 'cryptotrader', verified: true, connectedAt: new Date() }],
      totalDeals: 45,
      activeDeals: 2,
      completedDeals: [],
      createdAt: new Date()
    },
    asset: 'USDT',
    amount: 5000,
    price: 1.02,
    currency: 'NGN',
    region: 'Nigeria',
    paymentMethod: 'Bank Transfer',
    notes: 'Fast and reliable trader. Usually respond within 5 minutes.',
    minEthosRequired: 1400,
    maxTradeAmount: 2500,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000),
    fulfillmentRequests: []
  },
  {
    id: 'order_2',
    type: 'buy',
    creatorId: 'mock_user_2',
    creator: {
      id: 'mock_user_2',
      ethosScore: 2100,
      socials: [
        { platform: 'twitter', username: 'defi_whale', verified: true, connectedAt: new Date() },
        { platform: 'discord', username: 'DeFiWhale#1234', verified: true, connectedAt: new Date() }
      ],
      totalDeals: 120,
      activeDeals: 0,
      completedDeals: [],
      createdAt: new Date()
    },
    asset: 'USDC',
    amount: 10000,
    price: 82.5,
    currency: 'INR',
    region: 'India',
    paymentMethod: 'UPI, IMPS',
    minEthosRequired: 1600,
    maxTradeAmount: 5000,
    status: 'open',
    createdAt: new Date(Date.now() - 7200000),
    fulfillmentRequests: []
  },
  {
    id: 'order_3',
    type: 'sell',
    creatorId: 'mock_user_3',
    creator: {
      id: 'mock_user_3',
      ethosScore: 1650,
      socials: [{ platform: 'discord', username: 'pktrader#5678', verified: true, connectedAt: new Date() }],
      totalDeals: 28,
      activeDeals: 1,
      completedDeals: [],
      createdAt: new Date()
    },
    asset: 'BTC',
    amount: 0.5,
    price: 43500,
    currency: 'PKR',
    region: 'Pakistan',
    notes: 'Only serious buyers. Verify payment before release.',
    minEthosRequired: 1800,
    maxTradeAmount: 10000,
    status: 'open',
    createdAt: new Date(Date.now() - 10800000),
    fulfillmentRequests: []
  }
];

const TradingPage = () => {
  const { user, canAccessP2P, orders, setOrders, activeDeals, setActiveDeals } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'my-orders'>('buy');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false);
  const [activeDeal, setActiveDeal] = useState<DealAgreement | null>(null);
  const [pendingRequests, setPendingRequests] = useState<FulfillmentRequest[]>([]);
  const [reviewingRequest, setReviewingRequest] = useState<FulfillmentRequest | null>(null);

  useEffect(() => {
    if (!canAccessP2P) {
      navigate('/');
    }
  }, [canAccessP2P, navigate]);

  useEffect(() => {
    // Initialize with mock orders
    if (orders.length === 0) {
      setOrders(mockOrders);
    }
  }, []);

  const handleRequestFulfill = (order: Order) => {
    setSelectedOrder(order);
    setFulfillDialogOpen(true);
  };

  const handleFulfillmentSubmit = (orderId: string, amount: number) => {
    if (!user) return;
    
    // Create a fulfillment request
    const newRequest: FulfillmentRequest = {
      id: `req_${Date.now()}`,
      orderId,
      requesterId: user.id,
      requester: user,
      requestedAmount: amount,
      status: 'pending',
      createdAt: new Date()
    };

    // For demo: if user is the order creator, show it as a pending request
    // Otherwise, simulate acceptance after delay
    const order = orders.find(o => o.id === orderId);
    if (order && order.creatorId !== user.id) {
      // Simulate instant acceptance for demo
      setTimeout(() => {
        createDealFromRequest(newRequest, order);
      }, 1500);
    }
  };

  const createDealFromRequest = (request: FulfillmentRequest, order: Order) => {
    if (!user) return;

    const newDeal: DealAgreement = {
      id: `deal_${Date.now()}`,
      orderId: order.id,
      buyerId: order.type === 'sell' ? request.requesterId : order.creatorId,
      sellerId: order.type === 'sell' ? order.creatorId : request.requesterId,
      buyer: order.type === 'sell' ? request.requester : order.creator,
      seller: order.type === 'sell' ? order.creator : request.requester,
      asset: order.asset,
      amount: request.requestedAmount,
      price: order.price,
      currency: order.currency,
      region: order.region,
      buyerConfirmed: false,
      sellerConfirmed: false,
      status: 'in_progress',
      messages: [],
      createdAt: new Date(),
      referenceHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    };

    setActiveDeals(prev => [...prev, newDeal]);
    setActiveDeal(newDeal);
    
    toast({
      title: "Deal Started!",
      description: "A private chat has been opened. Complete the trade and mark as done.",
    });
  };

  const handleSendMessage = (message: string) => {
    if (!activeDeal || !user) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      dealId: activeDeal.id,
      senderId: user.id,
      content: message,
      timestamp: new Date()
    };

    setActiveDeals(prev => prev.map(d => 
      d.id === activeDeal.id 
        ? { ...d, messages: [...d.messages, newMessage] }
        : d
    ));
    setActiveDeal(prev => prev ? { ...prev, messages: [...prev.messages, newMessage] } : null);
  };

  const handleMarkDone = () => {
    if (!activeDeal || !user) return;

    const isBuyer = user.id === activeDeal.buyerId;
    
    setActiveDeals(prev => prev.map(d => {
      if (d.id !== activeDeal.id) return d;
      
      const updated = {
        ...d,
        buyerConfirmed: isBuyer ? true : d.buyerConfirmed,
        sellerConfirmed: !isBuyer ? true : d.sellerConfirmed
      };

      // Check if both confirmed
      if (updated.buyerConfirmed && updated.sellerConfirmed) {
        updated.status = 'completed';
        updated.completedAt = new Date();
        toast({
          title: "Deal Completed!",
          description: "A deal agreement card has been generated.",
        });
      }

      return updated;
    }));

    setActiveDeal(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        buyerConfirmed: isBuyer ? true : prev.buyerConfirmed,
        sellerConfirmed: !isBuyer ? true : prev.sellerConfirmed
      };
      if (updated.buyerConfirmed && updated.sellerConfirmed) {
        updated.status = 'completed';
        updated.completedAt = new Date();
      }
      return updated;
    });
  };

  const buyOrders = orders.filter(o => o.type === 'buy' && o.status === 'open');
  const sellOrders = orders.filter(o => o.type === 'sell' && o.status === 'open');
  const myOrders = orders.filter(o => o.creatorId === user?.id);
  const completedDeals = activeDeals.filter(d => d.status === 'completed');

  if (!canAccessP2P) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20 pb-8">
        <div className="container px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold">P2P Trading</h1>
              <p className="text-muted-foreground">
                Browse orders or create your own
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeDeals.filter(d => d.status === 'in_progress').length > 0 && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setActiveDeal(activeDeals.find(d => d.status === 'in_progress') || null)}
                >
                  <MessageSquare className="w-4 h-4" />
                  Active Deals
                  <Badge variant="destructive" className="ml-1">
                    {activeDeals.filter(d => d.status === 'in_progress').length}
                  </Badge>
                </Button>
              )}
              <CreateOrderDialog />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Orders List */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="grid grid-cols-3 w-full mb-6">
                  <TabsTrigger value="buy" className="gap-2">
                    <ArrowDownLeft className="w-4 h-4" />
                    Buy Orders
                    <Badge variant="secondary" className="ml-1">{buyOrders.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="gap-2">
                    <ArrowUpRight className="w-4 h-4" />
                    Sell Orders
                    <Badge variant="secondary" className="ml-1">{sellOrders.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="my-orders" className="gap-2">
                    My Orders
                    <Badge variant="secondary" className="ml-1">{myOrders.length}</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="buy" className="space-y-4">
                  {buyOrders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No buy orders available</p>
                    </div>
                  ) : (
                    buyOrders.map(order => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        onRequestFulfill={handleRequestFulfill}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="sell" className="space-y-4">
                  {sellOrders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No sell orders available</p>
                    </div>
                  ) : (
                    sellOrders.map(order => (
                      <OrderCard 
                        key={order.id} 
                        order={order}
                        onRequestFulfill={handleRequestFulfill}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="my-orders" className="space-y-4">
                  {myOrders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>You haven't created any orders yet</p>
                    </div>
                  ) : (
                    myOrders.map(order => (
                      <OrderCard key={order.id} order={order} />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Active Deal or Completed Deals */}
            <div className="space-y-6">
              {activeDeal ? (
                <DealChat
                  deal={activeDeal}
                  onSendMessage={handleSendMessage}
                  onMarkDone={handleMarkDone}
                  onClose={() => setActiveDeal(null)}
                />
              ) : (
                <>
                  <div>
                    <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-primary" />
                      Recent Deals
                    </h3>
                    {completedDeals.length === 0 ? (
                      <div className="bg-gradient-card border border-border/50 rounded-xl p-6 text-center text-muted-foreground">
                        <p className="text-sm">Complete your first trade to see deal agreements here.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {completedDeals.slice(0, 3).map(deal => (
                          <DealAgreementCard key={deal.id} deal={deal} compact />
                        ))}
                      </div>
                    )}
                  </div>

                  {activeDeals.filter(d => d.status === 'in_progress').length > 0 && (
                    <div>
                      <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-warning" />
                        In Progress
                      </h3>
                      <div className="space-y-3">
                        {activeDeals.filter(d => d.status === 'in_progress').map(deal => (
                          <div 
                            key={deal.id}
                            className="bg-gradient-card border border-warning/30 rounded-xl p-4 cursor-pointer hover:border-warning/50 transition-all"
                            onClick={() => setActiveDeal(deal)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{deal.asset} Trade</p>
                                <p className="text-sm text-muted-foreground">${deal.amount.toLocaleString()}</p>
                              </div>
                              <Button size="sm" variant="outline">
                                Open Chat
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <FulfillmentDialog
        order={selectedOrder}
        open={fulfillDialogOpen}
        onOpenChange={setFulfillDialogOpen}
        onRequestSubmit={handleFulfillmentSubmit}
      />
    </div>
  );
};

export default TradingPage;

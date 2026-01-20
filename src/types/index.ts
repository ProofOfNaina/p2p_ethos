export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type Region = 'Nigeria' | 'India' | 'Pakistan' | 'Vietnam';
export type Currency = 'NGN' | 'INR' | 'PKR' | 'VND' | 'USD' | 'USDT';

export interface SocialConnection {
  platform: 'twitter' | 'discord';
  username: string;
  userId?: string;
  verified: boolean;
  connectedAt: Date;
}

export interface UserProfile {
  id: string;
  ethosScore: number;
  socials: SocialConnection[];
  totalDeals: number;
  activeDeals: number;
  completedDeals: DealAgreement[];
  createdAt: Date;
}

export interface Order {
  id: string;
  type: OrderType;
  creatorId: string;
  creator: UserProfile;
  asset: string;
  amount: number;
  price: number;
  currency: Currency;
  region: Region;
  paymentMethod?: string;
  notes?: string;
  minEthosRequired: number;
  maxTradeAmount: number;
  status: OrderStatus;
  createdAt: Date;
  fulfillmentRequests: FulfillmentRequest[];
}

export interface FulfillmentRequest {
  id: string;
  orderId: string;
  requesterId: string;
  requester: UserProfile;
  requestedAmount: number;
  status: 'pending' | 'accepted' | 'denied';
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  dealId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export interface DealAgreement {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  buyer: UserProfile;
  seller: UserProfile;
  asset: string;
  amount: number;
  price: number;
  currency: Currency;
  region: Region;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  status: 'in_progress' | 'completed' | 'disputed';
  messages: ChatMessage[];
  createdAt: Date;
  completedAt?: Date;
  referenceHash: string;
}

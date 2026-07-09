export interface GasStation {
  id: string;
  name: string;
  brand: "Petrobras" | "Ipiranga" | "Shell" | "Ale" | "Independent";
  address: string;
  lat: number;
  lng: number;
  prices: {
    gasoline: number;
    ethanol: number;
    diesel: number;
    premiumGas: number;
  };
  distance?: number; // Calculated on client relative to user location
  rating: number;
  features: string[]; // ['Loja de Conveniência', 'Lava Jato', 'Wi-Fi', 'Calibrador']
}

export interface FuelingRecord {
  id: string;
  date: string; // ISO string
  stationId: string;
  stationName: string;
  fuelType: "gasoline" | "ethanol" | "diesel" | "premiumGas";
  pricePerLiter: number;
  liters: number;
  totalCost: number;
  pointsEarned: number;
  paymentMethod: "QR Code" | "Credit Card" | "Debit Card";
}

export interface LoyaltyReward {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  category: "Desconto" | "Serviço" | "Conveniência";
}

export interface UserProfile {
  name: string;
  email: string;
  points: number;
  tier: "Bronze" | "Prata" | "Ouro";
  isTwoFactorEnabled: boolean;
  isBiometricsConfigured: boolean;
  monthlySavingsGoal: number; // in BRL
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: "price_drop" | "promo" | "system" | "loyalty";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface SystemMetrics {
  totalLitersSold: number;
  totalBRLRevenue: number;
  averageGasPrice: number;
  activeUsers: number;
  lastBackupDate: string;
}

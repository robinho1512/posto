import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { GasStation, FuelingRecord, LoyaltyReward, UserProfile, PushNotification, ChatMessage, SystemMetrics } from "./src/types";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-lint",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const app = express();
app.use(express.json());

const PORT = 3000;
const STORE_PATH = path.join(process.cwd(), "data_store.json");

// Default initial data if data_store.json doesn't exist
const initialStations: GasStation[] = [
  {
    id: "1",
    name: "Posto Petrobras - Av. Paulista",
    brand: "Petrobras",
    address: "Av. Paulista, 1000 - Cerqueira César, São Paulo - SP",
    lat: -23.5615,
    lng: -46.6560,
    prices: { gasoline: 5.69, ethanol: 3.59, diesel: 5.89, premiumGas: 7.29 },
    rating: 4.5,
    features: ["Loja de Conveniência", "Wi-Fi", "Calibrador"],
  },
  {
    id: "2",
    name: "Posto Ipiranga - Augusta",
    brand: "Ipiranga",
    address: "Rua Augusta, 1500 - Consolação, São Paulo - SP",
    lat: -23.5585,
    lng: -46.6610,
    prices: { gasoline: 5.49, ethanol: 3.49, diesel: 5.95, premiumGas: 7.19 },
    rating: 4.2,
    features: ["Loja de Conveniência", "Lava Jato", "Wi-Fi"],
  },
  {
    id: "3",
    name: "Posto Shell - Av. Rebouças",
    brand: "Shell",
    address: "Av. Rebouças, 2200 - Pinheiros, São Paulo - SP",
    lat: -23.5670,
    lng: -46.6780,
    prices: { gasoline: 5.54, ethanol: 3.44, diesel: 5.84, premiumGas: 7.49 },
    rating: 4.6,
    features: ["Loja de Conveniência", "Lava Jato", "Calibrador"],
  },
  {
    id: "4",
    name: "Posto Ale - Brigadeiro",
    brand: "Ale",
    address: "Av. Brigadeiro Luís Antônio, 3000 - Jardim Paulista, São Paulo - SP",
    lat: -23.5720,
    lng: -46.6510,
    prices: { gasoline: 5.39, ethanol: 3.39, diesel: 5.79, premiumGas: 6.99 },
    rating: 4.0,
    features: ["Wi-Fi", "Calibrador"],
  },
  {
    id: "5",
    name: "Posto Shell - Av. Europa",
    brand: "Shell",
    address: "Av. Europa, 500 - Jardim Europa, São Paulo - SP",
    lat: -23.5740,
    lng: -46.6850,
    prices: { gasoline: 5.89, ethanol: 3.79, diesel: 6.10, premiumGas: 7.89 },
    rating: 4.8,
    features: ["Loja de Conveniência", "Lava Jato", "Calibrador", "Wi-Fi"],
  },
  {
    id: "6",
    name: "Posto B. Branca - Al. Santos",
    brand: "Independent",
    address: "Alameda Santos, 450 - Paraíso, São Paulo - SP",
    lat: -23.5695,
    lng: -46.6450,
    prices: { gasoline: 5.24, ethanol: 3.24, diesel: 5.69, premiumGas: 6.84 },
    rating: 3.8,
    features: ["Calibrador"],
  }
];

const initialUser: UserProfile = {
  name: "João Pedro",
  email: "joaopedro.joaopedro12345678910@gmail.com",
  points: 450,
  tier: "Bronze",
  isTwoFactorEnabled: false,
  isBiometricsConfigured: false,
  monthlySavingsGoal: 80.00,
};

const initialHistory: FuelingRecord[] = [
  {
    id: "h1",
    date: "2026-06-15T14:30:00Z",
    stationId: "2",
    stationName: "Posto Ipiranga - Augusta",
    fuelType: "gasoline",
    pricePerLiter: 5.49,
    liters: 35.5,
    totalCost: 194.90,
    pointsEarned: 35,
    paymentMethod: "QR Code",
  },
  {
    id: "h2",
    date: "2026-06-28T09:15:00Z",
    stationId: "3",
    stationName: "Posto Shell - Av. Rebouças",
    fuelType: "ethanol",
    pricePerLiter: 3.44,
    liters: 42.0,
    totalCost: 144.48,
    pointsEarned: 42,
    paymentMethod: "QR Code",
  },
  {
    id: "h3",
    date: "2026-07-02T18:45:00Z",
    stationId: "6",
    stationName: "Posto B. Branca - Al. Santos",
    fuelType: "gasoline",
    pricePerLiter: 5.24,
    liters: 28.0,
    totalCost: 146.72,
    pointsEarned: 28,
    paymentMethod: "QR Code",
  }
];

const initialNotifications: PushNotification[] = [
  {
    id: "n1",
    title: "Preço Baixo!",
    body: "O Posto B. Branca - Al. Santos reduziu a gasolina para R$ 5,24/L! Aproveite.",
    timestamp: "2026-07-06T12:00:00Z",
    read: false,
    type: "price_drop",
  },
  {
    id: "n2",
    title: "Dobro de Pontos 🚀",
    body: "Abasteça hoje com Aditivada no Posto Shell Europa e ganhe o dobro de pontos de fidelidade!",
    timestamp: "2026-07-05T08:00:00Z",
    read: true,
    type: "promo",
  }
];

interface DataStore {
  stations: GasStation[];
  user: UserProfile;
  history: FuelingRecord[];
  notifications: PushNotification[];
  metrics: SystemMetrics;
}

// Load or initialize store
function getStore(): DataStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Erro ao carregar banco de dados local:", error);
  }

  // Create default schema
  const defaultStore: DataStore = {
    stations: initialStations,
    user: initialUser,
    history: initialHistory,
    notifications: initialNotifications,
    metrics: {
      totalLitersSold: 105.5,
      totalBRLRevenue: 486.10,
      averageGasPrice: 5.54,
      activeUsers: 1420,
      lastBackupDate: "2026-07-07T03:00:00.000Z",
    }
  };
  saveStore(defaultStore);
  return defaultStore;
}

function saveStore(store: DataStore) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar no banco de dados local:", err);
  }
}

// Endpoints API

// 1. Gas Stations
app.get("/api/stations", (req, res) => {
  const store = getStore();
  res.json(store.stations);
});

app.post("/api/stations", (req, res) => {
  const store = getStore();
  const newStation: GasStation = {
    id: String(store.stations.length + 1),
    name: req.body.name,
    brand: req.body.brand || "Independent",
    address: req.body.address,
    lat: Number(req.body.lat) || -23.5600,
    lng: Number(req.body.lng) || -46.6500,
    prices: {
      gasoline: Number(req.body.prices?.gasoline) || 5.50,
      ethanol: Number(req.body.prices?.ethanol) || 3.50,
      diesel: Number(req.body.prices?.diesel) || 5.80,
      premiumGas: Number(req.body.prices?.premiumGas) || 7.00,
    },
    rating: 4.0,
    features: req.body.features || ["Calibrador"],
  };

  store.stations.push(newStation);
  saveStore(store);

  // Trigger push notification about new station
  const promoPush: PushNotification = {
    id: "n_new_" + Date.now(),
    title: "Nova Unidade PostoFiel!",
    body: `${newStation.name} agora está ativo no app! Gasolina por R$ ${newStation.prices.gasoline.toFixed(2)}/L. Confira no mapa!`,
    timestamp: new Date().toISOString(),
    read: false,
    type: "promo"
  };
  store.notifications.unshift(promoPush);
  saveStore(store);

  res.status(201).json(newStation);
});

app.put("/api/stations/:id", (req, res) => {
  const store = getStore();
  const stationId = req.params.id;
  const index = store.stations.findIndex(s => s.id === stationId);

  if (index === -1) {
    return res.status(404).json({ error: "Posto não encontrado" });
  }

  const oldPrice = store.stations[index].prices.gasoline;
  const newPrices = {
    gasoline: Number(req.body.prices?.gasoline) || store.stations[index].prices.gasoline,
    ethanol: Number(req.body.prices?.ethanol) || store.stations[index].prices.ethanol,
    diesel: Number(req.body.prices?.diesel) || store.stations[index].prices.diesel,
    premiumGas: Number(req.body.prices?.premiumGas) || store.stations[index].prices.premiumGas,
  };

  store.stations[index].prices = newPrices;

  // If gasoline price dropped substantially, trigger alert
  if (newPrices.gasoline < oldPrice) {
    const push: PushNotification = {
      id: "n_alert_" + Date.now(),
      title: "O combustível baixou! 📉",
      body: `O ${store.stations[index].name} reduziu o preço da Gasolina para R$ ${newPrices.gasoline.toFixed(2)}/L! Abasteça e ganhe pontos.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: "price_drop",
    };
    store.notifications.unshift(push);
  }

  saveStore(store);
  res.json(store.stations[index]);
});

// 2. User Profile and Security
app.get("/api/user", (req, res) => {
  const store = getStore();
  res.json(store.user);
});

app.post("/api/user/update", (req, res) => {
  const store = getStore();
  store.user = { ...store.user, ...req.body };
  saveStore(store);
  res.json(store.user);
});

app.post("/api/user/security", (req, res) => {
  const store = getStore();
  const { toggle2FA, toggleBiometrics } = req.body;

  if (toggle2FA !== undefined) store.user.isTwoFactorEnabled = toggle2FA;
  if (toggleBiometrics !== undefined) store.user.isBiometricsConfigured = toggleBiometrics;

  saveStore(store);
  res.json(store.user);
});

// 3. Fueling History & Payment Processing
app.get("/api/history", (req, res) => {
  const store = getStore();
  res.json(store.history);
});

app.post("/api/fueling", (req, res) => {
  const store = getStore();
  const { stationId, fuelType, liters, paymentMethod } = req.body;

  const station = store.stations.find(s => s.id === stationId);
  if (!station) {
    return res.status(404).json({ error: "Posto selecionado inválido" });
  }

  const pricePerLiter = station.prices[fuelType as keyof typeof station.prices] || 5.00;
  const totalCost = parseFloat((liters * pricePerLiter).toFixed(2));
  const pointsEarned = Math.floor(totalCost); // 1 ponto por cada Real gasto!

  const record: FuelingRecord = {
    id: "h_" + Date.now(),
    date: new Date().toISOString(),
    stationId,
    stationName: station.name,
    fuelType: fuelType as any,
    pricePerLiter,
    liters,
    totalCost,
    pointsEarned,
    paymentMethod: paymentMethod || "QR Code",
  };

  store.history.unshift(record);

  // Update user points
  store.user.points += pointsEarned;
  // Dynamic tier system
  if (store.user.points >= 1500) {
    store.user.tier = "Ouro";
  } else if (store.user.points >= 600) {
    store.user.tier = "Prata";
  } else {
    store.user.tier = "Bronze";
  }

  // Update system metrics
  store.metrics.totalLitersSold += liters;
  store.metrics.totalBRLRevenue += totalCost;

  // Loyalty update notification
  const loyaltyPush: PushNotification = {
    id: "n_loyalty_" + Date.now(),
    title: "Pontos Acumulados! 🎉",
    body: `Você ganhou +${pointsEarned} pontos PostoFiel abastecendo no ${station.name}. Seu saldo atual é de ${store.user.points} pts.`,
    timestamp: new Date().toISOString(),
    read: false,
    type: "loyalty",
  };
  store.notifications.unshift(loyaltyPush);

  saveStore(store);
  res.status(201).json({ record, user: store.user });
});

// 4. Notifications Engine
app.get("/api/notifications", (req, res) => {
  const store = getStore();
  res.json(store.notifications);
});

app.post("/api/notifications/read", (req, res) => {
  const store = getStore();
  store.notifications.forEach(n => n.read = true);
  saveStore(store);
  res.json({ success: true });
});

// Force-trigger a promotional price drop push from client (useful for demonstrating real-time alert)
app.post("/api/notifications/trigger-promo", (req, res) => {
  const store = getStore();
  const alertType = req.body.type || "price_drop";

  let push: PushNotification;
  if (alertType === "price_drop") {
    push = {
      id: "n_forced_" + Date.now(),
      title: "Alerta de Preço Baixo! 📉",
      body: "Gasolina aditivada caiu para R$ 5,39/L no Posto Ale Brigadeiro! Economize agora.",
      timestamp: new Date().toISOString(),
      read: false,
      type: "price_drop"
    };
  } else {
    push = {
      id: "n_forced_" + Date.now(),
      title: "Desconto Exclusivo 🏷️",
      body: "Use o cupom FIEL10 no QR Code do app e ganhe 10% de desconto no próximo abastecimento de Etanol!",
      timestamp: new Date().toISOString(),
      read: false,
      type: "promo"
    };
  }

  store.notifications.unshift(push);
  saveStore(store);
  res.json(push);
});

// 5. Admin Panel & Metrics
app.get("/api/metrics", (req, res) => {
  const store = getStore();
  res.json(store.metrics);
});

// Backup simulated triggers
app.post("/api/backup", (req, res) => {
  const store = getStore();
  store.metrics.lastBackupDate = new Date().toISOString();
  saveStore(store);
  res.json({ success: true, lastBackupDate: store.metrics.lastBackupDate });
});

// Automated Monthly Report Generator sent directly as a mock email
app.get("/api/report/monthly", (req, res) => {
  const store = getStore();
  const currentMonth = "Julho 2026";

  // Filter July 2026 data
  const currentMonthHistory = store.history.filter(h => h.date.startsWith("2026-07") || h.date.startsWith("2026-06"));
  const totalSpent = currentMonthHistory.reduce((sum, h) => sum + h.totalCost, 0);
  const totalLiters = currentMonthHistory.reduce((sum, h) => sum + h.liters, 0);

  // Calculate simulated savings based on difference from highest premium location prices
  const simulatedSavings = parseFloat((totalLiters * 0.45).toFixed(2));

  res.json({
    email: store.user.email,
    month: currentMonth,
    userName: store.user.name,
    totalSpent,
    totalLiters,
    estimatedSavings: simulatedSavings,
    pointsBalance: store.user.points,
    currentTier: store.user.tier,
    recordsCount: currentMonthHistory.length,
    htmlEmail: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #10B981; text-align: center;">Relatório Mensal PostoFiel - ${currentMonth}</h2>
        <p>Olá, <strong>${store.user.name}</strong>!</p>
        <p>Aqui está o resumo detalhado do seu consumo de combustível e economia acumulada este mês pelo aplicativo.</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;"><strong>Total Gasto:</strong></td>
              <td style="padding: 8px 0; text-align: right; color: #DC2626; font-weight: bold;">R$ ${totalSpent.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Volume Total:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${totalLiters.toFixed(1)} Litros</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-top: 1px solid #D1D5DB;"><strong>Economia Estimada:</strong></td>
              <td style="padding: 8px 0; text-align: right; color: #10B981; font-weight: bold; border-top: 1px solid #D1D5DB;">R$ ${simulatedSavings.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Pontuação Atual:</strong></td>
              <td style="padding: 8px 0; text-align: right; color: #F59E0B; font-weight: bold;">${store.user.points} pts (${store.user.tier})</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 13px; color: #6B7280; text-align: center;">Este relatório foi gerado automaticamente pelo seu PostoFiel App para manter sua saúde financeira automotiva em dia!</p>
      </div>
    `
  });
});

// 6. Gemini API Chat (Virtual Assistant)
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  const store = getStore();

  if (!message) {
    return res.status(400).json({ error: "Mensagem vazia recebida" });
  }

  try {
    const formattedStations = store.stations.map(s => {
      return `- ${s.name}: Gasolina R$ ${s.prices.gasoline.toFixed(2)}, Etanol R$ ${s.prices.ethanol.toFixed(2)}, Diesel R$ ${s.prices.diesel.toFixed(2)}, Premium R$ ${s.prices.premiumGas.toFixed(2)} (${s.address})`;
    }).join("\n");

    const systemInstruction = `
      Você é o "FielBot", o assistente de suporte virtual inteligente do aplicativo de postos de combustível PostoFiel.
      Você está disponível 24 horas por dia para ajudar o usuário de maneira educada, prestativa e objetiva.

      Aqui está o contexto atual do aplicativo que você deve usar para responder de forma realista:
      - Nome do Usuário: ${store.user.name}
      - Saldo de Pontos de Fidelidade do Usuário: ${store.user.points} pontos (Nível ${store.user.tier})
      - Lista de Postos Credenciados e Preços Atuais em Tempo Real:
      ${formattedStations}

      Regras de Negócio do Programa de Fidelidade:
      - Cada R$ 1,00 gasto em abastecimento acumula 1 ponto de fidelidade no aplicativo.
      - Prata requer 600 pontos. Ouro requer 1500 pontos.
      - Prêmios disponíveis para resgate com pontos:
        * Café expresso grátis na conveniência: 100 pontos
        * Lavagem de carro completa: 400 pontos
        * R$ 15 de desconto em combustível: 300 pontos
        * Troca de óleo grátis: 1200 pontos

      Se o usuário perguntar qual o posto mais barato ou mais próximo, cite os postos e mostre os preços reais com base na lista acima.
      Se ele perguntar sobre o histórico, informe que há uma aba de Histórico e Gráficos dedicada para ver cada litro e centavo economizado.
      Responda SEMPRE em português, de forma amigável, clara e concisa. Use formatação em Markdown (negrito, listas) para facilitar a leitura.
    `;

    // Reconstruct chat history in Gemini structure if provided
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: `System context: ${systemInstruction}` }] },
        ...(history || []).map((h: any) => ({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ]
    });

    const aiText = response.text || "Desculpe, estou tendo dificuldades para processar sua mensagem agora. Como posso ajudar com os postos?";
    res.json({ text: aiText });

  } catch (error: any) {
    console.error("Erro na chamada da API do Gemini:", error);
    res.status(500).json({
      text: "Olá! Desculpe, não consegui conectar ao meu servidor inteligente. Mas estou aqui para te ajudar localmente! Nosso programa de fidelidade te dá 1 ponto por Real gasto. Gostaria de saber preços de combustíveis de algum posto específico?"
    });
  }
});

// Serve frontend files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

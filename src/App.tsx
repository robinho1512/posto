import { useState, useEffect } from "react";
import { GasStation, FuelingRecord, UserProfile, PushNotification, SystemMetrics } from "./types";
import InteractiveMap from "./components/InteractiveMap";
import FuelingCalculator from "./components/FuelingCalculator";
import LoyaltyDashboard from "./components/LoyaltyDashboard";
import HistoryAndAnalytics from "./components/HistoryAndAnalytics";
import SecurityAuth from "./components/SecurityAuth";
import AiChatAssistant from "./components/AiChatAssistant";
import AdminPanel from "./components/AdminPanel";
import { 
  Compass, 
  Award, 
  History, 
  MessageSquare, 
  ShieldCheck, 
  Settings, 
  Moon, 
  Sun, 
  Bell, 
  Flame, 
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"mapa" | "fidelidade" | "historico" | "chat" | "seguranca" | "admin">("mapa");
  const [stations, setStations] = useState<GasStation[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<FuelingRecord[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true); // Default to gorgeous dark mode!
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [toastNotification, setToastNotification] = useState<PushNotification | null>(null);

  // Initial data fetch
  const fetchData = async () => {
    try {
      const [stationsRes, userRes, historyRes, notificationsRes, metricsRes] = await Promise.all([
        fetch("/api/stations"),
        fetch("/api/user"),
        fetch("/api/history"),
        fetch("/api/notifications"),
        fetch("/api/metrics"),
      ]);

      if (stationsRes.ok) setStations(await stationsRes.ok ? await stationsRes.json() : []);
      if (userRes.ok) setUser(await userRes.json());
      if (historyRes.ok) setHistory(await historyRes.json());
      if (notificationsRes.ok) setNotifications(await notificationsRes.json());
      if (metricsRes.ok) setMetrics(await metricsRes.json());
    } catch (err) {
      console.error("Erro ao sincronizar dados com o servidor Express:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Poll for simulated new push notifications every 5 seconds to provide real-time alert simulation
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const latest: PushNotification[] = await res.json();
          // Check if a new notification has arrived
          if (latest.length > notifications.length && notifications.length > 0) {
            const newPush = latest[0];
            setToastNotification(newPush);
            // Auto hide toast
            setTimeout(() => setToastNotification(null), 5000);
          }
          setNotifications(latest);
        }
        
        // Also sync metrics in background
        const metricsRes = await fetch("/api/metrics");
        if (metricsRes.ok) setMetrics(await metricsRes.json());
      } catch (err) {
        // Silent fail for offline/development environments
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [notifications]);

  // Handle station selection from search/list
  const handleSelectStation = (station: GasStation) => {
    setSelectedStation(station);
  };

  // Redirect to fueling calculator
  const handleFuelRedirect = (station: GasStation) => {
    setSelectedStation(station);
    // Smooth scroll down to the calculator if in view
    setTimeout(() => {
      document.getElementById("fueling-calculator-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Fueling transaction processed successfully
  const handleFuelingSuccess = (record: FuelingRecord) => {
    // Refresh all state
    fetchData();
    // Move to history tab to see the outcome
    setTimeout(() => {
      setActiveTab("historico");
    }, 2500);
  };

  // Loyalty reward redeemed
  const handleRedeemReward = async (pointsCost: number, rewardTitle: string) => {
    if (!user) return;
    
    try {
      // Deduct points on client & update via backend profile update
      const updatedPoints = user.points - pointsCost;
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: updatedPoints }),
      });

      if (res.ok) {
        setUser(await res.json());
        fetchData();
      }
    } catch (err) {
      console.error("Erro ao resgatar pontos:", err);
    }
  };

  // Earn points via sharing
  const handleShareReward = async (extraPoints: number) => {
    if (!user) return;

    try {
      const updatedPoints = user.points + extraPoints;
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: updatedPoints }),
      });

      if (res.ok) {
        setUser(await res.json());
        fetchData();
      }
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  };

  // Update Security Settings (Biometrics and 2FA)
  const handleSecurityUpdate = async (toggle2FA?: boolean, toggleBiometrics?: boolean) => {
    try {
      const res = await fetch("/api/user/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggle2FA, toggleBiometrics }),
      });

      if (res.ok) {
        setUser(await res.json());
      }
    } catch (err) {
      console.error("Erro ao atualizar segurança:", err);
    }
  };

  // Admin Actions
  const handleUpdateStationPrice = async (stationId: string, fuelType: string, newPrice: number) => {
    try {
      const res = await fetch(`/api/stations/${stationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prices: { [fuelType]: newPrice }
        })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Erro ao reajustar preço administrativo:", err);
    }
  };

  const handleAddStation = async (newStation: Partial<GasStation>) => {
    try {
      const res = await fetch("/api/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStation)
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Erro ao adicionar novo posto credenciado:", err);
    }
  };

  const handleTriggerBackup = async () => {
    try {
      const res = await fetch("/api/backup", { method: "POST" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Erro ao executar backup administrativo:", err);
    }
  };

  const handleTriggerPushPromo = async (type: "price_drop" | "promo") => {
    try {
      const res = await fetch("/api/notifications/trigger-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        const newPush = await res.json();
        setNotifications(prev => [newPush, ...prev]);
        setToastNotification(newPush);
        setTimeout(() => setToastNotification(null), 5000);
      }
    } catch (err) {
      console.error("Erro ao disparar campanha push:", err);
    }
  };

  // Clear notifications read state on dropdown open
  const handleMarkNotificationsRead = async () => {
    setShowNotificationsDropdown(!showNotificationsDropdown);
    if (!showNotificationsDropdown) {
      try {
        await fetch("/api/notifications/read", { method: "POST" });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {}
    }
  };

  // Unread badge count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-100 text-zinc-900"}`}>
      
      {/* Real-time In-App Floating Push Notification Alert */}
      {toastNotification && (
        <div id="push-toast-alert" className="fixed top-5 right-5 z-50 max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 text-white p-4 shadow-2xl flex gap-3.5 items-start animate-slide-in">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-xs flex items-center gap-1.5 text-emerald-400">
              Notificação Push Exclusiva!
            </h5>
            <p className="font-extrabold text-sm mt-1">{toastNotification.title}</p>
            <p className="text-xs text-zinc-400 mt-1 leading-snug">{toastNotification.body}</p>
          </div>
          <button 
            id="toast-dismiss-btn"
            onClick={() => setToastNotification(null)}
            className="text-xs text-zinc-500 hover:text-zinc-300 font-bold"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Primary Container */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col min-h-screen gap-6">
        
        {/* Top Header Row */}
        <header id="app-header" className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-center gap-4 ${
          darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        } shadow-md`}>
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/15">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-1">
                PostoFiel <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase">Fidelidade</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium">Buscador Inteligente & Pagamentos via QR Code</p>
            </div>
          </div>

          {/* Quick Stats & Toggles */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
            
            {/* Loyalty points mini badge */}
            {user && (
              <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 ${
                darkMode ? "bg-zinc-800/50 border-zinc-700/50" : "bg-zinc-50 border-zinc-200"
              }`}>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-black text-amber-500">{user.points} <span className="text-[10px] font-semibold text-zinc-500">pts</span></span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 relative">
              {/* Push Center Bell */}
              <button
                id="header-notification-bell"
                onClick={handleMarkNotificationsRead}
                className={`p-2.5 rounded-xl border relative transition-all ${
                  unreadCount > 0 
                    ? "bg-red-500/10 text-red-500 border-red-500/20" 
                    : darkMode ? "bg-zinc-800/80 border-zinc-700/50 text-zinc-400 hover:text-white" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Push Center List Dropdown */}
              {showNotificationsDropdown && (
                <div id="notifications-dropdown-menu" className={`absolute top-full right-0 mt-2.5 w-72 rounded-xl border shadow-2xl p-4 z-40 animate-scale-up ${
                  darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
                }`}>
                  <div className="flex justify-between items-center border-b border-zinc-500/10 pb-2 mb-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-emerald-500" /> Notificações Push Ativas
                    </h4>
                    {unreadCount > 0 && <span className="text-[8px] bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded">Novo</span>}
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-2 rounded-lg border text-[11px] leading-snug ${
                          !n.read 
                            ? "border-emerald-500 bg-emerald-500/5 font-medium" 
                            : darkMode ? "border-zinc-800 bg-zinc-800/30 text-zinc-400" : "border-zinc-100 bg-zinc-50 text-zinc-600"
                        }`}
                      >
                        <p className="font-bold flex items-center justify-between gap-1">
                          <span>{n.title}</span>
                          {!n.read && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>}
                        </p>
                        <p className="mt-0.5">{n.body}</p>
                        <span className="text-[8px] opacity-60 mt-1 block text-right font-mono">
                          {new Date(n.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}

                    {notifications.length === 0 && (
                      <p className="text-center py-4 text-xs text-zinc-500">Nenhum alerta recente.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Dark mode button */}
              <button
                id="header-darkmode-toggle"
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl border transition-all ${
                  darkMode ? "bg-zinc-800/80 border-zinc-700/50 text-zinc-400 hover:text-white" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation Hub */}
        <nav id="app-navigation-hub" className={`p-1.5 rounded-2xl border flex gap-1 overflow-x-auto ${
          darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        } shadow-sm custom-scrollbar shrink-0`}>
          <button
            id="tab-mapa"
            onClick={() => setActiveTab("mapa")}
            className={`flex-1 min-w-[95px] py-2.5 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1.5 ${
              activeTab === "mapa"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <Compass className="w-4 h-4" />
            Mapa & Postos
          </button>
          
          <button
            id="tab-fidelidade"
            onClick={() => setActiveTab("fidelidade")}
            className={`flex-1 min-w-[95px] py-2.5 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1.5 ${
              activeTab === "fidelidade"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <Award className="w-4 h-4" />
            Clube Fidelidade
          </button>

          <button
            id="tab-historico"
            onClick={() => setActiveTab("historico")}
            className={`flex-1 min-w-[95px] py-2.5 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1.5 ${
              activeTab === "historico"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <History className="w-4 h-4" />
            Extrato & Consumo
          </button>

          <button
            id="tab-chat"
            onClick={() => setActiveTab("chat")}
            className={`flex-1 min-w-[95px] py-2.5 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Suporte FielBot
          </button>

          <button
            id="tab-seguranca"
            onClick={() => setActiveTab("seguranca")}
            className={`flex-1 min-w-[95px] py-2.5 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1.5 ${
              activeTab === "seguranca"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Segurança 2FA
          </button>

          <button
            id="tab-admin"
            onClick={() => setActiveTab("admin")}
            className={`flex-1 min-w-[95px] py-2.5 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1.5 ${
              activeTab === "admin"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <Settings className="w-4 h-4" />
            Painel Admin
          </button>
        </nav>

        {/* Primary View Workspace */}
        <main className="flex-1">
          {activeTab === "mapa" && (
            <div className="space-y-6">
              {/* Interactive map display */}
              <InteractiveMap
                stations={stations}
                selectedStation={selectedStation}
                onSelectStation={handleSelectStation}
                onFuelClick={handleFuelRedirect}
                darkMode={darkMode}
              />
              
              {/* Interactive calculator linked contextually underneath */}
              {selectedStation && user ? (
                <FuelingCalculator
                  station={selectedStation}
                  user={user}
                  onPaymentSuccess={handleFuelingSuccess}
                  darkMode={darkMode}
                />
              ) : (
                <div className={`p-6 rounded-2xl border text-center ${
                  darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-500" : "bg-white border-zinc-200 text-zinc-400"
                } shadow-sm`}>
                  <Compass className="w-12 h-12 mx-auto mb-2 opacity-30 animate-pulse" />
                  <p className="text-sm font-bold">Selecione um Posto de Combustível no mapa acima para simular seu abastecimento, calcular litros e custo total atualizado.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "fidelidade" && user && (
            <LoyaltyDashboard
              user={user}
              onRedeemReward={handleRedeemReward}
              onShareReward={handleShareReward}
              darkMode={darkMode}
            />
          )}

          {activeTab === "historico" && user && (
            <HistoryAndAnalytics
              history={history}
              user={user}
              darkMode={darkMode}
            />
          )}

          {activeTab === "chat" && (
            <AiChatAssistant
              darkMode={darkMode}
            />
          )}

          {activeTab === "seguranca" && user && (
            <SecurityAuth
              user={user}
              onSecurityUpdate={handleSecurityUpdate}
              darkMode={darkMode}
            />
          )}

          {activeTab === "admin" && metrics && (
            <AdminPanel
              stations={stations}
              metrics={metrics}
              onUpdateStationPrice={handleUpdateStationPrice}
              onAddStation={handleAddStation}
              onTriggerBackup={handleTriggerBackup}
              onTriggerPushPromo={handleTriggerPushPromo}
              darkMode={darkMode}
            />
          )}
        </main>

        {/* Global Footer Credits */}
        <footer className="text-center py-4 text-[10px] text-zinc-500 border-t border-zinc-500/10 mt-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 PostoFiel Inc. Todos os direitos reservados. Rede Credenciada São Paulo, SP.</p>
          <div className="flex gap-3 font-semibold">
            <a href="#interactive-map-section" className="hover:text-emerald-500 transition-colors">Mapa Geral</a>
            <span>•</span>
            <a href="#loyalty-dashboard-section" className="hover:text-emerald-500 transition-colors">Termos do Clube</a>
            <span>•</span>
            <a href="#security-auth-section" className="hover:text-emerald-500 transition-colors">Criptografia SSL</a>
          </div>
        </footer>

      </div>
    </div>
  );
}

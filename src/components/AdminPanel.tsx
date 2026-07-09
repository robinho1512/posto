import { useState } from "react";
import { GasStation, SystemMetrics } from "../types";
import { 
  Settings, 
  BarChart3, 
  Database, 
  BellRing, 
  Edit, 
  PlusCircle, 
  Save, 
  Users, 
  DollarSign, 
  Fuel, 
  CheckCircle,
  AlertTriangle,
  ChevronRight
} from "lucide-react";

interface AdminPanelProps {
  stations: GasStation[];
  metrics: SystemMetrics;
  onUpdateStationPrice: (stationId: string, fuelType: string, newPrice: number) => void;
  onAddStation: (newStation: Partial<GasStation>) => void;
  onTriggerBackup: () => void;
  onTriggerPushPromo: (type: "price_drop" | "promo") => void;
  darkMode: boolean;
}

export default function AdminPanel({
  stations,
  metrics,
  onUpdateStationPrice,
  onAddStation,
  onTriggerBackup,
  onTriggerPushPromo,
  darkMode,
}: AdminPanelProps) {
  const [selectedStationId, setSelectedStationId] = useState<string>(stations[0]?.id || "");
  const [editedPrices, setEditedPrices] = useState({
    gasoline: "",
    ethanol: "",
    diesel: "",
    premiumGas: ""
  });
  const [priceSuccessMsg, setPriceSuccessMsg] = useState("");

  // Add Station States
  const [newStationName, setNewStationName] = useState("");
  const [newStationBrand, setNewStationBrand] = useState<GasStation["brand"]>("Independent");
  const [newStationAddress, setNewStationAddress] = useState("");
  const [newStationLat, setNewStationLat] = useState("");
  const [newStationLng, setNewStationLng] = useState("");
  const [newStationGasoline, setNewStationGasoline] = useState("");
  const [addStationSuccess, setAddStationSuccess] = useState("");

  // Backup loading
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState("");

  // Notification success
  const [pushSuccess, setPushSuccess] = useState("");

  const selectedStation = stations.find(s => s.id === selectedStationId);

  // Sync edited prices when station id changes
  const handleStationSelect = (stationId: string) => {
    setSelectedStationId(stationId);
    const station = stations.find(s => s.id === stationId);
    if (station) {
      setEditedPrices({
        gasoline: String(station.prices.gasoline),
        ethanol: String(station.prices.ethanol),
        diesel: String(station.prices.diesel),
        premiumGas: String(station.prices.premiumGas)
      });
    }
  };

  const handleSavePrices = () => {
    if (!selectedStationId) return;

    onUpdateStationPrice(selectedStationId, "gasoline", Number(editedPrices.gasoline));
    onUpdateStationPrice(selectedStationId, "ethanol", Number(editedPrices.ethanol));
    onUpdateStationPrice(selectedStationId, "diesel", Number(editedPrices.diesel));
    onUpdateStationPrice(selectedStationId, "premiumGas", Number(editedPrices.premiumGas));

    setPriceSuccessMsg("Preços de combustível alterados com sucesso! Alerta de flutuação disparado.");
    setTimeout(() => setPriceSuccessMsg(""), 3500);
  };

  const handleAddNewStation = () => {
    if (!newStationName || !newStationAddress || !newStationGasoline) {
      alert("Por favor, preencha todos os campos obrigatórios da nova unidade.");
      return;
    }

    const payload: Partial<GasStation> = {
      name: newStationName,
      brand: newStationBrand,
      address: newStationAddress,
      lat: Number(newStationLat) || -23.5600,
      lng: Number(newStationLng) || -46.6500,
      prices: {
        gasoline: Number(newStationGasoline),
        ethanol: Number(newStationGasoline) * 0.65, // Standard estimate
        diesel: Number(newStationGasoline) * 1.05,
        premiumGas: Number(newStationGasoline) * 1.25,
      }
    };

    onAddStation(payload);
    setAddStationSuccess(`Posto '${newStationName}' cadastrado com sucesso! Veja no mapa.`);
    
    // Clear inputs
    setNewStationName("");
    setNewStationAddress("");
    setNewStationLat("");
    setNewStationLng("");
    setNewStationGasoline("");

    setTimeout(() => setAddStationSuccess(""), 4500);
  };

  const handleTriggerBackupClick = () => {
    setIsBackingUp(true);
    setBackupSuccess("");
    setTimeout(() => {
      onTriggerBackup();
      setIsBackingUp(false);
      setBackupSuccess("Backup agendado executado com sucesso! Cópia espelhada na nuvem Cloud SQL.");
      setTimeout(() => setBackupSuccess(""), 4500);
    }, 1500);
  };

  const handlePushPromoClick = (type: "price_drop" | "promo") => {
    onTriggerPushPromo(type);
    setPushSuccess(`Notificação Push do tipo [${type === "price_drop" ? "Queda de Preço" : "Campanha Promocional"}] disparada para todos os celulares ativos!`);
    setTimeout(() => setPushSuccess(""), 4000);
  };

  return (
    <div id="admin-panel-section" className={`rounded-2xl border ${
      darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
    } p-5 shadow-lg`}>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-zinc-500/10">
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
          <Settings className="w-6 h-6 animate-spin [animation-duration:8s]" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight">Painel do Administrador (PostoFiel Control)</h3>
          <p className="text-xs text-zinc-500">Métricas consolidadas de vendas, gestão de preços de postos credenciados e testes de simulações.</p>
        </div>
      </div>

      {/* Grid of Analytical Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl border ${darkMode ? "bg-zinc-800/15 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
          <div className="flex justify-between items-center text-zinc-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Usuários Ativos</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-base font-black tracking-tight">{metrics.activeUsers}</span>
          <p className="text-[9px] text-zinc-500 mt-0.5">Dispositivos logados no app</p>
        </div>

        <div className={`p-4 rounded-xl border ${darkMode ? "bg-zinc-800/15 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
          <div className="flex justify-between items-center text-zinc-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Volume Faturado</span>
            <Fuel className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-base font-black tracking-tight">{metrics.totalLitersSold.toFixed(1)} L</span>
          <p className="text-[9px] text-zinc-500 mt-0.5">Litragem total liberada via QR</p>
        </div>

        <div className={`p-4 rounded-xl border ${darkMode ? "bg-zinc-800/15 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
          <div className="flex justify-between items-center text-zinc-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Receita Líquida</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-base font-black tracking-tight">R$ {metrics.totalBRLRevenue.toFixed(2)}</span>
          <p className="text-[9px] text-zinc-500 mt-0.5">Simulado via gateway de pagamentos</p>
        </div>

        <div className={`p-4 rounded-xl border ${darkMode ? "bg-zinc-800/15 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
          <div className="flex justify-between items-center text-zinc-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Último Backup</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[11px] font-mono font-bold block truncate mt-1">
            {new Date(metrics.lastBackupDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <p className="text-[9px] text-zinc-500">Backup automático em nuvem</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Box 1: Fuel Price Manager (7 cols) */}
        <div className={`lg:col-span-7 p-4 rounded-xl border ${darkMode ? "bg-zinc-800/20 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
          <h4 className="font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1">
            <Edit className="w-4 h-4 text-emerald-500" />
            Alterar Preço de Combustível (Tempo Real)
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">Selecione a Unidade do Posto</label>
              <select
                id="admin-station-select"
                value={selectedStationId}
                onChange={(e) => handleStationSelect(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-zinc-200"
                }`}
              >
                {stations.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.brand})</option>
                ))}
              </select>
            </div>

            {selectedStation && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">Gasolina Comum (R$)</label>
                  <input
                    id="admin-gas-input"
                    type="number"
                    step="0.01"
                    value={editedPrices.gasoline}
                    onChange={(e) => setEditedPrices(prev => ({ ...prev, gasoline: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border text-xs ${
                      darkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">Etanol Comum (R$)</label>
                  <input
                    id="admin-ethanol-input"
                    type="number"
                    step="0.01"
                    value={editedPrices.ethanol}
                    onChange={(e) => setEditedPrices(prev => ({ ...prev, ethanol: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border text-xs ${
                      darkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">S10 Diesel (R$)</label>
                  <input
                    id="admin-diesel-input"
                    type="number"
                    step="0.01"
                    value={editedPrices.diesel}
                    onChange={(e) => setEditedPrices(prev => ({ ...prev, diesel: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border text-xs ${
                      darkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">Gasolina Aditivada (R$)</label>
                  <input
                    id="admin-premium-input"
                    type="number"
                    step="0.01"
                    value={editedPrices.premiumGas}
                    onChange={(e) => setEditedPrices(prev => ({ ...prev, premiumGas: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border text-xs ${
                      darkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200"
                    }`}
                  />
                </div>
              </div>
            )}

            {priceSuccessMsg && (
              <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 animate-pulse">
                <CheckCircle className="w-3.5 h-3.5" />
                {priceSuccessMsg}
              </p>
            )}

            <button
              id="admin-save-prices-btn"
              onClick={handleSavePrices}
              className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow"
            >
              Confirmar Reajuste & Notificar Dispositivos
            </button>
          </div>
        </div>

        {/* Box 2: Manual Push & Cloud Backups (5 cols) */}
        <div className={`lg:col-span-5 p-4 rounded-xl border flex flex-col justify-between ${darkMode ? "bg-zinc-800/20 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1">
              <BellRing className="w-4 h-4 text-emerald-500" />
              Notificações Push & Cloud backups
            </h4>

            <div className="space-y-2 mb-4">
              <button
                id="admin-push-pricedrop-btn"
                onClick={() => handlePushPromoClick("price_drop")}
                className="w-full py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold transition-all text-left px-3 flex justify-between items-center"
              >
                <span>Disparar Alerta: Queda de Combustível 📉</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                id="admin-push-promo-btn"
                onClick={() => handlePushPromoClick("promo")}
                className="w-full py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold transition-all text-left px-3 flex justify-between items-center"
              >
                <span>Disparar Alerta: Campanha Cupom de desconto 🏷️</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {pushSuccess && (
              <p className="text-[10px] font-semibold text-emerald-500 mb-3 leading-snug">
                ✔️ {pushSuccess}
              </p>
            )}
          </div>

          <div className="border-t border-zinc-500/10 pt-4 mt-2">
            <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Backups Automáticos em Nuvem</h5>
            <p className="text-[10px] text-zinc-500 mb-3">O banco de dados de postos e histórico de fidelidade possui backup programado redundante.</p>
            
            {backupSuccess && (
              <p className="text-[10px] font-bold text-emerald-500 mb-2">
                ✔️ {backupSuccess}
              </p>
            )}

            <button
              id="admin-backup-btn"
              onClick={handleTriggerBackupClick}
              disabled={isBackingUp}
              className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-zinc-700/50"
            >
              <Database className="w-3.5 h-3.5" />
              {isBackingUp ? "Efetuando Backup..." : "Executar Backup Agendado Agora"}
            </button>
          </div>
        </div>

      </div>

      {/* Adding a new Gas Station content creator */}
      <div className={`p-4 rounded-xl border ${darkMode ? "bg-zinc-800/10 border-zinc-800/80" : "bg-white border-zinc-100"}`}>
        <h4 className="font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <PlusCircle className="w-4 h-4 text-emerald-500" />
          Credenciar Nova Unidade de Posto no Mapa
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Nome do Posto *</label>
            <input
              id="admin-new-name"
              type="text"
              placeholder="Ex: Posto Petrobras Trianon"
              value={newStationName}
              onChange={(e) => setNewStationName(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Bandeira *</label>
            <select
              id="admin-new-brand"
              value={newStationBrand}
              onChange={(e) => setNewStationBrand(e.target.value as any)}
              className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <option value="Petrobras">Petrobras</option>
              <option value="Ipiranga">Ipiranga</option>
              <option value="Shell">Shell</option>
              <option value="Ale">Ale</option>
              <option value="Independent">Bandeira Branca</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Preço Inicial Gasolina (R$) *</label>
            <input
              id="admin-new-price"
              type="number"
              step="0.01"
              placeholder="Ex: 5.45"
              value={newStationGasoline}
              onChange={(e) => setNewStationGasoline(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Endereço Completo *</label>
            <input
              id="admin-new-addr"
              type="text"
              placeholder="Av. Paulista, 1500 - Bela Vista"
              value={newStationAddress}
              onChange={(e) => setNewStationAddress(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
              }`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Latitude (GPS)</label>
              <input
                id="admin-new-lat"
                type="number"
                step="0.0001"
                placeholder="-23.5600"
                value={newStationLat}
                onChange={(e) => setNewStationLat(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                }`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Longitude (GPS)</label>
              <input
                id="admin-new-lng"
                type="number"
                step="0.0001"
                placeholder="-46.6500"
                value={newStationLng}
                onChange={(e) => setNewStationLng(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                }`}
              />
            </div>
          </div>
        </div>

        {addStationSuccess && (
          <p className="text-[10px] font-bold text-emerald-500 mb-3 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            {addStationSuccess}
          </p>
        )}

        <button
          id="admin-add-station-btn"
          onClick={handleAddNewStation}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow"
        >
          Inserir Posto e Recalcular Distâncias de Clientes
        </button>
      </div>

    </div>
  );
}
